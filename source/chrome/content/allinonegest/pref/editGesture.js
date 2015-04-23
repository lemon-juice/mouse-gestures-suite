"use strict";

var gprop = {
  init: function() {
    this.isNew = window.arguments[0];
    this.row = window.opener.getSelections()[0];
    
    if (this.isNew) {
      // new custom function
      this.rowType = "custom";
      this.customData = {
        "winTypes": ["browser"],
        "menuId": null,
      };
      
    } else {
      // edit existing function
      this.rowType = window.opener.gestView.getRowType(this.row);
      
      this.customData = JSON.parse(JSON.stringify(
        window.opener.gestView.getRowMetaData(this.row) || {}
      ));
    }
    
    var nameInput = document.getElementById("functionName");
    
    if (this.rowType == 'custom') {
      // custom function
      document.getElementById("functionType").value = "custom";
      
      if (!this.isNew) {
        nameInput.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      }
      document.getElementById("functionName").focus();
      
    } else if (this.rowType == 'native') {
      // native function
      document.getElementById("functionType").value = "built-in";
      nameInput.hidden = true;
      let desc = document.getElementById("functionNameDesc");
      desc.value = window.opener.gestView.getCellText(this.row, window.opener.functionCol);
      desc.hidden = false;
      document.getElementById("gestureShape").focus();
    }
  
    var shapeDef = this.isNew ? "" : window.opener.abbrTable[this.row];
    
    // translate
    var shape = "";
    for (var i = 0; i < shapeDef.length; ++i) {
      shape += window.opener.abbrLocalizedGest[shapeDef.charAt(i)];
    }
    
    document.getElementById("gestureShape").value = shape;
    
    if (this.rowType == 'custom') {
      // show current action
      document.getElementById("actionBox").hidden = false;
      this.prefillScope();
      
      setTimeout(function() {
        if (window.outerWidth < 900) {
          window.resizeTo(900, window.outerHeight);
        }
        
        // preselect function type
        if (gprop.customData.menuId) {
          document.getElementById("actionTypeSelect").selectedIndex = 0;
          
        } else if (gprop.customData.script) {
          document.getElementById("actionTypeSelect").selectedIndex = 1;
          document.getElementById("scriptInput").value = settingsIO.readFile(gprop.customData.script);
        }
        
        gprop.changeActionType();
        
        // preselect tab based on window types
        var tabbox = document.getElementById("menuTabbox");
        var tabs = tabbox.querySelectorAll("tabs tab");
        
        for (let i=0; i<tabs.length; i++) {
          let winType = tabs[i].value;
          if (gprop.customData.winTypes && gprop.customData.winTypes.indexOf(winType) >= 0) {
            if (i > 0) {
              tabbox.selectedTab = tabs[i];
            }
            break;
          }
        }
        
      }, 0);
      
      // preselect scriptScope radio
      var scriptScope = document.getElementById("scriptScope");
      if (this.customData.scope && /^\w+$/.test(this.customData.scope)) {
        scriptScope.selectedItem = scriptScope.querySelector("radio[id=" + this.customData.scope + "]");
      }
      
      if (!scriptScope.selectedItem) {
        scriptScope.selectedItem = scriptScope.querySelector("radio[id=chrome]");
      }
      
      this.changeScriptScope();
      
      gprop.firstActivateEvent = true;
      
      window.addEventListener("activate", function() {
        // refresh menus on window focus
        if (gprop.firstActivateEvent) {
          // skip when opening window
          gprop.firstActivateEvent = false;
          return;
        }
        
        if (document.getElementById("openWinInfo")) {
          // refresh only if menu list is empty
          setTimeout(function() {
            gprop.refreshMenuList();
          }, 200);
        }
       });
    }
  },
  
  refreshMenuList: function() {
    gprop.fillMenuItems();
    gprop.preselectMenuItem(gprop.customData.menuId);
    this.resizeWindow();
  },
  
  resizeWindow: function() {
    var w = window.outerWidth;
    window.sizeToContent();
    window.resizeTo(w, window.outerHeight);
  },
  
  saveGesture: function() {
    
    var data = {
      shape: document.getElementById("gestureShape").value,
    }
    
    if (this.rowType == 'custom') {
      data.name = document.getElementById("functionName").value;
      
      if (!data.name) {
        alert("Enter name of this function");
        return false;
      }
      
      var selected = document.getElementById("actionTypeSelect").selectedIndex;
      
      switch (selected) {
        case 0:  // menu item
          var menuListBox = document.getElementById("menuItemsList");
          var selectedMenu = menuListBox.selectedItem;
          
          if (selectedMenu && !selectedMenu.value) {
            alert("Menu item '" + selectedMenu.label.trim() + "' cannot be selected as function");
            return false;
          }
          
          data.menuId = selectedMenu ? selectedMenu.value : null;
          break;
        
        case 1:  // script
          var js = document.getElementById("scriptInput").value;
          
          try {
			new Function(js);
		  }
          catch(ex) {
            alert(ex);
            return false;
          }
          
          data.scope = document.getElementById("scriptScope").selectedItem.id;
          
          var filename = this.customData.script ? this.customData.script : settingsIO.getNextScriptFilename();
          data.script = filename;
          
          settingsIO.saveFile(filename, js);
          break;
      }
      
      // pass window type checkboxes
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
    
    if (this.isNew) {
      window.opener.insertNewCustomFunction(data);
      return true;
      
    } else {
      var ok = window.opener.changeGestureData(this.row, data);
      
      if (ok === false) {
        window.focus();
        document.getElementById("gestureShape").focus();
      }
      return ok;
    }
  },
  
  /**
   * Action type selectbox selected
   */
  changeActionType: function() {
    var menuBox = document.getElementById("menuBox");
    var scriptBox = document.getElementById("scriptBox");
    var scriptScopeBox = document.getElementById("scriptScopeBox");
    
    menuBox.hidden = true;
    scriptBox.hidden = true;
    scriptScopeBox.hidden = true;
    
    var selected = document.getElementById("actionTypeSelect").selectedIndex;
    
    switch (selected) {
      case 0:
        menuBox.hidden = false;
        this.refreshMenuList();
        break;
      
      case 1:
        scriptBox.hidden = false;
        scriptScopeBox.hidden = false;
        this.resizeWindow();
        break;
    }
  },
  
  /**
   * Script scope radio changed
   */
  changeScriptScope: function() {
    var scope = document.getElementById("scriptScope").selectedItem.id;
    
    document.getElementById("winTypesBox").hidden = (scope == "content");
  },
  
  selectTab: function() {
    // move menu listbox to selected tab
    var selectedPanel = document.getElementById("menuTabbox").selectedPanel;
    var listBox = selectedPanel.querySelector("#menuItemsList");
    
    if (!listBox) {
      // move!
      selectedPanel.appendChild(document.getElementById("menuItemsList"));
      this.refreshMenuList();
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
    
    var listitem, listitemValue, label;
    
    for (var i=0; i<menu.length; i++) {
      label = "      ".repeat(menu[i].depth) + menu[i].label;
      
      if (menu[i].nodeName == "menu") {
        label += " »";
      }
      
      listitemValue = menu[i].menuId;
      
      if (!listitemValue && menu[i].parentId && menu[i].label) {
        // this item doesn't have menuId but we use parent's menuId
        // and current item's label as a way of identification
        listitemValue = menu[i].parentId + ">" + menu[i].label;
      }
      
      listitem = mList.appendItem(label, listitemValue);
      
      if (menu[i].nodeName == "menu") {
        listitem.style.fontStyle = "italic";
      }
      if (menu[i].depth == 0) {
        listitem.style.fontWeight = "bold";
      }
      if (menu[i].nodeName == "menuitem" && menu[i].depth > 0 && !listitemValue) {
        listitem.style.color = "#888";
      }
      listitem.addEventListener("dblclick", gprop.copyMenuNameToFunctionName);
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
        }, 100);
        
        setTimeout(function() {
          listbox.selectItem(items[i]);
        }, 250);
        
        return;
      }
    }
  },
  
  getMenu: function(win, node, depth, parentId) {
    if (typeof depth != "number") {
      depth = 0;
    }
    if (typeof parentId == "undefined") {
      parentId = null;
    }
    
    var retItems = [];
    var children = node.childNodes;
    var menu, item, items, label;
    var children2, menupopup;
    var command;
    
    for (var i=0; i<children.length; i++) {
      menu = children[i];
      
      if (menu.nodeName == "menu") {
        label = menu.label;
        
        if (!label && menu.id=="menu_zoom") {
          // Zoom menu may be not populated in SeaMonkey - get the label manually
          try {
            let zoomBundle = win.document.getElementById("bundle_viewZoom");
            label = zoomBundle.getString("fullZoom.label")
                                      .replace(/\([^)]*\)/, "");
          } catch(err) {
            label = "Zoom";
          }
        }
        
        if (label) {
          item = {
            "label": label,
            "menuId": "",
            "depth": depth,
            "nodeName": "menu",
            "parentId": null
          };
          retItems.push(item);
        
          // get subitems under <menupopup>
          children2 = menu.childNodes;
          
          for (var j=0; j<children2.length; j++) {
            menupopup = children2[j];
            
            if (menupopup.nodeName == "menupopup") {
              items = this.getMenu(win, menupopup, depth+1, menu.id);
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
        
        if (label && (menu.id || menu.label)) {
          item = {
            "label": label,
            "menuId": menu.id ? menu.id : "",
            "depth": depth,
            "nodeName": "menuitem",
            "parentId": parentId
          };
          
          if (!menu.id && menu.label) {
            item.menuLabel = menu.label;
          }
          
          retItems.push(item);
        }
      }
    }
    
    return retItems;
  },
  
  copyMenuNameToFunctionName: function() {
    var menuListBox = document.getElementById("menuItemsList");
    var selectedMenu = menuListBox.selectedItem;
     
    if (selectedMenu) {
      var nameElem = document.getElementById("functionName");
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
      gprop.customData.menuId = selectedMenu.value;
    }
  },
  
  // set scope checkboxes
  prefillScope: function() {
    var winTypes = this.customData.winTypes;
    
    if (!Array.isArray(winTypes)) {
      dump(winTypes + ";\n");
      dump(typeof winTypes + ";\n");
      winTypes = ["browser"];
    }
    
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
  },
 }
