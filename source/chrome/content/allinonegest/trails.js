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
	
	this.aioDocX = window.mozInnerScreenX;
	this.aioDocY = window.mozInnerScreenY;
	
	// insert trail outside viewable document to avoid DOM delays on large documents
	switch (aioWindowType) {
	  case 'browser':
		this.insertionNode = document.getElementById("content"); // tabbrowser
		break;
	  
	  case 'messenger':
		this.insertionNode = document.getElementById("messagepanebox");
		break;
	  
	  case 'mailcompose':
	  case 'source':
		this.insertionNode = document.getElementById("appcontent");
		break;
	}
	
	if (!this.insertionNode) {
	  return;
	}
	
	this.halfTrailSize = Math.ceil(aioTrailSize / 2);
	
	var x = e.screenX - this.aioDocX;
	var y = e.screenY - this.aioDocY;
	
	this.aioTrailPoints = [];
	this.aioTrailPoints.push([x, y]);
	
	this.minX = x - this.halfTrailSize;
	this.maxX = x + this.halfTrailSize;
	this.minY = y - this.halfTrailSize;
	this.maxY = y + this.halfTrailSize;
  },
  
  aioDrawTrail: function(e) {
	if (!this.insertionNode) return;
	
	if (!this.aioTrailCont) {
	  var cnv = this.aioMakeTrailCanvas();
	  this.aioTrailCont = cnv.canvas;
	  this.aioCtx = cnv.ctx;
	  
	  if (!aioSmoothTrail) {
		this.aioSetCtxProperties(this.aioCtx, 1);
	  }
	}
	
	if (this.aioTimeoutTrailCont && this.aioTrailCont.style.display == 'none') {
	  this.aioTimeoutTrailCont.style.display = 'none';
	  this.aioTrailCont.style.display = 'block';
	}
	
	var x = e.screenX - this.aioDocX;
	var y = e.screenY - this.aioDocY;
	this.aioTrailPoints.push([x, y]);
	
	if (aioSmoothTrail) {
	  // erasing all canvas and drawing all line again results in smooth line
	  
	  // we make canvas the size only as large as necessary, because full size canvas
	  // cause flash objects in window mode to disappear
	  if (x + this.halfTrailSize > this.maxX) {
		this.maxX = x + this.halfTrailSize;
	  } else if (x - this.halfTrailSize < this.minX) {
		this.minX = x - this.halfTrailSize;
	  }
	  
	  if (y + this.halfTrailSize > this.maxY) {
		this.maxY = y + this.halfTrailSize;
	  } else if (y - this.halfTrailSize < this.minY) {
		this.minY = y - this.halfTrailSize;
	  }
	  
	  this.aioTrailCont.style.left = this.minX + "px";
	  this.aioTrailCont.style.top = this.minY + "px";
	  this.aioTrailCont.width = this.maxX - this.minX; // this erases canvas
	  this.aioTrailCont.height = this.maxY - this.minY;
	  
	  this.aioSetCtxProperties(this.aioCtx, 1);
		
	  var shiftX = this.aioTrailCont.offsetLeft;
	  var shiftY = this.aioTrailCont.offsetTop;
		
	  this.aioCtx.beginPath();
	  this.aioCtx.moveTo(this.aioTrailPoints[0][0] - shiftX, this.aioTrailPoints[0][1] - shiftY);
	  
	  for (var i = 1, len=this.aioTrailPoints.length; i < len; i++) {
		this.aioCtx.lineTo(this.aioTrailPoints[i][0] - shiftX, this.aioTrailPoints[i][1] - shiftY);
	  }
	  
	} else {
	  this.aioCtx.lineTo(x, y);
	}
	
	this.aioCtx.stroke();
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
	
	this.insertionNode.appendChild(canvas);
  
	var ctx = canvas.getContext('2d');
	
	if (!aioSmoothTrail) {
	  ctx.beginPath();
	  ctx.moveTo(this.aioTrailPoints[0][0], this.aioTrailPoints[0][1]);
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
	  if (this.aioTrailCont) {
		this.aioTrailCont.style.display = 'none';
		
		if (!this.aioTimeoutTrailCont) {
		  // instead of simply changing opacity of main canvas, we create another canvas
		  // where we draw the same trail with smaller opacity line - we do this because
		  // changing opacity of canvas causes it to hide behind window-mode flash objects
		  var cnv = this.aioMakeTrailCanvas();
		  this.aioTimeoutTrailCont = cnv.canvas;
		  this.aioTimeoutCtx = cnv.ctx;
		} else {
		  // reuse canvas created earlier
		  this.aioTimeoutTrailCont.style.display = 'block';
		}
		this.aioTimeoutTrailCont.style.top = this.aioTrailCont.style.top;
		this.aioTimeoutTrailCont.style.left = this.aioTrailCont.style.left;
		this.aioTimeoutTrailCont.width = this.aioTrailCont.width;
		this.aioTimeoutTrailCont.height = this.aioTrailCont.height;
		
		// draw all trail again with smaller opacity
		this.aioSetCtxProperties(this.aioTimeoutCtx, 0.5);
		
		var shiftX = this.aioTimeoutTrailCont.offsetLeft;
		var shiftY = this.aioTimeoutTrailCont.offsetTop;
		
		this.aioTimeoutCtx.beginPath();
		this.aioTimeoutCtx.moveTo(this.aioTrailPoints[0][0] - shiftX, this.aioTrailPoints[0][1] - shiftY);
		
		for (var i = 1, len=this.aioTrailPoints.length; i < len; i++) {
		  this.aioTimeoutCtx.lineTo(this.aioTrailPoints[i][0] - shiftX, this.aioTrailPoints[i][1] - shiftY);
		}
		this.aioTimeoutCtx.stroke();
	  }
	  aioStatusMessage("  [X]", null, true);
	
	} catch(err) {}
  },
  
  aioEraseTrail: function() {
	this.aioTrailPoints = null;
	// try-catch to prevent errors on page transitions during gesture drawing
	try {
	  if (this.aioTrailCont) {
		this.aioTrailCont.parentNode.removeChild(this.aioTrailCont);
	  }
	  
	  if (this.aioTimeoutTrailCont) {
		this.aioTimeoutTrailCont.parentNode.removeChild(this.aioTimeoutTrailCont);
	  }
	}
	catch(err) {}
	this.aioTrailCont = null;
	this.aioTimeoutTrailCont = null;
	this.insertionNode = null;
  }
}

