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
      this.prefillScope();
      
      setTimeout(function() {
        if (window.outerWidth < 900) {
          window.resizeTo(900, window.outerHeight);
        }
        
        // preselect tab based on window types
        var tabbox = document.getElementById("menuTabbox");
        var tabs = tabbox.querySelectorAll("tabs tab");
        
        for (let i=0; i<tabs.length; i++) {
          let winType = tabs[i].value;
          if (gprop.customData.winTypes && gprop.customData.winTypes.indexOf(winType) >= 0) {
            tabbox.selectedTab = tabs[i];
            break;
          }
        }
        
      }, 0);
      
      window.addEventListener("activate", function() {
        // refresh menus on window focus
        setTimeout(function() {
          gprop.fillMenuItems();
          gprop.preselectMenuItem(gprop.customData.menuId);
        }, 200);
       });
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
          
          if (selectedMenu && !selectedMenu.value) {
            alert("Menu item '" + selectedMenu.label.trim() + "' cannot be selected as gesture action");
            return false;
          }
          
          data.menuId = selectedMenu ? selectedMenu.value : null;
          break;
        
        case 1:  // script
          break;
      }
      
      // pass scope checkboxes
      data.winTypes = [];
      if (document.getElementById("scope-browser").checked) {
        data.winTypes.push("browser");
      }
      if (document.getElementById("scope-source").checked) {
        data.winTypes.push("source");
      }
      if (document.getElementById("scope-messenger").checked) {
        data.winTypes.push("messenger");
      }
      if (document.getElementById("scope-mailcompose").checked) {
        data.winTypes.push("mailcompose");
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
  
  selectTab: function() {
    // move menu listbox to selected tab
    var selectedPanel = document.getElementById("menuTabbox").selectedPanel;
    var listBox = selectedPanel.querySelector("#menuItemsList");
    
    if (!listBox) {
      // move!
      selectedPanel.appendChild(document.getElementById("menuItemsList"));
      this.fillMenuItems();
      this.preselectMenuItem(this.customData.menuId);
    }
  },
  
  fillMenuItems: function() {
    var desc = document.getElementById("openWinInfo");
    if (desc) {
      desc.parentNode.removeChild(desc);
    }
    
    var mList = document.getElementById("menuItemsList");
    mList.hidden = false;
    
    while (mList.itemCount > 0) {
      mList.removeItemAt(0);
    }
    
    var winType = document.getElementById("menuTabbox").selectedTab.value;
    var win = this.getContentWindow(winType);
    
    if (!win) {
      // info about window being not open
      document.getElementById("menuItemsList").hidden = true;
      
      let selectedPanel = document.getElementById("menuTabbox").selectedPanel;
      let winName =  document.getElementById("menuTabbox").selectedTab.label;
      let desc = document.createElement("vbox");
      desc.textContent = "Open " + winName + " window for the menu to become accessible";
      desc.id = "openWinInfo";
      selectedPanel.appendChild(desc);
      return;
    }
    
    // get root menu element
    var rootIds = {
      browser: "main-menubar",
      source: "viewSource-main-menubar",
      messenger: "mail-menubar",
      mailcompose: "mail-menubar",
    }

    var menuWrapper = win.document.getElementById(rootIds[winType]);
    
    if (!menuWrapper) {
      alert("Cannot find menu element in this window");
      return;
    }
    
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
      listitem.addEventListener("dblclick", gprop.copyMenuNameToGestureName);
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
    
    var pad = "      ".repeat(depth);
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
  
  copyMenuNameToGestureName: function() {
    var menuListBox = document.getElementById("menuItemsList");
    var selectedMenu = menuListBox.selectedItem;
     
    if (selectedMenu) {
      var nameElem = document.getElementById("gestureName");
      nameElem.value = selectedMenu.label.trim();
      nameElem.className = "blinkme";
      setTimeout(function() {
        nameElem.className = "";
      }, 900);
    }
  },
  
  menuItemSelect: function() {
    var menuListBox = document.getElementById("menuItemsList");
    var selectedMenu = menuListBox.selectedItem;
    
    if (selectedMenu && selectedMenu.value) {
      this.customData.menuId = selectedMenu.value;
    }
  },
  
  // set scope checkboxes
  prefillScope: function() {
    var winTypes = this.customData.winTypes;
    
    document.getElementById("scope-browser").checked = (winTypes.indexOf("browser") >= 0);
    document.getElementById("scope-source").checked = (winTypes.indexOf("source") >= 0);
    document.getElementById("scope-messenger").checked = (winTypes.indexOf("messenger") >= 0);
    document.getElementById("scope-mailcompose").checked = (winTypes.indexOf("mailcompose") >= 0);
  },
  
  getContentWindow: function(winType) {
    var map = {
      browser: "navigator:browser",
      source: "navigator:view-source",
      messenger: "mail:3pane",
      mailcompose: "msgcompose",
    }
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
    return wm.getMostRecentWindow(map[winType]);
  }
}
