/*
 * ulitilities.js
 * For licence information, read licence.txt
 */
"use strict";

if (typeof mgsuite == 'undefined') {
  var mgsuite = {};
}

mgsuite.util = {
  collectedLinks: [],
  collectedLinksUrls: [],
  collectedImg: null,
  collectedImgUrl: null,
  
  // collect elements (links, images) under performed gesture
  CollectLinksListener: function(msg) {
    //dump("CollectLinksListener: " + JSON.stringify(msg.data) + "\n");
    //dump("[CLL] ");
    var bgImgUrl = msg.data.bgImgUrl;
    var link, linkUrl;
    
    if (msg.objects.link) {
      link = msg.objects.link.node;
      linkUrl = msg.objects.link.url;
    }
    
    if (linkUrl && mgsuite.util.collectedLinksUrls.lastIndexOf(linkUrl) < 0) {
      // collect link
      mgsuite.util.collectedLinksUrls.push(linkUrl);
      mgsuite.util.collectedLinks.push(link);
    }
    
    if (msg.objects.img && !mgsuite.util.collectedImg) {
      // image found under gesture
      mgsuite.util.collectedImg = msg.objects.img;
      mgsuite.util.collectedImgUrl = msg.objects.img.src;
      
    } else if (bgImgUrl && !mgsuite.util.collectedImgUrl) {
      // bg image found under gesture
      mgsuite.util.collectedImgUrl = bgImgUrl;
    }
  },
  
  clearCollectedItems: function() {
    mgsuite.util.collectedLinks = [];
    mgsuite.util.collectedLinksUrls = [];
    mgsuite.util.collectedImg = null;
    mgsuite.util.collectedImgUrl = null;
    mgsuite.util.collectedFrame = null;
  },
  
  // collect document frame on mousedown
  CollectFrameListener: function(msg) {
    mgsuite.util.collectedFrame = msg.objects.frame;
  },
  
  returnWithCallback: function(msg) {
    var param = msg.data.param;
    var param2 = msg.objects.param; // optional
    
    if (param2) {
      param = param2;
    }
    
    var callSegm = msg.data.callback.split('.');
    //dump("param=" + param + "\n");
    //dump("param.nodeToScroll=" + param.nodeToScroll + "\n");
    
    switch (callSegm[0]) {
      case 'imp':
        mgsuite.imp[callSegm[1]].apply(null, param);
        break;
      
      case 'overlay':
        mgsuite.overlay[callSegm[1]].apply(null, param);
        break;
      
      default:
        dump("unknown callback object wrapper: " + callSegm[0] + "\n");
    }
    
  },
  
  testListener: function(msg) {
    dump("testListener: " + JSON.stringify(msg.data) + "\n");
  },
  
  getSelectedText: function() {
    let [element, focusedWindow] = BrowserUtils.getFocusSync(document);
    var selection = focusedWindow.getSelection().toString();
    
    if (!selection) {
      var isOnTextInput = function isOnTextInput(elem) {
        // we avoid to return a value if a selection is in password field.
        // ref. bug 565717
        return elem instanceof HTMLTextAreaElement ||
               (elem instanceof HTMLInputElement && elem.mozIsTextField(true));
      };
  
      if (isOnTextInput(element)) {
        selection = element.QueryInterface(Components.interfaces.nsIDOMNSEditableElement)
                          .editor.selection.toString();
      }
    }
    
    if (selection) {
      selection = selection.trim().replace(/\s+/g, " ");
      
      if (selection.length > 250) {
        selection = selection.substr(0, 250);
      }
    }
    
    return selection;
  },
  
  /* Check if string is a URL - return URL if valid */
  detectUrl: function(input) {
    input = input.replace(/^[\s\'\"\(\[<]+/, ""); // strip bad leading characters
    input = input.replace(/[\.,\'\"\)\?!>\]]+$/, ""); // strip bad ending characters
    input = input.trim();
    
    if (input.indexOf("about:") == 0) {
      return input;
    }
    
    if (!input || /\s/.test(input)) {
      return false;
    }
    
    if (/^(http|https|ftp):\/\/\w/i.test(input)) {
      // URL with scheme
      return input;
    }
    
    var host;
    
    if (/\//.test(input)) {
      var segm = input.split('/');
      host = segm[0].toLowerCase();
    } else {
      host = input.toLowerCase();
    }
    // match segments in host
    var matches = /^([^@]+@)?((?:[\w-]+\.)*)([\w-]+)(:\d{1,5})?$/.exec(host);
    
    if (!matches || !matches[3]) {
      return false;
    }
    
    if (matches[1] && !matches[4] && !/\//.test(input)) {
      // probably email address
      return false;
    }
    
    var domain = (typeof matches[2] != 'undefined') ? matches[2] : "";
    domain += (typeof matches[3] != 'undefined') ? matches[3] : "";
    
    if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})+$/.test(domain)
        || domain == 'localhost'
        || /\.localhost$/.test(domain)) {
      // IP or localhost
      return input;
    }
    
    if (!matches[2]) {
      return false;
    }
    
    // check top level domain
    var tld = matches[3];
    
    // load list of top level domains
    // see http://data.iana.org/TLD/tlds-alpha-by-domain.txt
    var str = "";
    var req = new XMLHttpRequest();
    try {
      req.open("GET", mgsuite.const.CHROME_DIR + "tlds.txt", false);
      req.send();
      str = req.responseText.trim();
      
    } catch (err){};
    
    var tlds = str.toLowerCase().split(/\s+/);
    
    return (tlds.indexOf(tld) >= 0) ? input : false;
  },
  
  
  /**
   * Get an object that is a serialized representation of a History entry.
   *
   * @param shEntry
   *        nsISHEntry instance
   * @param isPinned
   *        The tab is pinned and should be treated differently for privacy.
   * @return object
   */
  serializeEntry: function (shEntry, isPinned) {
    let entry = { url: shEntry.URI.spec };

    // Save some bytes and don't include the title property
    // if that's identical to the current entry's URL.
    if (shEntry.title && shEntry.title != entry.url) {
      entry.title = shEntry.title;
    }
    if (shEntry.isSubFrame) {
      entry.subframe = true;
    }

    let cacheKey = shEntry.cacheKey;
    if (cacheKey && cacheKey instanceof Ci.nsISupportsPRUint32 &&
        cacheKey.data != 0) {
      // XXXbz would be better to have cache keys implement
      // nsISerializable or something.
      entry.cacheKey = cacheKey.data;
    }
    entry.ID = shEntry.ID;
    entry.docshellID = shEntry.docshellID;

    // We will include the property only if it's truthy to save a couple of
    // bytes when the resulting object is stringified and saved to disk.
    if (shEntry.referrerURI) {
      entry.referrer = shEntry.referrerURI.spec;
      entry.referrerPolicy = shEntry.referrerPolicy;
    }

    if (shEntry.srcdocData)
      entry.srcdocData = shEntry.srcdocData;

    if (shEntry.isSrcdocEntry)
      entry.isSrcdocEntry = shEntry.isSrcdocEntry;

    if (shEntry.baseURI)
      entry.baseURI = shEntry.baseURI.spec;

    if (shEntry.contentType)
      entry.contentType = shEntry.contentType;

    let x = {}, y = {};
    
    try {
      // this errors out in e10s but somehow saving scroll works (for loaded tabs)
      shEntry.getScrollPosition(x, y);
    } catch (err) {
    }
    
    if (x.value != 0 || y.value != 0) {
      entry.scroll = x.value + "," + y.value;
    }

    // Collect owner data for the current history entry.
    try {
      let owner = this.serializeOwner(shEntry);
      if (owner) {
        entry.owner_b64 = owner;
      }
    } catch (ex) {
      // Not catching anything specific here, just possible errors
      // from writeCompoundObject() and the like.
      debug("Failed serializing owner data: " + ex);
    }

    entry.docIdentifier = shEntry.BFCacheEntry.ID;

    if (shEntry.stateData != null) {
      entry.structuredCloneState = shEntry.stateData.getDataAsBase64();
      entry.structuredCloneVersion = shEntry.stateData.formatVersion;
    }

    if (!(shEntry instanceof Ci.nsISHContainer)) {
      return entry;
    }

    if (shEntry.childCount > 0) {
      let children = [];
      for (let i = 0; i < shEntry.childCount; i++) {
        let child = shEntry.GetChildAt(i);

        if (child && !this.isDynamic(child)) {
          // Don't try to restore framesets containing wyciwyg URLs.
          // (cf. bug 424689 and bug 450595)
          if (child.URI.schemeIs("wyciwyg")) {
            children.length = 0;
            break;
          }

          children.push(this.serializeEntry(child, isPinned));
        }
      }

      if (children.length) {
        entry.children = children;
      }
    }

    return entry;
  },
  
  /**
   * Serialize owner data contained in the given session history entry.
   *
   * @param shEntry
   *        The session history entry.
   * @return The base64 encoded owner data.
   */
  serializeOwner: function (shEntry) {
    if (!shEntry.owner) {
      return null;
    }
    
    const Cc = Components.classes;
    const Ci = Components.interfaces;

    let binaryStream = Cc["@mozilla.org/binaryoutputstream;1"].
                       createInstance(Ci.nsIObjectOutputStream);
    let pipe = Cc["@mozilla.org/pipe;1"].createInstance(Ci.nsIPipe);
    pipe.init(false, false, 0, 0xffffffff, null);
    binaryStream.setOutputStream(pipe.outputStream);
    binaryStream.writeCompoundObject(shEntry.owner, Ci.nsISupports, true);
    binaryStream.close();

    // Now we want to read the data from the pipe's input end and encode it.
    let scriptableStream = Cc["@mozilla.org/binaryinputstream;1"].
                           createInstance(Ci.nsIBinaryInputStream);
    scriptableStream.setInputStream(pipe.inputStream);
    let ownerBytes =
      scriptableStream.readByteArray(scriptableStream.available());

    // We can stop doing base64 encoding once our serialization into JSON
    // is guaranteed to handle all chars in strings, including embedded
    // nulls.
    return btoa(String.fromCharCode.apply(null, ownerBytes));
  },
  
  /**
   * Determines whether a given session history entry has been added dynamically.
   *
   * @param shEntry
   *        The session history entry.
   * @return bool
   */
  isDynamic: function (shEntry) {
    // shEntry.isDynamicallyAdded() is true for dynamically added
    // <iframe> and <frameset>, but also for <html> (the root of the
    // document) so we use shEntry.parent to ensure that we're not looking
    // at the root of the document
    return shEntry.parent && shEntry.isDynamicallyAdded();
  },
  
  /**
   * This is for backwards compatibility - contentWindowAsCPOW is quite new
   */
  getContentWindow: function(browser) {
    var win = browser.contentWindowAsCPOW;
    if (win) {
      return win;
    } else {
      return browser.contentWindow;
    }
  }

}
