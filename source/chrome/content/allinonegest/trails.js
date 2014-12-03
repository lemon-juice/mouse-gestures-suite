/*
 * Drawing gesture trails
 */
"use strict";

var mgsuiteTrails = {

  startTrail: function(e) {
	
	this.docX = window.mozInnerScreenX;
	this.docY = window.mozInnerScreenY;
	
	// insert trail outside viewable document to avoid DOM delays on large documents
	switch (mgsuite.overlay.aioWindowType) {
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
	
	this.halfTrailSize = Math.ceil(mgsuite.overlay.aioTrailSize / 2);
	
	var x = e.screenX - this.docX;
	var y = e.screenY - this.docY;
	
	this.trailPoints = [];
	this.trailPoints.push([x, y]);
	
	this.minX = x - this.halfTrailSize;
	this.maxX = x + this.halfTrailSize;
	this.minY = y - this.halfTrailSize;
	this.maxY = y + this.halfTrailSize;
  },
  
  drawTrail: function(e) {
	if (!this.insertionNode) return;
	
	if (!this.trailCont) {
	  var cnv = this.makeTrailCanvas();
	  this.trailCont = cnv.canvas;
	  this.ctx = cnv.ctx;
	  
	  if (!mgsuite.overlay.aioSmoothTrail) {
		this.setCtxProperties(this.ctx, 1);
	  }
	}
	
	if (this.timeoutTrailCont && this.trailCont.style.display == 'none') {
	  this.timeoutTrailCont.style.display = 'none';
	  this.trailCont.style.display = 'block';
	}
	
	var x = e.screenX - this.docX;
	var y = e.screenY - this.docY;
	this.trailPoints.push([x, y]);
	
	if (mgsuite.overlay.aioSmoothTrail) {
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
	  
	  this.trailCont.style.left = this.minX + "px";
	  this.trailCont.style.top = this.minY + "px";
	  this.trailCont.width = this.maxX - this.minX; // this erases canvas
	  this.trailCont.height = this.maxY - this.minY;
	  
	  this.setCtxProperties(this.ctx, 1);
		
	  var shiftX = this.trailCont.offsetLeft;
	  var shiftY = this.trailCont.offsetTop;
		
	  this.ctx.beginPath();
	  this.ctx.moveTo(this.trailPoints[0][0] - shiftX, this.trailPoints[0][1] - shiftY);
	  
	  for (var i = 1, len=this.trailPoints.length; i < len; i++) {
		this.ctx.lineTo(this.trailPoints[i][0] - shiftX, this.trailPoints[i][1] - shiftY);
	  }
	  
	} else {
	  this.ctx.lineTo(x, y);
	}
	
	this.ctx.stroke();
  },
  
  makeTrailCanvas: function() {
	var canvas = document.createElementNS(mgsuite.const.xhtmlNS, "canvas");
	canvas.style.position = "fixed";
	canvas.width = window.outerWidth;
	canvas.height = window.outerHeight;
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.pointerEvents = "none";
	canvas.style.zIndex = 2147483647;  // needed for full screen invoked by full screen API
	
	this.insertionNode.appendChild(canvas);
  
	var ctx = canvas.getContext('2d');
	
	if (!mgsuite.overlay.aioSmoothTrail) {
	  ctx.beginPath();
	  ctx.moveTo(this.trailPoints[0][0], this.trailPoints[0][1]);
	}
	
	return {
	  canvas: canvas,
	  ctx: ctx
	};
  },
  
  setCtxProperties: function(ctx, opacity) {
	ctx.lineWidth = mgsuite.overlay.aioTrailSize;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = mgsuite.overlay.aioTrailColor;
	ctx.globalAlpha = opacity;
  },
  
  indicateGestureTimeout: function() {
	try {
	  if (this.trailCont) {
		this.trailCont.style.display = 'none';
		
		if (!this.timeoutTrailCont) {
		  // instead of simply changing opacity of main canvas, we create another canvas
		  // where we draw the same trail with smaller opacity line - we do this because
		  // changing opacity of canvas causes it to hide behind window-mode flash objects
		  var cnv = this.makeTrailCanvas();
		  this.timeoutTrailCont = cnv.canvas;
		  this.timeoutCtx = cnv.ctx;
		} else {
		  // reuse canvas created earlier
		  this.timeoutTrailCont.style.display = 'block';
		}
		this.timeoutTrailCont.style.top = this.trailCont.style.top;
		this.timeoutTrailCont.style.left = this.trailCont.style.left;
		this.timeoutTrailCont.width = this.trailCont.width;
		this.timeoutTrailCont.height = this.trailCont.height;
		
		// draw all trail again with smaller opacity
		this.setCtxProperties(this.timeoutCtx, 0.5);
		
		var shiftX = this.timeoutTrailCont.offsetLeft;
		var shiftY = this.timeoutTrailCont.offsetTop;
		
		this.timeoutCtx.beginPath();
		this.timeoutCtx.moveTo(this.trailPoints[0][0] - shiftX, this.trailPoints[0][1] - shiftY);
		
		for (var i = 1, len=this.trailPoints.length; i < len; i++) {
		  this.timeoutCtx.lineTo(this.trailPoints[i][0] - shiftX, this.trailPoints[i][1] - shiftY);
		}
		this.timeoutCtx.stroke();
	  }
	  mgsuite.imp.aioStatusMessage("  [X]", null, true);
	
	} catch(err) {}
  },
  
  eraseTrail: function() {
	this.trailPoints = null;
	// try-catch to prevent errors on page transitions during gesture drawing
	try {
	  if (this.trailCont) {
		this.trailCont.parentNode.removeChild(this.trailCont);
	  }
	  
	  if (this.timeoutTrailCont) {
		this.timeoutTrailCont.parentNode.removeChild(this.timeoutTrailCont);
	  }
	}
	catch(err) {}
	this.trailCont = null;
	this.timeoutTrailCont = null;
	this.insertionNode = null;
  }
}

