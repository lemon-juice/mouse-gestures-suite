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
  },
  
  //returnWithCallback: function(msg) {
  //  var param = msg.data.param;
  //  var callback = msg.data.callback;
  //  window[callback](param);
  //},
  
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
  }

}
