/*
 * Drawing gesture trails
 */
var aioTrailCont, aioTimeoutTrailCont;
var aioCtx, aioTimeoutCtx, aioTrailPoints;;
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
	var cnv = aioMakeTrailCanvas();
	aioTrailCont = cnv.canvas;
	aioCtx = cnv.ctx;
	
	if (!aioSmoothTrail) {
	  aioSetCtxProperties(aioCtx, 1);
	}
  }
  
  if (aioTimeoutTrailCont && aioTrailCont.style.display == 'none') {
	aioTimeoutTrailCont.style.display = 'none';
	aioTrailCont.style.display = 'block';
  }
  
  var x = e.screenX - aioDocX;
  var y = e.screenY - aioDocY;
  aioTrailPoints.push([x, y]);
  
  if (aioSmoothTrail) {
	// erasing all canvas and drawing all line again results in smooth line
	
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
	aioTrailCont.width = maxX - minX; // this erases canvas
	aioTrailCont.height = maxY - minY;
	
	aioSetCtxProperties(aioCtx, 1);
	  
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
  var canvas = document.createElementNS(xhtmlNS, "canvas");
  canvas.style.position = "fixed";
  canvas.width = window.outerWidth;
  canvas.height = window.outerHeight;
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 10000;
  
  insertionNode.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  
  if (!aioSmoothTrail) {
	ctx.beginPath();
	ctx.moveTo(aioTrailPoints[0][0], aioTrailPoints[0][1]);
  }
  
  return {
	canvas: canvas,
	ctx: ctx
  };
}

function aioSetCtxProperties(ctx, opacity) {
  ctx.lineWidth = aioTrailSize;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = aioTrailColor;
  ctx.globalAlpha = opacity;
}

function aioIndicateGestureTimeout() {
  try {
    if (aioTrailCont) {
	  aioTrailCont.style.display = 'none';
	  
	  if (!aioTimeoutTrailCont) {
		// instead of simply changing opacity of main canvas, we create another canvas
		// where we draw the same trail with smaller opacity line - we do this because
		// changing opacity of canvas causes it to hide behind window-mode flash objects
		var cnv = aioMakeTrailCanvas();
		aioTimeoutTrailCont = cnv.canvas;
		aioTimeoutCtx = cnv.ctx;
	  } else {
		// reuse canvas created earlier
		aioTimeoutTrailCont.style.display = 'block';
	  }
	  aioTimeoutTrailCont.style.top = aioTrailCont.style.top;
	  aioTimeoutTrailCont.style.left = aioTrailCont.style.left;
	  aioTimeoutTrailCont.width = aioTrailCont.width;
	  aioTimeoutTrailCont.height = aioTrailCont.height;
	  
	  // draw all trail again with smaller opacity
	  aioSetCtxProperties(aioTimeoutCtx, 0.5);
	  
	  var shiftX = aioTimeoutTrailCont.offsetLeft;
	  var shiftY = aioTimeoutTrailCont.offsetTop;
	  
	  aioTimeoutCtx.beginPath();
	  aioTimeoutCtx.moveTo(aioTrailPoints[0][0] - shiftX, aioTrailPoints[0][1] - shiftY);
	  
	  for (var i = 1, len=aioTrailPoints.length; i < len; i++) {
		aioTimeoutCtx.lineTo(aioTrailPoints[i][0] - shiftX, aioTrailPoints[i][1] - shiftY);
	  }
	  aioTimeoutCtx.stroke();
    }
	aioStatusMessage("  [X]", null, true);
  
  } catch(err) {}
}

function aioEraseTrail() {
  aioTrailPoints = null;
  // try-catch to prevent errors on page transitions during gesture drawing
  try {
	if (aioTrailCont) {
	  aioTrailCont.parentNode.removeChild(aioTrailCont);
	}
    
	if (aioTimeoutTrailCont) {
	  aioTimeoutTrailCont.parentNode.removeChild(aioTimeoutTrailCont);
	}
  }
  catch(err) {}
  aioTrailCont = null;
  aioTimeoutTrailCont = null;
  insertionNode = null;
}
