/*
 * Drawing gesture trails
 */
var aioTrailCont = null;
var aioCtx, aioTrailPoints;;
var aioDocX, aioDocY;
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
  
  aioTrailPoints = [];
  aioTrailPoints.push([e.screenX - aioDocX, e.screenY - aioDocY]);
}

function aioDrawTrail(e) {
  if (!insertionNode) return;
  
  if (!aioTrailCont) {
	aioMakeTrailCanvas();
  }
  
  if (aioSmoothTrail) {
	// erasing all canvas and drawing all line again results in smooth line
	aioTrailPoints.push([e.screenX - aioDocX, e.screenY - aioDocY]);
	
	aioCtx.clearRect(0, 0, aioTrailCont.width, aioTrailCont.height);
	aioCtx.beginPath();
	aioCtx.moveTo(aioTrailPoints[0][0], aioTrailPoints[0][1]);
	
	for (var i = 1, len=aioTrailPoints.length; i < len; i++) {
	  aioCtx.lineTo(aioTrailPoints[i][0], aioTrailPoints[i][1]);
	}
	
  } else {
	aioCtx.lineTo(e.screenX - aioDocX, e.screenY - aioDocY);
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
  aioCtx.lineWidth = aioTrailSize;
  aioCtx.lineJoin = 'round';
  aioCtx.lineCap = 'round';
  aioCtx.strokeStyle = aioTrailColor;
  
  if (!aioSmoothTrail) {
	aioCtx.beginPath();
	aioCtx.moveTo(aioTrailPoints[0][0], aioTrailPoints[0][1]);
  }
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
