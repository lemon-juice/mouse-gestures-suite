const xhtmlNS = "http://www.w3.org/1999/xhtml";
var aioOldX, aioOldY;
var aioGrid = 15;
var aioStrokes = [], aioLocaleGest = [], aioShortGest = [];
var aioTrailDot;
var aioTrailCont = null;
var aioTrailCnt;
var aioTrailX, aioTrailY, aioDocX, aioDocY;
var rv = {}, gestureStarted, iframe;
var shapeElem;

function initPlayGesture() {
  const httpProtocolHandler = Components.classes["@mozilla.org/network/protocol;1?name=http"]
                               .getService(Components.interfaces.nsIHttpProtocolHandler);

  iframe = document.getElementById("gestDrawArea");
  var aioBundle = document.getElementById("allinonegestbundle");
  aioShortGest["R"] = aioBundle.getString("abbreviation.right");
  aioShortGest["L"] = aioBundle.getString("abbreviation.left");
  aioShortGest["U"] = aioBundle.getString("abbreviation.up");
  aioShortGest["D"] = aioBundle.getString("abbreviation.down");
  
  rv.trailColor = window.opener.document.getElementById("trailPickerId").color;
  rv.trailSize = window.opener.trailSize;
  rv.mousebutton = window.opener.document.getElementById("mousebuttOptions").value;

  iframe.addEventListener("mousedown", startGesture, true);
  window.addEventListener("mouseup", endGesture, true);
  gestureStarted = false;
  shapeElem = document.getElementById("gestureShape");
}

function startGesture(e) {
  if (e.button != rv.mousebutton) return;
  
  gestureStarted = true;
  iframe.addEventListener("mousemove", gestMove, true);
  aioOldX = e.screenX; aioOldY = e.screenY;
  var targetDoc = e.target.ownerDocument;
  var insertionNode = targetDoc.documentElement;
  var insertBounds = insertionNode.getBoundingClientRect();
  aioDocX = targetDoc.defaultView.mozInnerScreenX + insertBounds.left;
  aioDocY = targetDoc.defaultView.mozInnerScreenY + insertBounds.top;

  aioTrailCont = targetDoc.createElementNS(xhtmlNS, "aioTrailContainer");
  insertionNode.appendChild(aioTrailCont);
  aioTrailDot = targetDoc.createElementNS(xhtmlNS, "aioTrailDot");
  aioTrailDot.style.width = rv.trailSize + "px";
  aioTrailDot.style.height = rv.trailSize + "px";
  aioTrailDot.style.background = rv.trailColor;
  aioTrailDot.style.border = "0px";
  aioTrailDot.style.position = "absolute";
  aioTrailX = e.screenX;
  aioTrailY = e.screenY;
  aioTrailCnt = 0;
}

function gestMove(e) {
  var x_dir = e.screenX - aioOldX; var absX = Math.abs(x_dir);
  var y_dir = e.screenY - aioOldY; var absY = Math.abs(y_dir);
  var tempMove;
  if (absX < aioGrid && absY < aioGrid) return;
  drawTrail(e);
  var pente = absY <= 5 ? 100 : absX / absY;
  if (pente < 0.58 || pente > 1.73) {
    if (pente < 0.58) tempMove = y_dir > 0 ? "D" : "U";
    else tempMove = x_dir > 0 ? "R" : "L";
    
    if (!aioStrokes.length || aioStrokes[aioStrokes.length-1] != tempMove) {
      aioStrokes.push(tempMove);
      
      var localeMove = aioShortGest[tempMove];
      aioLocaleGest.push(localeMove);
      
      if (aioStrokes.length == 1) {
        shapeElem.value = localeMove;
      } else if (aioStrokes.length > 1) {
        shapeElem.value += localeMove;
      }
    }
  }
  aioOldX = e.screenX; aioOldY = e.screenY;
}

function endGesture() {
  if (gestureStarted) {
    eraseTrail();
    aioLocaleGest = [];
    aioStrokes = [];
  }
  iframe.removeEventListener("mousemove", gestMove, true);
}

function drawTrail(e) {
  function appendDot(x, y) {
    if ((++aioTrailCnt & 1) || rv.trailSize == 1) {
      var dot = aioTrailDot.cloneNode(true);
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      aioTrailCont.appendChild(dot);
      
    }
  }
  if (!aioTrailCont) return;
  var xMove = e.screenX - aioTrailX;
  var yMove = e.screenY - aioTrailY;
  var xDecrement = xMove < 0 ? 1 : -1;
  var yDecrement = yMove < 0 ? 1 : -1;
  var i, currX = e.screenX - aioDocX, currY = e.screenY - aioDocY;
  if (Math.abs(xMove) >= Math.abs(yMove))
    for (i = xMove; i != 0; i += xDecrement)
      appendDot(currX - i, currY - Math.round(yMove * i / xMove));
  else
    for (i = yMove; i != 0; i += yDecrement)
      appendDot(currX - Math.round(xMove * i / yMove), currY - i);
  aioTrailX = e.screenX; aioTrailY = e.screenY;
}

function eraseTrail() {
  if (aioTrailCont && aioTrailCont.parentNode)
    aioTrailCont.parentNode.removeChild(aioTrailCont);
  aioTrailCont = null;
}
