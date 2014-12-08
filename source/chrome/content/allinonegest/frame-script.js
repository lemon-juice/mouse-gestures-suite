var mgsuiteFr = {
  
  init: function() {
    addMessageListener("MouseGesturesSuite:startMouseMove", this);
    addMessageListener("MouseGesturesSuite:endMouseMove", this);
    addMessageListener("MouseGesturesSuite:getContentWindow", this);
    addMessageListener("MouseGesturesSuite:insertHistory", this);
    addMessageListener("MouseGesturesSuite:test", this);
    addMessageListener("MouseGesturesSuite:displayGesturesList", this);
    addEventListener("mousedown", this);
  },
  
  /* Receiving message from addMessageListener */
  receiveMessage: function(aMsg) {
    switch (aMsg.name) {
      case "MouseGesturesSuite:startMouseMove": this.startMouseMove(); break;
      case "MouseGesturesSuite:endMouseMove": this.endMouseMove(); break;
      case "MouseGesturesSuite:getContentWindow": this.getContentWindow(aMsg); break;
      case "MouseGesturesSuite:displayGesturesList": this.displayGesturesList(aMsg); break;
      case "MouseGesturesSuite:insertHistory": this.insertHistory(aMsg); break;
      //case "MouseGesturesSuite:test": this.test(aMsg); break;
    }
  },
  
  /* Handle mouse event */
  handleEvent: function(e) {
    if (!this.collectElementsData) {
      return;
    }
    
    // send link info found under gesture to mouse gesture script
    var elemInfo = this.getElementInfo(e);
    
    if (elemInfo.link || elemInfo.img || elemInfo.bgImgUrl) {
      // send link url or image
      sendAsyncMessage("MouseGesturesSuite:CollectLinks", {bgImgUrl: elemInfo.bgImgUrl, eventType: e.type}, {link: elemInfo.link, img: elemInfo.img});
    }
  },
  
  
  getElementInfo: function(e) {
    var elem = e.target;
    var link, img, bgImgUrl;
    
    while (elem) {
      if (elem.nodeType == 1) { // ELEMENT_NODE
        // Link?
        if (!link &&
            ((elem instanceof content.HTMLAnchorElement && elem.href) ||
            (elem instanceof content.HTMLAreaElement && elem.href) ||
             elem.getAttributeNS("http://www.w3.org/1999/xlink", "type") == "simple")) {

          // elem is link
          link = {node: elem, url: elem.href};
          
          if (!elem.href) {
            link.url = makeURLAbsolute(elem.baseURI, elem.getAttributeNS("http://www.w3.org/1999/xlink", "href"));
          }
          
        } else if (!img &&
                  (elem instanceof content.HTMLImageElement && elem.src)) {
          // Image?
          img = elem;
          
        } else if (!img && !bgImgUrl) {
          // Bg image?
          bgImgUrl = this.getComputedURL(elem, "background-image");
        }
      }

      elem = elem.parentNode;
    }
    
    return {link: link, img: img, bgImgUrl: bgImgUrl};
  },
  
  // Returns a "url"-type computed style attribute value, with the url() stripped.
  getComputedURL: function(aElem, aProp) {
    var url = aElem.ownerDocument
                  .defaultView.getComputedStyle(aElem, "")
                  .getPropertyCSSValue(aProp);
                  
    if (url instanceof content.CSSValueList) {
      url = url[0];
    }
    return url.primitiveType == content.CSSPrimitiveValue.CSS_URI ?
          url.getStringValue() : null;
  },
  
  startMouseMove: function() {
    addEventListener("mousemove", this);
    this.collectElementsData = true;
  },
  
  endMouseMove: function() {
    removeEventListener("mousemove", this);
    this.collectElementsData = false;
  },
   
  getContentWindow: function(msg) {
    sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {callback: msg.data}, {param: content});
  },
  
  displayGesturesList: function(msg) {
    mgsuiteFr.recentMsgData = msg.data;
    addEventListener("DOMContentLoaded", mgsuiteFr.displayGesturesList2, false);
  },
  
  displayGesturesList2: function(e) {
    var doc = content.document;
    
    var str = "(function(){window.addEventListener('load',function(e){document.title='" + mgsuiteFr.recentMsgData.title +
       "';document.body.innerHTML='" + mgsuiteFr.recentMsgData.content + "';},false);})();"
    var script = doc.createElement("script");
    script.appendChild(doc.createTextNode(str));
    doc.body.appendChild(script);
    
    removeEventListener("DOMContentLoaded", mgsuiteFr.displayGesturesList2, false);
    mgsuiteFr.recentMsgData = null;
  },
  
  
  insertHistory: function(msg) {   
    docShell.QueryInterface(Components.interfaces.nsIWebNavigation);
    
    var sHistory = docShell.sessionHistory;
    sHistory.QueryInterface(Components.interfaces.nsISHistoryInternal);
    
    var entries = msg.data.entries;
    var entry;
    let idMap = { used: {} };
    let docIdentMap = {};
    
    for (var i=0; i<entries.length; i++) {
      if (!entries[i].url) continue;
      entry = this.deserializeEntry(entries[i], idMap, docIdentMap);
      sHistory.addEntry(entry, true);
    }

    docShell.gotoIndex(msg.data.index);
    this.setScrollPosition(msg.data.scrollX, msg.data.scrollY, 10);
  },
  
  setScrollPosition: function(x, y, attempts) {
    content.scrollTo(x, y);
    
    if (attempts > 0 && (content.scrollX != x || content.scrollY != y)) {
      var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
      
      timer.initWithCallback(function() {
        mgsuiteFr.setScrollPosition(x, y, --attempts);
        
      }, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    }
  },
  
  /**
   * Expands serialized history data into a session-history-entry instance.
   *
   * @param entry
   *        Object containing serialized history data for a URL
   * @param idMap
   *        Hash for ensuring unique frame IDs
   * @param docIdentMap
   *        Hash to ensure reuse of BFCache entries
   * @returns nsISHEntry
   */
  deserializeEntry: function (entry, idMap, docIdentMap) {
    
    function makeURI(url) {
      return Services.io.newURI(url, null, null);
    }

    var shEntry = Components.classes["@mozilla.org/browser/session-history-entry;1"].
                  createInstance(Components.interfaces.nsISHEntry);

    shEntry.setURI(makeURI(entry.url));
    shEntry.setTitle(entry.title || entry.url);
    if (entry.subframe)
      shEntry.setIsSubFrame(entry.subframe || false);
    shEntry.loadType = Components.interfaces.nsIDocShellLoadInfo.loadHistory;
    if (entry.contentType)
      shEntry.contentType = entry.contentType;
    if (entry.referrer) {
      shEntry.referrerURI = makeURI(entry.referrer);
      try {
        // doesn't work in SM
        shEntry.referrerPolicy = entry.referrerPolicy;
      } catch (err) {};
    }
    if (entry.isSrcdocEntry)
      shEntry.srcdocData = entry.srcdocData;
    if (entry.baseURI)
      shEntry.baseURI = makeURI(entry.baseURI);

    if (entry.cacheKey) {
      var cacheKey = Components.classes["@mozilla.org/supports-PRUint32;1"].
                     createInstance(Components.interfaces.nsISupportsPRUint32);
      cacheKey.data = entry.cacheKey;
      shEntry.cacheKey = cacheKey;
    }

    if (entry.ID) {
      // get a new unique ID for this frame (since the one from the last
      // start might already be in use)
      var id = idMap[entry.ID] || 0;
      if (!id) {
        for (id = Date.now(); id in idMap.used; id++);
        idMap[entry.ID] = id;
        idMap.used[id] = true;
      }
      shEntry.ID = id;
    }

    if (entry.docshellID)
      shEntry.docshellID = entry.docshellID;

    if (entry.structuredCloneState && entry.structuredCloneVersion) {
      shEntry.stateData =
        Components.classes["@mozilla.org/docshell/structured-clone-container;1"].
        createInstance(Components.interfaces.nsIStructuredCloneContainer);

      shEntry.stateData.initFromBase64(entry.structuredCloneState,
                                       entry.structuredCloneVersion);
    }

    if (entry.scroll) {
      var scrollPos = (entry.scroll || "0,0").split(",");
      scrollPos = [parseInt(scrollPos[0]) || 0, parseInt(scrollPos[1]) || 0];
      shEntry.setScrollPosition(scrollPos[0], scrollPos[1]);
    }

    let childDocIdents = {};
    if (entry.docIdentifier) {
      // If we have a serialized document identifier, try to find an SHEntry
      // which matches that doc identifier and adopt that SHEntry's
      // BFCacheEntry.  If we don't find a match, insert shEntry as the match
      // for the document identifier.
      let matchingEntry = docIdentMap[entry.docIdentifier];
      if (!matchingEntry) {
        matchingEntry = {shEntry: shEntry, childDocIdents: childDocIdents};
        docIdentMap[entry.docIdentifier] = matchingEntry;
      }
      else {
        shEntry.adoptBFCacheEntry(matchingEntry.shEntry);
        childDocIdents = matchingEntry.childDocIdents;
      }
    }

    if (entry.owner_b64) {
      var ownerInput = Components.classes["@mozilla.org/io/string-input-stream;1"].
                       createInstance(Components.interfaces.nsIStringInputStream);
      var binaryData = atob(entry.owner_b64);
      ownerInput.setData(binaryData, binaryData.length);
      var binaryStream = Components.classes["@mozilla.org/binaryinputstream;1"].
                         createInstance(Components.interfaces.nsIObjectInputStream);
      binaryStream.setInputStream(ownerInput);
      try { // Catch possible deserialization exceptions
        shEntry.owner = binaryStream.readObject(true);
      } catch (ex) { debug(ex); }
    }

    if (entry.children && shEntry instanceof Components.interfaces.nsISHContainer) {
      for (var i = 0; i < entry.children.length; i++) {
        //XXXzpao Wallpaper patch for bug 514751
        if (!entry.children[i].url)
          continue;

        // We're getting sessionrestore.js files with a cycle in the
        // doc-identifier graph, likely due to bug 698656.  (That is, we have
        // an entry where doc identifier A is an ancestor of doc identifier B,
        // and another entry where doc identifier B is an ancestor of A.)
        //
        // If we were to respect these doc identifiers, we'd create a cycle in
        // the SHEntries themselves, which causes the docshell to loop forever
        // when it looks for the root SHEntry.
        //
        // So as a hack to fix this, we restrict the scope of a doc identifier
        // to be a node's siblings and cousins, and pass childDocIdents, not
        // aDocIdents, to _deserializeHistoryEntry.  That is, we say that two
        // SHEntries with the same doc identifier have the same document iff
        // they have the same parent or their parents have the same document.

        shEntry.AddChild(this.deserializeEntry(entry.children[i], idMap,
                                               childDocIdents), i);
      }
    }

    return shEntry;
  },
}

mgsuiteFr.init();
