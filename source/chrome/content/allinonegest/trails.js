/*
 * Drawing gesture trails
 */
var aioTrailCont = null;
var aioCtx;
var aioDocX, aioDocY;

function aioStartTrail(e) {
  var targetDoc = e.target.ownerDocument;
  if (targetDoc.defaultView.top instanceof Window) targetDoc = targetDoc.defaultView.top.document;
  if (aioIsUnformattedXML(targetDoc)) return;
  
  aioDocX = window.mozInnerScreenX;
  aioDocY = window.mozInnerScreenY;
  
  var insertionNode;
  
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
	
	default:
	  return;
  }

  aioTrailCont = targetDoc.createElementNS(xhtmlNS, "canvas");
  aioTrailCont.style.position = "fixed";
  aioTrailCont.width = window.outerWidth;
  aioTrailCont.height = window.outerHeight;
  aioTrailCont.style.top = "0";
  aioTrailCont.style.left = "0";
  aioTrailCont.style.pointerEvents = "none";
  
  insertionNode.appendChild(aioTrailCont);

  aioCtx = aioTrailCont.getContext('2d');
  aioCtx.lineWidth = aioTrailSize;
  aioCtx.lineJoin = 'round';
  aioCtx.lineCap = 'round';
  aioCtx.strokeStyle = aioTrailColor;
  
  aioCtx.beginPath();
  aioCtx.moveTo(e.screenX - aioDocX, e.screenY - aioDocY);
}

function aioDrawTrail(e) {
  aioCtx.lineTo(e.screenX - aioDocX, e.screenY - aioDocY);
  aioCtx.stroke();
}

function aioEraseTrail() {
  try {
     aioTrailCont.parentNode.removeChild(aioTrailCont);
  }
  catch(err) {}
  aioTrailCont = null;
}
