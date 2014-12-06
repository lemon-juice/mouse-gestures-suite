var mgsuiteFr = {
  
  init: function() {
    addMessageListener("MouseGesturesSuite:startMouseMove", this);
    addMessageListener("MouseGesturesSuite:endMouseMove", this);
    addEventListener("mousedown", this);
  },
  
  /* Receiving message from addMessageListener */
  receiveMessage: function(aMsg) {
    switch (aMsg.name) {
      case "MouseGesturesSuite:startMouseMove": this.startMouseMove(); break;
      case "MouseGesturesSuite:endMouseMove": this.endMouseMove(); break;
    }
  },
  
  /* Handle mouse event */
  handleEvent: function(e) {
    if (!this.collectElementsData) {
      return;
    }
    
    // send link info found under gesture to mouse gesture script
    var elemInfo = this.getElementInfo(e);
    
    if (elemInfo.href || elemInfo.img || elemInfo.bgImgUrl) {
      // send link url or image
      sendAsyncMessage("MouseGesturesSuite:CollectLinks", elemInfo.href, {img: elemInfo.img, bgImgUrl: elemInfo.bgImgUrl});
    }
  },
  
  
  getElementInfo: function(e) {
    var elem = e.target;
    var href, img, bgImgUrl;
    
    while (elem) {
      if (elem.nodeType == 1) { // ELEMENT_NODE
        // Link?
        if (!href &&
            ((elem instanceof content.HTMLAnchorElement && elem.href) ||
            (elem instanceof content.HTMLAreaElement && elem.href) ||
             elem.getAttributeNS("http://www.w3.org/1999/xlink", "type") == "simple")) {

          // elem is link
          href = elem.href;
          if (!href) {
            href = this.link.getAttributeNS("http://www.w3.org/1999/xlink", "href");
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
    
    return {href: href, img: img, bgImgUrl: bgImgUrl};
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
  
  
  //getTopLocation: function(msg) {
  //  var url = content.top.location.href;
  //  sendAsyncMessage("MouseGesturesSuite:returnWithCallback", {param: url, callback: msg.data});
  //}
}

mgsuiteFr.init();
