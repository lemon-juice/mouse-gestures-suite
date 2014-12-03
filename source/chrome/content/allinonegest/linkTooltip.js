/*
 * linkTooltip.js
 * For licence information, read licence.txt
 *
 * handling of link tooltips
 *
 */
"use strict";

function aioHasNewWindowTarget(node) { // code from Chris Cook's Tabbrowser Preferences
  function notExistingFrameName(containerFrame, targetFrame) {
    for (var i = 0; i < containerFrame.length; ++i) {
       if (containerFrame[i].name == targetFrame) return false;
       if (containerFrame[i].frames.length && !notExistingFrameName(containerFrame[i].frames, targetFrame))
          return false;
    }
    return true;
  }

  var aiotarget = node.getAttribute("aiotarget");
  if (aiotarget) return aiotarget == "true";
  var target = node.getAttribute("target");
  // If link has no target attribute, check if there is a <base> with a target attribute
  if (!target) {
     var bases = node.ownerDocument.documentElement.getElementsByTagName("base");
     for (var i = bases.length - 1; i >= 0; --i) {
        target = bases[i].getAttribute("target");
        if (target) break;
     }
  }
  var hasNewWindow = target && (target == "_blank" || (target != "_self" && target !=" _parent" && target != "_top"
        && notExistingFrameName(document.commandDispatcher.focusedWindow.top.frames, target)));
  node.setAttribute("aiotarget", hasNewWindow ? "true": "false");
  return hasNewWindow;
}

function aioGetTextForTitle(linkNode) { // from pageInfo.js; modified by M.B.
  function getTitleAltText(node) {
    if (node.hasAttribute("title")) {
       var altText = node.getAttribute("title");
       node.removeAttribute("title");
       return altText;
    }
    if (node.alt) return node.alt;
    altText = "";
    var length = node.childNodes.length;
    for (var i = 0; i < length; i++)
       if ((altText = getAltText(node.childNodes[i]) != undefined)) return altText;
    return "";
  }

  const nsIImageElement = Components.interfaces.nsIDOMHTMLImageElement;
  const nsIAreaElement = Components.interfaces.nsIDOMHTMLAreaElement;
  var s, childNode, nodeType;
  if (linkNode.hasAttribute("aioTitle")) return linkNode.getAttribute("aioTitle");
  if (linkNode.hasAttribute("title")) {
     var valueText = linkNode.getAttribute("title");
     linkNode.removeAttribute("title");
  }
  else {
     valueText = "";
     if (linkNode instanceof nsIAreaElement) valueText = linkNode.alt;
     else {
        var length = linkNode.childNodes.length;
        for (var i = 0; i < length; i++) {
          childNode = linkNode.childNodes[i];
          nodeType = childNode.nodeType;
          if (nodeType == Node.TEXT_NODE) valueText += " " + childNode.nodeValue;
          else if (nodeType == Node.ELEMENT_NODE)
            if (childNode instanceof nsIImageElement) {
               s = getTitleAltText(childNode);
               if (s) {
                  valueText = s; break;
               }
            } 
            else valueText += " " + aioGetTextForTitle(childNode);
        }
     }
  }
  var middleRE = /\s+/g;
  var endRE = /(^\s+)|(\s+$)/g;
  valueText = valueText.replace(middleRE, " ").replace(endRE, "")
  linkNode.setAttribute("aioTitle", valueText);
  return valueText;
}

function aioShowTitle(e) {
  if (mgsuite.overlay.aioDownButton != mgsuite.const.NoB || mgsuite.overlay.aioTTShown || (mgsuite.overlay.aioShiftForTitle && !e.shiftKey)) return;
  var linkNode = mgsuite.overlay.aioFindLink(e.target, false);
  if (!linkNode) return;
  aioGetTextForTitle(linkNode); // prevent native title to popup
  if (mgsuite.overlay.aioTTTimer) clearTimeout(mgsuite.overlay.aioTTTimer);
  linkNode.addEventListener("mouseout", aioEraseTitlePopup, true);
  window.addEventListener("mousedown", aioEraseTitlePopup, true);
  window.addEventListener("DOMMouseScroll", aioEraseTitlePopup, true);
  mgsuite.overlay.aioTTNode = linkNode;
  mgsuite.overlay.aioTTTimer = setTimeout(function(a, b){aioShowTitlePopup(a, b);},
                          mgsuite.overlay.aioShiftForTitle ? 50 : mgsuite.overlay.aioTitleDelay, e.screenX, e.screenY);
}

function aioShowTitlePopup(X, Y) {
  mgsuite.overlay.aioTTShown = true;
  mgsuite.overlay.aioTTTimer = null;
  mgsuite.overlay.aioTTPU = new mgsuite.overlay.aioPopUp(0, 0, 0, false, "tooltip", X, Y, aioHasNewWindowTarget(mgsuite.overlay.aioTTNode),
                         null, mgsuite.overlay.aioLinkTTPopping, null);
  mgsuite.overlay.aioTTPU.createPopup(aioGetTextForTitle(mgsuite.overlay.aioTTNode), mgsuite.overlay.aioGetHRef(mgsuite.overlay.aioTTNode), "");
  mgsuite.overlay.aioTTTimer = setTimeout(function(){aioEraseTitlePopup(null);}, mgsuite.overlay.aioTitleDuration);
}

function aioEraseTitlePopup(e) {
  if (mgsuite.overlay.aioTTTimer) {
     clearTimeout(mgsuite.overlay.aioTTTimer);
     mgsuite.overlay.aioTTTimer = null;
  }
  mgsuite.overlay.aioTTNode.removeEventListener("mouseout", aioEraseTitlePopup, true);
  window.removeEventListener("mousedown", aioEraseTitlePopup, true);
  window.removeEventListener("DOMMouseScroll", aioEraseTitlePopup, true);
  if (mgsuite.overlay.aioTTShown) mgsuite.overlay.aioTTPU.closePopup(0);
  mgsuite.overlay.aioTTPU = null; mgsuite.overlay.aioTTNode = null;
  if (e && e.type == "mousedown") {
     mgsuite.overlay.aioTTShown = true;
     setTimeout(function(){mgsuite.overlay.aioTTShown = false;}, 2000);
  }
  else mgsuite.overlay.aioTTShown = false;
}
