var gprop = {
  init: function() {
    this.row = window.opener.getSelections()[0];
    
    var nameInput = document.getElementById("gestureName");
    this.rowType = window.opener.gestView.getRowType(this.row);
    
    this.customData = window.opener.gestView.getRowMetaData(this.row);
    
    if (this.rowType == 'custom') {
      // custom gesture
      document.getElementById("gestureType").value = "custom";
      nameInput.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      
    } else if (this.rowType == 'native') {
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
    
    if (this.rowType == 'custom') {
      // show current action
      document.getElementById("actionBox").hidden = false;
      this.changeActionType();
    }
  },
  
  saveGesture: function() {
    var data = {
      shape: document.getElementById("gestureShape").value,
    }
    
    if (this.rowType == 'custom') {
      data.name = document.getElementById("gestureName").value;
      
      if (!data.name) {
        alert("Enter name of this gesture");
        return false;
      }
      
      var selected = document.getElementById("actionTypeSelect").selectedIndex;
      
      switch (selected) {
        case 0:  // menu item
          var menuListBox = document.getElementById("menuItemsList");
          var selectedMenu = menuListBox.selectedItem;
          
          if (!selectedMenu) {
            alert("Choose a menu item to execute!");
            return false;
          }
          if (!selectedMenu.value) {
            alert("Menu item '" + selectedMenu.label.trim() + "' cannot be selected as gesture action");
            return false;
          }
          
          data.menuId = selectedMenu.value;        
          break;
        
        case 1:  // script
          break;
      }
    }
    
    var ok = window.opener.newGestValue(this.row, data);
    
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
        this.preselectMenuItem(this.customData.menuId);
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
    var listitem, label;
    
    for (var i=0; i<menu.length; i++) {
      label = menu[i].label;
      if (menu[i].nodeName == "menu") {
        label += " »";
      }
      listitem = mList.appendItem(label, menu[i].value);
      
      if (menu[i].depth == 0) {
        listitem.style.fontWeight = "bold";
        
      }
      if (!menu[i].value) {
        listitem.style.fontStyle = "italic";
      }
    }
  },
  
  preselectMenuItem: function(menuId) {
    if (!menuId) {
      return;
    }
    
    var listbox = document.getElementById("menuItemsList");
    var items = listbox.getElementsByTagName("listitem");
    
    for (var i=0; i<items.length; i++) {
      if (items[i].getAttribute("value") == menuId) {
        
        setTimeout(function() {
          document.getElementById("menuItemsList").ensureIndexIsVisible(i);
        }, 200);
        
        setTimeout(function() {
          listbox.selectItem(items[i]);
        }, 400);
        
        return;
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
            "value": "",
            "depth": depth,
            "nodeName": "menu",
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
            "nodeName": "menuitem",
          };
          retItems.push(item);
        }
      }
    }
    
    return retItems;
  },
  
  getContentWindow: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
    return wm.getMostRecentWindow("navigator:browser");
  }
}
