var gprop = {
  init: function() {
    this.row = window.opener.getSelections()[0];
    
    var nameInput = document.getElementById("gestureName");
    var rowType = window.opener.gestView.getRowType(this.row);
    
    if (rowType == 'custom') {
      // custom gesture
      document.getElementById("gestureType").value = "custom";
      
      let data = window.opener.gestView.getRowMetaData(this.row);
      
      nameInput.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      
    } else if (rowType == 'native') {
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
    
    this.changeActionType();
  },
  
  saveGesture: function() {
    var ok = window.opener.newGestValue(document.getElementById("gestureShape").value, this.row);
    
    if (ok === false) {
      window.focus();
      document.getElementById("gestureShape").focus();
    }
    return ok;
  },
  
  /**
   * Action type selectbox selected
   */
  changeActionType: function() {
    var menuBox = document.getElementById("menuBox");
    var scriptBox = document.getElementById("scriptBox");
    
    menuBox.hidden = true;
    scriptBox.hidden = true;
    
    var selected = document.getElementById("actionTypeSelect").selectedIndex;
    
    switch (selected) {
      case 0:
        menuBox.hidden = false;
        this.fillMenuItems();
        break;
      
      case 1:
        scriptBox.hidden = false;
        break;
      
    }
  },
  
  fillMenuItems: function() {
    var mList = document.getElementById("menuItemsList");
    
    while (mList.itemCount > 0) {
      mList.removeItemAt(0);
    }
    
    var win = this.getContentWindow();
    
    if (!win) {
      return;
    }
    var menuWrapper = win.document.getElementById("main-menubar");
    
    var menu = this.getMenu(win, menuWrapper);
    var menuItem;
    
    for (var i=0; i<menu.length; i++) {
      menuItem = mList.appendItem(menu[i].label, menu[i].value);
      
      if (menu[i].depth == 0) {
        menuItem.style.fontWeight = "bold";
        
      } else if (!menu[i].hasCommand) {
        menuItem.style.color = "#888";
      }
    }
  },
  
  getMenu: function(win, node, depth) {
    if (typeof depth != "number") {
      depth = 0;
    }
    
    var pad = "    ".repeat(depth);
    var retItems = [];
    var children = node.childNodes;
    var menu, item, items, label;
    var children2, menupopup;
    var command;
    
    for (var i=0; i<children.length; i++) {
      menu = children[i];
      
      if (menu.nodeName == "menu") {
        if (menu.label) {
          item = {
            "label": pad + menu.label,
            "value": null,
            "depth": depth,
            "hasCommand": false
          };
          retItems.push(item);
        
          // get subitems under <menupopup>
          children2 = menu.childNodes;
          
          for (var j=0; j<children2.length; j++) {
            menupopup = children2[j];
            
            if (menupopup.nodeName == "menupopup") {
              items = this.getMenu(win, menupopup, depth+1);
              if (items.length) {
                retItems = retItems.concat(items);
              }
            }
          }
        }
        
      } else if (menu.nodeName == "menuitem") {
        label = menu.label;
        
        if (!label) {
          label = menu.getAttribute("valueSave");
        }
        
        if (!label && menu.command) {
          // find label on <command> element
          command = win.document.getElementById(menu.command);
          if (command) {
            label = command.getAttribute("label");
          }
        }
        
        if (label && menu.id) {
          item = {
            "label": pad + label,
            "value": menu.id,
            "depth": depth,
            "hasCommand": this.menuItemHasCommand(menu)
          };
          retItems.push(item);
        }
      }
    }
    
    return retItems;
  },
  
  /**
   * Check if menu element has command attached to it
   */
  menuItemHasCommand: function(menuElem) {
    return menuElem.command || menuElem.getAttribute("oncommand");
  },
  
  getContentWindow: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    
    var win;
    
    if (enumerator.hasMoreElements()) {
      win = enumerator.getNext();
    }

    return win;
  }
}
