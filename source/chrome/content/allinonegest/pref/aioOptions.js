var trailSize;

function getBrowserWindow() {
  var winMgr=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService()
    .QueryInterface(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser");
  if (winMgr.hasMoreElements()) return winMgr.getNext();
  return null;
}

function init() {
  var checkboxes  = ["mouse", "trailId", "rocker", "wheelscroll", "autoscroll", "wheelDirection",
                     "markerId", "cursorId", "panningId", "pasteId", "reverseId",
                     "noAltGestId", "leftdefaultId", "openlinksId", "openLinkInNewId", "tabBar", "evenOnLinkId",
                     "linkTooltip", "tooltipShiftId", "grabHorizId", "grabModeId",
                     "goUpId", "disableClickHeatId"];
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
  var gestureStrings = sortGestureStrings(gestureString, functionString, defaultFunctionString);
  populateTree(gestureStrings.gestureString, gestureStrings.functionString,
               pref.getCharPref("allinonegest.rockerString"));
  setScrollGesturesVisibility(document.getElementById("wheelScrollOptions").value == 0);
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
  var c6 = c4 && trailSize < 8;
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
                 ["trailSizeId", c4, a1], ["plusId", c6, a1], ["minusId", c7, a1],
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
                 ["grabModeId", c9d, a1], ["leftlabelId", c12, a1],
                 ["goUpId", c1, a1], ["nextprevId", c1, a1], ["nextlinkId", c1, a1],
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

function savePrefs() {
  var checkboxes  = ["mouse", "trailId", "rocker", "wheelscroll", "autoscroll", "wheelDirection",
                     "markerId", "cursorId", "panningId", "pasteId", "reverseId",
                     "noAltGestId", "leftdefaultId", "openlinksId", "openLinkInNewId", "tabBar", "evenOnLinkId",
                     "linkTooltip", "tooltipShiftId", "grabHorizId", "grabModeId",
                     "goUpId", "disableClickHeatId"];
  var radiogroups = ["wheelScrollOptions", "mousebuttOptions", "autoscrollOptions",
                     "scrollrateOptions"];
  var checkbox, radiogroup, i;
  if (document.getElementById("tabpanId").selectedIndex == 1 &&
      !document.getElementById("customEdit").hasAttribute("hidden")) {
     setTimeout(function() {newGestValue();}, 0);
     return false;
  }
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
  var str = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance(Components.interfaces.nsISupportsString);
  str.data = document.getElementById("nextsStringId").value;
  pref.setComplexValue("allinonegest.nextsString", Components.interfaces.nsISupportsString, str);
  str.data = document.getElementById("prevsStringId").value;
  pref.setComplexValue("allinonegest.prevsString", Components.interfaces.nsISupportsString, str);
  return true;
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
  
  pref.setCharPref("allinonegest.gestureString", defaultGestureString);
  pref.setCharPref("allinonegest.functionString", defaultFunctionString);
  pref.setCharPref("allinonegest.rockerString", defaultRockerString);
  
  if (typeof window.opener.aioOpenAioOptionsDelayed == "function") {
    window.opener.aioOpenAioOptionsDelayed(400);
  }
  closeWindow(true);
}

function openHelp(tabIndex) {
  var url = "allinonegest/locale/help.html";
  
  if (!chromeFileExists(url)) {
    // default English help
    url = "allinonegest-en/content/help-options.html";
  }
  
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
  
  var win = window.open("chrome://" + url, "mousegesturessuiteoptions", "chrome=no,scrollbars=yes,resizable=yes,width=850,height=660");
  win.focus();
}

function chromeFileExists(file)
{
  var xmlhttp = new window.XMLHttpRequest();
  try {
    xmlhttp.open("GET", "chrome://" + file, false);
    xmlhttp.onreadystatechange = function() {
      xmlhttp.abort();
    }
    xmlhttp.send(null);
  }
  catch (ex) {
    return false;
  }
  return true;
}

function openOptions() {
  window.openDialog("chrome://allinonegest/content/pref/aioOptions.xul", "", "chrome,dialog,modal,resizable");
}

// Sort gesture and function strings according to order in
// defaultFunctionString & defaultGestureString.
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

