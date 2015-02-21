var gprop = {
  init: function() {
    this.row = window.opener.getSelections()[0];
    
    var nameInput = document.getElementById("gestureName");
    var actionToken = window.opener.gestView.getActionToken(this.row);
    
    if (actionToken == '[custom]') {
      // custom gesture
      document.getElementById("gestureType").value = "custom";
      
      let data = window.opener.gestView.getRowMetaData(this.row);
      
      nameInput.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      
    } else if (actionToken) {
      // native gesture
      document.getElementById("gestureType").value = "built-in";
      nameInput.hidden = true;
      let desc = document.getElementById("gestureNameDesc");
      desc.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      desc.hidden = false;
    }
  
    var shapeDef = window.opener.abbrTable[this.row];
    
    // translate
    var shape = "";
    for (var i = 0; i < shapeDef.length; ++i) {
      shape += window.opener.abbrLocalizedGest[shapeDef.charAt(i)];
    }
    
    document.getElementById("gestureShape").value = shape;
    document.getElementById("gestureShape").focus();
  },
  
  saveGesture: function() {
    window.opener.newGestValue(document.getElementById("gestureShape").value, this.row);
  }
}
