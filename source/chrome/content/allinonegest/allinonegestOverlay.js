/*
 * allinonegest.js
 * For licence information, read licence.txt
 *
 * event handling and scrollwheel navigation for Mouse Gestures Suite
 *
 */
"use strict";

if (typeof mgsuite == 'undefined') {
  var mgsuite = {};
}

mgsuite.const = {
  // 'Constants'
  LMB: 0,
  MMB: 1,
  RMB: 2,
  NoB: 3,
  CHROME_DIR: "chrome://allinonegest/content/",
  xhtmlNS: "http://www.w3.org/1999/xhtml",
  xlinkNS: "http://www.w3.org/1999/xlink",
  xulNS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
  LOCALE_PROPERTIES: "chrome://allinonegest/locale/allinonegest.properties",
  GUID: "mousegesturessuite@lemon_juice.addons.mozilla.org",
}


// global variables for mouse gestures
var aioContent, aioRendering, aioTabRendering, aioContextPopup, aioMainWin, aioStatusBar;
var aioLastStatusMsg = "";
var aioBlockActionStatusMsg;
var aioIsWin, aioIsMac, aioIsNix;
var aioFirstInit = true;
var aioGrid = 15; // minimal gesture has to be 'grid' pixels long
var aioDelay = 1000; // delay before aborting gesture
var aioDelayTO;
var aioGestInProgress = false;
var aioOldX, aioOldY; // old coords from previous gesture stroke
var aioGestStr, aioUnknownStr, aioCurrGest, aioRockerString;
var aioGesturesEnabled;
var aioStrokes = [], aioLocaleGest = [], aioShortGest = [];
var aioLastEvtTime; // time of last gesture stroke
var aioOnLink = []; // array of objects representing the links traversed during gesture
var aioOnImage = null; // contains an image DOM node
var aioSrcEvent; // event which started the active gesture
var aioIsRocker = false;
var aioBundle; // String bundle for localized strings
var aioShowContextMenu;
var aioGestEnabled, aioRockEnabled;  // prefs ....
var aioTrailEnabled, aioTrailColor, aioTrailSize, aioSmoothTrail;
var aioWheelEnabled, aioScrollEnabled, aioNoScrollMarker, aioStartOnLinks;
var aioWhatAS, aioASEnabled, aioTabSwitching, aioSmoothScroll;
var aioRockMode, aioWheelMode, aioHistIfDown;
var aioSpecialCursor, aioLeftDefault, aioPreferPaste, aioNoAltWithGest;
var aioSingleNewWindow, aioOpenLinkInNew, aioPanToAS, aioReverseScroll;
var aioShowTitletip, aioTTHover, aioShiftForTitle, aioTitleDelay, aioTitleDuration;
var aioScrollAlaAcrobat, aioNextsString, aioPrevsString;
var aioGestButton, aioActionString, aioFuncString, aioWheelRocker;
var aioGoUpInNewTab, aioNoHorizScroll;
var aioRockerAction = [], aioRockMultiple = [];
var aioTrustAutoSelect;
var aioDisableClickHeat;
var aioCrispResize;
var aioFxV18;
var aioWindowType, aioIsFx = false;
var aioDefNextSearch, aioDefPrevSearch;
var aioTabFocusHistory = [];
var aioGestureTab;  // contains reference to tab if gesture was performed on a tab
var aioSiteList = [];  // list of sites for enabling/disabling gestures
var aioSitePref;  // D for disabled gestures, P for gestures priority
var aioPrevParsedURL;

// global variables for rocker gesture
const aioOpp = [mgsuite.const.RMB, mgsuite.const.NoB, mgsuite.const.LMB, mgsuite.const.NoB];
var aioDownButton;
var aioBackRocking;
var aioRockTimer = null;
var aioRepet = [], aioWheelBothWays;

// global variables for wheel navigation
const aioBackURL = mgsuite.const.CHROME_DIR + "back.png";
const aioNextURL = mgsuite.const.CHROME_DIR + "next.png";
var aioTabPU, aioHistPU, aioTTPU = null;
var aioTabCount, aioTabSrc, aioTabDest = -1;
var aioCCW;
var aioTTTimer = null, aioTTShown = false;
var aioTTNode;

// global variables for autoscroll
const aioMarkerSize = 28, aioHalfMarker = aioMarkerSize / 2;
const aioMarkers = [mgsuite.const.CHROME_DIR + "autoscroll_all.png", mgsuite.const.CHROME_DIR + "autoscroll_v.png", mgsuite.const.CHROME_DIR + "autoscroll_h.png"];
const aioMarkerIds = ["aioscrollerNSEW", "aioscrollerNS", "aioscrollerEW"];
const aioDist =  [0, 20, 40, 60, 80, 100, 130, 180, 300, 5000];
const aioRatio = [.0, .067, .083, .108, .145, .2, .3, .45, .65, .9];
const aioScrollLoop = [1, 2, 4];
var aioSofar;
const aioCursors = ["move", "n-resize", "e-resize"];
var aioScrollCount, aioScrollRate, aioScrollMax, aioASPeriod;
const aioASBasicPeriod = 40;
const aioSmoothPeriod = 20;
var aioLastX, aioLastY;
var aioDistX = [0, 0, 0, 0];
var aioDistY = [0, 0, 0, 0];
var aioScrollFingerFree;
var aioAcceptASKeys = false;
var aioIntervalID = null, aioScroll;
var aioOverlay = null, aioMarker = null;
var aioMarkerX, aioMarkerY;
var aioInitStarted = false;
var aioSmoothInc;
var aioSmooth = null, aioSmoothInterval;
var aioGrabTarget, aioScrollMode;
var aioTabsNb;
var aioBeingUninstalled = false;
var aioPrefObserverTimeout;
var aioPrefObserverDisabled = false;

// Preferences observers
const aioPrefListener = {
  domain: "allinonegest.",
  observe: function(subject, topic, prefName) {// when AiO pref was changed, reinit
    if (topic != "nsPref:changed" || aioPrefObserverDisabled) return;
	
	// run aioInit() delayed and only once if the observer is fired multiple times
	// in a short period
	if (aioPrefObserverTimeout) {
	  clearTimeout(aioPrefObserverTimeout);
	}
	
	aioPrefObserverTimeout = setTimeout(function() {
	  //dump("Observer runs aioInit()\n");
	  aioInit();
	}, 300);
  }
};
const aioStdPrefListener = {
  domain1: "general.",
  domain2: "mousewheel.withnokey.",
  domain3: "middlemouse.",
  observe: function(subject, topic, prefName) {
    if (topic != "nsPref:changed") return;
    aioStdPrefChanged();
  }
};
// used to prevent infinite loop when aioStdPrefListener called itself on changing pref
var aioIgnoreStdPrefListener = false;

const aioShutdownListener = {
  observe: function(subject, topic, data) {
    if (topic != "quit-application") return;
    if (aioBeingUninstalled) aioUninstallCleanUp();
  }
};
const aioUninstallListener = {
  onUninstalling: function(addon) {
    if (addon.id == mgsuite.const.GUID) {
	   aioBeingUninstalled = true;
	}
  },
  onOperationCancelled: function(addon) {
    if (addon.id == mgsuite.const.GUID) {
	   aioBeingUninstalled = false;
	}
  }
}

var aioPrefRoot, aioPref, aioPbi;

function aioStartUp() {
  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService);
  aioPrefRoot = aioPrefService.getBranch(null); // prefs: root node
  aioPref = aioPrefService.getBranch("allinonegest."); // prefs: AiO node
  aioPbi = aioPrefRoot.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
  aioPbi.addObserver(aioStdPrefListener.domain1, aioStdPrefListener, false); //set Pref observer on "general"
  aioPbi.addObserver(aioStdPrefListener.domain2, aioStdPrefListener, false); // and mousewheel
  aioPbi.addObserver(aioStdPrefListener.domain3, aioStdPrefListener, false); // and middlemouse
 
  try {
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.addAddonListener(aioUninstallListener);
  }
  catch (err) {}
  
  var isActive, prefNotExisting;
  try {
    isActive = aioPref.getBoolPref("isActive");
    prefNotExisting = false;
  }
  catch(err) {
    isActive = false;
	prefNotExisting = true;
  }

  try {
    if (!isActive) {
       aioPref.setBoolPref("isActive", true);
       if (prefNotExisting) aioPref.setBoolPref("savedAutoscroll", true); // active or not? Suppose active & autoScroll was true
	   else aioPref.setBoolPref("savedAutoscroll", aioPrefRoot.getBoolPref("general.autoScroll")); // not active case
	}
  }
  catch (err) {}

  // Now that isActive and savedAutoScroll have been set, we can add the observer on AioG prefs
  aioPbi.addObserver(aioPrefListener.domain, aioPrefListener, false); //set Pref observer on "allinonegest"

  aioInit();
}

function aioWindowUnload() {

  function freeObservers() {
    // Don't leak the observers when a window closes
    try {
      aioPbi.removeObserver(aioPrefListener.domain, aioPrefListener);
      aioPbi.removeObserver(aioStdPrefListener.domain1, aioStdPrefListener);
      aioPbi.removeObserver(aioStdPrefListener.domain2, aioStdPrefListener);
      aioPbi.removeObserver(aioStdPrefListener.domain3, aioStdPrefListener);
	
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.removeAddonListener(aioUninstallListener);
    }
    catch(err) {}
  }
  
  function getNumberOfOpenWindows(windowType) {
    var count = 0;
    var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
                  .getService(Components.interfaces.nsIWindowMediator);

    var windowIter = wm.getEnumerator(windowType);
    while (windowIter.hasMoreElements()) {
      count++;
      windowIter.getNext();
    }
	return count;
  }
  
  function isLastBrowserWindow() {
    const numberAfterLastWindowUnload = 0;
    return getNumberOfOpenWindows("navigator:browser") == numberAfterLastWindowUnload;
  }

  function installQuitObserver() {
    try {
      var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
      observerService.addObserver(aioShutdownListener, "quit-application", false);
    }
	catch (err) {}
  }

  freeObservers();
  if (isLastBrowserWindow()) installQuitObserver();
}

function aioUninstallCleanUp() {
  // AiOG is being uninstalled. Set isActive to false and restore std prefs that were overriden.
  // Since pref observers were freed on unload, aioInit & aioStdPrefChanged will not be called.

  aioPref.setBoolPref("isActive", false);
  aioPrefRoot.setBoolPref("general.autoScroll", aioPref.getBoolPref("savedAutoscroll"));
}

function aioStdPrefChanged(force) {
  if (aioIgnoreStdPrefListener) {
    return;
  }
  aioIgnoreStdPrefListener = true; // prevent infinite loop
  
  try {
    if (aioPrefRoot.getBoolPref("general.autoScroll") != (aioASEnabled && aioWhatAS == 1)) {
        aioPrefRoot.setBoolPref("general.autoScroll", aioASEnabled && aioWhatAS == 1);
      }
  }
  catch(err) {}
  try {
    aioSmoothScroll = aioPrefRoot.getBoolPref("general.smoothScroll");
  }
  catch(err) {aioSmoothScroll = false;}
  try {
    aioPreferPaste = aioPrefRoot.getBoolPref("middlemouse.paste");
  }
  catch(err) {aioPreferPaste = false;}
  try {
    if (!aioPrefRoot.getBoolPref("mousewheel.withnokey.sysnumlines"))
        aioSmoothInc = aioPrefRoot.getIntPref("mousewheel.withnokey.numlines") * 19;
    else aioSmoothInc = 60;
  }
  catch(err) {aioSmoothInc = 60;}
  
  aioIgnoreStdPrefListener = false;
}

function aioCreateStringBundle(propFile) {
  try {
    var strBundleService =  Components.classes["@mozilla.org/intl/stringbundle;1"].getService(). 
                              QueryInterface(Components.interfaces.nsIStringBundleService);
    return strBundleService.createBundle(propFile);
  }
  catch(err) {return null;}
}

function aioGetStr(str) {
  if (aioBundle) {
    try {
      return aioBundle.GetStringFromName(str);
    } catch (err) {
      return "?";
    }
  }
  return "";
}

function aioGetLocalizedStrings() {
  aioBundle = aioCreateStringBundle(mgsuite.const.LOCALE_PROPERTIES);
  aioShortGest["R"] = aioGetStr("abbreviation.right");
  aioShortGest["L"] = aioGetStr("abbreviation.left");
  aioShortGest["U"] = aioGetStr("abbreviation.up");
  aioShortGest["D"] = aioGetStr("abbreviation.down");
  aioGestStr = aioGetStr("g.gesture");
  aioUnknownStr = aioGetStr("g.unknown");
  aioDefNextSearch = aioGetStr("g.nextTerm");
  aioDefPrevSearch = aioGetStr("g.prevTerm");
}

function aioInit() { // overlay has finished loading or a pref was changed
  //dump("aioInit\n");
  var titleDelay, titleDuration;
  const delayTable = [250, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000];
  const durationTable = [2000, 3000, 4000, 5000, 6000, 7000, 8000];

  if (!aioInitStarted) {
     aioInitStarted = true;
     aioGetLocalizedStrings();
  }
  
  var XULAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                .getService(Components.interfaces.nsIXULAppInfo);
				
  if (XULAppInfo.ID != '{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}') {  // SM id
	aioIsFx = true;  // if false, then SM
  }
  
  // detect window type
  switch (String(document.location)) {
    case "chrome://navigator/content/navigator.xul":
    case "chrome://browser/content/browser.xul":
     aioWindowType = "browser";
      break;
     
    case "chrome://global/content/viewSource.xul":
    case "chrome://global/content/viewPartialSource.xul":
      aioWindowType = "source";
      break;
     
    case "chrome://messenger/content/messenger.xul":
    case "chrome://messenger/content/messageWindow.xul":
      aioWindowType = "messenger";
      break;
    
    case "chrome://messenger/content/messengercompose/messengercompose.xul":
      aioWindowType = "mailcompose";
      break;
    
    default:
      aioWindowType = null;
  }
  

  // read prefs or set Defaults
  var prefFuncs = [ // get pref value, set default value, check value range
	 [function(){aioActionString=aioPref.getCharPref("gestureString");}, function(){aioPref.setCharPref("gestureString",mgsuiteDefaults.gestureString);}, function(){return !aioActionString;}],
	 [function(){aioFuncString=aioPref.getCharPref("functionString");}, function(){aioPref.setCharPref("functionString",mgsuiteDefaults.functionString);}, function(){return !aioFuncString;}],
     [function(){aioRockerString=aioPref.getCharPref("rockerString");}, function(){aioPref.setCharPref("rockerString",mgsuiteDefaults.rockerString);}, function(){return !aioRockerString;}],
	 [function(){aioGestButton=aioPref.getIntPref("mousebuttonpref");}, function(){aioPref.setIntPref("mousebuttonpref",mgsuite.const.RMB);}, function(){return aioGestButton<0||aioGestButton>2;}],
	 [function(){aioGestEnabled=aioPref.getBoolPref("mouse");}, function(){aioPref.setBoolPref("mouse",true);}, function(){return false;}],
	 [function(){aioTrailEnabled=aioPref.getBoolPref("gestureTrails");}, function(){aioPref.setBoolPref("gestureTrails",true);}, function(){return false;}],
	 [function(){aioTrailColor=aioPref.getCharPref("trailColor");}, function(){aioPref.setCharPref("trailColor","#009900");}, function(){return false;}],
	 [function(){aioTrailSize=aioPref.getIntPref("trailSize");}, function(){aioPref.setIntPref("trailSize",3);}, function(){return aioTrailSize<1||aioTrailSize>12;}],
	 [function(){aioSmoothTrail=aioPref.getBoolPref("smoothTrail");}, function(){aioPref.setBoolPref("smoothTrail",true);}, function(){return false;}],
	 [function(){aioRockEnabled=aioPref.getBoolPref("rocking");}, function(){aioPref.setBoolPref("rocking",true);}, function(){return false;}],
	 [function(){aioWheelEnabled=aioPref.getBoolPref("wheelscrolling");}, function(){aioPref.setBoolPref("wheelscrolling",true);}, function(){return false;}], // Scroll wheel navigation
	 [function(){aioASEnabled=aioPref.getBoolPref("autoscrolling2");}, function(){aioPref.setBoolPref("autoscrolling2",true);}, function(){return false;}], // Middle button scrolling
	 [function(){aioTabSwitching=aioPref.getBoolPref("tabBar");}, function(){aioPref.setBoolPref("tabBar",true);}, function(){return false;}],
	 [function(){aioWhatAS=aioPref.getIntPref("autoscrollpref");}, function(){aioPref.setIntPref("autoscrollpref",1);}, function(){return aioWhatAS<0||aioWhatAS>3;}],
	 [function(){aioScrollRate=aioPref.getIntPref("autoscrollRate");}, function(){aioPref.setIntPref("autoscrollRate",1);}, function(){return aioScrollRate<0||aioScrollRate>2;}],
	 [function(){aioNoScrollMarker=aioPref.getBoolPref("autoscrollNoMarker");}, function(){aioPref.setBoolPref("autoscrollNoMarker",false);}, function(){return false;}],
	 [function(){aioWheelMode=aioPref.getIntPref("wheelpref2");}, function(){aioPref.setIntPref("wheelpref2",0);}, function(){return aioWheelMode<0||aioWheelMode>3;}],
	 [function(){aioHistIfDown=aioPref.getBoolPref("wheelHistoryIfCw");}, function(){aioPref.setBoolPref("wheelHistoryIfCw",true);}, function(){return false;}],
	 [function(){aioRockMode=aioPref.getIntPref("rockertypepref");}, function(){aioPref.setIntPref("rockertypepref",1);}, function(){return aioRockMode<0||aioRockMode>1;}],
	 [function(){aioSpecialCursor=aioPref.getBoolPref("autoscrollCursor");}, function(){aioPref.setBoolPref("autoscrollCursor",false);}, function(){return false;}],
	 [function(){aioNoAltWithGest=aioPref.getBoolPref("noAltGest");}, function(){aioPref.setBoolPref("noAltGest",true);}, function(){return false;}],
	 [function(){aioLeftDefault=aioPref.getBoolPref("leftDefault");}, function(){aioPref.setBoolPref("leftDefault",false);}, function(){return false;}],
	 [function(){aioSingleNewWindow=aioPref.getBoolPref("singleWindow");}, function(){aioPref.setBoolPref("singleWindow",false);}, function(){return false;}],
	 [function(){aioOpenLinkInNew=aioPref.getBoolPref("openLinkInNew");}, function(){aioPref.setBoolPref("openLinkInNew",true);}, function(){return false;}],
	 [function(){aioGoUpInNewTab=aioPref.getBoolPref("goUpInNewTab");}, function(){aioPref.setBoolPref("goUpInNewTab",false);}, function(){return false;}],
	  [function(){aioReverseScroll=aioPref.getBoolPref("reverseScrolling");}, function(){aioPref.setBoolPref("reverseScrolling",false);}, function(){return false;}],
	 [function(){aioStartOnLinks=aioPref.getBoolPref("evenOnLink");}, function(){aioPref.setBoolPref("evenOnLink",false);}, function(){return false;}],
	 [function(){aioShowTitletip=aioPref.getBoolPref("showLinkTooltip");}, function(){aioPref.setBoolPref("showLinkTooltip",false);}, function(){return false;}],
	 [function(){aioTTHover=aioPref.getBoolPref("TTHover");}, function(){aioPref.setBoolPref("TTHover",true);}, function(){return false;}],
	 [function(){aioShiftForTitle=aioPref.getBoolPref("shiftForTitle");}, function(){aioPref.setBoolPref("shiftForTitle",true);}, function(){return false;}],
	 [function(){titleDelay=aioPref.getIntPref("titleDelay");}, function(){aioPref.setIntPref("titleDelay",2);}, function(){return titleDelay<0||titleDelay>9;}],
	 [function(){titleDuration=aioPref.getIntPref("titleDuration");}, function(){aioPref.setIntPref("titleDuration",3);}, function(){return titleDuration<0||titleDuration>6;}],
	 [function(){aioScrollAlaAcrobat=aioPref.getBoolPref("dragAlaAcrobat");}, function(){aioPref.setBoolPref("dragAlaAcrobat",false);}, function(){return false;}],
	 [function(){aioNoHorizScroll=aioPref.getBoolPref("noHorizScroll");}, function(){aioPref.setBoolPref("noHorizScroll",false);}, function(){return false;}],
	 [function(){aioTrustAutoSelect=aioPref.getBoolPref("trustAutoSelect");}, function(){aioPref.setBoolPref("trustAutoSelect",false);}, function(){return false;}],
	 [function(){aioPanToAS=aioPref.getBoolPref("panning");}, function(){aioPref.setBoolPref("panning",false);}, function(){return false;}],
	 [function(){aioDisableClickHeat=aioPref.getBoolPref("disableClickHeat");}, function(){aioPref.setBoolPref("disableClickHeat",false);}, function(){return false;}],
	 [function(){aioCrispResize=aioPref.getBoolPref("crispResize");}, function(){aioPref.setBoolPref("crispResize",false);}, function(){return false;}]
  ];

  aioPrefObserverDisabled = true;

  aioSiteList = [];
  try {
	var prefList = aioPref.getComplexValue("sitesList", Components.interfaces.nsISupportsString);
	
	aioSiteList = JSON.parse(prefList);
	
  } catch (err) {
	var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
    str.data = "[]";
    aioPref.setComplexValue("sitesList", Components.interfaces.nsISupportsString, str);
  }

  const unixRe = new RegExp("unix|linux|sun|freebsd", "i");
  
  for (var i = 0; i < prefFuncs.length; ++i) {
    try {prefFuncs[i][0]();}
    catch(err) {prefFuncs[i][1](); prefFuncs[i][0]()}
    if (prefFuncs[i][2]()) {prefFuncs[i][1](); prefFuncs[i][0]()}
  }
  
  
  try {
    aioNextsString = aioPref.getComplexValue("nextsString", Components.interfaces.nsISupportsString).data;
  }
  catch(err) {
    var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
    str.data = aioDefNextSearch;
    aioNextsString = aioDefNextSearch;
    aioPref.setComplexValue("nextsString", Components.interfaces.nsISupportsString, str);
  }
  
  try {
    aioPrevsString = aioPref.getComplexValue("prevsString", Components.interfaces.nsISupportsString).data;
  }
  catch(err) {
    str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
    str.data = aioDefPrevSearch;
    aioPrevsString = aioDefPrevSearch;
    aioPref.setComplexValue("prevsString", Components.interfaces.nsISupportsString, str);
  }
  if (aioNoAltWithGest) aioLeftDefault = false;
  aioWheelRocker = aioWheelMode == 0;
  
  aioPrefObserverDisabled = false;
  

  aioStdPrefChanged();
  aioGesturesEnabled = (aioGestEnabled || aioRockEnabled || aioWheelEnabled);
  aioShowContextMenu = true;
  
  aioScrollEnabled = aioASEnabled && aioWhatAS != 1;
  const httpProtocolHandler = Components.classes["@mozilla.org/network/protocol;1?name=http"]
                                   .getService(Components.interfaces.nsIHttpProtocolHandler);
  var platform = httpProtocolHandler.platform.toLowerCase();
  var geckoVersion = httpProtocolHandler.misc.match(/rv:([0-9.]+)/)[1];
  var versionComparator = null;
  if ("nsIVersionComparator" in Components.interfaces)
     versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                          .getService(Components.interfaces.nsIVersionComparator);
  else
     versionComparator = Components.classes["@mozilla.org/updates/version-checker;1"]
                          .getService(Components.interfaces.nsIVersionChecker);
  
  if (aioFirstInit) {
	aioIsWin = false; aioIsMac = false; aioIsNix = false;
	if (platform.indexOf('win') != -1) aioIsWin = true;
	else
	   if (platform.indexOf('mac') != -1) aioIsMac = true;
	   else aioIsNix = platform.search(unixRe) != -1;
     
    aioFxV18 = versionComparator.compare(geckoVersion, "18.0") >= 0;

	switch (aioWindowType) {
	  case 'browser':
		aioContent = document.getElementById("content");
		aioRendering = aioContent;
		aioTabRendering = document.getElementById("TabsToolbar"); // Fx
		aioStatusBar = document.getElementById("statusbar-display");
		if (!aioStatusBar) {
		  aioStatusBar = gBrowser.getStatusPanel();
		}
		
		aioContent.tabContainer.addEventListener("TabSelect", aioTabFocus, true);
		var activeId = "t" + aioUnique++;
		if (aioContent.mTabContainer) {
		  aioContent.mTabContainer.childNodes[0].setAttribute('aioTabId', activeId);
		  aioTabFocusHistory.push({focused: activeId});
		}
		
		// listener for url changes
		var urlListener =
		{
		QueryInterface: function(aIID)
		{
		 if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			 aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			 aIID.equals(Components.interfaces.nsISupports))
		  return this;
		 throw Components.results.NS_NOINTERFACE;
		},
		onLocationChange: function(aProgress, aRequest, aURI, aFlags)
		{
		 if (!(aFlags & Components.interfaces.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT)) {
		   // don't run this when only URL hash changed or tab switched;
		   // Fx and SM 2.29.1 and later run it even on tab switching.
		   aioParseSiteList();
		 }
		},
		onStateChange: function() {},
		onProgressChange: function() {},
		onStatusChange: function() {},
		onSecurityChange: function() {},
		onLinkIconAvailable: function() {}
	  };
	  
	  gBrowser.addProgressListener(urlListener);
	  
	  gBrowser.tabContainer.addEventListener("TabSelect", aioParseSiteList, false);
	  
	  window.addEventListener("activate", function() {
		// we need delay because aioInit() is run with delay after pref change
		setTimeout(aioParseSiteList, 600);
	  });
	  break;
	   
	  case 'messenger':
		aioContent = document.getElementById("messagepane");
		aioRendering = document.getElementById("messagepane");
		aioStatusBar = document.getElementById("statusText");
		break;
		
	  case 'mailcompose':
		aioContent = aioContent = document.getElementById("appcontent");
		aioRendering = document.getElementById("content-frame");
		aioStatusBar = document.getElementById("statusText");
		break;
		
	  case 'source':
		aioContent = aioContent = document.getElementById("appcontent");
		aioRendering = document.getElementById("content");
		aioStatusBar = document.getElementById("statusbar-line-col");
		break;
	}
   
  
	aioContextPopup = document.getElementById("contentAreaContextMenu");
	aioMainWin = document.getElementById("main-window");
   
	aioRendering.addEventListener("mousedown", aioMouseDown, true);
	if (aioTabRendering) {
	  aioTabRendering.addEventListener("mousedown", aioMouseDown, true);
	}
	
	document.documentElement.addEventListener("popupshowing", aioContextMenuEnabler, true);

	window.addEventListener("mouseup", aioMouseUp, true);
	
	if (!aioIsWin) {
	  window.addEventListener("mouseup", function(e) {
	    aioShowContextMenu = true;
	  }, true);
	}
	
	window.addEventListener("draggesture", aioDragGesture, true);
	window.addEventListener("unload", aioWindowUnload, false);
	window.addEventListener("keypress", aioKeyPressed, true);
	
	// init some autoscroll variables
	aioSofar = [];
	aioSofar[1] = 0;
	for (var ii = 1; ii < aioDist.length - 1; ++ii) {
	   aioSofar[ii+1] = aioSofar[ii] + (aioDist[ii] - aioDist[ii-1]) * aioRatio[ii];
	}
  }

  if (aioGesturesEnabled) {
	aioInitGestTable();
	
	var rockerFuncs = aioRockerString.split("|");
	var rFunc;
	for (var i = 0; i < rockerFuncs.length; ++i)
	  if (rockerFuncs[i].charAt(0) == "/") {
		 aioRockerAction[i] = function(){void(0);};
		 aioRockMultiple[i] = 0;
	  }
	  else {
		rFunc = rockerFuncs[i] - 0;
		if (rFunc < 0 || rFunc >= aioActionTable.length) {rockerFuncs[i] = "0"; rFunc = 0;}
		aioRockerAction[i] = aioActionTable[rFunc][0];
		aioRockMultiple[i] = aioActionTable[rFunc][2];
	  }
	aioWheelBothWays = rockerFuncs[2].charAt(0) != "/" && rockerFuncs[3].charAt(0) != "/" && 
	   (rockerFuncs[2] == rockerFuncs[3] || rockerFuncs[2] == aioActionTable[rockerFuncs[3] - 0][3]);
  }
  
  aioTitleDelay = delayTable[titleDelay];
  aioTitleDuration = durationTable[titleDuration];
  aioScrollMax = aioScrollLoop[aioScrollRate]; aioASPeriod = aioASBasicPeriod / aioScrollMax;

  aioDownButton = mgsuite.const.NoB; aioBackRocking = false;
  if (aioShowTitletip && aioTTHover) aioRendering.addEventListener("mousemove", aioShowTitle, true);
  else aioRendering.removeEventListener("mousemove", aioShowTitle, true);
  
  aioRendering.removeEventListener("DOMMouseScroll", aioWheelScroll, false);

  if (aioWindowType == "browser") {
    if (aioTabSwitching) {
      aioContent.mStrip.addEventListener("DOMMouseScroll", aioSwitchTabs, true);
      if (platform.indexOf('linux') != -1) // hack for linux-gtk2 + xft bug
         document.getElementById("navigator-toolbox").addEventListener("DOMMouseScroll", aioSwitchTabs, true); 
   }
   else {
      aioContent.mStrip.removeEventListener("DOMMouseScroll", aioSwitchTabs, true);
      if (platform.indexOf('linux') != -1)
         document.getElementById("navigator-toolbox").removeEventListener("DOMMouseScroll", aioSwitchTabs, true);
    }
	
	aioPrevParsedURL = null;
  }

  aioFirstInit = false;
}

/* Parse site list preferences and determine if current page should be given
 * special treatment (prioritize gestures or disable gestures)
 */
function aioParseSiteList() {
  var url = window.content.top.location.href;
  
  if (url === aioPrevParsedURL) {
	return;
  }
  
  aioPrevParsedURL = url;
  
  if (url == "about:blank") {
	aioSitePref = null;
	return;
  }
  var searchUrl, searchUrlEsc, urlRegex, urlToTest, matches;
  
  var hashPos = url.lastIndexOf('#'); // ignore hash part
  if (hashPos >= 0) {
	// strip hash
	url = url.substr(0, hashPos);
  }
  
  matches = url.match(/^(\w+:\/\/)?(.*)$/);
  var urlWithoutProtocol = matches[2];
  
  aioSitePref = null;
  
  for (var i=0, len=aioSiteList.length; i<len; i++) {
	searchUrl = aioSiteList[i][0];
	var hashPos = searchUrl.indexOf('#');
	if (hashPos >= 0) {
	  // strip hash
	  searchUrl = searchUrl.substr(0, hashPos);
	}
	
	// detect protocol (index 1)
	matches = searchUrl.match(/^(\w+:\/\/)?(.*)$/);
	
	if (matches[2].indexOf('/') < 0 && matches[2].indexOf('*') < 0) {
	  // there should be at least 1 slash - append it
	  searchUrl += "/";
	}
	
	if (matches[1]) {
	  // has protocol - full comparison
	  urlToTest = url;
	} else {
	  // no protocol - omit protocol in comparison
	  urlToTest = urlWithoutProtocol;
	}
	
	searchUrlEsc = searchUrl.replace(/([.+?^${}()|\[\]\/\\])/g, "\\$1")
	  .replace(/\*/g, '.*');
	urlRegex = new RegExp('^' + searchUrlEsc + '$');
	
	if (urlRegex.test(urlToTest)) {
	  aioSitePref = aioSiteList[i][1];
	}
  }
}

function aioIsKeyOK(e) {
   return !(aioNoAltWithGest && e.altKey)
}

function aioIsUnformattedXML(aDoc) {
  return /\/[\w+]*xml/.test(aDoc.contentType) && aDoc.styleSheets && aDoc.styleSheets.length && aDoc.styleSheets[0].href &&
         aDoc.styleSheets[0].href.substr(-31) == "/content/xml/XMLPrettyPrint.css";
}

function aioContextMenuEnabler(e) {
  //dump("\ntarget: " + e.target.nodeName + "; id=" + e.target.id + "\n");
  //dump("ctx: " + e.originalTarget.nodeName + "; id=" + e.originalTarget.id + "\n");
  if (!aioShowContextMenu && (e.originalTarget.nodeName == "menupopup" || e.originalTarget.nodeName == "xul:menupopup")) {
	
	var id = e.originalTarget.id ? e.originalTarget.id : null;
	
	if (id == "contentAreaContextMenu"
	  || (id == "mailContext" && e.explicitOriginalTarget.nodeName != "treechildren")
	  || id == "viewSourceContextMenu"
	  || id == "addonitem-popup"
	  || (aioIsFx && id == "toolbar-context-menu") // Fx
	  || id == "tabContextMenu" // Fx
	  || e.originalTarget.getAttribute('anonid') == "tabContextMenu" // SM
    ) {
	  e.preventDefault(); e.stopPropagation();
	}
  }
}

//function debugAllAttr(elem) {
//  var str = "", node;
//  
//  for (var i=0; i<elem.attributes.length; i++) {
//    node = elem.attributes[i];
//    str += node.nodeName + "=" + node.nodeValue + "; ";
//  }
//  return str;
//}

function aioKeyPressed(e) {
  if (aioAcceptASKeys) aioAutoScrollKey(e);
  else aioShowContextMenu = !aioGestInProgress;
}

function aioNukeEvent(e) {
  e.preventDefault(); e.stopPropagation();
}

function aioGestMove(e) {
  var x_dir = e.screenX - aioOldX; var absX = Math.abs(x_dir);
  var y_dir = e.screenY - aioOldY; var absY = Math.abs(y_dir);
  var tempMove;

  aioAddLink(e);
  //only add if movement enough to make a gesture
  if (absX < aioGrid && absY < aioGrid) return;
  aioLastEvtTime = new Date(); // e.timeStamp is broken on Linux
  
  if (aioDelayTO) {
	clearTimeout(aioDelayTO);
  }
  aioDelayTO = setTimeout(function() { mgsuiteTrails.indicateGestureTimeout() }, aioDelay);
  
  mgsuiteTrails.drawTrail(e);
  var pente = absY <= 5 ? 100 : absX / absY; // 5 should be grid/tangent(60)
  if (pente < 0.58 || pente > 1.73) { //between 30° & 60°, wait
     if (pente < 0.58) tempMove = y_dir > 0 ? "D" : "U";
     else tempMove = x_dir > 0 ? "R" : "L";
     if (!aioStrokes.length || aioStrokes[aioStrokes.length-1] != tempMove) {
        aioStrokes.push(tempMove); aioLocaleGest.push(aioShortGest[tempMove]);
		
		var sequence = aioStrokes.join("");
        var index = aioGestTable[sequence];
		
		if (index == null) {
		   index = aioGestTable["+" + sequence.substr(-2)];
		   if (index == null)
			  index = aioGestTable["+" + sequence.substr(-3)];
		}
		
        if (index != null) {
		  aioCurrGest = aioActionTable[index][1];
		} else {
		  aioCurrGest = aioUnknownStr;
		}
     }
     aioStatusMessage(aioGestStr + ": " + aioLocaleGest.join("") + " (" + aioCurrGest + ")", 0);
  }
  aioOldX = e.screenX; aioOldY = e.screenY;
}

function aioGetHRef(node) {
  if (node.hasAttributeNS(mgsuite.const.xlinkNS, "href"))
     return makeURLAbsolute(node.baseURI, node.getAttributeNS(mgsuite.const.xlinkNS, "href"));
  return node.href;
}

function aioAddLink(e) { // Add traversed link to aioOnLink
  var linkNode = aioFindLink(e.originalTarget, true);
  if (!linkNode) return;
  var linkObj = {node: linkNode, href: aioGetHRef(linkNode)};
  // check if duplicated
  for (var i = aioOnLink.length - 1; i >= 0; --i)
     if (aioOnLink[i].href == linkObj.href) return;
  aioOnLink.push(linkObj);
}

function aioFindLink(domNode, gesturing) { // Loop up the DOM looking for a link. Returns the node
  if (!domNode.ownerDocument) return null;
  var stopNode = domNode.ownerDocument.documentElement;
  var nextNode = domNode, currNode, nodeNameLC;
  try {
    do {
      currNode = nextNode;
      if (currNode.namespaceURI == mgsuite.const.xhtmlNS) nodeNameLC = currNode.localName;
      else nodeNameLC = currNode.nodeName.toLowerCase();

      if (nodeNameLC == "img" && !aioOnImage && gesturing) aioOnImage = currNode;
      else {
         if (nodeNameLC == "a"  || nodeNameLC == "area" || currNode.hasAttributeNS(mgsuite.const.xlinkNS, "href"))
            if (nodeNameLC == "a" && !currNode.hasAttribute("href")) return null;
            else return currNode;
      }
      nextNode = currNode.parentNode;
    } while (nextNode && currNode != stopNode);
    return null;
  }
  catch(err) {return null;}
}

function aioIsAreaOK(e, isAutoScroll) {
  if (isAutoScroll && e.target.ownerDocument == aioContent.ownerDocument) return false;      
  var tag = e.target.nodeName.toLowerCase();
  try { var xtag = e.originalTarget.localName.toLowerCase(); } catch (err) {}

  return xtag != "slider" && xtag != "thumb" && xtag != "scrollbarbutton" &&
   (((tag != "input" || aioGestButton == mgsuite.const.RMB) && (tag != "textarea" || aioGestButton == mgsuite.const.RMB)
   && tag != "option" && tag != "select" && tag != "textarea" && tag != "textbox" && tag != "menu") || isAutoScroll);
}

function aioIsPastable(e) {
  var tag = e.target.nodeName.toLowerCase();
  return tag == "input" || tag == "textarea" || tag == "textbox";
}

function aioKillGestInProgress(clearMode) {
  aioGestInProgress = false;
  if (!clearMode) {
     aioOnLink.length = 0;
     aioOnImage = null;
  }
  mgsuiteTrails.eraseTrail();
  window.removeEventListener("mousemove", aioGestMove, true);
}

function aioClearRocker() {
  aioRockTimer = null;
  aioDownButton = mgsuite.const.NoB;
}

function aioPerformRockerFunction(index) {
  aioIsRocker = true;
  try {aioRockerAction[index]();}
  catch(err) {}
  aioIsRocker = false;
}

function aioPrioritizeGestures(e) {
  if (aioSitePref == 'P' && (
	  (e.button == mgsuite.const.RMB && ((aioGestEnabled && aioGestButton == mgsuite.const.RMB) || aioRockEnabled || aioWheelEnabled))
	  || (e.button == mgsuite.const.MMB && ((aioGestEnabled && aioGestButton == mgsuite.const.MMB) || aioWheelEnabled || aioScrollEnabled))
	  || (aioRockEnabled && e.button == mgsuite.const.LMB && aioDownButton == mgsuite.const.RMB)
	  )
	) {
	e.stopPropagation();
	
	var prefStr = aioGetStr("opt.sitePrefP");
	if (aioBlockActionStatusMsg.indexOf(prefStr) < 0) {
	  aioBlockActionStatusMsg += "<" + prefStr + ">";
	}
	aioStatusMessage(aioBlockActionStatusMsg, 1000);
  }
}

function aioMouseDown(e) {
  
  var gesturesEnabled = aioGesturesEnabled;
  
  if (gesturesEnabled) {
	// detect gesture start on tab
	aioGestureTab = null;
	
	if (aioWindowType == "browser") {
	  var tg = e.originalTarget;
	  if (tg.nodeName == 'xul:tab' ||
		  (tg.nodeName == 'tab' && tg.parentNode.nodeName.indexOf('xul:') == 0)) {
		// tab in SM
		aioGestureTab = e.originalTarget;
	  
	  } else if (tg.nodeName == 'xul:hbox' || tg.nodeName == 'xul:label') {
		// tab in Fx
		var tab = tg.parentNode.parentNode.parentNode;
		
		if (tab.nodeName == 'tab') {
		  aioGestureTab = tab;
		}
	  }
	}
	
  
	aioBlockActionStatusMsg = "";
	
	if (aioSitePref == 'P') {
	  // prioritize gestures - these listeners on document will prevent mouse clicks
	  // from reaching it
	  var addPrioritizeEvents = function(elem) {
		elem.addEventListener("mousedown", aioPrioritizeGestures, true);
		elem.addEventListener("mouseup", aioPrioritizeGestures, true);
		
		if (!aioIsWin) {
		  elem.addEventListener("contextmenu", aioPrioritizeGestures, true);
		}
	  }
	  
	  addPrioritizeEvents(window.content.document);
	  
	  var frames = window.content.frames;
	  var framesB, i, j, len, lenB;
	  
	  for (i=0, len=frames.length; i<len; i++) {
		addPrioritizeEvents(frames[i]);
		
		framesB = frames[i].frames;
		
		for (j=0, lenB=framesB.length; j<lenB; j++) {
		  addPrioritizeEvents(framesB[j]);
		}
	  }
	  
	} else if (aioSitePref == 'D' && !aioGestureTab) {
	  // disable gestures
	  
	  // sometimes context menu can get disabled in Windows in D mode
	  aioShowContextMenu = true;
	  
	  if (!aioGestureTab) {
		if (e.button != mgsuite.const.LMB || aioGestButton == mgsuite.const.LMB) {
		  aioBlockActionStatusMsg += "<" + aioGetStr("opt.sitePrefD") + ">";
		  aioStatusMessage(aioBlockActionStatusMsg, 1000);
		}
		gesturesEnabled = false;
	  }
	}
	
	if (gesturesEnabled) {
	  if (aioDisableClickHeat && aioWindowType == "browser") {
		aioDisableClickHeatEvents(e);
	  }
	  
	  aioShowContextMenu = false;
	  aioBackRocking = false;
	}
  }
  
  if (gesturesEnabled && e.button == aioOpp[aioDownButton] && aioRockEnabled) {
	// rocker gestures
     if (e.button == mgsuite.const.RMB) {
        var func = 1;
        aioSrcEvent = e;
        setTimeout(function(){aioPerformRockerFunction(1);}, 0);
     }
     else {
        func = 0;
        if (aioFindLink(e.target, false)) aioBackRocking = true;
        else {
           aioSrcEvent = e;
           aioPerformRockerFunction(0);
        }
     }
     aioKillGestInProgress();
	 aioStatusMessage("", 0);
     aioContent.removeEventListener("DOMMouseScroll", aioWheelNav, true);
     if (!aioRockMultiple[func] || (aioRockMultiple[func] == 2 && aioRockMode == 0)) aioDownButton = mgsuite.const.NoB;
     else { // multiple ops allowed
        if (aioRockTimer) {clearTimeout(aioRockTimer); aioRockTimer = null;}
        if (aioRockMultiple[func] == 2) aioRockTimer = setTimeout(function(){aioClearRocker();}, 3000);
        else aioRockTimer = setTimeout(function(){aioClearRocker();}, 10000000);
     }
  }
  else {
	if (gesturesEnabled && e.button == mgsuite.const.RMB) {
	  // turn off gesture on active flash because right click event may be triggered
	  // and the gesture may end up unfinished after choosing a context menu flash option
	  var targetName = e.target.localName.toLowerCase();
	  if ((targetName == "object" || targetName == "embed")
		&& e.target.actualType == "application/x-shockwave-flash"
		&& e.target.activated) {
	    return;
	  }
    }
	 
    if (gesturesEnabled && e.button == aioGestButton) {
      var preventDefaultAction = false;
      if (aioGestEnabled && aioIsKeyOK(e)) {
        aioSrcEvent = e;
        targetName  = e.target.nodeName.toLowerCase();
		 
        if ((aioIsAreaOK(e, false) || e.button != mgsuite.const.LMB) && targetName != 'toolbarbutton'
            && !aioGestInProgress) {
             
			preventDefaultAction = e.button != mgsuite.const.LMB || !aioLeftDefault ||
						 targetName == "html" || targetName == "body" || e.target.ownerDocument == aioContent.ownerDocument;
			aioGestInProgress = true;
			aioAddLink(e);  // Check if started over a link
			aioStrokes = []; aioLocaleGest = []; aioCurrGest = "";
			if (aioTrailEnabled) mgsuiteTrails.startTrail(e);
			window.addEventListener("mousemove", aioGestMove, true);
          }
          else preventDefaultAction = e.button != mgsuite.const.LMB;
      }
       // it can be the start of a wheelscroll gesture as well
       if (aioWheelEnabled && (aioWindowType == "browser" || aioWindowType == "messenger" || aioWindowType == "source")) {
          preventDefaultAction = preventDefaultAction || e.button != mgsuite.const.LMB;
          aioTabCount = (aioWindowType == "browser") ? aioContent.mPanelContainer.childNodes.length : 0;
          if (aioWheelRocker) {
             if (!aioGestInProgress) {
                aioSrcEvent = e;
                aioAddLink(e);
             }
          }
          else aioTTNode = aioFindLink(e.target, false);
          if (aioWheelRocker || aioTabCount >= 1 || aioTTNode)
             aioContent.addEventListener("DOMMouseScroll", aioWheelNav, true);
       }
	   
       if (preventDefaultAction && e.button == mgsuite.const.LMB) aioNukeEvent(e);
       aioOldX = e.screenX; aioOldY = e.screenY;
     }
     else {
		// middle button scrolling
        if (e.button == mgsuite.const.MMB && aioDownButton == mgsuite.const.NoB && aioScrollEnabled && aioIsAreaOK(e, true) &&
            (aioStartOnLinks  || !aioFindLink(e.target, false)) && !(aioPreferPaste && aioIsPastable(e))) {
		  aioShowContextMenu = false;
		  
		  window.removeEventListener("mouseup", aioMouseUp, true);
		  aioRendering.removeEventListener("mousedown", aioMouseDown, true);
		  window.addEventListener("click", aioASClick, true);
		  aioLastEvtTime = new Date();
		  aioLastX = e.screenX; aioLastY = e.screenY;
		  window.addEventListener("mousemove", aioScrollMove, true);
		  aioNukeEvent(e);
		  
		  switch (aioWhatAS) {
			case 0: aioAutoScrollStart(e);
					break;
			case 2: aioRendering.addEventListener("mouseup", aioStartAS, true);
					aioGrabTarget = e.target;
					aioScrollMode = 1;
					break;
			case 3: aioGrabNDrag(e.target);
		  }
        }
     }
     aioDownButton = e.button;
  }
}

function aioRockClickEnd() { // click event is not always fired
  window.removeEventListener("click", aioRockClickHandler, true);
}

function aioRockClickHandler(e) {
  if (e.button != mgsuite.const.LMB) return;
  aioNukeEvent(e);
  window.removeEventListener("click", aioRockClickHandler, true);
}

function aioGestClickEnd() { // click event is not always fired
  window.removeEventListener("click", aioGestClickHandler, true);
}

function aioGestClickHandler(e) {
  if (e.button != aioGestButton) return;
  aioNukeEvent(e);
  window.removeEventListener("click", aioGestClickHandler, true);
}

function aioDisplayContextMenu(e) {
  aioShowContextMenu = true;
  if (aioIsWin) return; // use the default action

  var evt = Components.interfaces.nsIDOMNSEvent;
  var mods = 0;

  if (e.shiftKey) mods |= evt.SHIFT_MASK;
  if (e.ctrlKey) mods |= evt.CONTROL_MASK;
  if (e.altKey) mods |= evt.ALT_MASK;
  if (e.metaKey) mods |= evt.META_MASK;

  var dwu = e.view.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowUtils);

  dwu.sendMouseEvent("contextmenu", e.clientX, e.clientY, 2, 1, mods);
}

function aioMouseUp(e) {
  if (!aioGesturesEnabled) {
	aioDownButton = mgsuite.const.NoB;
	return;
  }
  
  if (aioDelayTO) {
	clearTimeout(aioDelayTO);
  }
  
  if (aioSitePref == 'D' && !aioGestureTab) {
	// disable gestures
	aioDownButton = mgsuite.const.NoB;
	return;
  }
  aioBlockActionStatusMsg = "";
  
  if (aioIsMac && e.button == mgsuite.const.LMB && e.ctrlKey) var button = mgsuite.const.RMB;
  else button = e.button;
  if (aioBackRocking && button == mgsuite.const.LMB) {
     aioBackRocking = false;
     aioSrcEvent = e;
     window.addEventListener("click", aioRockClickHandler, true);
     setTimeout(function(){aioPerformRockerFunction(0);}, 0);
     setTimeout(function(){aioRockClickEnd();}, 200);
     return;
  }
  if (button == aioDownButton) {
     aioDownButton = mgsuite.const.NoB;
     aioContent.removeEventListener("DOMMouseScroll", aioWheelNav, true);
     if (button == mgsuite.const.RMB && !aioGestInProgress && !aioRockTimer) aioDisplayContextMenu(e);
     else {
        if (aioRockTimer) clearTimeout(aioRockTimer);
        aioRockTimer = null;
     }
  }
  
  if (aioGestInProgress) {
     var lastgesture = aioStrokes.join("");
	 
     if (lastgesture) aioNukeEvent(e);
     mgsuiteTrails.eraseTrail();
	 
     if (lastgesture) {
        window.addEventListener("click", aioGestClickHandler, true);
		var shiftKey = e.shiftKey;
		
        if ((new Date() - aioLastEvtTime) < aioDelay) {
           setTimeout(function(a){aioFireGesture(a, shiftKey);}, 0, lastgesture);
           setTimeout(function(){aioGestClickEnd();}, 200);
           return;
        }
        else { // abort if user pauses at the end of gesture
           aioStatusMessage(aioGetStr("g.aborted"), 2500);
           setTimeout(function(){aioGestClickEnd();}, 200);
        }
     }
     else {
        aioStatusMessage("", 0);
        if (button == mgsuite.const.RMB) aioDisplayContextMenu(e);
     }
     aioKillGestInProgress();
     aioDownButton = mgsuite.const.NoB;
  }
}

function aioDragGesture(e) {
  aioDownButton = mgsuite.const.NoB;
  aioContent.removeEventListener("DOMMouseScroll", aioWheelNav, true);
  if (aioGestInProgress) aioKillGestInProgress();
}

/* Scroll Wheel gestures
   Original code by Joe4711. Rewritten by Marc Boullet  */
function aioWheelNav(e) {
  aioNukeEvent(e);
  aioDownButton = mgsuite.const.NoB;
  aioCCW = e.detail < 0;

  aioRendering.removeEventListener("mousedown", aioMouseDown, true);
  aioContent.removeEventListener("DOMMouseScroll", aioWheelNav, true);
  window.removeEventListener("mouseup", aioMouseUp, true);
  if (aioGestInProgress) {
     aioKillGestInProgress(aioWheelRocker);
     aioStatusMessage("", 0);  //remove gesture indication
  }

  if (aioWheelRocker) {
     var func = 2 + (!aioCCW - 0);
     aioSrcEvent = e;
     aioPerformRockerFunction(func);
     if (!aioRockMultiple[func] || (aioRockMultiple[func] == 2 && aioRockMode == 0)) aioWheelRockEnd();
     else {
        aioRepet[func] = true; aioRepet[2 + (aioCCW - 0)] = aioWheelBothWays;
        window.addEventListener("mouseup", aioWheelRockUp, true);
        aioContent.addEventListener("DOMMouseScroll", aioWheelRocking, true);
     }
     return;
  }

  if (aioTTNode && aioShowTitletip && !aioTTHover) {aioLinkTooltip(); return;}
  switch (aioWheelMode) {
    case 1: aioHistoryWheelNav();
            break;
    case 2: aioTabWheelNav();
            break;
    case 3: if (aioCCW == aioHistIfDown) aioTabWheelNav();
            else aioHistoryWheelNav();
  }
}

function aioWheelRockEnd() {
  aioRestoreListeners();
  aioOnLink.length = 0;
  aioOnImage = null;
}

function aioWheelRockUp(e) {
  window.removeEventListener("mouseup", aioWheelRockUp, true);
  aioContent.removeEventListener("DOMMouseScroll", aioWheelRocking, true);
  aioWheelRockEnd();
}

function aioWheelRocking(e) {
  var func = 2 + ((e.detail >= 0) - 0);
  if (aioRepet[func]) {
     aioSrcEvent = e;
     aioPerformRockerFunction(func);
  }
  aioNukeEvent(e);
}
  

/*
  Function prototype for scrolling popups
*/
function aioPopUp(pActive, pStart, pLength, pLastFirst, ptype, mouseX, mouseY, revScroll, func1, func2, func3) {
  this.activeRow = pLastFirst ? pLength - pActive + pStart - 1 : pActive - pStart;
  this.initialRow = this.activeRow;
  this.initialItem = pActive;
  this.popupStart = pStart;
  this.popupLength = pLength;
  this.lastFirst = pLastFirst;
  this.popupType = ptype;
  this.popupX = mouseX;
  this.popupY = mouseY;
  this.reverseScroll = revScroll;
  this.closeFunc = func1;
  this.observeFunc = func2;
  this.scrollingFunc = func3;
  this.createPopup = _aioCreatePU;
  this.updatePopup = _aioUpdatePU;
  this.scrollPopup = _aioScrollPU;
  this.closePopup = _aioClosePU;
  this.scrollerNode = null;
}

function _aioCreatePU(arg1, arg2, arg3) {
  var popupElem, label, img;
  if (this.closeFunc) window.addEventListener("mouseup", this.closeFunc, true);
  if (this.popupType == "popup") {
     this.scrollerNode = document.createElementNS(mgsuite.const.xulNS, "panel");
     this.scrollerNode.id = "aioWheelPopup";
     this.scrollerNode.setAttribute("noautohide", "true");
  }
  else this.scrollerNode = document.createElementNS(mgsuite.const.xulNS, this.popupType);
  this.scrollerNode.setAttribute("ignorekeys", "true");
  if (this.popupType == "popup") {
    for (var i = this.popupStart; i < this.popupStart + this.popupLength; ++i) {
      popupElem = document.createElementNS(mgsuite.const.xulNS, "menuitem");
      if (arg1) {
         label = getWebNavigation().sessionHistory.getEntryAtIndex(i, false).title;
      }
      else {
		if (aioContent.mTabContainer.childNodes[i]) {
		  label = aioContent.mTabContainer.childNodes[i].label;
		} else {
		  label = aioContent.ownerDocument.title;
		}
	  }

      popupElem.setAttribute("class", "menuitem-iconic");
      popupElem.setAttribute("style", "max-width:40em;");
      popupElem.setAttribute("label", label);
      if (arg1) {
         img = (i < this.initialItem) ? aioBackURL : (i == this.initialItem) ?
                aioContent.mTabContainer.childNodes[aioContent.mTabContainer.selectedIndex].getAttribute("image") : aioNextURL;
	  } else {
		
		if (aioContent.mTabContainer.childNodes[i]) {
		  img = aioContent.mTabContainer.childNodes[i].getAttribute("image");
		}
	  }
      if (img) popupElem.setAttribute("image", img);
	  
      if (this.lastFirst) this.scrollerNode.insertBefore(popupElem, this.scrollerNode.firstChild);
      else this.scrollerNode.appendChild(popupElem);
    }
  }
  else {
    this.scrollerNode.setAttribute("orient", "vertical");
    if (arg1) {
       popupElem = document.createElementNS(mgsuite.const.xulNS, "description");
       popupElem.setAttribute("style", "font-family:sans-serif;font-weight:bold;font-size:16px;" +
                       (this.reverseScroll ? "color:red;" : ""));
       this.scrollerNode.appendChild(popupElem);
       popupElem.appendChild(document.createTextNode(arg1));
    }
    if (arg3) {
       popupElem = document.createElementNS(mgsuite.const.xulNS, "description");
       popupElem.setAttribute("style", "font-family:sans-serif;font-size:12px");
       this.scrollerNode.appendChild(popupElem);
       popupElem.appendChild(document.createTextNode(arg3));
    }
    popupElem = document.createElementNS(mgsuite.const.xulNS, "description");
    popupElem.setAttribute("style", "font-family:sans-serif;font-size:12px");
    this.scrollerNode.appendChild(popupElem);
    if (arg2.length > 69) arg2 = arg2.substr(0, 33) + "..." + arg2.substr(-33);
    popupElem.appendChild(document.createTextNode(arg2));
  }
  document.popupNode = null; document.tooltipNode = null;
  aioMainWin.appendChild(this.scrollerNode);
  this.scrollerNode.addEventListener("popupshowing", this.observeFunc, true);
  this.scrollerNode.openPopupAtScreen(this.popupX, this.popupY, false);
}

function _aioUpdatePU() {
  this.scrollerNode.removeEventListener("popupshowing", this.observeFunc, true);
  if (this.scrollingFunc) aioMainWin.addEventListener("DOMMouseScroll", this.scrollingFunc, true);
  for (var i = 0; i < arguments.length; i += 2)
    if (arguments[i] >= 0)
       this.scrollerNode.childNodes[arguments[i]].setAttribute(arguments[i + 1], "true");
}

function _aioScrollPU(event) {
  event.preventDefault(); event.stopPropagation();
  this.scrollerNode.childNodes[this.activeRow].removeAttribute("_moz-menuactive");
  var goRight = this.reverseScroll ? event.detail < 0 : event.detail > 0;
  if (goRight) {if (++this.activeRow >= this.popupLength) this.activeRow = 0;}
  else if (--this.activeRow < 0) this.activeRow = this.popupLength - 1;
  this.scrollerNode.childNodes[this.activeRow].setAttribute("_moz-menuactive","true");
}

function _aioClosePU(action) {
  if (this.closeFunc) window.removeEventListener("mouseup", this.closeFunc, true);
  if (this.scrollingFunc) aioMainWin.removeEventListener("DOMMouseScroll", this.scrollingFunc, true);
  this.scrollerNode.hidePopup();
  switch (action) {
    case 0: break;
    case 1: aioContent.mTabContainer.selectedIndex = this.activeRow;
            break;
    case 2: if (this.activeRow!=this.initialRow) {
               var indice = this.lastFirst ? this.popupLength + this.popupStart -1 - this.activeRow
                                           : this.activeRow + this.popupStart;
               getWebNavigation().gotoIndex(indice);
            }
  }
  aioMainWin.removeChild(this.scrollerNode);
}
// End of Popup prototype

function aioRestoreListeners() {
  aioRendering.addEventListener("mousedown", aioMouseDown, true);
  window.addEventListener("mouseup", aioMouseUp, true);
}

function aioTabWheelNav() {
  var activeTab = aioContent.mTabContainer.selectedIndex;
  if (activeTab != aioTabSrc) {
     aioTabDest = -1;
     aioTabSrc = activeTab;
  }
// Create and Display the popup menu
  aioTabPU = new aioPopUp(activeTab, 0, aioTabCount, false, "popup", aioOldX + 2, aioOldY + 2,
                          aioReverseScroll, aioTabWheelEnd, aioTabPopping, aioTabWheeling);
  aioTabPU.createPopup(0, "", "");
}

function aioTabPopping(e) {
  var row = (aioTabDest != -1 && aioTabDest < aioTabPU.popupLength) ? aioTabDest : -1;
  if (row != -1)
     aioTabPU.updatePopup(aioTabPU.initialRow, "_moz-menuactive", aioTabPU.initialRow, "aioBold", row, "aioItalic");
  else
     aioTabPU.updatePopup(aioTabPU.initialRow, "_moz-menuactive", aioTabPU.initialRow, "aioBold");
  
  e.preventDefault(); //no popup
  if (aioWheelMode == 2) aioContent.mTabContainer.advanceSelectedTab(aioCCW != aioReverseScroll ? -1 : 1, true);
}

function aioTabWheeling(e) {
  aioTabPU.scrollPopup(e);
  if (aioTabDest != -1 && aioTabDest < aioTabPU.popupLength)
     if (aioTabPU.activeRow == aioTabPU.initialRow)
        aioTabPU.scrollerNode.childNodes[aioTabDest].setAttribute("aioItalic", "true")
     else aioTabPU.scrollerNode.childNodes[aioTabDest].removeAttribute("aioItalic");
  aioContent.mTabContainer.advanceSelectedTab(e.detail > 0 == aioReverseScroll ? -1 : 1, true);
}

function aioTabWheelEnd(e) {
  aioTabPU.closePopup(0);
  aioRestoreListeners();
  return;
}

function aioHistoryWheelNav() {
  var sessionH = getWebNavigation().sessionHistory;
  if (sessionH.index < 0 || sessionH.count <= 0) { // Firefox bug: untitled tab
     aioRestoreListeners();
     return;
  }
  if (sessionH.count > 15) {
     var start = Math.max(0, sessionH.index - 7);
     if (start + 15 > sessionH.count) start = sessionH.count - 15;
     var count = 15;
  }
  else {
     start = 0;
     count = sessionH.count;
  }
        
  aioHistPU = new aioPopUp(sessionH.index, start, count, true, "popup", aioOldX + 2, aioOldY + 2,
                           false, aioHistWheelEnd, aioHistPopping, aioHistWheeling);
  aioHistPU.createPopup(1, "", "");
}

function aioHistPopping() {
  aioHistPU.updatePopup(aioHistPU.initialRow, "_moz-menuactive", aioHistPU.initialRow, "aioBold");
}

function aioHistWheeling(e) {
  aioHistPU.scrollPopup(e);
}

function aioHistWheelEnd(e) {
  aioHistPU.closePopup(2);
  aioRestoreListeners();
}

function aioLinkTooltip(e) {
  aioTTPU = new aioPopUp(0, 0, 0, false, "tooltip", aioOldX, aioOldY, aioHasNewWindowTarget(aioTTNode),
                         aioLinkTTEnd, aioLinkTTPopping, aioLinkTTNuke);
  
  aioTTPU.createPopup(aioGetTextForTitle(aioTTNode), aioGetHRef(aioTTNode), "");
}

function aioLinkTTPopping(e) {
  aioTTPU.updatePopup();
}

function aioLinkTTNuke(e) {
  aioNukeEvent(e);
}

function aioLinkTTEnd(e) {
  aioTTPU.closePopup(0);
  aioTTPU = null; aioTTNode = null;
  aioRestoreListeners();
  aioNukeEvent(e);
}

function aioSwitchTabs(e) {
  if (typeof(TabbrowserService) == "object" || aioContent.mPanelContainer.childNodes.length <= 1)  return;
  aioNukeEvent(e);
  aioContent.mTabContainer.advanceSelectedTab(e.detail > 0 == aioReverseScroll ? -1 : 1, true);
}

function aioScrollMove(e) {
  switch (aioScrollMode) {
    case 0: aioAutoScrollMove(e);
            break;
    case 1: aioGrabMaybe(e);
            break;
    case 2: aioGrabNDragMove(e);
  }
}

function aioScrollWindow() {
  aioScroll.clientFrame.scrollBy(aioDistX[aioScrollCount], aioDistY[aioScrollCount]);
  if (++aioScrollCount >= aioScrollMax) aioScrollCount = 0;
}

function aioScrollElem() {
  aioScroll.nodeToScroll.scrollLeft += aioDistX[aioScrollCount];
  aioScroll.nodeToScroll.scrollTop += aioDistY[aioScrollCount];
  if (++aioScrollCount >= aioScrollMax) aioScrollCount = 0;
}

function aioAutoScrollStart(e) {
  window.addEventListener("DOMMouseScroll", aioAutoScrollStop, true);
  window.addEventListener("mouseup", aioAutoScrollUp, true);
  window.addEventListener("mousedown", aioAutoScrollUp, true);
  aioAcceptASKeys = true;
  aioDistX = [0, 0, 0, 0]; aioDistY = [0, 0, 0, 0]; aioScrollCount = 0;
  aioScrollMode = 0;
  aioScrollFingerFree = false;

  switch (aioAddMarker(e)) {
    case 0: aioIntervalID = setInterval(function(){aioScrollElem();}, aioASPeriod);
            break;
    case 1: aioIntervalID = setInterval(function(){aioScrollWindow();}, aioASPeriod);
            break;
    case 2: ;
  }
}

function aioLogDist(aDist) {
  var absDist = Math.abs(aDist);
  for (var i = 1; i < aioDist.length; ++i)
     if (absDist < aioDist[i]) {
        absDist = Math.round(aioSofar[i] + (absDist - aioDist[i-1]) * aioRatio[i]);
        break;
     }
  var tabDist = [0, 0, 0, 0];
  switch (aioScrollRate) {
    case 0: tabDist[0] = (aDist < 0) ? -absDist : absDist;
            break;
    case 1: var half = absDist >> 1;
            tabDist[1] = (aDist < 0) ? -half : half;
            tabDist[0] = (aDist < 0) ? half - absDist : absDist - half;
            break;
    case 2: var quarter = absDist >> 2; var roundQuart = quarter;
            if ((absDist & 3) > 1) ++roundQuart;
            tabDist[0] = (aDist < 0) ? -roundQuart : roundQuart;
            tabDist[2] = tabDist[0];
            tabDist[1] = (aDist < 0) ? -quarter : quarter;
            tabDist[3] = absDist - quarter - roundQuart - roundQuart; if (aDist < 0) tabDist[3] = -tabDist[3];
  }
  return tabDist;
}

function aioAutoScrollMove(e) {
// Apply pseudo logarithmic scale
  aioNukeEvent(e);
  aioScroll.dX = e.screenX - aioLastX;
  aioScroll.dY = e.screenY - aioLastY;
  aioDistX = [0, 0, 0, 0]; aioDistY = [0, 0, 0, 0];
  switch (aioScroll.scrollType) {
    case 3: break;
    case 0: if (Math.abs(aioScroll.dX) > Math.abs(aioScroll.dY)) aioDistX = aioLogDist(aioScroll.dX);
            else aioDistY = aioLogDist(aioScroll.dY); // diagonal scrolling is jerky; don't do it
            break;
    case 1: aioDistY = aioLogDist(aioScroll.dY);
            break;
    case 2: aioDistX = aioLogDist(aioScroll.dX);
  }
}

function aioAutoScrollKey(e) {
  const VK_LEFT = e.DOM_VK_LEFT, VK_UP = e.DOM_VK_UP;
  const VK_RIGHT = e.DOM_VK_RIGHT, VK_DOWN = e.DOM_VK_DOWN;
  aioNukeEvent(e);
  switch (e.keyCode) {
    case VK_DOWN :
    case VK_UP   : if (aioScroll.scrollType < 2) {
                      var inc = e.keyCode == VK_UP ? -20 : 20 ;
                      if (aioMarker) {
						aioMarker.moveBy(0, inc);
                      }

                      aioLastY -= inc;
                      aioScroll.dY += inc;
                      aioDistY = aioLogDist(aioScroll.dY);
                   }
                   break;
    case VK_LEFT :
    case VK_RIGHT: if (!(aioScroll.scrollType & 1)) {
                      inc = e.keyCode == VK_LEFT ? -20 : 20 ;
                      if (aioMarker) {
                        aioMarker.moveBy(inc, 0);
                      }

                      aioLastX -= inc;
                      aioScroll.dX += inc;
                      aioDistX = aioLogDist(aioScroll.dX);
                   }
                   break;
    default      : aioAutoScrollStop(e);
 }          
}

function aioAutoScrollStop(e) {
  aioScrollFingerFree = true;
  aioAutoScrollUp(e);
}
        
function aioScrollEnd() {
  window.removeEventListener("click", aioASClick, true);
}

function aioASClick(e) { // prevent Unix pastes
  aioNukeEvent(e);
}

function aioAutoScrollUp(e) {
  if (aioScrollFingerFree || ((new Date() - aioLastEvtTime) > aioDelay &&
      (!aioPanToAS || Math.abs(e.screenX - aioLastX) >= aioHalfMarker || Math.abs(e.screenY - aioLastY) >= aioHalfMarker))) {
	if (aioIntervalID) window.clearInterval(aioIntervalID);
	aioIntervalID = null;
	aioNukeEvent(e);
	
	if (e.type == "mousedown") {
	   aioRemoveMarker();
	   window.removeEventListener("mousemove", aioScrollMove, true);
	}
    else {
	  aioDownButton = mgsuite.const.NoB;
	  window.removeEventListener("mouseup", aioAutoScrollUp, true);
	  window.removeEventListener("mousedown", aioAutoScrollUp, true);
	  window.removeEventListener("mousemove", aioScrollMove, true);
	  window.removeEventListener("DOMMouseScroll", aioAutoScrollStop, true);
	  aioAcceptASKeys = false;
	  window.addEventListener("mouseup", aioMouseUp, true);
	  aioRendering.addEventListener("mousedown", aioMouseDown, true);
	  aioRemoveMarker();
	  setTimeout(function(){aioScrollEnd();}, 200);
    }
  }
  else aioScrollFingerFree = true;
}

function aioFindNodeToScroll(initialNode) {
  
  function getStyle(elem, aProp) {
    var p = elem.ownerDocument.defaultView.getComputedStyle(elem, "").getPropertyValue(aProp);
    var val = parseFloat(p);
    if (!isNaN(val)) return Math.ceil(val);
    if (p == "thin") return 1;
    if (p == "medium") return 3;
    if (p == "thick") return 5;
    return 0;
  }

  const scrollingAllowed = ['scroll', 'auto'];
  const defaultScrollBarSize = 16;
  const twiceScrollBarSize = defaultScrollBarSize * 2;
  var retObj = {scrollType: 3, isXML: false, nodeToScroll: null, dX: 0, dY: 0,
                docWidth: 0, docHeight: 0, clientFrame: null, isBody: false, isFrame: false,
                targetDoc: null, insertionNode: null, docBoxX: 0, docBoxY: 0, realHeight: 0,
                ratioX: -1, ratioY: -1, XMLPrettyPrint: false, cursorChangeable: false};
  var realWidth, realHeight, nextNode, currNode;
  var targetDoc = initialNode.ownerDocument;
  var docEl = targetDoc.documentElement;
  var clientFrame = targetDoc.defaultView;
  retObj.insertionNode = (docEl) ? docEl : targetDoc;
  retObj.XMLPrettyPrint = aioIsUnformattedXML(targetDoc);
  var zoom = 1;
  
  var domWindowUtils = clientFrame.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIDOMWindowUtils);
  zoom = domWindowUtils.fullZoom;

  var insertBounds = retObj.insertionNode.getBoundingClientRect();
  retObj.docBoxX = Math.floor((clientFrame.mozInnerScreenX + insertBounds.left) * zoom);
  retObj.docBoxY = Math.floor((clientFrame.mozInnerScreenY + insertBounds.top) * zoom);

  retObj.targetDoc = targetDoc; retObj.clientFrame = clientFrame;
  if (docEl && docEl.nodeName.toLowerCase() == "html") { // walk the tree up looking for something to scroll
     if (clientFrame.frameElement) retObj.isFrame = true; else retObj.isFrame = false;
     var bodies = docEl.getElementsByTagName("body");
     if (!bodies || !bodies.length) return retObj;
     var bodyEl = bodies[0];
     if (initialNode == docEl) nextNode = bodyEl;
     else if (initialNode.nodeName.toLowerCase() == "select") nextNode = initialNode.parentNode;
          else nextNode = initialNode;
     do {
        try {
          currNode = nextNode;
          if (!(currNode instanceof HTMLElement)) {
			// some non-html element, e.g. svg
			nextNode = currNode.parentNode;
			continue;
		  }
		  
		  if ((currNode instanceof HTMLHtmlElement) ||
              (currNode instanceof HTMLBodyElement)) {
	         if (clientFrame.scrollMaxX > 0) {
			  retObj.scrollType = clientFrame.scrollMaxY > 0 ? (clientFrame.scrollbars.visible ? 0 : 3) : 2;			 
			 } else {
			  retObj.scrollType =  (clientFrame.scrollMaxY > 0 && clientFrame.scrollbars.visible) ? 1 : 3;
			 }
          }
		  else {
             var overflowx = currNode.ownerDocument.defaultView
                        		     .getComputedStyle(currNode, '')
                                     .getPropertyValue('overflow-x');
             var overflowy = currNode.ownerDocument.defaultView
                                     .getComputedStyle(currNode, '')
                                     .getPropertyValue('overflow-y');

			// Bug 212763 - overflow: visible on textarea isn't applied 
			 if (currNode instanceof HTMLTextAreaElement) {
			     if (overflowx == "visible") overflowx = "scroll";
				 if (overflowy == "visible") overflowy = "scroll";
			 }

             var scrollVert = currNode.clientHeight > 0 &&
                              currNode.scrollHeight > currNode.clientHeight &&
                              (currNode instanceof HTMLSelectElement ||
							  scrollingAllowed.indexOf(overflowy) >= 0);

             // do not allow horizontal scrolling for select elements, it leads
             // to visual artifacts and is not the expected behavior anyway
             if (!(currNode instanceof HTMLSelectElement) &&
                  currNode.clientWidth > 0 &&
                  currNode.scrollWidth > currNode.clientWidth &&
                  scrollingAllowed.indexOf(overflowx) >= 0) {
                retObj.scrollType = scrollVert ? 0 : 2;
             }
             else {
                retObj.scrollType = scrollVert ? 1 : 3;
             }
		  }
		  
          if (retObj.scrollType != 3) {
             retObj.nodeToScroll = currNode;
             retObj.isBody = (currNode instanceof HTMLHtmlElement) || (currNode instanceof HTMLBodyElement);
			 if (retObj.isBody) {
                retObj.docWidth = clientFrame.innerWidth + clientFrame.scrollMaxX;
                retObj.docHeight = clientFrame.innerHeight + clientFrame.scrollMaxY;
                realWidth = clientFrame.innerWidth;
                realHeight = clientFrame.innerHeight;
                retObj.realHeight = realHeight;
                realWidth *= zoom; realHeight *= zoom;
                if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
                if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
                retObj.ratioX = retObj.docWidth / realWidth;
                retObj.ratioY = retObj.docHeight / realHeight;
			 }
			 else {
                retObj.docWidth = docEl.scrollWidth; retObj.docHeight = docEl.scrollHeight;
                realWidth = currNode.clientWidth + getStyle(currNode, "border-left-width") + getStyle(currNode, "border-right-width");
                realHeight = currNode.clientHeight + getStyle(currNode, "border-top-width") + getStyle(currNode, "border-bottom-width");
                retObj.realHeight = realHeight;
                realWidth *= zoom; realHeight *= zoom;
                if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
                if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
                retObj.ratioX = currNode.scrollWidth / realWidth;
                retObj.ratioY = currNode.scrollHeight / realHeight;
			 }
             return retObj;
          }
          nextNode = currNode.parentNode;
        }
        catch(err) {return retObj;}
     } while (nextNode && currNode != docEl);
	 
	 // if we're in a frame, check embedding frame/window
     if (retObj.isFrame) return aioFindNodeToScroll(clientFrame.frameElement.ownerDocument.documentElement);
  }
  else { // XML document; do our best
    retObj.nodeToScroll = initialNode;
    retObj.docWidth = clientFrame.innerWidth + clientFrame.scrollMaxX;
    retObj.docHeight = clientFrame.innerHeight + clientFrame.scrollMaxY;
    realWidth = clientFrame.innerWidth;
    realHeight = clientFrame.innerHeight;
    retObj.realHeight = realHeight;
    realWidth *= zoom; realHeight *= zoom;
    if (realWidth > twiceScrollBarSize) realWidth -= twiceScrollBarSize;
    if (realHeight > twiceScrollBarSize) realHeight -= twiceScrollBarSize;
    retObj.ratioX = retObj.docWidth / realWidth;
    retObj.ratioY = retObj.docHeight / realHeight;
    retObj.scrollType = 3 - (((clientFrame.scrollMaxY > 0) - 0) << 1) - ((clientFrame.scrollMaxX > 0) - 0);

    retObj.isXML = true;
  }
  return retObj;
}
/* Display autoscroll marker */
function aioAddMarker(e) {
  aioScroll = aioFindNodeToScroll(e.target);
  if (aioScroll.scrollType == 3) { // nothing to scroll
     aioScrollFingerFree = true; // exit on next mouse up
     return 2;
  }

  if (aioSpecialCursor && !aioNoScrollMarker && !aioScroll.XMLPrettyPrint) {
    // overlay
    var el = aioScroll.targetDoc.createElementNS(mgsuite.const.xhtmlNS, "aioOverlay");
    el.style.position = "fixed";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.width = aioScroll.docWidth + "px";
    el.style.height = aioScroll.docHeight + "px";
    el.style.zIndex = 10001;
    el.style.background = "transparent";
    el.style.cursor = aioCursors[aioScroll.scrollType];
    aioScroll.insertionNode.appendChild(el);
    aioOverlay = el;
  } else {
	aioOverlay = null;
  }
  
  // marker
  var insertionNode;
  
  if (!aioNoScrollMarker) {
	switch (aioWindowType) {
		case 'browser':
		  insertionNode = document.getElementById("content"); // tabbrowser
		  break;
		
		case 'messenger':
		  insertionNode = document.getElementById("messagepanebox");
		  break;
		
		case 'mailcompose':
		case 'source':
		  insertionNode = document.getElementById("appcontent");
		  break;
	}
	
	aioMarkerX = e.screenX - window.mozInnerScreenX - aioHalfMarker;
	aioMarkerY = e.screenY - window.mozInnerScreenY - aioHalfMarker;
	
	var canvas = document.createElementNS(mgsuite.const.xhtmlNS, "canvas");
	canvas.id = aioMarkerIds[aioScroll.scrollType];
	canvas.style.position = "fixed";
	canvas.width = window.outerWidth;
	canvas.height = window.outerHeight;
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.pointerEvents = "none";
	canvas.style.zIndex = 10000;
  
	insertionNode.appendChild(canvas);
  
	var ctx = canvas.getContext('2d');
	var img = new Image();
	img.onload = function() {
	  ctx.drawImage(img, aioMarkerX, aioMarkerY);
	}
	img.src = aioMarkers[aioScroll.scrollType];
	
	aioMarker = canvas;
	aioMarker.moveBy = function(shiftX, shiftY) {
	  ctx.clearRect(aioMarkerX, aioMarkerY, aioMarkerSize, aioMarkerSize)
	  aioMarkerX += shiftX;
	  aioMarkerY += shiftY;
	  ctx.drawImage(img, aioMarkerX, aioMarkerY);
	};
	
  } else {
	aioMarker = null;
  }

  return (aioScroll.isXML || aioScroll.isBody) - 0;
}

function aioRemoveMarker() {
  if (aioMarker) {
    try {
      aioMarker.parentNode.removeChild(aioMarker);
	}
	catch(err) {}
    aioMarker = null;
  }
  if (aioOverlay) {
    try {
      aioOverlay.parentNode.removeChild(aioOverlay);
	}
	catch(err) {}
    aioOverlay = null;
  }
}

function aioWheelScroll(e) {
  if (typeof(sw_EnableThisExtension) == "boolean") return; // if smoothWheel is present, use it
  var scrollObj = aioFindNodeToScroll(e.target);
  if (scrollObj.scrollType == 3 || scrollObj.isXML || (scrollObj.isBody && !(scrollObj.isFrame &&
      scrollObj.clientFrame.frameElement.nodeName.toLowerCase() == "iframe") && scrollObj.scrollType != 2)) return; // Moz scrolling
  aioNukeEvent(e);
  var inc = (e.detail > 0) ? aioSmoothInc : -aioSmoothInc;
  if (aioSmoothScroll)
     if (aioSmooth) { //we're currently scrolling
        var directionChanged = (aioSmooth.smoothScrollBy < 0) != (inc < 0)
        if (directionChanged || aioSmooth.node != scrollObj.nodeToScroll) {
           aioSmooth.totalToScroll = directionChanged ? -inc : 0;
           aioSmooth.scrolledSoFar = 0;
           aioSmooth.node = scrollObj.nodeToScroll; aioSmooth.scrollHz = scrollObj.scrollType == 2;
        }
        aioSmooth.totalToScroll += inc;
        aioSmooth.smoothScrollBy = Math.ceil((aioSmooth.totalToScroll - aioSmooth.scrolledSoFar) / 10);    
     }
     else {
        aioSmooth = {node: scrollObj.nodeToScroll, totalToScroll: inc, smoothScrollBy: inc / 10,
                     scrolledSoFar: 0, scrollHz: scrollObj.scrollType == 2};
        aioSmoothInterval = setInterval(function(){aioSmoothLoop();}, aioSmoothPeriod);
     }
  else
     if (scrollObj.scrollType != 2) scrollObj.nodeToScroll.scrollTop += inc;
     else scrollObj.nodeToScroll.scrollLeft += inc;
}

function aioSmoothLoop() {
  if (aioSmooth.scrollHz) aioSmooth.node.scrollLeft += aioSmooth.smoothScrollBy;
  else aioSmooth.node.scrollTop += aioSmooth.smoothScrollBy;
  aioSmooth.scrolledSoFar += aioSmooth.smoothScrollBy;
  if ((aioSmooth.scrolledSoFar >= aioSmooth.totalToScroll && aioSmooth.smoothScrollBy >= 0) ||
      (aioSmooth.scrolledSoFar <= aioSmooth.totalToScroll && aioSmooth.smoothScrollBy <= 0)) {
     if (aioSmoothInterval) window.clearInterval(aioSmoothInterval);
     aioSmooth = null;
  }
}

function aioGrabMaybe(e) {
  if (Math.abs(e.screenX - aioLastX) < 3 && Math.abs(e.screenY - aioLastY) < 3) return;
  aioRendering.removeEventListener("mouseup", aioStartAS, true);
  aioGrabNDrag(aioGrabTarget);
  aioGrabNDragMove(e);
}

function aioStartAS(e) {
   aioRendering.removeEventListener("mouseup", aioStartAS, true);
   aioAutoScrollStart(e);
   aioScrollFingerFree = true;
   if (aioScroll.scrollType == 3) aioAutoScrollUp(e);
} 

function aioGrabNDrag(target) {
  aioScrollMode = 2;
  window.addEventListener("mouseup", aioGrabNDragMouseUp, true);
  aioScroll = aioFindNodeToScroll(target);
  if (aioScroll.scrollType == 3) return; // nothing to scroll
  if (!aioScroll.isXML && aioScroll.nodeToScroll.nodeName.toLowerCase() != "select") {
     aioScroll.cursorChangeable = true;
     aioScroll.nodeToScroll.style.cursor = "url(chrome://allinonegest/content/allscroll.png), move";
  }
  if (aioScrollAlaAcrobat) {aioScroll.ratioX = -1; aioScroll.ratioY = -1; }
}

function aioGrabNDragMove(e) {
  if (aioScroll.scrollType == 3) return;
  aioScrollCount = 0;
  aioDistX[0] = aioNoHorizScroll ? 0 : Math.ceil((e.screenX - aioLastX) * aioScroll.ratioX);
  aioDistY[0] = Math.ceil((e.screenY - aioLastY) * aioScroll.ratioY);
  aioLastX = e.screenX; aioLastY = e.screenY;
  if (aioScroll.isXML || aioScroll.isBody) aioScrollWindow();
  else aioScrollElem();
}

function aioGrabNDragMouseUp(e) {
  aioNukeEvent(e);
  aioDownButton = mgsuite.const.NoB;
  window.removeEventListener("mouseup", aioGrabNDragMouseUp, true);
  window.removeEventListener("mousemove", aioScrollMove, true);
  window.addEventListener("mouseup", aioMouseUp, true);
  aioRendering.addEventListener("mousedown", aioMouseDown, true);
  if (aioScroll.cursorChangeable)
     aioScroll.nodeToScroll.style.cursor = "auto";
  setTimeout(function(){aioScrollEnd();}, 200);
}

// Disable clickheat.js events, because they cause delays in gestures
// See http://www.labsmedia.com/clickheat/index.html
function aioDisableClickHeatEvents(e) {
  var targetWin = e.target.ownerDocument.defaultView.wrappedJSObject;
  
  if (typeof targetWin.catchClickHeat == "function") {
	_aioRemoveEventsForFunction(targetWin.document, targetWin.catchClickHeat);
	
	var f=targetWin.document.getElementsByTagName("iframe");
	for (var i=0; i<f.length; i++) {
	  _aioRemoveEventsForFunction(f[i], targetWin.catchClickHeat);
	}
	
	aioBlockActionStatusMsg += "<" + aioGetStr("g.ClickHeatDisabled") + ">";
	aioStatusMessage(aioBlockActionStatusMsg, 1000);
  }
}

// remove all event listeners for function on given target
function _aioRemoveEventsForFunction(target, func) {
  var els = Components.classes["@mozilla.org/eventlistenerservice;1"]
            .getService(Components.interfaces.nsIEventListenerService);
  
  var handlers = els.getListenerInfoFor(target);
  var handler;
  
  for (var i in handlers) {
	handler = handlers[i];
	
	if (handler.type && (typeof handler.listenerObject) == "function"
		&& handler.listenerObject.name == func.name) {
	  target.removeEventListener(handler.type, handler.listenerObject, handler.capturing);
	}
  }
}

//function aioDebugObj(o) {
//  var s="";
//  for (var key in o) {
//	s += key + "=" + o[key] + "; ";
//  }
//  return s;
//}

window.addEventListener("load",
  function() {
     if (aioInitStarted) return;
     aioStartUp();},
  false);

// With each window focusing we save current and previous window in global variable
// because we will need previous window for double-stack windows option
// (we can't use z-order of windows because it's broken on Linux)
window.addEventListener("activate", function() {
  var curwin = Application.storage.get("aioCurWindow", null);
  
  if (curwin == window) {
	return;
  }
  
  if (curwin) {
	Application.storage.set("aioLastWindow", curwin);
  }
  
  Application.storage.set("aioCurWindow", window);
});
