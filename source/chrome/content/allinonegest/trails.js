/*
 * trails.js
 * For licence information, read licence.txt
 *
 * handling of gesture trails
 *
 */
var aioTrailDot;
var aioTrailCont = null;
var aioTrailZoom, scaledTrailWidth;
var aioTrailX, aioTrailY, aioDocX, aioDocY;
var aioDraw = null;


function aioStartTrail(e) {
  var targetDoc = e.target.ownerDocument;
  if (targetDoc.defaultView.top instanceof Window) targetDoc = targetDoc.defaultView.top.document;
  if (aioIsUnformattedXML(targetDoc)) return;

  var trailZoom = 0;
  var domWindowUtils = targetDoc.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                      .getInterface(Components.interfaces.nsIDOMWindowUtils);
						   
  if (aioFxV18) trailZoom = domWindowUtils.fullZoom;
	else trailZoom = domWindowUtils.screenPixelsPerCSSPixel;
  
  aioTrailZoom = (trailZoom == 1) ? 0 : trailZoom;

  aioTrailCont = targetDoc.createElementNS(xhtmlNS, "aioTrailContainer");
  aioTrailCont.style.position = "fixed";
  
  if (aioWindowType == 'browser') {
	// insert trail outside viewable document to avoid DOM delays on large documents
	aioTrailZoom = 0;
	scaledTrailWidth = Math.max(Math.round(aioTrailSize * trailZoom), 1);
	
	var insertionNode = document.getElementById("content"); // tabbrowser
	aioDocX = Math.floor(window.mozInnerScreenX * 1);
	aioDocY = Math.floor(window.mozInnerScreenY * 1);
	insertionNode.appendChild(aioTrailCont);
	
  } else {
	aioTrailZoom = (trailZoom == 1) ? 0 : trailZoom;
	scaledTrailWidth = aioTrailSize;
	
	var insertionNode = (targetDoc.documentElement) ? targetDoc.documentElement : targetDoc;
	aioDocX = Math.floor(targetDoc.defaultView.mozInnerScreenX * trailZoom);
	aioDocY = Math.floor(targetDoc.defaultView.mozInnerScreenY * trailZoom);
	
	// insertBefore is much faster than appendChild on large documents
	insertionNode.insertBefore(aioTrailCont, insertionNode.firstChild);
  }
  
  aioTrailDot = targetDoc.createElementNS(xhtmlNS, "aioTrailDot");
  with (aioTrailDot.style) {
     width = scaledTrailWidth + "px";
     height = scaledTrailWidth + "px";
     background = aioTrailColor;
     border = "0px";
     position = "fixed";
     zIndex = 2147483647;
     opacity = aioTrailOpacity / 100;
     pointerEvents = "none";
  }

  aioTrailX = e.screenX;
  aioTrailY = e.screenY;
}

function aioDrawTrail(e) { // code from Walter Zorn
  var ls, ad, p, pr, pru, ox, oy;

  function appendDot(x, y, w , h) {
    if (aioTrailZoom) {
       x = Math.floor(x / aioTrailZoom);
       y = Math.floor(y / aioTrailZoom);
    }
	
    if (aioDraw) {
       if (aioDraw.y == y && aioDraw.h == h) {
          var newX = Math.min(x, aioDraw.x); // leftmost pixel
          var newW = Math.max(x + w, aioDraw.x + aioDraw.w) - newX;
          aioDraw.x = newX; aioDraw.w = newW;
          aioDraw.lastDot.style.left = newX + "px";
          aioDraw.lastDot.style.width = newW + "px";
          //dump("aggregating horizontally:" + newX + ", " + newW + "\n");
          return;
       }
       if (aioDraw.x == x && aioDraw.w == w) {
          var newY = Math.min(y, aioDraw.y); // uppermost pixel
          var newH = Math.max(y + h, aioDraw.y + aioDraw.h) - newY;
          aioDraw.y = newY; aioDraw.h = newH;
          aioDraw.lastDot.style.top = newY + "px";
          aioDraw.lastDot.style.height = newH + "px";
          //dump("aggregating vertically:" + newY + ", " + newH + "\n");
          return;
       }
    }
    var dot = aioTrailDot.cloneNode(true);
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    dot.style.width = w + "px";
    dot.style.height = h + "px";
    aioTrailCont.appendChild(dot);
    aioDraw = {lastDot: dot, x: x, y: y, w: w, h: h} ;
    //aioDraw = null;   // don't optimize
  }

  if (!aioTrailCont) return;
  try {
     var dumm = aioTrailCont.parentNode; // check if the DOM has been removed to prevent leaks
  }
  catch(e) {
     aioTrailCont = null;
	 return;
  }
  var x1 = aioTrailX - aioDocX;
  var y1 = aioTrailY - aioDocY;
  var x2 = e.screenX - aioDocX;
  var y2 = e.screenY - aioDocY;
  
  if (x1 > x2) {
     var tmpx = x1; var tmpy = y1;
     x1 = x2; y1 = y2;
     x2 = tmpx; y2 = tmpy;
  }
  var dx = x2 - x1; var dy = Math.abs(y2 - y1);
  var yInc = (y1 > y2)? -1 : 1;
  var s = scaledTrailWidth;
  if (dx >= dy) {
     if (dx > 0 && s-3 > 0) {
        ls = (s*dx*Math.sqrt(1+dy*dy/(dx*dx))-dx-(s>>1)*dy) / dx;
        ls = (!(s-4)? Math.ceil(ls) : Math.round(ls)) + 1;
     }
     else ls = s;
     ad = Math.ceil(s / 2);
     pr = dy << 1;
     pru = pr - (dx << 1);
     p = pr - dx;
     ox = x1;
     while (dx > 0) {
       --dx;
       ++x1;
       if (p > 0) {
          appendDot(ox, y1, x1 - ox + ad, ls);
          y1 += yInc;
          p += pru;
          ox = x1;
       }
       else p += pr;
     }
     appendDot(ox, y1, x2 - ox + ad + 1, ls);
  }
  else {
     if (s-3 > 0) {
        ls = (s*dy*Math.sqrt(1+dx*dx/(dy*dy))-(s>>1)*dx-dy) / dy;
        ls = (!(s-4)? Math.ceil(ls) : Math.round(ls)) + 1;
     }
     else ls = s;
     ad = Math.round(s / 2);
     pr = dx << 1;
     pru = pr - (dy << 1);
     p = pr - dy;
     oy = y1;
     if (y2 <= y1) {
        ++ad;
        while (dy > 0) {
          --dy;
          if (p > 0) {
             appendDot(x1++, y1, ls, oy - y1 + ad);
             y1 += yInc;
             p += pru;
             oy = y1;
          }
          else {
             y1 += yInc;
             p += pr;
          }
        }
	    appendDot(x2, y2, ls, oy - y2 + ad);
     }
     else {
        while (dy > 0) {
          --dy;
          y1 += yInc;
          if (p > 0) {
             appendDot(x1++, oy, ls, y1 - oy + ad);
             p += pru;
             oy = y1;
          }
          else p += pr;
        }
        appendDot(x2, oy, ls, y2 - oy + ad + 1);
     }
  }
  aioTrailX = e.screenX; aioTrailY = e.screenY;
}

function aioEraseTrail() {
  try {
     aioTrailCont.parentNode.removeChild(aioTrailCont);
  }
  catch(err) {}
  aioTrailCont = null;
  aioDraw = null;
}
