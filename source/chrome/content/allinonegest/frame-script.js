"use strict";

var mgsuiteFr = {
  collectElementsData: false,
  undoHideObjects: [],
  
  init: function() {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService);
    this.prefBranch = prefService.getBranch("allinonegest.");

    addMessageListener("MouseGesturesSuite:startMouseMove", this);
    addMessageListener("MouseGesturesSuite:endMouseMove", this);
    addMessageListener("MouseGesturesSuite:getContentWindow", this);
    addMessageListener("MouseGesturesSuite:insertHistory", this);
    addMessageListener("MouseGesturesSuite:test", this);
    addMessageListener("MouseGesturesSuite:displayGesturesList", this);
    addMessageListener("MouseGesturesSuite:scrollElement", this);
    addMessageListener("MouseGesturesSuite:goToNextPrevLink", this);
    addMessageListener("MouseGesturesSuite:reloadFrame", this);
    addMessageListener("MouseGesturesSuite:nukeFlashObjects", this);
    addMessageListener("MouseGesturesSuite:hideObject", this);
    addMessageListener("MouseGesturesSuite:undoHideObject", this);
    addMessageListener("MouseGesturesSuite:runUserScript", this);
    addMessageListener("MouseGesturesSuite:startAutoScroll", this);
    addMessageListener("MouseGesturesSuite:setAutoScrollDist", this);
    addMessageListener("MouseGesturesSuite:stopAutoScroll", this);
    addMessageListener("MouseGesturesSuite:scrollWinOrElem", this);
    addEventListener("mousedown", this, true);
    addEventListener("click", this, true);
  },
  
  /* Receiving message from addMessageListener */
  receiveMessage: function(aMsg) {
    switch (aMsg.name) {
      case "MouseGesturesSuite:startMouseMove": this.startMouseMove(); break;
      case "MouseGesturesSuite:endMouseMove": this.endMouseMove(); break;
      case "MouseGesturesSuite:getContentWindow": this.getContentWindow(aMsg); break;
      case "MouseGesturesSuite:displayGesturesList": this.displayGesturesList(aMsg); break;
      case "MouseGesturesSuite:insertHistory": this.insertHistory(aMsg); break;
      case "MouseGesturesSuite:scrollElement": this.scrollElement(aMsg); break;
      case "MouseGesturesSuite:goToNextPrevLink": this.goToNextPrevLink(aMsg); break;
      case "MouseGesturesSuite:reloadFrame": this.reloadFrame(aMsg); break;
      case "MouseGesturesSuite:nukeFlashObjects": this.nukeFlashObjects(aMsg); break;
      case "MouseGesturesSuite:hideObject": this.hideObject(aMsg); break;
      case "MouseGesturesSuite:undoHideObject": this.undoHideObject(aMsg); break;
      case "MouseGesturesSuite:runUserScript": this.runUserScript(aMsg); break;
      case "MouseGesturesSuite:startAutoScroll": this.startAutoScroll(aMsg); break;
      case "MouseGesturesSuite:setAutoScrollDist": this.setAutoScrollDist(aMsg); break;
      case "MouseGesturesSuite:stopAutoScroll": this.stopAutoScroll(aMsg); break;
      case "MouseGesturesSuite:scrollWinOrElem": this.scrollWinOrElem(aMsg); break;
      //case "MouseGesturesSuite:test": this.test(aMsg); break;
    }
  },
  
  /* Handle mouse event */
  handleEvent: function(e) {
    if (!e.target.ownerDocument) {
      // in print preview we don't need to collect any document data
      return;
    }
    
    var elemInfo;
    
    if (e.button == 1 && (e.type == 'click' || e.type == 'mousedown')) {
      // middle button
      elemInfo = this.getElementInfo(e);
      
      var scrollEnabled = this.prefBranch.getBoolPref("autoscrolling2") && this.prefBranch.getIntPref("autoscrollpref") != 1;
      var evenOnLink = this.prefBranch.getBoolPref("evenOnLink");
      
      if (e.type == 'click' && scrollEnabled
          && evenOnLink && elemInfo.link) {
        // block click from reaching page
        e.stopPropagation();
        e.preventDefault();
      }
      
      if (e.type == 'mousedown') {
        // possible start of middle button scrolling
        this.nodeToScroll = this.findNodeToScroll(e.target);
        
        if (this.nodeToScroll && scrollEnabled
          && this.prefBranch.getIntPref("mousebuttonpref") != 1
          && (evenOnLink || !elemInfo.link)
        ) {
          sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {callback: 'overlay.middleButtonDown'}, {param: [this.nodeToScroll, e.target]});
        }
      }
    }
    
    if (e.type == 'mousedown') {
      this.mouseDownFrame = e.target.ownerDocument.defaultView;
      sendAsyncMessage("MouseGesturesSuite:CollectFrame", {}, {frame: this.mouseDownFrame});
            
      this.firstLink = null;
      
      // save mousedown element e.g. for scrolling actions
      e.target.ownerDocument.defaultView.top.mgsuiteMouseDownEvent = e;

      var isKeyOK = !(e.altKey && this.prefBranch.getBoolPref("noAltGest"));
      
      if (isKeyOK && e.button == 0 && this.prefBranch.getIntPref("mousebuttonpref") == 0) {
        // left button gesture
        var ok = this.isAreaOKForLeftButtonGesture(e.target);
        
        if (ok) {
          // stop left button from reaching page - this will be gesture
          e.preventDefault();
          e.stopPropagation();
        }
      }
      
      if (e.button == 2) {
        // turn off gesture on active flash because right click event may be triggered
		// and the gesture may end up unfinished after flash context menu appears
        let targetName = e.target.localName.toLowerCase();
        if ((targetName == "object" || targetName == "embed")
             && e.target.actualType == "application/x-shockwave-flash"
              && e.target.activated) {
          sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {callback: 'overlay.killGestureOnFlash'});
        }
      }
    }
    
    if (this.collectElementsData || e.type == 'mousedown') {
      // send link and image info found under gesture to mouse gesture script
      if (!elemInfo) {
        elemInfo = this.getElementInfo(e);
      }
      
      if (elemInfo.link || elemInfo.img || elemInfo.bgImgUrl || e.type == 'mousedown') {
        if (elemInfo.link && !this.firstLink) {
          this.firstLink = elemInfo.link;
        }
        
        // send link url or image
        sendAsyncMessage("MouseGesturesSuite:CollectLinks", {bgImgUrl: elemInfo.bgImgUrl, eventType: e.type}, {link: elemInfo.link, img: elemInfo.img});
      }
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
  
  isAreaOKForLeftButtonGesture: function(node) {
    var tag = node.nodeName.toLowerCase();
  
    var ok = 
     (tag != "input" && tag != "textarea"
     && tag != "option" && tag != "select" && tag != "textarea" && tag != "textbox" && tag != "menu");
     
    return ok;
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
  
  // invoked when mousedown happens in chrome scope
  startMouseMove: function() {
    addEventListener("mousemove", this);
    this.collectElementsData = true;
  },
  
  endMouseMove: function() {
    removeEventListener("mousemove", this);
    this.collectElementsData = false;
  },
   
  getContentWindow: function(msg) {
    sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {callback: msg.data}, {param: [content]});
  },
  
  displayGesturesList: function(msg) {
    mgsuiteFr.recentMsgData = msg.data;
    addEventListener("DOMContentLoaded", mgsuiteFr.displayGesturesList2, false);
  },
  
  // Create help page at chrome://mgsuite/content/show-gestures.html listing all defined gestures
  displayGesturesList2: function(e) {
    var doc = content.document;
    
    // Page content for innerHTML comes from aioGesturesPage() function in gestimp.js
    // and contains html code with table containing gestures list and their definitions.
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
    var entry, shEntry;
    let idMap = { used: {} };
    let docIdentMap = {};
    
    for (var i=0; i<entries.length; i++) {
      entry = entries[i];
      if (typeof entry == 'string') {
        // new entry type (Fx43+) passed as JSON
        entry = JSON.parse(entries[i]);
      }
      
      if (!entry.url) continue;
      shEntry = this.deserializeEntry(entry, idMap, docIdentMap);
      sHistory.addEntry(shEntry, true);
    }
    
    var scrollIsSet = false;
    
    addEventListener('DOMContentLoaded', function(e) {
      if (!scrollIsSet) {
        mgsuiteFr.setScrollPosition(msg.data.scrollX, msg.data.scrollY, 10);
        scrollIsSet = true;
      }
    }, true);        

    docShell.gotoIndex(msg.data.index);
  },
  
  setScrollPosition: function(x, y, attempts) {
    content.scrollTo(x, y);
    
    if (attempts > 0 && (content.scrollX != x || content.scrollY != y)) {
      var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
      
      timer.initWithCallback(function() {
        mgsuiteFr.setScrollPosition(x, y, --attempts);
        
      }, 50, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
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
  
  
  
  findNodeToScroll: function(initialNode) {

    function getStyle(elem, aProp) {
      var p = elem.ownerDocument.defaultView.getComputedStyle(elem, "").getPropertyValue(aProp);
      var val = parseFloat(p);
      if (!isNaN(val)) return Math.ceil(val);
      if (p == "thin") return 1;
      if (p == "medium") return 3;
      if (p == "thick") return 5;
      return 0;
    }
    
    function isUnformattedXML(aDoc) {
      return /\/[\w+]*xml/.test(aDoc.contentType) && aDoc.styleSheets && aDoc.styleSheets.length && aDoc.styleSheets[0].href &&
            aDoc.styleSheets[0].href.substr(-31) == "/content/xml/XMLPrettyPrint.css";
    }

    const scrollingAllowed = ['scroll', 'auto'];
    const defaultScrollBarSize = 16;
    const twiceScrollBarSize = defaultScrollBarSize * 2;
    
    var retObj = {
      scrollType: 3,
      isXML: false,
      nodeToScroll: null,
      dX: 0,
      dY: 0,
      docWidth: 0,
      docHeight: 0,
      clientFrame: null,
      isBody: false,
      isFrame: false,
      targetDoc: null,
      insertionNode: null,
      docBoxX: 0,
      docBoxY: 0,
      realHeight: 0,
      ratioX: -1,
      ratioY: -1,
      XMLPrettyPrint: false,
      cursorChangeable: false
    };
    
    var realWidth, realHeight, nextNode, currNode;
    var targetDoc = initialNode.ownerDocument;
    var docEl = targetDoc.documentElement;
    var clientFrame = targetDoc.defaultView;
    retObj.insertionNode = (docEl) ? docEl : targetDoc;
    retObj.XMLPrettyPrint = isUnformattedXML(targetDoc);
    
    var domWindowUtils = clientFrame.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
    var zoom = domWindowUtils.fullZoom;

    var insertBounds = retObj.insertionNode.getBoundingClientRect();
    retObj.docBoxX = Math.floor((clientFrame.mozInnerScreenX + insertBounds.left) * zoom);
    retObj.docBoxY = Math.floor((clientFrame.mozInnerScreenY + insertBounds.top) * zoom);

    retObj.targetDoc = targetDoc;
    retObj.clientFrame = clientFrame;
    
    if (docEl && docEl.nodeName.toLowerCase() == "html") { // walk the tree up looking for something to scroll
	  if (clientFrame.frameElement) {
        retObj.isFrame = true;
      } else {
        retObj.isFrame = false;
      }
      
	  var bodies = docEl.getElementsByTagName("body");
	  if (!bodies || !bodies.length) return retObj;
      
	  var bodyEl = bodies[0];
	  if (initialNode == docEl) nextNode = bodyEl;
	  else if (initialNode.nodeName.toLowerCase() == "select") nextNode = initialNode.parentNode;
		   else nextNode = initialNode;
	  
	  do {
		try {
		  currNode = nextNode;
		  if (!(currNode instanceof content.HTMLElement)) {
			// some non-html element, e.g. svg
			nextNode = currNode.parentNode;
			continue;
		  }

		  if ((currNode instanceof content.HTMLHtmlElement) ||
                (currNode instanceof content.HTMLBodyElement)) {
            if (clientFrame.scrollMaxX > 0) {
			  retObj.scrollType = clientFrame.scrollMaxY > 0 ? (clientFrame.scrollbars.visible ? 0 : 3) : 2;			 
			} else {
			  retObj.scrollType =  (clientFrame.scrollMaxY > 0 && clientFrame.scrollbars.visible) ? 1 : 3;
			}
          }
		  else {
			var overflowx = currNode.ownerDocument.defaultView
								.getComputedStyle(currNode, '')
								.getPropertyValue('overflow-x');
			var overflowy = currNode.ownerDocument.defaultView
								.getComputedStyle(currNode, '')
								.getPropertyValue('overflow-y');

			// Bug 212763 - overflow: visible on textarea isn't applied 
			if (currNode instanceof content.HTMLTextAreaElement) {
			  if (overflowx == "visible") overflowx = "scroll";
			  if (overflowy == "visible") overflowy = "scroll";
			}
  
			var scrollVert = currNode.clientHeight > 0 &&
							 currNode.scrollHeight > currNode.clientHeight &&
							 (currNode instanceof content.HTMLSelectElement ||
							 scrollingAllowed.indexOf(overflowy) >= 0);
  
			// do not allow horizontal scrolling for select elements, it leads
			// to visual artifacts and is not the expected behavior anyway
			if (!(currNode instanceof content.HTMLSelectElement) &&
				 currNode.clientWidth > 0 &&
				 currNode.scrollWidth > currNode.clientWidth &&
				 scrollingAllowed.indexOf(overflowx) >= 0) {
			  retObj.scrollType = scrollVert ? 0 : 2;
			}
			else {
			  retObj.scrollType = scrollVert ? 1 : 3;
			}
		  }

		  if (retObj.scrollType != 3) {
			retObj.nodeToScroll = currNode;
			retObj.isBody = (currNode instanceof content.HTMLHtmlElement) || (currNode instanceof content.HTMLBodyElement);
				
			if (retObj.isBody) {
			  retObj.docWidth = clientFrame.innerWidth + clientFrame.scrollMaxX;
			  retObj.docHeight = clientFrame.innerHeight + clientFrame.scrollMaxY;
			  realWidth = clientFrame.innerWidth;
			  realHeight = clientFrame.innerHeight;
			  retObj.realHeight = realHeight;
			  realWidth *= zoom;
              realHeight *= zoom;
			  if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
			  if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
			  retObj.ratioX = retObj.docWidth / realWidth;
			  retObj.ratioY = retObj.docHeight / realHeight;
			}
			else {
			  retObj.docWidth = docEl.scrollWidth; retObj.docHeight = docEl.scrollHeight;
			  realWidth = currNode.clientWidth + getStyle(currNode, "border-left-width") + getStyle(currNode, "border-right-width");
			  realHeight = currNode.clientHeight + getStyle(currNode, "border-top-width") + getStyle(currNode, "border-bottom-width");
			  retObj.realHeight = realHeight;
			  realWidth *= zoom; realHeight *= zoom;
			  if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
			  if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
			  retObj.ratioX = currNode.scrollWidth / realWidth;
			  retObj.ratioY = currNode.scrollHeight / realHeight;
			}
			return retObj;
		  }
		  nextNode = currNode.parentNode;
		}
	  catch(err) {
        return retObj;
      }
	} while (nextNode && currNode != docEl);

      // if we're in a frame, check embedding frame/window
      if (retObj.isFrame) {
        return this.findNodeToScroll(clientFrame.frameElement.ownerDocument.documentElement);
      }
    }
    else { // XML document; do our best
      retObj.nodeToScroll = initialNode;
      retObj.docWidth = clientFrame.innerWidth + clientFrame.scrollMaxX;
      retObj.docHeight = clientFrame.innerHeight + clientFrame.scrollMaxY;
      realWidth = clientFrame.innerWidth;
      realHeight = clientFrame.innerHeight;
      retObj.realHeight = realHeight;
      realWidth *= zoom; realHeight *= zoom;
      if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
      if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
      retObj.ratioX = retObj.docWidth / realWidth;
      retObj.ratioY = retObj.docHeight / realHeight;
      retObj.scrollType = 3 - (((clientFrame.scrollMaxY > 0) - 0) << 1) - ((clientFrame.scrollMaxX > 0) - 0);

      retObj.isXML = true;
    }
    return retObj;
  },
  
  /**
   * Scroll element or document vertically
   */
  scrollElement: function(msg) {
    var value = msg.data.value;
    var node = content.top.mgsuiteMouseDownEvent.target;
    
    if (!node) {
      return;
    }
    
    var scrollObj = this.findNodeToScroll(node);
    if (scrollObj.scrollType >= 2) return;
    
    var useScrollToBy = scrollObj.isXML || scrollObj.isBody;
    
    if (msg.data.relative) {
       var val = Math.round(scrollObj.realHeight * 0.9 * value)
       if (!val) val = value;
       if (useScrollToBy) scrollObj.clientFrame.scrollBy(0, val);
       else scrollObj.nodeToScroll.scrollTop += val;
    }     
    else
       if (useScrollToBy) scrollObj.clientFrame.scrollTo(scrollObj.clientFrame.pageXOffset, value);
       else scrollObj.nodeToScroll.scrollTop = value;
  },
  
  
  startAutoScroll: function(msg) {
    this.autoScrollMoved = false;
    this.scrollCount = 0;
    this.scrollByXStack = 0;
    this.scrollByYStack = 0;
    this.scrollMax = msg.data.scrollMax;
    this.autoScrollDistX = [0, 0, 0, 0];
    this.autoScrollDistY = [0, 0, 0, 0];
    
    this.autoScrollTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
      
    this.autoScrollTimer.initWithCallback(function() {
      mgsuiteFr.scrollWinOrElemByInterval(msg.data.whatToScroll);
      
    }, msg.data.interval, Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
  },
  
  stopAutoScroll: function() {
    if (this.autoScrollTimer) {
      this.autoScrollTimer.cancel();
      this.autoScrollTimer = null;
    }
  },
  
  setAutoScrollDist: function(msg) {
    if (msg.data.x !== null) {
      this.autoScrollDistX = msg.data.x;
    }
    if (msg.data.y !== null) {
      this.autoScrollDistY = msg.data.y;
    }
  },
  
    /**
   * Scroll element or window (used by auto scroll)
   * @param {String} whatToScroll element|window
   */
  scrollWinOrElemByInterval: function(whatToScroll) {
    var moveX = mgsuiteFr.autoScrollDistX[mgsuiteFr.scrollCount];
    var moveY = mgsuiteFr.autoScrollDistY[mgsuiteFr.scrollCount];
    
    if (moveX != 0 || moveY != 0) {
      var scrollNow = function() {
        var absScrollX = Math.abs(mgsuiteFr.scrollByXStack);
        var absScrollY = Math.abs(mgsuiteFr.scrollByYStack);
        
        if (absScrollX < 1 && absScrollY < 1) {
          return;
        }
        
        if (whatToScroll == 'element') {
          if (mgsuiteFr.scrollByXStack) {
            mgsuiteFr.nodeToScroll.nodeToScroll.scrollLeft += mgsuiteFr.scrollByXStack;
          }
          if (mgsuiteFr.scrollByYStack) {
            mgsuiteFr.nodeToScroll.nodeToScroll.scrollTop += mgsuiteFr.scrollByYStack;
          }
          
        } else if (whatToScroll == 'window') {
          mgsuiteFr.nodeToScroll.clientFrame.scrollBy(mgsuiteFr.scrollByXStack, mgsuiteFr.scrollByYStack);
        }
        
        // subtract and leave only fractions below 1
        mgsuiteFr.scrollByXStack -= Math.floor(absScrollX) * Math.sign(mgsuiteFr.scrollByXStack);
        mgsuiteFr.scrollByYStack -= Math.floor(absScrollY) * Math.sign(mgsuiteFr.scrollByYStack);
      }
      
      // We accumulate amount of pixels to scroll in 'stack' variables
      // so that scrolling can catch up in case of delays. This improves
      // scroll smoothness and speed stablity.
      mgsuiteFr.scrollByXStack += moveX;
      mgsuiteFr.scrollByYStack += moveY;
      
      content.requestAnimationFrame(function() {
        // setTimeout improves speed and smoothness
        content.setTimeout(scrollNow, 0);
      });
      
      if (!mgsuiteFr.autoScrollMoved) {
        mgsuiteFr.autoScrollMoved = true;
        sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {callback: 'overlay.setAutoScrollMoved'});
      }
    }
    
    if (++mgsuiteFr.scrollCount >= mgsuiteFr.scrollMax) {
      mgsuiteFr.scrollCount = 0;
    }
  },
  
    /**
   * Scroll element or window (used by grab & drag scrolling)
   * @param {Object} msg.data:
   *   @param {String} whatToScroll element|window
   *   @param {Number} moveX
   *   @param {Number} moveY
   */
  scrollWinOrElem: function(msg) {
    if (msg.data.whatToScroll == 'element') {
      if (msg.data.moveX) {
        mgsuiteFr.nodeToScroll.nodeToScroll.scrollLeft += msg.data.moveX;
      }
      if (msg.data.moveY) {
        mgsuiteFr.nodeToScroll.nodeToScroll.scrollTop += msg.data.moveY;
      }
      
    } else if (msg.data.whatToScroll == 'window') {
      mgsuiteFr.nodeToScroll.clientFrame.scrollBy(msg.data.moveX, msg.data.moveY);
    }
  },
  
  /**
   * Go to next or previous link whose text is defined in options.
   * @param {String} msg.data.direction next|prev
   * @param {String} msg.data.nextsString
   * @param {String} msg.data.prevsString
   */
  goToNextPrevLink: function(msg) {
    
    var dir = msg.data.direction;
    
    var re = [];
    var doc = content.document;
    var links = doc.getElementsByTagName("link");
    var imgElems;
    for (var i = 0; i < links.length; ++i) {
      if (links[i].getAttribute("rel") && links[i].getAttribute("rel").toLowerCase() == dir) {
         if (links[i].href) { content.location.href = links[i].href; return; }
      }
    }
      
    var nextArray = (dir == "next") ? msg.data.nextsString.split("|") : msg.data.prevsString.split("|");
    
    if (!nextArray.length) return;
    
    for (var j = 0; j < nextArray.length; ++j) {
       re[j] = new RegExp(nextArray[j], "i");
    }
    
    links = doc.links;
    
    for (var j = 0; j < re.length; ++j) {
      for (var i = 0; i < links.length; ++i) { // search for exact match
        if (links[i].textContent && links[i].textContent.search(re[j]) != -1 &&
            nextArray[j].length == links[i].textContent.length && links[i].href) {
          content.location.href = links[i].href;
          return;
        }
      }
    }
    
    for (var j = 0; j < re.length; ++j) {
      for (var i = 0; i < links.length; ++i) { // search for partial match
        if (links[i].textContent && links[i].textContent.search(re[j]) != -1 && links[i].href) {
          content.location.href = links[i].href;
          return;
        }
        imgElems = links[i].getElementsByTagName("img"); // Is it an image tag?
        if (imgElems.length > 0 && imgElems[0].src && imgElems[0].src.search(re[j]) != -1 && links[i].href) {
          content.location.href = links[i].href;
          return;
        }
      }
    }
  },
  
  reloadFrame: function() {
    content.top.mgsuiteMouseDownEvent.target.ownerDocument.location.reload();
  },
  
  /**
   * Hide all flash objects.
   * @param {String} msg.data.clickToViewStr
   */
  nukeFlashObjects: function(msg) {
    function getElemsByTagNameForAllFrames(frameDoc, tagName) {
      var elsWithTag = [];
      var frames = frameDoc.getElementsByTagName("frame");
      for (var i = 0; i < frames.length; ++ i)
          elsWithTag = elsWithTag.concat(getElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
      frames = frameDoc.getElementsByTagName("iframe");
      for (i = 0; i < frames.length; ++ i)
          elsWithTag = elsWithTag.concat(getElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
      var lEls = frameDoc.getElementsByTagName(tagName);
      for (i = 0; i < lEls.length; ++i) elsWithTag.push(lEls[i]);
      return elsWithTag;
    }
    
    function playFlash(e) {
      e.currentTarget.removeEventListener("click", playFlash, true);
      var flashNode = e.currentTarget.nextSibling;
      var disp = e.currentTarget.getAttribute("hiddenByMGSuite");
      e.currentTarget.parentNode.removeChild(e.currentTarget);
      var style = flashNode.getAttribute("style") || "";
      flashNode.setAttribute("style", style + "display:" + disp + ";");
    }
    
    var currFlash, height, width, top, next, span, text, view, disp, style;
    var topDocument = content.top.document;
    
    var embeds = getElemsByTagNameForAllFrames(topDocument, "embed");
    embeds = embeds.concat(getElemsByTagNameForAllFrames(topDocument, "object"));
    
    for (var i = 0; i < embeds.length; ++i) {
      currFlash = embeds[i];
      if (currFlash.getAttribute("type") != "application/x-shockwave-flash") continue;
      if (currFlash.parentNode.nodeName.toLowerCase() == "object") {
        top = currFlash.parentNode.parentNode;
        next = currFlash.parentNode;
      }
      else {
        top = currFlash.parentNode;
        next = currFlash;
      }
      if (next.previousSibling && next.previousSibling.nodeName.toLowerCase() == "span"
          && next.previousSibling.hasAttribute("hiddenByMGSuite")) continue;
      view = next.ownerDocument.defaultView;
      disp = view.getComputedStyle(next, "").getPropertyValue("display");
      width = currFlash.offsetWidth;
      height = currFlash.offsetHeight;
      
      if (height && width) {
         style = next.getAttribute("style") || "";
         next.setAttribute("style", style + "display:none;");
         span = content.document.createElement("span");
         text = content.document.createTextNode("[" + msg.data.clickToViewStr + "]");
         span.appendChild(text);
         top.insertBefore(span, next);
         span.setAttribute("style", "height:" + (height - 2) + "px;width:" + (width - 2) + "px;border:1px solid black;display:inline-block;");
         span.setAttribute("hiddenByMGSuite", disp);
         span.addEventListener("click", playFlash, true);
      }
    }
  },
  
  hideObject: function() {
    var node = content.top.mgsuiteMouseDownEvent.target;
    if (!node) return;
    
    var view = node.ownerDocument.defaultView;
    var disp = view.getComputedStyle(node, "").getPropertyValue("display");
    node.setAttribute("MGSuiteOriginalDisplay", "display:" + disp + ";");
    var style = node.getAttribute("style") || "";
    node.setAttribute("style", style + "display:none;");
    this.undoHideObjects.push(node);
  },
  
  undoHideObject: function() {
    try {
      var node = this.undoHideObjects.pop();
      if (!node || !node.hasAttribute("MGSuiteOriginalDisplay")) return;
      var style = node.getAttribute("style") || "";
      node.setAttribute("style", style + node.getAttribute("MGSuiteOriginalDisplay"));
    }
    catch(err) {}
  },
  
  runUserScript: function(msg) {
    var event = content.top.mgsuiteMouseDownEvent;
    
    if (msg.data.onTab || !event) {
      // gesture started on tab or some other case where event is not available
      var doc = content.document;
      
    } else {
      // the document can be a frame, that's why we get it from event
      var doc = event.target.ownerDocument.defaultView.document;
    }
    
    if (!doc.body) {
      // probably a non-html document is loaded, like XML
      return;
    }
    
    var funcParams, node;

    if (msg.data.onTab) {
      funcParams = "document.documentElement, null, true";
      
    } else {
      if (event) {
        node = event.target;
        node.setAttribute('data-mgsuite-mousedown-tmp-node', 'dummy');
      }
      
      if (this.firstLink) {
        this.firstLink.node.setAttribute('data-mgsuite-mousedown-tmp-link', 'dummy');
      }
      
      funcParams = "document.querySelector('*[data-mgsuite-mousedown-tmp-node]')"
      + ", document.querySelector('*[data-mgsuite-mousedown-tmp-link]')"
      + ", false";
    }
    
    // inject and run user script in target page or frame
    var str = "(function(node, link, onTab) { " + msg.data.js + " })("
      + funcParams
      + ");";
    
    var script = doc.createElement("script");
    script.textContent = str;
    doc.head.appendChild(script);
    doc.head.removeChild(script);
    
    if (!msg.data.onTab && node) {
      node.removeAttribute('data-mgsuite-mousedown-tmp-node');
      
      if (this.firstLink) {
        this.firstLink.node.removeAttribute('data-mgsuite-mousedown-tmp-link', 'dummy');
      }
    }
  }
}

mgsuiteFr.init();
