/*
 * Drawing gesture trails
 */
var aioTrailCont = null;
var aioCtx, aioTrailPoints;;
var aioDocX, aioDocY;
var minX, miny, maxX, maxY;
var haftTrailSize;
var insertionNode;

function aioStartTrail(e) {
  
  aioDocX = window.mozInnerScreenX;
  aioDocY = window.mozInnerScreenY;
  
  // insert trail outside viewable document to avoid DOM delays on large documents
  switch (aioWindowType) {
	case 'browser':
	  insertionNode = document.getElementById("content"); // tabbrowser
	  break;
	
	case 'messenger':
	  insertionNode = document.getElementById("messagepanebox");
	  break;
	
	case 'mailcompose':
	case 'source':
	  insertionNode = document.getElementById("appcontent");
	  break;
  }
  
  if (!insertionNode) {
	return;
  }
  
  haftTrailSize = Math.ceil(aioTrailSize / 2);
  
  var x = e.screenX - aioDocX;
  var y = e.screenY - aioDocY;
  
  aioTrailPoints = [];
  aioTrailPoints.push([x, y]);
  
  minX = x - haftTrailSize;
  maxX = x + haftTrailSize;
  minY = y - haftTrailSize;
  maxY = y + haftTrailSize;
}

function aioDrawTrail(e) {
  if (!insertionNode) return;
  
  if (!aioTrailCont) {
	aioMakeTrailCanvas();
  }
  aioTrailCont.style.opacity = 1;
  
  var x = e.screenX - aioDocX;
  var y = e.screenY - aioDocY;
  
  if (aioSmoothTrail) {
	// erasing all canvas and drawing all line again results in smooth line
	aioTrailPoints.push([x, y]);
	
	// we make canvas the size only as large as necessary, because full size canvas
	// cause flash objects in window mode to disappear
	if (x + haftTrailSize > maxX) {
	  maxX = x + haftTrailSize;
	} else if (x - haftTrailSize < minX) {
	  minX = x - haftTrailSize;
	}
	
	if (y + haftTrailSize > maxY) {
	  maxY = y + haftTrailSize;
	} else if (y - haftTrailSize < minY) {
	  minY = y - haftTrailSize;
	}
	
	aioTrailCont.style.left = minX + "px";
	aioTrailCont.style.top = minY + "px";
	aioTrailCont.width = maxX - minX;
	aioTrailCont.height = maxY - minY;
	
	aioSetCtxProperties();
	  
	var shiftX = aioTrailCont.offsetLeft;
	var shiftY = aioTrailCont.offsetTop;
	  
	aioCtx.beginPath();
	aioCtx.moveTo(aioTrailPoints[0][0] - shiftX, aioTrailPoints[0][1] - shiftY);
	
	for (var i = 1, len=aioTrailPoints.length; i < len; i++) {
	  aioCtx.lineTo(aioTrailPoints[i][0] - shiftX, aioTrailPoints[i][1] - shiftY);
	}
	
  } else {
	aioCtx.lineTo(x, y);
  }
  
  aioCtx.stroke();
}

function aioMakeTrailCanvas() {
  aioTrailCont = document.createElementNS(xhtmlNS, "canvas");
  aioTrailCont.style.position = "fixed";
  aioTrailCont.width = window.outerWidth;
  aioTrailCont.height = window.outerHeight;
  aioTrailCont.style.top = "0";
  aioTrailCont.style.left = "0";
  aioTrailCont.style.pointerEvents = "none";
  aioTrailCont.style.zIndex = 10000;
  
  insertionNode.appendChild(aioTrailCont);

  aioCtx = aioTrailCont.getContext('2d');
  aioSetCtxProperties();
  
  if (!aioSmoothTrail) {
	aioCtx.beginPath();
	aioCtx.moveTo(aioTrailPoints[0][0], aioTrailPoints[0][1]);
  }
}

function aioSetCtxProperties() {
  aioCtx.lineWidth = aioTrailSize;
  aioCtx.lineJoin = 'round';
  aioCtx.lineCap = 'round';
  aioCtx.strokeStyle = aioTrailColor;
}

function aioIndicateGestureTimeout() {
 try {
   if (aioTrailCont) {
	  aioTrailCont.style.opacity = 0.5;
   }
   aioStatusBar.label += "  [X]";
  
  } catch(err) {}
}

function aioEraseTrail() {
  aioTrailPoints = null;
  try {
     aioTrailCont.parentNode.removeChild(aioTrailCont);
  }
  catch(err) {}
  aioTrailCont = null;
  insertionNode = null;
}
