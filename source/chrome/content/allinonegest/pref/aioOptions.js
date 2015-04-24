"use strict";

var trailSize;

function getBrowserWindow() {
  var winMgr=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService()
    .QueryInterface(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser");
  if (winMgr.hasMoreElements()) return winMgr.getNext();
  return null;
}

function init() {
  initEditRuleConst();
  var checkboxes  = ["mouse", "trailId", "smoothId", "rocker", "wheelscroll", "autoscroll", "wheelDirection",
                     "markerId", "cursorId", "panningId", "pasteId", "reverseId",
                     "noAltGestId", "leftdefaultId", "openlinksId", "openLinkInNewId", "tabBar", "evenOnLinkId",
                     "linkTooltip", "tooltipShiftId", "grabHorizId", "grabModeId",
                     "goUpId", "crispResizeId", "disableClickHeatId"];
  var radiogroups = ["wheelScrollOptions", "mousebuttOptions", "autoscrollOptions",
                     "scrollrateOptions"];
  var checkbox, radiogroup, i;
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  for (i = 0; i < checkboxes.length; ++i) {
    checkbox = document.getElementById(checkboxes[i]);
    checkbox.checked = pref.getBoolPref(checkbox.getAttribute("prefstring"));
  }
  for (i = 0; i < radiogroups.length; ++i) {
    radiogroup = document.getElementById(radiogroups[i]);
    radiogroup.selectedItem = radiogroup.childNodes[pref.getIntPref(radiogroup.getAttribute("prefstring"))];
  }
  document.getElementById("rockerModeId").checked = pref.getIntPref("allinonegest.rockertypepref") != 0;
  document.getElementById("delaydropdownId").selectedIndex = pref.getIntPref("allinonegest.titleDelay");
  document.getElementById("durationdropdownId").selectedIndex = pref.getIntPref("allinonegest.titleDuration");
  document.getElementById("trailPickerId").color = pref.getCharPref("allinonegest.trailColor");
  document.getElementById("nextsStringId").value = pref.getComplexValue("allinonegest.nextsString", Components.interfaces.nsISupportsString).data;
  document.getElementById("prevsStringId").value = pref.getComplexValue("allinonegest.prevsString", Components.interfaces.nsISupportsString).data;
  trailSize = pref.getIntPref("allinonegest.trailSize");
  changeTrace(0);
  doEnabling();
  
  var gestureString = pref.getCharPref("allinonegest.gestureString");
  var functionString = pref.getCharPref("allinonegest.functionString");
  var gestureStrings = sortGestureStrings(gestureString, functionString, mgsuite.default.functionString);
  
  var customGestures = [];
  try {
    let prefS = pref.getComplexValue("allinonegest.customGestures", Components.interfaces.nsISupportsString);
    customGestures = JSON.parse(prefS);
  } catch (err) {}
  
  if (!Array.isArray(customGestures)) {
    customGestures = [];
  }
  
  populateTree(gestureStrings.gestureString, gestureStrings.functionString,
               pref.getCharPref("allinonegest.rockerString"),
               customGestures);
  setScrollGesturesVisibility(document.getElementById("wheelScrollOptions").value == 0);
  
  populateSiteList(pref.getComplexValue("allinonegest.sitesList", Components.interfaces.nsISupportsString).data);
  
  const myGUID = "mousegesturessuite@lemon_juice.addons.mozilla.org";
  
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
  AddonManager.getAddonByID(myGUID,
    function(addon) {
       document.getElementById("versId").value += " " + addon.version;
    });
  
  restoreLastSelectedPanel();
  
  var tabpanels = document.getElementsByTagName('tabpanels');
  
  for (var i=0; i<tabpanels.length; i++) {
    tabpanels[i].addEventListener("select", rememberSelectedPanel);
  }
}

function doEnabling() {
  var wheelEl = document.getElementById("wheelScrollOptions");
  var autoscrollEl = document.getElementById("autoscrollOptions");
  var c1 = document.getElementById("mouse").checked;
  var c2 = document.getElementById("wheelscroll").checked;
  var c1or2 = c1 || c2;
  var c3 = document.getElementById("rocker").checked;
  var c4 = c1 && document.getElementById("trailId").checked;
  var c5 = c2 && wheelEl.value == 3;
  var c6 = c4 && trailSize < 12;
  var c7 = c4 && trailSize > 1;
  var c8 = !c1or2 || document.getElementById("mousebuttOptions").value != 1;
  var c9 = c8 && document.getElementById("autoscroll").checked;
  var c9a = c9 && autoscrollEl.value == 0;
  var c9b = c9 && autoscrollEl.value != 1;
  var c9c = c9 && !(autoscrollEl.value & 1);
  var c9d = c9 && autoscrollEl.value > 1;
  var c10 = c9c && !document.getElementById("markerId").checked;
  var c11 = c2 && wheelEl.value >= 2;
  var c12 = c1 && document.getElementById("mousebuttOptions").value == 0 && !document.getElementById("noAltGestId").checked;
  try {var c14 = !getBrowserWindow().document.getElementById("tabMenu");}
  catch(err) {c14 = true;}
  var c15 = c11 || (c14 && document.getElementById("tabBar").checked);
  var c16 = document.getElementById("linkTooltip").checked;
  var c17 = c16 && !document.getElementById("tooltipShiftId").checked;

  var a1 = "disabled", a2 = "hidden";

  var idTable = [["trailId", c1, a1], ["trailColorId", c4, a1], ["trailPickerId", c4, a2],
                 ["trailSizeId", c4, a1], ["smoothId", c4, a1],
                 ["plusId", c6, a1], ["minusId", c7, a1],
                 ["wheelScrollOptions", c2, a1], ["wheelScrollOptions0", c2, a1],
                 ["wheelScrollOptions1", c2, a1], ["wheelScrollOptions2", c2, a1],
                 ["wheelScrollOptions3", c2, a1],
                 ["wheelDirection", c5, a1], ["rockerModeId", c3, a1],
                 ["tooltipShiftId", c16, a1], ["tooltipDelayId", c17, a1], ["delaydropdownId", c17, a1],
                 ["tooltipDisplayId", c16, a1], ["durationdropdownId", c16, a1], ["mousebuttOptions", c1or2, a1],
                 ["mousebutt0", c1or2, a1],  ["mousebutt1", c1or2, a1], ["mousebutt2", c1or2, a1],
                 ["autoscroll", c8, a1], ["markerId", c9c, a1], ["cursorId", c10, a1],
                 ["noAltGestId", c1, a1], ["leftdefaultId", c12, a1], ["autoscrollOptions", c9, a1],
                 ["autoscrollOptions0", c9, a1], ["autoscrollOptions1", c9, a1], ["autoscrollOptions2", c9, a1],
                 ["autoscrollOptions3", c9, a1], ["refreshrateId", c9c, a1], ["scrollrateOptions", c9c, a1],
                 ["scrollrate0", c9c, a1], ["scrollrate1", c9c, a1], ["scrollrate2", c9c, a1],
                 ["tabBar", c14, a1], ["panningId", c9a, a1], ["reverseId", c15, a1],
                 ["evenOnLinkId", c9b, a1], ["openlinksId", c1, a1], ["openLinkInNewId", c1, a1], ["grabHorizId", c9d, a1],
                 ["grabModeId", c9d, a1], ["leftlabelId", c12, a1], ["goUpId", c1, a1],
                 ["crispResizeId", c1, a1], ["nextprevId", c1, a1], ["nextlinkId", c1, a1],
                 ["prevlinkId", c1, a1], ["nextsStringId", c1, a1], ["prevsStringId", c1, a1]];
  var elem;

  for (var i = 0; i < idTable.length; ++i) {
     elem = document.getElementById(idTable[i][0]);
     if (idTable[i][1]) elem.removeAttribute(idTable[i][2]);
     else elem.setAttribute(idTable[i][2], "true");
  }
}

function checkWheelRocker() {
  setScrollGesturesVisibility(document.getElementById("wheelScrollOptions").value == 0);
  doEnabling();
}

function populateSiteList(prefStr) {
  var listBox = document.getElementById('siteList');
  var items = [];
  try {
    items = JSON.parse(prefStr);
  } catch(err){};
  
  for (var i=0; i<items.length; i++) {
    addSiteListItem(listBox, items[i][0], items[i][1], ruleActionMap[items[i][1]]);
  }
}

function savePrefs() {
  var checkboxes  = ["mouse", "trailId", "smoothId", "rocker", "wheelscroll", "autoscroll", "wheelDirection",
                     "markerId", "cursorId", "panningId", "pasteId", "reverseId",
                     "noAltGestId", "leftdefaultId", "openlinksId", "openLinkInNewId", "tabBar", "evenOnLinkId",
                     "linkTooltip", "tooltipShiftId", "grabHorizId", "grabModeId",
                     "goUpId", "crispResizeId", "disableClickHeatId"];
  var radiogroups = ["wheelScrollOptions", "mousebuttOptions", "autoscrollOptions",
                     "scrollrateOptions"];
  var checkbox, radiogroup, i;

  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  for (i = 0; i < checkboxes.length; ++i) {
    checkbox = document.getElementById(checkboxes[i]);
    pref.setBoolPref(checkbox.getAttribute("prefstring"), checkbox.checked);
  }
  for (i = 0; i < radiogroups.length; ++i) {
    radiogroup = document.getElementById(radiogroups[i]);
    pref.setIntPref(radiogroup.getAttribute("prefstring"), radiogroup.value);
  }
  pref.setIntPref("allinonegest.rockertypepref", document.getElementById("rockerModeId").checked ? 1 : 0);
  pref.setIntPref("allinonegest.titleDelay", document.getElementById("delaydropdownId").selectedIndex);
  pref.setIntPref("allinonegest.titleDuration", document.getElementById("durationdropdownId").selectedIndex);
  pref.setCharPref("allinonegest.trailColor", document.getElementById("trailPickerId").color);
  pref.setIntPref("allinonegest.trailSize", trailSize);
  pref.setCharPref("allinonegest.gestureString", returnCustomizedString(0));
  pref.setCharPref("allinonegest.functionString", returnCustomizedString(1));
  pref.setCharPref("allinonegest.rockerString", returnCustomizedString(2));
  
  // save custom gestures
  var customGestures = getCustomGestures();
  var str = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance(Components.interfaces.nsISupportsString);
  str.data = JSON.stringify(customGestures);
  pref.setComplexValue("allinonegest.customGestures", Components.interfaces.nsISupportsString, str);
  deleteUnusedScriptFiles(customGestures);

  
  var str = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance(Components.interfaces.nsISupportsString);
  str.data = document.getElementById("nextsStringId").value;
  pref.setComplexValue("allinonegest.nextsString", Components.interfaces.nsISupportsString, str);
  str.data = document.getElementById("prevsStringId").value;
  pref.setComplexValue("allinonegest.prevsString", Components.interfaces.nsISupportsString, str);
  
  // save site-specific URLs
  var listItems = document.getElementById('siteList').getElementsByTagName('listitem');
  var cells, url, val;
  var prefList = [];
  
  for (var i=0; i<listItems.length; i++) {
    cells = listItems[i].getElementsByTagName('listcell');
    url = cells[0].getAttribute('label');
    val = cells[1].getAttribute('value');
    
    prefList.push([url, val]);
  }
  
  var str = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance(Components.interfaces.nsISupportsString);
  str.data = JSON.stringify(prefList);
  pref.setComplexValue("allinonegest.sitesList", Components.interfaces.nsISupportsString, str);
  
  return true;
}

function deleteUnusedScriptFiles(customGestures) {
  var usedFiles = [];
  
  for (var i=0; i<customGestures.length; i++) {
    if (customGestures[i].script) {
      usedFiles.push(customGestures[i].script);
    }
  }
  
  // directory listing
  Components.utils.import("resource://gre/modules/FileUtils.jsm");
  var file = FileUtils.getDir("ProfD", ["MouseGesturesSuite"], true);
  var entries = file.directoryEntries;
  
  var toDelete = [];
  
  while (entries.hasMoreElements()) {
    var entry = entries.getNext();
    entry.QueryInterface(Components.interfaces.nsIFile);
    
    if (entry.isFile()
        && /\.js$/i.test(entry.leafName)
        && usedFiles.indexOf(entry.leafName) < 0) {
      // delete unused file
      entry.remove(false);
    }
  }
}

function changeTrace(inc) {
  var color = document.getElementById("trailPickerId").color;
  trailSize += inc;
  document.getElementById("traitId").setAttribute("style",
        "border-top-width:" + trailSize + "px;border-top-color:" + color);
  if (inc) doEnabling();
}

function restoreDefaultGestures() {
  
  if (!confirm(bundle.getString("opt.confirmDefaultGestures"))) return;
  
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  
  pref.setCharPref("allinonegest.gestureString", mgsuite.default.gestureString);
  pref.setCharPref("allinonegest.functionString", mgsuite.default.functionString);
  pref.setCharPref("allinonegest.rockerString", mgsuite.default.rockerString);
  
  reopenPrefWindow();
}

function openHelp(tabIndex) {
  // default English help
  var  url = "mgsuite-en/content/help-options.html";
  
  if (typeof tabIndex != 'undefined') {
    if (tabIndex != '') {
      url += "#tab"+tabIndex;
    }
  } else {
    tabIndex = document.getElementById("tabpanId").selectedIndex;
    if (tabIndex) {
      url += "#tab"+(tabIndex+1);
    }
  }
  
  try {
    var win = window.open("chrome://" + url, "mousegesturessuiteoptions", "chrome=no,scrollbars=yes,resizable=yes,width=850,height=660");
  
  } catch (err) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefs.getBranch("");
    var browserUrl = prefBranch.getCharPref('browser.chromeURL');
    
    var win = window.openDialog(browserUrl, "mousegesturessuiteoptions", "chrome,all,dialog=no,width=850,height=660", "chrome://" + url);
  }
  win.focus();
}

function openOptions() {
  window.openDialog("chrome://mgsuite/content/pref/aioOptions.xul", "", "chrome,dialog,modal,resizable");
}

// Sort gesture and function strings according to order in
// mgsuite.default.functionString & mgsuite.default.gestureString.
// If an item does not exists (eg. new action not yet in prefs)
// then add it with empty definition.
function sortGestureStrings(gestStr, funcStr, defaultFuncStr) {
  var gest = gestStr.split("|");
  var func = funcStr.split("|");
  var defaultFunc = defaultFuncStr.split("|");
  
  // create key=>value object with gesture string
  var gestObj = {};
  
  for (var i=0; i<func.length; i++) {
    // we add gesture definitions to array because one gesture can have
    // multiple definitions (gesture strings)
    if (typeof gestObj[func[i]] == "undefined") {
      gestObj[func[i]] = [];
    }
    gestObj[func[i]].push(gest[i] ? gest[i] : "");
  }
  
  // recreate strings in new order as defined in defaultFuncStr
  var newGest = [];
  var newFunc = [];
  
  for (var i=0; i<defaultFunc.length; i++) {
    
    if (gestObj.hasOwnProperty(defaultFunc[i])) {
      for (var j=0; j<gestObj[defaultFunc[i]].length; j++) {
        newFunc.push(defaultFunc[i]);
        newGest.push(gestObj[defaultFunc[i]][j]);
      }
      
    } else {
      // new action not yet in prefs
      newFunc.push(defaultFunc[i]);
      newGest.push("");
    }
  }

  return {
    gestureString: newGest.join("|"),
    functionString: newFunc.join("|")
  };
}

function rememberSelectedPanel() {
  var tabIndex = document.getElementById("tabpanId").selectedIndex;
  Application.storage.set("aioOptionsLastTab", tabIndex);
}

function restoreLastSelectedPanel() {
  var tabIndex = Application.storage.get("aioOptionsLastTab", null);
  
  if (tabIndex !== null) {
    document.getElementsByTagName('tabbox')[0].selectedIndex = tabIndex;
  }
}

function exportSettings() {
  savePrefs();
  
  var data = "# Mouse Gestures Suite settings - saved on " + new Date().toString() + "\n";
  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService);
  var aioPref = aioPrefService.getBranch("allinonegest.");
  
  var prefs = getPrefsForImportExport();
  var name, type, val;
  
  try {
    for (var i=0; i<prefs.length; i++) {
      name = prefs[i][0];
      type = prefs[i][1];
      
      switch (type) {
        case 'bool':
          val = aioPref.getBoolPref(name) ? 'true' : 'false';
          break;
        
        case 'int':
          val = aioPref.getIntPref(name);
          break;
        
        case 'char':
          val = aioPref.getComplexValue(name, Components.interfaces.nsISupportsString).data;
          break;
        
        default:
          continue;
      }
      
      data += name + "=" + val + "\n";    
    }
  } catch (err) {
    // prefs can be non-existent after restoring defaults
    alert("Cannot export settings. Open new browser window and try exporting again.");
    return;
  }
  
  // export scripts
  var customGestures = [];
  try {
    let prefS = aioPref.getComplexValue("customGestures", Components.interfaces.nsISupportsString);
    customGestures = JSON.parse(prefS);
  } catch (err) {}
  
  if (Array.isArray(customGestures)) {
    var cg, js;
    
    for (var i=0; i<customGestures.length; i++) {
      cg = customGestures[i];
      if (!cg.script) {
        continue;
      }
      
      js = settingsIO.readFile(cg.script);
      
      data += cg.script + "=" + JSON.stringify(js) + "\n";
    }
  }
  
  
   
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  
  var windowTitle = "Save Mouse Gestures Suite settings...";
  
  picker.init(window, windowTitle, nsIFilePicker.modeSave);
  picker.defaultString = "gesture-settings.txt";
  picker.defaultExtension = "txt";
  picker.appendFilters(nsIFilePicker.filterText);
  picker.appendFilters(nsIFilePicker.filterAll);
  
  var lastDir = Application.storage.get("aioSettingsDir", null);
  
  if (lastDir) {
    var file = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(lastDir);
    picker.displayDirectory = file;
  }

  var rv = picker.show();
  if (rv != nsIFilePicker.returnOK && rv != nsIFilePicker.returnReplace) return;
  
  if (!picker.file || picker.file.path.length <= 0) return;
  
  var segm = picker.file.path.split(/([/\\])/);
  segm.pop();
  segm.pop();
  var dir = segm.join("");
  Application.storage.set("aioSettingsDir", dir);
  
  const MODE_WRONLY   = 0x02;
  const MODE_CREATE   = 0x08;
  const MODE_TRUNCATE = 0x20;
  const PERM_RW_RW_R  = parseInt("0664", 8);
  
  var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		     createInstance(Components.interfaces.nsIFileOutputStream);
             
  outputStream.init(picker.file, MODE_WRONLY | MODE_CREATE | MODE_TRUNCATE, PERM_RW_RW_R, 0);
  
  outputStream.write(data, data.length);
  outputStream.close();
  alert("Settings saved!");
}

function importSettings() {
  if (!confirm(bundle.getString("opt.confirmRestoreDefaults"))) return;
  
  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService);
  var aioPref = aioPrefService.getBranch("allinonegest.");

  const MODE_RDONLY   = 0x01;
  const PERM_R_R_R    = parseInt("0444", 8);
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  
  var windowTitle = "Load Mouse Gestures Suite settings...";
  
  picker.init(window, windowTitle, nsIFilePicker.modeOpen);
  picker.defaultExtension = "txt";
  picker.appendFilters(nsIFilePicker.filterText);
  picker.appendFilters(nsIFilePicker.filterAll);
  
  var lastDir = Application.storage.get("aioSettingsDir", null);
  
  if (lastDir) {
    var file = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(lastDir);
    picker.displayDirectory = file;
  }

  var rv = picker.show();
  
  if (rv != nsIFilePicker.returnOK || !picker.file || picker.file.path.length <= 0) return;
  
  
  var ioPr = getPrefsForImportExport();
  var prefs = {};
  
  for (var i=0; i<ioPr.length; i++) {
    prefs[ioPr[i][0]] = ioPr[i][1];
  }
  
  var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                    createInstance(Components.interfaces.nsIFileInputStream);
  inputStream.init(picker.file, MODE_RDONLY, PERM_R_R_R, 0);
  
  var lis = inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
  var inpLine = {}, more;
  var line, delimPos;
  var name, val, saveVal;
  var countSet = 0;
  var firstLine = true;
  var savedFiles = [];

  do {
      more = lis.readLine(inpLine);
      line = inpLine.value.replace(/[\r\n]/g, "");
      
      if (firstLine && line.indexOf("# Mouse Gestures Suite settings") != 0) {
        inputStream.close();
        alert(bundle.getString("opt.invalidSettingsFile"));
        return;
      }
      
      if (line.substr(0,1) != '#') {
        delimPos = line.indexOf('=');
        
        if (delimPos > 0) {
          name = line.substr(0, delimPos);
          val = line.substr(delimPos+1);
          saveVal = null;
          
          if (prefs[name]) { // only allowed prefs
            switch (prefs[name]) {
              case 'bool':
                if (val == 'true') {
                  saveVal = true;
                } else if (val == 'false') {
                  saveVal = false;
                }
                
                if (saveVal !== null) {
                  aioPref.setBoolPref(name, saveVal);
                  countSet++;
                }
                break;
              
              case 'int':
                saveVal = parseInt(val, 10);
                
                if (!isNaN(saveVal)) {
                  aioPref.setIntPref(name, saveVal);
                  countSet++;
                }
                break;
             
              case 'char':
                var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
                str.data = val.substr(0, 50000);
                aioPref.setComplexValue(name, Components.interfaces.nsISupportsString, str);
                
                countSet++;
                break;
            }
          } else if (/\.js$/i.test(name)) {
            // import script and save it to file
            try {
              var data = JSON.parse(val);
              
              if (typeof data == 'string') {
                settingsIO.saveFile(name, data);
                savedFiles.push(name);
                countSet++;
              }
              
            } catch (err) {};
          }
        }
      }
      firstLine = false;
  } while (more);
  
  inputStream.close();
  
  if (countSet > 0) {
    settingsIO.deleteAllExcept(savedFiles);
    reopenPrefWindow();
  } else {
    alert(bundle.getString("opt.invalidSettingsFile"));
  }
}

function restoreDefaultSettings() {
  if (!confirm(bundle.getString("opt.restoreDefaultsConfirm"))) {
    return;
  }
  
  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService);
  var aioPref = aioPrefService.getBranch("allinonegest.");
  
  var prefs = getPrefsForImportExport();
  var name;
  
  for (var i=0; i<prefs.length; i++) {
    name = prefs[i][0];
    aioPref.clearUserPref(name);
  }
  
  reopenPrefWindow();
}

function getPrefsForImportExport() {
  return [
    ['TTHover', 'bool'],
    ['autoscrollCursor', 'bool'],
    ['autoscrollNoMarker', 'bool'],
    ['autoscrollRate', 'int'],
    ['autoscrolling2', 'bool'],
    ['autoscrollpref', 'int'],
    ['crispResize', 'bool'],
    ['customGestures', 'char'],
    ['disableClickHeat', 'bool'],
    ['dragAlaAcrobat', 'bool'],
    ['evenOnLink', 'bool'],
    ['functionString', 'char'],
    ['gestureString', 'char'],
    ['gestureTrails', 'bool'],
    ['goUpInNewTab', 'bool'],
    ['isActive', 'bool'],
    ['leftDefault', 'bool'],
    ['mouse', 'bool'],
    ['mousebuttonpref', 'int'],
    ['nextsString', 'char'],
    ['noAltGest', 'bool'],
    ['noHorizScroll', 'bool'],
    ['openLinkInNew', 'bool'],
    ['panning', 'bool'],
    ['prevsString', 'char'],
    ['reverseScrolling', 'bool'],
    ['rockerString', 'char'],
    ['rockertypepref', 'int'],
    ['rocking', 'bool'],
    //['savedAutoscroll', 'bool'],
    ['shiftForTitle', 'bool'],
    ['sitesList', 'char'],
    ['showLinkTooltip', 'bool'],
    ['singleWindow', 'bool'],
    ['smoothTrail', 'bool'],
    ['tabBar', 'bool'],
    ['titleDelay', 'int'],
    ['titleDuration', 'int'],
    ['trailColor', 'char'],
    ['trailSize', 'int'],
    ['trustAutoSelect', 'bool'],
    ['wheelHistoryIfCw', 'bool'],
    ['wheelpref2', 'int'],
    ['wheelscrolling', 'bool'],
  ];
}

function reopenPrefWindow() {
  window.opener.aioOpenAioOptionsDelayed = function() {
    var openerWin = window.opener;
    openerWin.setTimeout(function() {
      openerWin.openDialog("chrome://mgsuite/content/pref/aioOptions.xul", "", "chrome,dialog,modal,resizable");
    }, 400);
  }
  
  window.opener.aioOpenAioOptionsDelayed();
  closeWindow(true);
}


function addRule() {
  openEditRuleWin(true);
}

function editRule() {
  var listBox = document.getElementById('siteList');
  if (listBox.selectedCount != 1) {
    alert(bundle.getString("opt.only1ItemToEdit"));
    return;
  }
  openEditRuleWin(false);
}

function deleteRule() {
  var listBox = document.getElementById('siteList');
  var selectedCount = listBox.selectedCount;
  
  if (listBox.selectedCount == 0) {
    alert("Please select items to delete.");
    return;
  }
  
  for (var c=0; c<selectedCount; c++) {
    var listItem = listBox.selectedItems[0];
    listItem.parentNode.removeChild(listItem);
  }
}

function openEditRuleWin(newRule) {
  var x = window.screenX + 40;
  var y = window.screenY + Math.round(window.outerHeight / 2 - 150);
  
  var suffix = newRule ? "?new=1" : "";
  
  window.openDialog("chrome://mgsuite/content/pref/aioEditRule.xul" + suffix, "", "width=540,height=230,chrome,dialog,modal,resizable,top=" + y + ",left=" + x);
}

/**
 * @param {String} type
 * @param {Boolean} isNew If it will be new gesture
 */
function editGesture(type, isNew) {
  var sizeStr = "";
  
  if (type == "native") {
    var w = 375;
    var h = 460;
    
    var x = Math.max(window.screenX + Math.round(window.outerWidth / 2 - w /2), 0);
    var y = Math.max(window.screenY + Math.round(window.outerHeight / 2 - h / 2), 0);
    
    sizeStr = ",width=" + w
      + ",height=" + h
      + ",top=" + y
      + ",left=" + x;
  }
  
  window.openDialog("chrome://mgsuite/content/pref/editGesture.xul", "", "chrome,dialog,modal,resizable" + sizeStr, isNew); 
}
