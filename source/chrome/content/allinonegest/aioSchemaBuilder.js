/*
 * Dialog window for incrementing/decrementing numbers in URL
 */
var gOKButton = null;
var gURLField = null;

function init() {
  gOKButton = document.documentElement.getButton("accept");

  gURLField = document.getElementById("urlSelector");
  gURLField.value = window.arguments[0];
  var RE = /\d+/g;
  var rtn, startIndex = -1, endIndex;
  while ((rtn = RE.exec(gURLField.value)) != null) {
    startIndex = rtn.index;
    endIndex = startIndex + rtn[0].length;
  }
  if (startIndex == -1)
     gURLField.setSelectionRange(0, 0);
  else
     gURLField.setSelectionRange(startIndex, endIndex);
  gURLField.focus();
  selectionChanged();
}

function buildSchema() {
  var startIndex = gURLField.selectionStart;
  var endIndex = gURLField.selectionEnd;
  
  var key = gURLField.value.substr(0, startIndex);
  window.arguments[1].key = key;
  window.arguments[1].startIndex = startIndex;
  window.arguments[1].endIndex = endIndex;
}

function exitOnReturn(e) {
  if ((e.keyCode == e.DOM_VK_RETURN) &&
      !gOKButton.hasAttribute("disabled")) document.documentElement.acceptDialog();
  else selectionChanged();
}

function selectionChanged() {
  if (gURLField.selectionStart == gURLField.selectionEnd)
     gOKButton.setAttribute("disabled", "true");
  else {
     var RE = /\D/;
     if (RE.test(gURLField.value.substring(gURLField.selectionStart, gURLField.selectionEnd))) {
        gURLField.setSelectionRange(0, 0);
        gOKButton.setAttribute("disabled", "true");
     }
     else gOKButton.removeAttribute("disabled");
  }
}
