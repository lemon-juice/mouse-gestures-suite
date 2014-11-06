/*
 * Drawing gesture trails
 */
var mgsTrails = {
  aioTrailCont: null,
  aioTimeoutTrailCont: null,
  aioCtx: null,
  aioTimeoutCtx: null,
  aioTrailPoints: null,
  aioDocX: null,
  aioDocY: null,
  minX: null,
  minY: null,
  maxX: null,
  maxY: null,
  halfTrailSize: null,
  insertionNode: null,

  aioStartTrail: function(e) {
	
	mgsTrails.aioDocX = window.mozInnerScreenX;
	mgsTrails.aioDocY = window.mozInnerScreenY;
	
	// insert trail outside viewable document to avoid DOM delays on large documents
	switch (aioWindowType) {
	  case 'browser':
		mgsTrails.insertionNode = document.getElementById("content"); // tabbrowser
		break;
	  
	  case 'messenger':
		mgsTrails.insertionNode = document.getElementById("messagepanebox");
		break;
	  
	  case 'mailcompose':
	  case 'source':
		mgsTrails.insertionNode = document.getElementById("appcontent");
		break;
	}
	
	if (!mgsTrails.insertionNode) {
	  return;
	}
	
	mgsTrails.halfTrailSize = Math.ceil(aioTrailSize / 2);
	
	var x = e.screenX - mgsTrails.aioDocX;
	var y = e.screenY - mgsTrails.aioDocY;
	
	mgsTrails.aioTrailPoints = [];
	mgsTrails.aioTrailPoints.push([x, y]);
	
	mgsTrails.minX = x - mgsTrails.halfTrailSize;
	mgsTrails.maxX = x + mgsTrails.halfTrailSize;
	mgsTrails.minY = y - mgsTrails.halfTrailSize;
	mgsTrails.maxY = y + mgsTrails.halfTrailSize;
  },
  
  aioDrawTrail: function(e) {
	if (!mgsTrails.insertionNode) return;
	
	if (!mgsTrails.aioTrailCont) {
	  var cnv = mgsTrails.aioMakeTrailCanvas();
	  mgsTrails.aioTrailCont = cnv.canvas;
	  mgsTrails.aioCtx = cnv.ctx;
	  
	  if (!aioSmoothTrail) {
		mgsTrails.aioSetCtxProperties(mgsTrails.aioCtx, 1);
	  }
	}
	
	if (mgsTrails.aioTimeoutTrailCont && mgsTrails.aioTrailCont.style.display == 'none') {
	  mgsTrails.aioTimeoutTrailCont.style.display = 'none';
	  mgsTrails.aioTrailCont.style.display = 'block';
	}
	
	var x = e.screenX - mgsTrails.aioDocX;
	var y = e.screenY - mgsTrails.aioDocY;
	mgsTrails.aioTrailPoints.push([x, y]);
	
	if (aioSmoothTrail) {
	  // erasing all canvas and drawing all line again results in smooth line
	  
	  // we make canvas the size only as large as necessary, because full size canvas
	  // cause flash objects in window mode to disappear
	  if (x + mgsTrails.halfTrailSize > mgsTrails.maxX) {
		mgsTrails.maxX = x + mgsTrails.halfTrailSize;
	  } else if (x - mgsTrails.halfTrailSize < mgsTrails.minX) {
		mgsTrails.minX = x - mgsTrails.halfTrailSize;
	  }
	  
	  if (y + mgsTrails.halfTrailSize > mgsTrails.maxY) {
		mgsTrails.maxY = y + mgsTrails.halfTrailSize;
	  } else if (y - mgsTrails.halfTrailSize < mgsTrails.minY) {
		mgsTrails.minY = y - mgsTrails.halfTrailSize;
	  }
	  
	  mgsTrails.aioTrailCont.style.left = mgsTrails.minX + "px";
	  mgsTrails.aioTrailCont.style.top = mgsTrails.minY + "px";
	  mgsTrails.aioTrailCont.width = mgsTrails.maxX - mgsTrails.minX; // this erases canvas
	  mgsTrails.aioTrailCont.height = mgsTrails.maxY - mgsTrails.minY;
	  
	  mgsTrails.aioSetCtxProperties(mgsTrails.aioCtx, 1);
		
	  var shiftX = mgsTrails.aioTrailCont.offsetLeft;
	  var shiftY = mgsTrails.aioTrailCont.offsetTop;
		
	  mgsTrails.aioCtx.beginPath();
	  mgsTrails.aioCtx.moveTo(mgsTrails.aioTrailPoints[0][0] - shiftX, mgsTrails.aioTrailPoints[0][1] - shiftY);
	  
	  for (var i = 1, len=mgsTrails.aioTrailPoints.length; i < len; i++) {
		mgsTrails.aioCtx.lineTo(mgsTrails.aioTrailPoints[i][0] - shiftX, mgsTrails.aioTrailPoints[i][1] - shiftY);
	  }
	  
	} else {
	  mgsTrails.aioCtx.lineTo(x, y);
	}
	
	mgsTrails.aioCtx.stroke();
  },
  
  aioMakeTrailCanvas: function() {
	var canvas = document.createElementNS(xhtmlNS, "canvas");
	canvas.style.position = "fixed";
	canvas.width = window.outerWidth;
	canvas.height = window.outerHeight;
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.pointerEvents = "none";
	canvas.style.zIndex = 10000;
	
	mgsTrails.insertionNode.appendChild(canvas);
  
	var ctx = canvas.getContext('2d');
	
	if (!aioSmoothTrail) {
	  ctx.beginPath();
	  ctx.moveTo(mgsTrails.aioTrailPoints[0][0], mgsTrails.aioTrailPoints[0][1]);
	}
	
	return {
	  canvas: canvas,
	  ctx: ctx
	};
  },
  
  aioSetCtxProperties: function(ctx, opacity) {
	ctx.lineWidth = aioTrailSize;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = aioTrailColor;
	ctx.globalAlpha = opacity;
  },
  
  aioIndicateGestureTimeout: function() {
	try {
	  if (mgsTrails.aioTrailCont) {
		mgsTrails.aioTrailCont.style.display = 'none';
		
		if (!mgsTrails.aioTimeoutTrailCont) {
		  // instead of simply changing opacity of main canvas, we create another canvas
		  // where we draw the same trail with smaller opacity line - we do this because
		  // changing opacity of canvas causes it to hide behind window-mode flash objects
		  var cnv = mgsTrails.aioMakeTrailCanvas();
		  mgsTrails.aioTimeoutTrailCont = cnv.canvas;
		  mgsTrails.aioTimeoutCtx = cnv.ctx;
		} else {
		  // reuse canvas created earlier
		  mgsTrails.aioTimeoutTrailCont.style.display = 'block';
		}
		mgsTrails.aioTimeoutTrailCont.style.top = mgsTrails.aioTrailCont.style.top;
		mgsTrails.aioTimeoutTrailCont.style.left = mgsTrails.aioTrailCont.style.left;
		mgsTrails.aioTimeoutTrailCont.width = mgsTrails.aioTrailCont.width;
		mgsTrails.aioTimeoutTrailCont.height = mgsTrails.aioTrailCont.height;
		
		// draw all trail again with smaller opacity
		mgsTrails.aioSetCtxProperties(mgsTrails.aioTimeoutCtx, 0.5);
		
		var shiftX = mgsTrails.aioTimeoutTrailCont.offsetLeft;
		var shiftY = mgsTrails.aioTimeoutTrailCont.offsetTop;
		
		mgsTrails.aioTimeoutCtx.beginPath();
		mgsTrails.aioTimeoutCtx.moveTo(mgsTrails.aioTrailPoints[0][0] - shiftX, mgsTrails.aioTrailPoints[0][1] - shiftY);
		
		for (var i = 1, len=mgsTrails.aioTrailPoints.length; i < len; i++) {
		  mgsTrails.aioTimeoutCtx.lineTo(mgsTrails.aioTrailPoints[i][0] - shiftX, mgsTrails.aioTrailPoints[i][1] - shiftY);
		}
		mgsTrails.aioTimeoutCtx.stroke();
	  }
	  aioStatusMessage("  [X]", null, true);
	
	} catch(err) {}
  },
  
  aioEraseTrail: function() {
	mgsTrails.aioTrailPoints = null;
	// try-catch to prevent errors on page transitions during gesture drawing
	try {
	  if (mgsTrails.aioTrailCont) {
		mgsTrails.aioTrailCont.parentNode.removeChild(mgsTrails.aioTrailCont);
	  }
	  
	  if (mgsTrails.aioTimeoutTrailCont) {
		mgsTrails.aioTimeoutTrailCont.parentNode.removeChild(mgsTrails.aioTimeoutTrailCont);
	  }
	}
	catch(err) {}
	mgsTrails.aioTrailCont = null;
	mgsTrails.aioTimeoutTrailCont = null;
	mgsTrails.insertionNode = null;
  }
}

