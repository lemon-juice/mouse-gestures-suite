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


mgsuite.overlay = {
  
  // variables for mouse gestures
  aioContent: null,
  aioRendering: null,
  aioTabRendering: null,
  aioMainWin: null,
  aioStatusBar: null,
  aioLastStatusMsg: "",
  aioBlockActionStatusMsg: null,
  aioIsWin: null,
  aioIsMac: null,
  aioIsNix: null,
  aioFirstInit: true,
  aioGrid: 15, // minimal gesture has to be 'grid' pixels long
  aioDelay: 1000, // delay before aborting gesture
  aioDelayTO: null,
  aioGestInProgress: false,
  aioOldX: null,
  aioOldY: null, // old coords from previous gesture stroke
  aioGestStr: null,
  aioUnknownStr: null,
  aioCurrGest: null,
  aioRockerString: null,
  aioGesturesEnabled: null,
  aioStrokes: [],
  aioLocaleGest: [],
  aioShortGest: [],
  aioLastEvtTime: null, // time of last gesture stroke
  aioOnImage: null, // contains an image DOM node
  aioSrcEvent: null, // event which started the active gesture
  aioIsRocker: false,
  aioBundle: null, // String bundle for localized strings
  aioShowContextMenu: null,
  aioGestEnabled: null,
  aioRockEnabled: null,  // prefs ....
  aioTrailEnabled: null,
  aioTrailColor: null,
  aioTrailSize: null,
  aioSmoothTrail: null,
  aioWheelEnabled: null,
  aioScrollEnabled: null,
  aioNoScrollMarker: null,
  aioStartOnLinks: null,
  aioWhatAS: null,
  aioASEnabled: null,
  aioTabSwitching: null,
  aioSmoothScroll: null,
  aioRockMode: null,
  aioWheelMode: null,
  aioHistIfDown: null,
  aioSpecialCursor: null,
  aioLeftDefault: null,
  aioPreferPaste: null,
  aioNoAltWithGest: null,
  aioSingleNewWindow: null,
  aioOpenLinkInNew: null,
  aioPanToAS: null,
  aioReverseScroll: null,
  aioShowTitletip: null,
  aioTTHover: null,
  aioShiftForTitle: null,
  aioTitleDelay: null,
  aioTitleDuration: null,
  aioScrollAlaAcrobat: null,
  aioNextsString: null,
  aioPrevsString: null,
  aioGestButton: null,
  aioActionString: null,
  aioFuncString: null,
  aioWheelRocker: null,
  aioGoUpInNewTab: null,
  aioNoHorizScroll: null,
  aioRockerAction: [],
  aioRockMultiple: [],
  aioTrustAutoSelect: null,
  aioDisableClickHeat: null,
  aioCrispResize: null,
  aioFxV18: null,
  aioWindowType: null,
  aioIsFx: false,
  aioDefNextSearch: null,
  aioDefPrevSearch: null,
  aioTabFocusHistory: [],
  aioGestureTab: null,  // contains reference to tab if gesture was performed on a tab
  aioSiteList: [],  // list of sites for enabling/disabling gestures
  aioSitePref: null,  // D for disabled gestures, P for gestures priority
  aioPrevParsedURL: null,

  // global variables for rocker gesture
  aioDownButton: null,
  aioBackRocking: null,
  aioRockTimer: null,
  aioRepet: [],
  aioWheelBothWays: null,

  // global variables for wheel navigation
  aioTabPU: null,
  aioHistPU: null,
  aioTTPU: null,
  aioTabCount: null,
  aioTabSrc: null,
  aioTabDest: -1,
  aioCCW: null,
  aioTTTimer: null,
  aioTTShown: false,
  aioTTNode: null,

  aioScrollCount: null,
  aioScrollRate: null,
  aioScrollMax: null,
  aioASPeriod: null,
  aioSofar: null,
  aioLastX: null,
  aioLastY: null,
  aioDistX: [0, 0, 0, 0],
  aioDistY: [0, 0, 0, 0],
  aioScrollFingerFree: null,
  aioAcceptASKeys: false,
  aioIntervalID: null,
  aioScroll: null,
  aioOverlay: null,
  aioMarker: null,
  aioMarkerX: null,
  aioMarkerY: null,
  aioInitStarted: false,
  aioSmoothInc: null,
  aioSmooth: null,
  aioSmoothInterval: null,
  aioGrabTarget: null,
  aioScrollMode: null,
  aioBeingUninstalled: false,
  aioPrefObserverTimeout: null,
  aioPrefObserverDisabled: false,

  aioPrefRoot: null,
  aioPref: null,
  aioPbi: null,

  // used to prevent infinite loop when mgsuite.overlay.aioStdPrefListener called itself on changing pref
  aioIgnoreStdPrefListener: false,

  

  aioStartUp: function() {
    // rocker gesture buttons
    mgsuite.const.aioOpp = [mgsuite.const.RMB, mgsuite.const.NoB, mgsuite.const.LMB, mgsuite.const.NoB];

    // wheel navigation imgs
    mgsuite.const.aioBackURL = mgsuite.const.CHROME_DIR + "back.png";
    mgsuite.const.aioNextURL = mgsuite.const.CHROME_DIR + "next.png";
    
    // variables for autoscroll
    mgsuite.const.aioMarkerSize = 28;
    mgsuite.const.aioHalfMarker = mgsuite.const.aioMarkerSize / 2;
    mgsuite.const.aioMarkers = [mgsuite.const.CHROME_DIR + "autoscroll_all.png", mgsuite.const.CHROME_DIR + "autoscroll_v.png", mgsuite.const.CHROME_DIR + "autoscroll_h.png"];
    mgsuite.const.aioMarkerIds = ["aioscrollerNSEW", "aioscrollerNS", "aioscrollerEW"];
    mgsuite.const.aioDist =  [0, 20, 40, 60, 80, 100, 130, 180, 300, 5000];
    mgsuite.const.aioRatio = [.0, .067, .083, .108, .145, .2, .3, .45, .65, .9];
    mgsuite.const.aioScrollLoop = [1, 2, 4];
    mgsuite.const.aioCursors = ["move", "n-resize", "e-resize"];
    mgsuite.const.aioASBasicPeriod = 40;
    mgsuite.const.aioSmoothPeriod = 20;

    

    var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService);
    mgsuite.overlay.aioPrefRoot = aioPrefService.getBranch(null); // prefs: root node
    mgsuite.overlay.aioPref = aioPrefService.getBranch("allinonegest."); // prefs: AiO node
    mgsuite.overlay.aioPbi = mgsuite.overlay.aioPrefRoot.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
    mgsuite.overlay.aioPbi.addObserver(mgsuite.overlay.aioStdPrefListener.domain1, mgsuite.overlay.aioStdPrefListener, false); //set Pref observer on "general"
    mgsuite.overlay.aioPbi.addObserver(mgsuite.overlay.aioStdPrefListener.domain2, mgsuite.overlay.aioStdPrefListener, false); // and mousewheel
    mgsuite.overlay.aioPbi.addObserver(mgsuite.overlay.aioStdPrefListener.domain3, mgsuite.overlay.aioStdPrefListener, false); // and middlemouse

    try {
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.addAddonListener(mgsuite.overlay.aioUninstallListener);
    }
    catch (err) {}

    var isActive, prefNotExisting;
    try {
      isActive = mgsuite.overlay.aioPref.getBoolPref("isActive");
      prefNotExisting = false;
    }
    catch(err) {
      isActive = false;
    prefNotExisting = true;
    }

    try {
      if (!isActive) {
         mgsuite.overlay.aioPref.setBoolPref("isActive", true);
         if (prefNotExisting) mgsuite.overlay.aioPref.setBoolPref("savedAutoscroll", true); // active or not? Suppose active & autoScroll was true
       else mgsuite.overlay.aioPref.setBoolPref("savedAutoscroll", mgsuite.overlay.aioPrefRoot.getBoolPref("general.autoScroll")); // not active case
    }
    }
    catch (err) {}

    // Now that isActive and savedAutoScroll have been set, we can add the observer on AioG prefs
    mgsuite.overlay.aioPbi.addObserver(mgsuite.overlay.aioPrefListener.domain, mgsuite.overlay.aioPrefListener, false); //set Pref observer on "allinonegest"

    mgsuite.overlay.aioInit();
  },
  
  // Preferences observers
  aioPrefListener: {
    domain: "allinonegest.",
    observe: function(subject, topic, prefName) { // when AiO pref was changed, reinit
      if (topic != "nsPref:changed" || mgsuite.overlay.aioPrefObserverDisabled) return;

      // run mgsuite.overlay.aioInit() delayed and only once if the observer is fired multiple times
      // in a short period
      if (mgsuite.overlay.aioPrefObserverTimeout) {
        clearTimeout(mgsuite.overlay.aioPrefObserverTimeout);
      }

      mgsuite.overlay.aioPrefObserverTimeout = setTimeout(function() {
        //dump("Observer runs mgsuite.overlay.aioInit()\n");
        mgsuite.overlay.aioInit();
      }, 300);
    }
  },
  
  aioStdPrefListener: {
    domain1: "general.",
    domain2: "mousewheel.withnokey.",
    domain3: "middlemouse.",
    observe: function(subject, topic, prefName) {
      if (topic != "nsPref:changed") return;
      mgsuite.overlay.aioStdPrefChanged();
    }
  },
  
  aioShutdownListener: {
    observe: function(subject, topic, data) {
      if (topic != "quit-application") return;
      if (mgsuite.overlay.aioBeingUninstalled) mgsuite.overlay.aioUninstallCleanUp();
    }
  },
  
  aioUninstallListener: {
    onUninstalling: function(addon) {
      if (addon.id == mgsuite.const.GUID) {
        mgsuite.overlay.aioBeingUninstalled = true;
      }
    },
    onOperationCancelled: function(addon) {
      if (addon.id == mgsuite.const.GUID) {
        mgsuite.overlay.aioBeingUninstalled = false;
      }
    }
  },

  aioWindowUnload: function() {

    function freeObservers() {
      // Don't leak the observers when a window closes
      try {
        mgsuite.overlay.aioPbi.removeObserver(mgsuite.overlay.aioPrefListener.domain, mgsuite.overlay.aioPrefListener);
        mgsuite.overlay.aioPbi.removeObserver(mgsuite.overlay.aioStdPrefListener.domain1, mgsuite.overlay.aioStdPrefListener);
        mgsuite.overlay.aioPbi.removeObserver(mgsuite.overlay.aioStdPrefListener.domain2, mgsuite.overlay.aioStdPrefListener);
        mgsuite.overlay.aioPbi.removeObserver(mgsuite.overlay.aioStdPrefListener.domain3, mgsuite.overlay.aioStdPrefListener);

        Components.utils.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.removeAddonListener(mgsuite.overlay.aioUninstallListener);
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
      return getNumberOfOpenWindows("navigator:browser") == 0;
    }

    function installQuitObserver() {
      try {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                              .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(mgsuite.overlay.aioShutdownListener, "quit-application", false);
      }
    catch (err) {}
    }

    freeObservers();
    if (isLastBrowserWindow()) installQuitObserver();
  },

  aioUninstallCleanUp: function() {
    // AiOG is being uninstalled. Set isActive to false and restore std prefs that were overriden.
    // Since pref observers were freed on unload, mgsuite.overlay.aioInit & aioStdPrefChanged will not be called.

    mgsuite.overlay.aioPref.setBoolPref("isActive", false);
    mgsuite.overlay.aioPrefRoot.setBoolPref("general.autoScroll", mgsuite.overlay.aioPref.getBoolPref("savedAutoscroll"));
  },

  aioStdPrefChanged: function(force) {
    if (mgsuite.overlay.aioIgnoreStdPrefListener) {
      return;
    }
    mgsuite.overlay.aioIgnoreStdPrefListener = true; // prevent infinite loop

    try {
      if (mgsuite.overlay.aioPrefRoot.getBoolPref("general.autoScroll") != (mgsuite.overlay.aioASEnabled && mgsuite.overlay.aioWhatAS == 1)) {
          mgsuite.overlay.aioPrefRoot.setBoolPref("general.autoScroll", mgsuite.overlay.aioASEnabled && mgsuite.overlay.aioWhatAS == 1);
        }
    }
    catch(err) {}
    try {
      mgsuite.overlay.aioSmoothScroll = mgsuite.overlay.aioPrefRoot.getBoolPref("general.smoothScroll");
    }
    catch(err) {mgsuite.overlay.aioSmoothScroll = false;}
    try {
      mgsuite.overlay.aioPreferPaste = mgsuite.overlay.aioPrefRoot.getBoolPref("middlemouse.paste");
    }
    catch(err) {mgsuite.overlay.aioPreferPaste = false;}
    try {
      if (!mgsuite.overlay.aioPrefRoot.getBoolPref("mousewheel.withnokey.sysnumlines"))
          mgsuite.overlay.aioSmoothInc = mgsuite.overlay.aioPrefRoot.getIntPref("mousewheel.withnokey.numlines") * 19;
      else mgsuite.overlay.aioSmoothInc = 60;
    }
    catch(err) {mgsuite.overlay.aioSmoothInc = 60;}

    mgsuite.overlay.aioIgnoreStdPrefListener = false;
  },

  aioCreateStringBundle: function(propFile) {
    try {
      var strBundleService =  Components.classes["@mozilla.org/intl/stringbundle;1"].getService(). 
                                QueryInterface(Components.interfaces.nsIStringBundleService);
      return strBundleService.createBundle(propFile);
    }
    catch(err) {return null;}
  },

  aioGetStr: function(str) {
    if (mgsuite.overlay.aioBundle) {
      try {
        return mgsuite.overlay.aioBundle.GetStringFromName(str);
      } catch (err) {
        return "?";
      }
    }
    return "";
  },

  aioGetLocalizedStrings: function() {
    mgsuite.overlay.aioBundle = mgsuite.overlay.aioCreateStringBundle(mgsuite.const.LOCALE_PROPERTIES);
    mgsuite.overlay.aioShortGest["R"] = mgsuite.overlay.aioGetStr("abbreviation.right");
    mgsuite.overlay.aioShortGest["L"] = mgsuite.overlay.aioGetStr("abbreviation.left");
    mgsuite.overlay.aioShortGest["U"] = mgsuite.overlay.aioGetStr("abbreviation.up");
    mgsuite.overlay.aioShortGest["D"] = mgsuite.overlay.aioGetStr("abbreviation.down");
    mgsuite.overlay.aioGestStr = mgsuite.overlay.aioGetStr("g.gesture");
    mgsuite.overlay.aioUnknownStr = mgsuite.overlay.aioGetStr("g.unknown");
    mgsuite.overlay.aioDefNextSearch = mgsuite.overlay.aioGetStr("g.nextTerm");
    mgsuite.overlay.aioDefPrevSearch = mgsuite.overlay.aioGetStr("g.prevTerm");
  },

  aioInit: function() { // overlay has finished loading or a pref was changed
    //dump("mgsuite.overlay.aioInit\n");
    var titleDelay, titleDuration;
    const delayTable = [250, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000];
    const durationTable = [2000, 3000, 4000, 5000, 6000, 7000, 8000];

    if (!mgsuite.overlay.aioInitStarted) {
       mgsuite.overlay.aioInitStarted = true;
       mgsuite.overlay.aioGetLocalizedStrings();
    }

    var XULAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                  .getService(Components.interfaces.nsIXULAppInfo);

    if (XULAppInfo.ID != '{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}') {  // SM id
    mgsuite.overlay.aioIsFx = true;  // if false, then SM
    }

    // detect window type
    switch (String(document.location)) {
      case "chrome://navigator/content/navigator.xul":
      case "chrome://browser/content/browser.xul":
       mgsuite.overlay.aioWindowType = "browser";
        break;

      case "chrome://global/content/viewSource.xul":
      case "chrome://global/content/viewPartialSource.xul":
        mgsuite.overlay.aioWindowType = "source";
        break;

      case "chrome://messenger/content/messenger.xul":
      case "chrome://messenger/content/messageWindow.xul":
        mgsuite.overlay.aioWindowType = "messenger";
        break;

      case "chrome://messenger/content/messengercompose/messengercompose.xul":
        mgsuite.overlay.aioWindowType = "mailcompose";
        break;

      default:
        mgsuite.overlay.aioWindowType = null;
    }


    // read prefs or set Defaults
    var prefFuncs = [ // get pref value, set default value, check value range
     [function(){mgsuite.overlay.aioActionString=mgsuite.overlay.aioPref.getCharPref("gestureString");}, function(){mgsuite.overlay.aioPref.setCharPref("gestureString",mgsuite.default.gestureString);}, function(){return !mgsuite.overlay.aioActionString;}],
     [function(){mgsuite.overlay.aioFuncString=mgsuite.overlay.aioPref.getCharPref("functionString");}, function(){mgsuite.overlay.aioPref.setCharPref("functionString",mgsuite.default.functionString);}, function(){return !mgsuite.overlay.aioFuncString;}],
       [function(){mgsuite.overlay.aioRockerString=mgsuite.overlay.aioPref.getCharPref("rockerString");}, function(){mgsuite.overlay.aioPref.setCharPref("rockerString",mgsuite.default.rockerString);}, function(){return !mgsuite.overlay.aioRockerString;}],
     [function(){mgsuite.overlay.aioGestButton=mgsuite.overlay.aioPref.getIntPref("mousebuttonpref");}, function(){mgsuite.overlay.aioPref.setIntPref("mousebuttonpref",mgsuite.const.RMB);}, function(){return mgsuite.overlay.aioGestButton<0||mgsuite.overlay.aioGestButton>2;}],
     [function(){mgsuite.overlay.aioGestEnabled=mgsuite.overlay.aioPref.getBoolPref("mouse");}, function(){mgsuite.overlay.aioPref.setBoolPref("mouse",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioTrailEnabled=mgsuite.overlay.aioPref.getBoolPref("gestureTrails");}, function(){mgsuite.overlay.aioPref.setBoolPref("gestureTrails",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioTrailColor=mgsuite.overlay.aioPref.getCharPref("trailColor");}, function(){mgsuite.overlay.aioPref.setCharPref("trailColor","#009900");}, function(){return false;}],
     [function(){mgsuite.overlay.aioTrailSize=mgsuite.overlay.aioPref.getIntPref("trailSize");}, function(){mgsuite.overlay.aioPref.setIntPref("trailSize",3);}, function(){return mgsuite.overlay.aioTrailSize<1||mgsuite.overlay.aioTrailSize>12;}],
     [function(){mgsuite.overlay.aioSmoothTrail=mgsuite.overlay.aioPref.getBoolPref("smoothTrail");}, function(){mgsuite.overlay.aioPref.setBoolPref("smoothTrail",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioRockEnabled=mgsuite.overlay.aioPref.getBoolPref("rocking");}, function(){mgsuite.overlay.aioPref.setBoolPref("rocking",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioWheelEnabled=mgsuite.overlay.aioPref.getBoolPref("wheelscrolling");}, function(){mgsuite.overlay.aioPref.setBoolPref("wheelscrolling",true);}, function(){return false;}], // Scroll wheel navigation
     [function(){mgsuite.overlay.aioASEnabled=mgsuite.overlay.aioPref.getBoolPref("autoscrolling2");}, function(){mgsuite.overlay.aioPref.setBoolPref("autoscrolling2",true);}, function(){return false;}], // Middle button scrolling
     [function(){mgsuite.overlay.aioTabSwitching=mgsuite.overlay.aioPref.getBoolPref("tabBar");}, function(){mgsuite.overlay.aioPref.setBoolPref("tabBar",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioWhatAS=mgsuite.overlay.aioPref.getIntPref("autoscrollpref");}, function(){mgsuite.overlay.aioPref.setIntPref("autoscrollpref",1);}, function(){return mgsuite.overlay.aioWhatAS<0||mgsuite.overlay.aioWhatAS>3;}],
     [function(){mgsuite.overlay.aioScrollRate=mgsuite.overlay.aioPref.getIntPref("autoscrollRate");}, function(){mgsuite.overlay.aioPref.setIntPref("autoscrollRate",1);}, function(){return mgsuite.overlay.aioScrollRate<0||mgsuite.overlay.aioScrollRate>2;}],
     [function(){mgsuite.overlay.aioNoScrollMarker=mgsuite.overlay.aioPref.getBoolPref("autoscrollNoMarker");}, function(){mgsuite.overlay.aioPref.setBoolPref("autoscrollNoMarker",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioWheelMode=mgsuite.overlay.aioPref.getIntPref("wheelpref2");}, function(){mgsuite.overlay.aioPref.setIntPref("wheelpref2",0);}, function(){return mgsuite.overlay.aioWheelMode<0||mgsuite.overlay.aioWheelMode>3;}],
     [function(){mgsuite.overlay.aioHistIfDown=mgsuite.overlay.aioPref.getBoolPref("wheelHistoryIfCw");}, function(){mgsuite.overlay.aioPref.setBoolPref("wheelHistoryIfCw",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioRockMode=mgsuite.overlay.aioPref.getIntPref("rockertypepref");}, function(){mgsuite.overlay.aioPref.setIntPref("rockertypepref",1);}, function(){return mgsuite.overlay.aioRockMode<0||mgsuite.overlay.aioRockMode>1;}],
     [function(){mgsuite.overlay.aioSpecialCursor=mgsuite.overlay.aioPref.getBoolPref("autoscrollCursor");}, function(){mgsuite.overlay.aioPref.setBoolPref("autoscrollCursor",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioNoAltWithGest=mgsuite.overlay.aioPref.getBoolPref("noAltGest");}, function(){mgsuite.overlay.aioPref.setBoolPref("noAltGest",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioLeftDefault=mgsuite.overlay.aioPref.getBoolPref("leftDefault");}, function(){mgsuite.overlay.aioPref.setBoolPref("leftDefault",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioSingleNewWindow=mgsuite.overlay.aioPref.getBoolPref("singleWindow");}, function(){mgsuite.overlay.aioPref.setBoolPref("singleWindow",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioOpenLinkInNew=mgsuite.overlay.aioPref.getBoolPref("openLinkInNew");}, function(){mgsuite.overlay.aioPref.setBoolPref("openLinkInNew",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioGoUpInNewTab=mgsuite.overlay.aioPref.getBoolPref("goUpInNewTab");}, function(){mgsuite.overlay.aioPref.setBoolPref("goUpInNewTab",false);}, function(){return false;}],
      [function(){mgsuite.overlay.aioReverseScroll=mgsuite.overlay.aioPref.getBoolPref("reverseScrolling");}, function(){mgsuite.overlay.aioPref.setBoolPref("reverseScrolling",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioStartOnLinks=mgsuite.overlay.aioPref.getBoolPref("evenOnLink");}, function(){mgsuite.overlay.aioPref.setBoolPref("evenOnLink",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioShowTitletip=mgsuite.overlay.aioPref.getBoolPref("showLinkTooltip");}, function(){mgsuite.overlay.aioPref.setBoolPref("showLinkTooltip",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioTTHover=mgsuite.overlay.aioPref.getBoolPref("TTHover");}, function(){mgsuite.overlay.aioPref.setBoolPref("TTHover",true);}, function(){return false;}],
     [function(){mgsuite.overlay.aioShiftForTitle=mgsuite.overlay.aioPref.getBoolPref("shiftForTitle");}, function(){mgsuite.overlay.aioPref.setBoolPref("shiftForTitle",true);}, function(){return false;}],
     [function(){titleDelay=mgsuite.overlay.aioPref.getIntPref("titleDelay");}, function(){mgsuite.overlay.aioPref.setIntPref("titleDelay",2);}, function(){return titleDelay<0||titleDelay>9;}],
     [function(){titleDuration=mgsuite.overlay.aioPref.getIntPref("titleDuration");}, function(){mgsuite.overlay.aioPref.setIntPref("titleDuration",3);}, function(){return titleDuration<0||titleDuration>6;}],
     [function(){mgsuite.overlay.aioScrollAlaAcrobat=mgsuite.overlay.aioPref.getBoolPref("dragAlaAcrobat");}, function(){mgsuite.overlay.aioPref.setBoolPref("dragAlaAcrobat",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioNoHorizScroll=mgsuite.overlay.aioPref.getBoolPref("noHorizScroll");}, function(){mgsuite.overlay.aioPref.setBoolPref("noHorizScroll",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioTrustAutoSelect=mgsuite.overlay.aioPref.getBoolPref("trustAutoSelect");}, function(){mgsuite.overlay.aioPref.setBoolPref("trustAutoSelect",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioPanToAS=mgsuite.overlay.aioPref.getBoolPref("panning");}, function(){mgsuite.overlay.aioPref.setBoolPref("panning",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioDisableClickHeat=mgsuite.overlay.aioPref.getBoolPref("disableClickHeat");}, function(){mgsuite.overlay.aioPref.setBoolPref("disableClickHeat",false);}, function(){return false;}],
     [function(){mgsuite.overlay.aioCrispResize=mgsuite.overlay.aioPref.getBoolPref("crispResize");}, function(){mgsuite.overlay.aioPref.setBoolPref("crispResize",false);}, function(){return false;}]
    ];

    mgsuite.overlay.aioPrefObserverDisabled = true;

    mgsuite.overlay.aioSiteList = [];
    try {
    var prefList = mgsuite.overlay.aioPref.getComplexValue("sitesList", Components.interfaces.nsISupportsString);

    mgsuite.overlay.aioSiteList = JSON.parse(prefList);

    } catch (err) {
    var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
      str.data = "[]";
      mgsuite.overlay.aioPref.setComplexValue("sitesList", Components.interfaces.nsISupportsString, str);
    }

    for (var i = 0; i < prefFuncs.length; ++i) {
      try {prefFuncs[i][0]();}
      catch(err) {prefFuncs[i][1](); prefFuncs[i][0]()}
      if (prefFuncs[i][2]()) {prefFuncs[i][1](); prefFuncs[i][0]()}
    }


    try {
      mgsuite.overlay.aioNextsString = mgsuite.overlay.aioPref.getComplexValue("nextsString", Components.interfaces.nsISupportsString).data;
    }
    catch(err) {
      var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
      str.data = mgsuite.overlay.aioDefNextSearch;
      mgsuite.overlay.aioNextsString = mgsuite.overlay.aioDefNextSearch;
      mgsuite.overlay.aioPref.setComplexValue("nextsString", Components.interfaces.nsISupportsString, str);
    }

    try {
      mgsuite.overlay.aioPrevsString = mgsuite.overlay.aioPref.getComplexValue("prevsString", Components.interfaces.nsISupportsString).data;
    }
    catch(err) {
      str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
      str.data = mgsuite.overlay.aioDefPrevSearch;
      mgsuite.overlay.aioPrevsString = mgsuite.overlay.aioDefPrevSearch;
      mgsuite.overlay.aioPref.setComplexValue("prevsString", Components.interfaces.nsISupportsString, str);
    }
    if (mgsuite.overlay.aioNoAltWithGest) mgsuite.overlay.aioLeftDefault = false;
    mgsuite.overlay.aioWheelRocker = mgsuite.overlay.aioWheelMode == 0;

    mgsuite.overlay.aioPrefObserverDisabled = false;


    mgsuite.overlay.aioStdPrefChanged();
    mgsuite.overlay.aioGesturesEnabled = (mgsuite.overlay.aioGestEnabled || mgsuite.overlay.aioRockEnabled || mgsuite.overlay.aioWheelEnabled);
    mgsuite.overlay.aioShowContextMenu = true;

    mgsuite.overlay.aioScrollEnabled = mgsuite.overlay.aioASEnabled && mgsuite.overlay.aioWhatAS != 1;
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

    const unixRe = new RegExp("unix|linux|sun|freebsd", "i");

    if (mgsuite.overlay.aioFirstInit) {
	  mgsuite.overlay.aioIsWin = false; mgsuite.overlay.aioIsMac = false; mgsuite.overlay.aioIsNix = false;
	  if (platform.indexOf('win') != -1) mgsuite.overlay.aioIsWin = true;
	  else
		if (platform.indexOf('mac') != -1) mgsuite.overlay.aioIsMac = true;
		else mgsuite.overlay.aioIsNix = platform.search(unixRe) != -1;

      mgsuite.overlay.aioFxV18 = versionComparator.compare(geckoVersion, "18.0") >= 0;

	  window.messageManager.loadFrameScript(mgsuite.const.CHROME_DIR + "frame-script.js", true);
	  window.messageManager.addMessageListener("MouseGesturesSuite:CollectLinks", mgsuite.util.CollectLinksListener);
	  window.messageManager.addMessageListener("MouseGesturesSuite:returnWithCallback", mgsuite.util.returnWithCallback);
	  window.messageManager.addMessageListener("MouseGesturesSuite:displayGesturesList", mgsuite.util.returnWithCallback);
	  window.messageManager.addMessageListener("MouseGesturesSuite:test", mgsuite.util.testListener);
	  
	  switch (mgsuite.overlay.aioWindowType) {
		case 'browser':
		mgsuite.overlay.aioContent = document.getElementById("content");
		mgsuite.overlay.aioRendering = mgsuite.overlay.aioContent;
		mgsuite.overlay.aioTabRendering = document.getElementById("TabsToolbar"); // Fx
		mgsuite.overlay.aioStatusBar = document.getElementById("statusbar-display");
		if (!mgsuite.overlay.aioStatusBar) {
		  mgsuite.overlay.aioStatusBar = gBrowser.getStatusPanel();
		}
  
		mgsuite.overlay.aioContent.tabContainer.addEventListener("TabSelect", mgsuite.imp.aioTabFocus, true);
		var activeId = "t" + mgsuite.imp.aioUnique++;
		if (mgsuite.overlay.aioContent.mTabContainer) {
		  mgsuite.overlay.aioContent.mTabContainer.childNodes[0].setAttribute('aioTabId', activeId);
		  mgsuite.overlay.aioTabFocusHistory.push({focused: activeId});
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
			  mgsuite.overlay.aioParseSiteList();
		    }
		  },
		  onStateChange: function() {},
		  onProgressChange: function() {},
		  onStatusChange: function() {},
		  onSecurityChange: function() {},
		  onLinkIconAvailable: function() {}
		};
  
		gBrowser.addProgressListener(urlListener);
  
		gBrowser.tabContainer.addEventListener("TabSelect", mgsuite.overlay.aioParseSiteList, false);
  
		window.addEventListener("activate", function() {
		  // we need delay because mgsuite.overlay.aioInit() is run with delay after pref change
		  setTimeout(mgsuite.overlay.aioParseSiteList, 600);
		});
		break;
  
		case 'messenger':
		  mgsuite.overlay.aioContent = document.getElementById("messagepane");
		  mgsuite.overlay.aioRendering = document.getElementById("messagepane");
		  mgsuite.overlay.aioStatusBar = document.getElementById("statusText");
		break;
  
		case 'mailcompose':
		  mgsuite.overlay.aioContent = document.getElementById("appcontent");
		  mgsuite.overlay.aioRendering = document.getElementById("content-frame");
		  mgsuite.overlay.aioStatusBar = document.getElementById("statusText");
		break;
  
		case 'source':
		  mgsuite.overlay.aioContent = document.getElementById("appcontent");
		  mgsuite.overlay.aioRendering = document.getElementById("content");
		  mgsuite.overlay.aioStatusBar = document.getElementById("statusbar-line-col");
		break;
	  }


	  mgsuite.overlay.aioMainWin = document.getElementById("main-window");
  
	  mgsuite.overlay.aioRendering.addEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
	  if (mgsuite.overlay.aioTabRendering) {
		mgsuite.overlay.aioTabRendering.addEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
	  }
  
	  document.documentElement.addEventListener("popupshowing", mgsuite.overlay.aioContextMenuEnabler, true);
  
	  window.addEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
  
	  if (!mgsuite.overlay.aioIsWin) {
		window.addEventListener("mouseup", function(e) {
		  mgsuite.overlay.aioShowContextMenu = true;
		}, true);
	  }
  
	  window.addEventListener("draggesture", mgsuite.overlay.aioDragGesture, true);
	  window.addEventListener("unload", mgsuite.overlay.aioWindowUnload, false);
	  window.addEventListener("keypress", mgsuite.overlay.aioKeyPressed, true);
  
	  // init some autoscroll variables
	  mgsuite.overlay.aioSofar = [];
	  mgsuite.overlay.aioSofar[1] = 0;
	  for (var ii = 1; ii < mgsuite.const.aioDist.length - 1; ++ii) {
		 mgsuite.overlay.aioSofar[ii+1] = mgsuite.overlay.aioSofar[ii] + (mgsuite.const.aioDist[ii] - mgsuite.const.aioDist[ii-1]) * mgsuite.const.aioRatio[ii];
	  }
    }

    if (mgsuite.overlay.aioGesturesEnabled) {
    mgsuite.imp.aioInitGestTable();

    var rockerFuncs = mgsuite.overlay.aioRockerString.split("|");
    var rFunc;
    for (var i = 0; i < rockerFuncs.length; ++i)
      if (rockerFuncs[i].charAt(0) == "/") {
       mgsuite.overlay.aioRockerAction[i] = function(){void(0);};
       mgsuite.overlay.aioRockMultiple[i] = 0;
      }
      else {
      rFunc = rockerFuncs[i] - 0;
      if (rFunc < 0 || rFunc >= mgsuite.imp.aioActionTable.length) {rockerFuncs[i] = "0"; rFunc = 0;}
      mgsuite.overlay.aioRockerAction[i] = mgsuite.imp.aioActionTable[rFunc][0];
      mgsuite.overlay.aioRockMultiple[i] = mgsuite.imp.aioActionTable[rFunc][2];
      }
    mgsuite.overlay.aioWheelBothWays = rockerFuncs[2].charAt(0) != "/" && rockerFuncs[3].charAt(0) != "/" && 
       (rockerFuncs[2] == rockerFuncs[3] || rockerFuncs[2] == mgsuite.imp.aioActionTable[rockerFuncs[3] - 0][3]);
    }

    mgsuite.overlay.aioTitleDelay = delayTable[titleDelay];
    mgsuite.overlay.aioTitleDuration = durationTable[titleDuration];
    mgsuite.overlay.aioScrollMax = mgsuite.const.aioScrollLoop[mgsuite.overlay.aioScrollRate]; mgsuite.overlay.aioASPeriod = mgsuite.const.aioASBasicPeriod / mgsuite.overlay.aioScrollMax;

    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
	mgsuite.overlay.aioBackRocking = false;
	
    if (mgsuite.overlay.aioShowTitletip && mgsuite.overlay.aioTTHover) mgsuite.overlay.aioRendering.addEventListener("mousemove", mgsuite.tooltip.aioShowTitle, true);
    else mgsuite.overlay.aioRendering.removeEventListener("mousemove", mgsuite.tooltip.aioShowTitle, true);

    mgsuite.overlay.aioRendering.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelScroll, false);

    if (mgsuite.overlay.aioWindowType == "browser") {
      if (mgsuite.overlay.aioTabSwitching) {
        mgsuite.overlay.aioContent.mStrip.addEventListener("DOMMouseScroll", mgsuite.overlay.aioSwitchTabs, true);
        if (platform.indexOf('linux') != -1) // hack for linux-gtk2 + xft bug
           document.getElementById("navigator-toolbox").addEventListener("DOMMouseScroll", mgsuite.overlay.aioSwitchTabs, true); 
     }
     else {
        mgsuite.overlay.aioContent.mStrip.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioSwitchTabs, true);
        if (platform.indexOf('linux') != -1)
           document.getElementById("navigator-toolbox").removeEventListener("DOMMouseScroll", mgsuite.overlay.aioSwitchTabs, true);
      }

    mgsuite.overlay.aioPrevParsedURL = null;
    }

    mgsuite.overlay.aioFirstInit = false;
  },

  /* Parse site list preferences and determine if current page should be given
   * special treatment (prioritize gestures or disable gestures)
   */
  aioParseSiteList: function() {
    var url = gBrowser.selectedBrowser.currentURI.spec;

    if (url === mgsuite.overlay.aioPrevParsedURL) {
    return;
    }

    mgsuite.overlay.aioPrevParsedURL = url;

    if (url == "about:blank") {
    mgsuite.overlay.aioSitePref = null;
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

    mgsuite.overlay.aioSitePref = null;

    for (var i=0, len=mgsuite.overlay.aioSiteList.length; i<len; i++) {
    searchUrl = mgsuite.overlay.aioSiteList[i][0];
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
      mgsuite.overlay.aioSitePref = mgsuite.overlay.aioSiteList[i][1];
    }
    }
  },

  aioIsKeyOK: function(e) {
     return !(mgsuite.overlay.aioNoAltWithGest && e.altKey)
  },

  aioIsUnformattedXML: function(aDoc) {
    return /\/[\w+]*xml/.test(aDoc.contentType) && aDoc.styleSheets && aDoc.styleSheets.length && aDoc.styleSheets[0].href &&
           aDoc.styleSheets[0].href.substr(-31) == "/content/xml/XMLPrettyPrint.css";
  },

  aioContextMenuEnabler: function(e) {
    //dump("\ntarget: " + e.target.nodeName + "; id=" + e.target.id + "\n");
    //dump("ctx: " + e.originalTarget.nodeName + "; id=" + e.originalTarget.id + "\n");
    if (!mgsuite.overlay.aioShowContextMenu && (e.originalTarget.nodeName == "menupopup" || e.originalTarget.nodeName == "xul:menupopup")) {

    var id = e.originalTarget.id ? e.originalTarget.id : null;

    if (id == "contentAreaContextMenu"
      || (id == "mailContext" && e.explicitOriginalTarget.nodeName != "treechildren")
      || id == "viewSourceContextMenu"
      || id == "addonitem-popup"
      || (mgsuite.overlay.aioIsFx && id == "toolbar-context-menu") // Fx
      || id == "tabContextMenu" // Fx
      || e.originalTarget.getAttribute('anonid') == "tabContextMenu" // SM
      ) {
      e.preventDefault(); e.stopPropagation();
    }
    }
  },

  //debugAllAttr: function(elem) {
  //  var str = "", node;
  //  
  //  for (var i=0; i<elem.attributes.length; i++) {
  //    node = elem.attributes[i];
  //    str += node.nodeName + "=" + node.nodeValue + "; ";
  //  }
  //  return str;
  //},

  aioKeyPressed: function(e) {
    if (mgsuite.overlay.aioAcceptASKeys) mgsuite.overlay.aioAutoScrollKey(e);
    else mgsuite.overlay.aioShowContextMenu = !mgsuite.overlay.aioGestInProgress;
  },

  aioNukeEvent: function(e) {
    e.preventDefault(); e.stopPropagation();
  },

  aioGestMove: function(e) {
    var x_dir = e.screenX - mgsuite.overlay.aioOldX; var absX = Math.abs(x_dir);
    var y_dir = e.screenY - mgsuite.overlay.aioOldY; var absY = Math.abs(y_dir);
    var tempMove;

    //only add if movement enough to make a gesture
    if (absX < mgsuite.overlay.aioGrid && absY < mgsuite.overlay.aioGrid) return;
    mgsuite.overlay.aioLastEvtTime = new Date(); // e.timeStamp is broken on Linux

    if (mgsuite.overlay.aioDelayTO) {
    clearTimeout(mgsuite.overlay.aioDelayTO);
    }
    mgsuite.overlay.aioDelayTO = setTimeout(function() { mgsuite.trail.indicateGestureTimeout() }, mgsuite.overlay.aioDelay);

    mgsuite.trail.drawTrail(e);
    var pente = absY <= 5 ? 100 : absX / absY; // 5 should be grid/tangent(60)
    if (pente < 0.58 || pente > 1.73) { //between 30° & 60°, wait
      if (pente < 0.58) tempMove = y_dir > 0 ? "D" : "U";
       else tempMove = x_dir > 0 ? "R" : "L";
	   
      if (!mgsuite.overlay.aioStrokes.length || mgsuite.overlay.aioStrokes[mgsuite.overlay.aioStrokes.length-1] != tempMove) {
        mgsuite.overlay.aioStrokes.push(tempMove); mgsuite.overlay.aioLocaleGest.push(mgsuite.overlay.aioShortGest[tempMove]);

		var sequence = mgsuite.overlay.aioStrokes.join("");
			var index = mgsuite.imp.aioGestTable[sequence];
  
		if (index == null) {
		  index = mgsuite.imp.aioGestTable["+" + sequence.substr(-2)];
		  if (index == null)
			index = mgsuite.imp.aioGestTable["+" + sequence.substr(-3)];
		}
  
		if (index != null) {
		  mgsuite.overlay.aioCurrGest = mgsuite.imp.aioActionTable[index][1];
		} else {
		  mgsuite.overlay.aioCurrGest = mgsuite.overlay.aioUnknownStr;
		}
      }
      mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioGestStr + ": " + mgsuite.overlay.aioLocaleGest.join("") + " (" + mgsuite.overlay.aioCurrGest + ")", 0);
    }
    mgsuite.overlay.aioOldX = e.screenX; mgsuite.overlay.aioOldY = e.screenY;
  },

  aioGetHRef: function(node) {
    if (node.hasAttributeNS(mgsuite.const.xlinkNS, "href"))
      return makeURLAbsolute(node.baseURI, node.getAttributeNS(mgsuite.const.xlinkNS, "href"));
    return node.href;
  },

  aioFindLink: function(domNode, gesturing) { // Loop up the DOM looking for a link. Returns the node
    if (!domNode.ownerDocument) return null;
    var stopNode = domNode.ownerDocument.documentElement;
    var nextNode = domNode, currNode, nodeNameLC;
    try {
      do {
        currNode = nextNode;
        if (currNode.namespaceURI == mgsuite.const.xhtmlNS) nodeNameLC = currNode.localName;
        else nodeNameLC = currNode.nodeName.toLowerCase();

        if (nodeNameLC == "img" && !mgsuite.overlay.aioOnImage && gesturing) mgsuite.overlay.aioOnImage = currNode;
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
  },

  aioIsAreaOK: function(e, isAutoScroll) {
    if (isAutoScroll && e.target.ownerDocument == mgsuite.overlay.aioContent.ownerDocument) return false;      
    var tag = e.target.nodeName.toLowerCase();
    try { var xtag = e.originalTarget.localName.toLowerCase(); } catch (err) {}

    return xtag != "slider" && xtag != "thumb" && xtag != "scrollbarbutton" &&
     (((tag != "input" || mgsuite.overlay.aioGestButton == mgsuite.const.RMB) && (tag != "textarea" || mgsuite.overlay.aioGestButton == mgsuite.const.RMB)
     && tag != "option" && tag != "select" && tag != "textarea" && tag != "textbox" && tag != "menu") || isAutoScroll);
  },

  aioIsPastable: function(e) {
    var tag = e.target.nodeName.toLowerCase();
    return tag == "input" || tag == "textarea" || tag == "textbox";
  },

  aioKillGestInProgress: function(clearMode) {
    mgsuite.overlay.aioGestInProgress = false;
    if (!clearMode) {
      mgsuite.util.clearCollectedItems();
    }
    mgsuite.trail.eraseTrail();
    window.removeEventListener("mousemove", mgsuite.overlay.aioGestMove, true);
  },

  aioClearRocker: function() {
    mgsuite.overlay.aioRockTimer = null;
    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
  },

  aioPerformRockerFunction: function(index) {
    mgsuite.overlay.aioIsRocker = true;
    try {mgsuite.overlay.aioRockerAction[index]();}
    catch(err) {}
    mgsuite.overlay.aioIsRocker = false;
  },

  aioPrioritizeGestures: function(e) {
    if (mgsuite.overlay.aioSitePref == 'P' && (
      (e.button == mgsuite.const.RMB && ((mgsuite.overlay.aioGestEnabled && mgsuite.overlay.aioGestButton == mgsuite.const.RMB) || mgsuite.overlay.aioRockEnabled || mgsuite.overlay.aioWheelEnabled))
      || (e.button == mgsuite.const.MMB && ((mgsuite.overlay.aioGestEnabled && mgsuite.overlay.aioGestButton == mgsuite.const.MMB) || mgsuite.overlay.aioWheelEnabled || mgsuite.overlay.aioScrollEnabled))
      || (mgsuite.overlay.aioRockEnabled && e.button == mgsuite.const.LMB && mgsuite.overlay.aioDownButton == mgsuite.const.RMB)
      )
    ) {
    e.stopPropagation();

    var prefStr = mgsuite.overlay.aioGetStr("opt.sitePrefP");
    if (mgsuite.overlay.aioBlockActionStatusMsg.indexOf(prefStr) < 0) {
      mgsuite.overlay.aioBlockActionStatusMsg += "<" + prefStr + ">";
    }
    mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioBlockActionStatusMsg, 1000);
    }
  },

  aioMouseDown: function(e) {

    var gesturesEnabled = mgsuite.overlay.aioGesturesEnabled;
	mgsuite.util.clearCollectedItems();

    if (gesturesEnabled) {
	  // detect gesture start on tab
	  mgsuite.overlay.aioGestureTab = null;
  
	  if (mgsuite.overlay.aioWindowType == "browser") {
		var tg = e.originalTarget;
		if (tg.nodeName == 'xul:tab' ||
		  (tg.nodeName == 'tab' && tg.parentNode.nodeName.indexOf('xul:') == 0)) {
		  // tab in SM
		  mgsuite.overlay.aioGestureTab = e.originalTarget;
  
		} else if (tg.nodeName == 'xul:hbox' || tg.nodeName == 'xul:label') {
		  // tab in Fx
		  var tab = tg.parentNode.parentNode.parentNode;
	
		  if (tab.nodeName == 'tab') {
			mgsuite.overlay.aioGestureTab = tab;
		  }
		}
	  }
  
  
	  mgsuite.overlay.aioBlockActionStatusMsg = "";
  
	  if (mgsuite.overlay.aioSitePref == 'P') {
		// prioritize gestures - these listeners on document will prevent mouse clicks
		// from reaching it
		var addPrioritizeEvents = function(elem) {
		  elem.addEventListener("mousedown", mgsuite.overlay.aioPrioritizeGestures, true);
		  elem.addEventListener("mouseup", mgsuite.overlay.aioPrioritizeGestures, true);
  
		  if (!mgsuite.overlay.aioIsWin) {
			elem.addEventListener("contextmenu", mgsuite.overlay.aioPrioritizeGestures, true);
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
  
	  } else if (mgsuite.overlay.aioSitePref == 'D' && !mgsuite.overlay.aioGestureTab) {
		// disable gestures
  
		// sometimes context menu can get disabled in Windows in D mode
		mgsuite.overlay.aioShowContextMenu = true;
  
		if (!mgsuite.overlay.aioGestureTab) {
		  if (e.button != mgsuite.const.LMB || mgsuite.overlay.aioGestButton == mgsuite.const.LMB) {
			mgsuite.overlay.aioBlockActionStatusMsg += "<" + mgsuite.overlay.aioGetStr("opt.sitePrefD") + ">";
			mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioBlockActionStatusMsg, 1000);
		  }
		  gesturesEnabled = false;
		}
	  }
  
	  if (gesturesEnabled) {
		if (mgsuite.overlay.aioDisableClickHeat && mgsuite.overlay.aioWindowType == "browser") {
		  mgsuite.overlay.aioDisableClickHeatEvents(e);
		}
  
		mgsuite.overlay.aioShowContextMenu = false;
		mgsuite.overlay.aioBackRocking = false;
		
		gBrowser.selectedBrowser.messageManager.sendAsyncMessage("MouseGesturesSuite:startMouseMove");
	  }
	}

    if (gesturesEnabled && e.button == mgsuite.const.aioOpp[mgsuite.overlay.aioDownButton] && mgsuite.overlay.aioRockEnabled) {
	  // rocker gestures
	  var func;
	  
      if (e.button == mgsuite.const.RMB) {
        func = 1;
        mgsuite.overlay.aioSrcEvent = e;
        setTimeout(function(){mgsuite.overlay.aioPerformRockerFunction(1);}, 0);
      }
       else {
		func = 0;
		mgsuite.overlay.aioSrcEvent = e;
		mgsuite.overlay.aioPerformRockerFunction(0);
      }
	  dump("rocker:" + func + "\n");
	  
	  mgsuite.overlay.blockMouseEventsForRocker();
	  
	  mgsuite.overlay.aioKillGestInProgress();
	  mgsuite.imp.aioStatusMessage("", 0);
	  mgsuite.overlay.aioContent.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelNav, true);
	  if (!mgsuite.overlay.aioRockMultiple[func] || (mgsuite.overlay.aioRockMultiple[func] == 2 && mgsuite.overlay.aioRockMode == 0)) mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
       else { // multiple ops allowed
		if (mgsuite.overlay.aioRockTimer) {clearTimeout(mgsuite.overlay.aioRockTimer); mgsuite.overlay.aioRockTimer = null;}
		if (mgsuite.overlay.aioRockMultiple[func] == 2) mgsuite.overlay.aioRockTimer = setTimeout(function(){mgsuite.overlay.aioClearRocker();}, 3000);
		else mgsuite.overlay.aioRockTimer = setTimeout(function(){mgsuite.overlay.aioClearRocker();}, 10000000);
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

      if (gesturesEnabled && e.button == mgsuite.overlay.aioGestButton) {
		// start mouse gesture
        var preventDefaultAction = false;
        if (mgsuite.overlay.aioGestEnabled && mgsuite.overlay.aioIsKeyOK(e)) {
          mgsuite.overlay.aioSrcEvent = e;
          targetName  = e.target.nodeName.toLowerCase();

          if ((mgsuite.overlay.aioIsAreaOK(e, false) || e.button != mgsuite.const.LMB) && targetName != 'toolbarbutton'
              && !mgsuite.overlay.aioGestInProgress) {

			  preventDefaultAction = e.button != mgsuite.const.LMB || !mgsuite.overlay.aioLeftDefault ||
					 targetName == "html" || targetName == "body" || e.target.ownerDocument == mgsuite.overlay.aioContent.ownerDocument;
			  mgsuite.overlay.aioGestInProgress = true;
			  mgsuite.overlay.aioStrokes = []; mgsuite.overlay.aioLocaleGest = []; mgsuite.overlay.aioCurrGest = "";
			  if (mgsuite.overlay.aioTrailEnabled) mgsuite.trail.startTrail(e);
			  window.addEventListener("mousemove", mgsuite.overlay.aioGestMove, true);
            }
          else preventDefaultAction = e.button != mgsuite.const.LMB;
        }
		
         // it can be the start of a wheelscroll gesture as well
        if (mgsuite.overlay.aioWheelEnabled && (mgsuite.overlay.aioWindowType == "browser" || mgsuite.overlay.aioWindowType == "messenger" || mgsuite.overlay.aioWindowType == "source")) {
		  preventDefaultAction = preventDefaultAction || e.button != mgsuite.const.LMB;
		  mgsuite.overlay.aioTabCount = (mgsuite.overlay.aioWindowType == "browser") ? mgsuite.overlay.aioContent.mPanelContainer.childNodes.length : 0;
		  if (mgsuite.overlay.aioWheelRocker) {
			if (!mgsuite.overlay.aioGestInProgress) {
			  mgsuite.overlay.aioSrcEvent = e;
			}
		  }
		  else mgsuite.overlay.aioTTNode = mgsuite.overlay.aioFindLink(e.target, false);
		  
		  if (mgsuite.overlay.aioWheelRocker || mgsuite.overlay.aioTabCount >= 1 || mgsuite.overlay.aioTTNode)
			mgsuite.overlay.aioContent.addEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelNav, true);
        }

        if (preventDefaultAction && e.button == mgsuite.const.LMB) mgsuite.overlay.aioNukeEvent(e);
          mgsuite.overlay.aioOldX = e.screenX; mgsuite.overlay.aioOldY = e.screenY;
      }
       else {
        // middle button scrolling
        if (e.button == mgsuite.const.MMB && mgsuite.overlay.aioDownButton == mgsuite.const.NoB && mgsuite.overlay.aioScrollEnabled && mgsuite.overlay.aioIsAreaOK(e, true) &&
              (mgsuite.overlay.aioStartOnLinks  || !mgsuite.overlay.aioFindLink(e.target, false)) && !(mgsuite.overlay.aioPreferPaste && mgsuite.overlay.aioIsPastable(e))) {
		  mgsuite.overlay.aioShowContextMenu = false;
  
		  window.removeEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
		  mgsuite.overlay.aioRendering.removeEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
		  window.addEventListener("click", mgsuite.overlay.aioASClick, true);
		  mgsuite.overlay.aioLastEvtTime = new Date();
		  mgsuite.overlay.aioLastX = e.screenX; mgsuite.overlay.aioLastY = e.screenY;
		  window.addEventListener("mousemove", mgsuite.overlay.aioScrollMove, true);
		  mgsuite.overlay.aioNukeEvent(e);
  
		  switch (mgsuite.overlay.aioWhatAS) {
			case 0: mgsuite.overlay.aioAutoScrollStart(e);
				break;
			case 2: mgsuite.overlay.aioRendering.addEventListener("mouseup", mgsuite.overlay.aioStartAS, true);
				mgsuite.overlay.aioGrabTarget = e.target;
				mgsuite.overlay.aioScrollMode = 1;
				break;
			case 3: mgsuite.overlay.aioGrabNDrag(e.target);
		  }
        }
      }
      mgsuite.overlay.aioDownButton = e.button;
    }
  },
  
  /* We need to block mouse clicks when doing rocker gestures so that links are not
   * activated */
  blockMouseEventsForRocker: function() {
	  window.addEventListener("click", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
	  window.addEventListener("mousedown", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
	  window.addEventListener("mouseup", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
  },

  unBlockMouseEventsForRocker: function() {
	setTimeout(function() {
	  window.removeEventListener("click", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
	  window.removeEventListener("mousedown", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
	  window.removeEventListener("mouseup", mgsuite.overlay.rockerBlockMouseEventsHandler, true);
	}, 200);
  },

  rockerBlockMouseEventsHandler: function(e) {
    mgsuite.overlay.aioNukeEvent(e);
    mgsuite.overlay.unBlockMouseEventsForRocker();
  },

  aioGestClickEnd: function() { // click event is not always fired
    window.removeEventListener("click", mgsuite.overlay.aioGestClickHandler, true);
  },

  aioGestClickHandler: function(e) {
    if (e.button != mgsuite.overlay.aioGestButton) return;
    mgsuite.overlay.aioNukeEvent(e);
    window.removeEventListener("click", mgsuite.overlay.aioGestClickHandler, true);
  },

  aioDisplayContextMenu: function(e) {
    mgsuite.overlay.aioShowContextMenu = true;
    if (mgsuite.overlay.aioIsWin) return; // use the default action

    var evt = Components.interfaces.nsIDOMNSEvent;
    var mods = 0;

    if (e.shiftKey) mods |= evt.SHIFT_MASK;
    if (e.ctrlKey) mods |= evt.CONTROL_MASK;
    if (e.altKey) mods |= evt.ALT_MASK;
    if (e.metaKey) mods |= evt.META_MASK;

    var dwu = e.view.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
              .getInterface(Components.interfaces.nsIDOMWindowUtils);

    dwu.sendMouseEvent("contextmenu", e.clientX, e.clientY, 2, 1, mods);
  },

  aioMouseUp: function(e) {
	gBrowser.selectedBrowser.messageManager.sendAsyncMessage("MouseGesturesSuite:endMouseMove");
	
	mgsuite.overlay.unBlockMouseEventsForRocker();

    if (!mgsuite.overlay.aioGesturesEnabled) {
	  mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
	  return;
    }

    if (mgsuite.overlay.aioDelayTO) {
	  clearTimeout(mgsuite.overlay.aioDelayTO);
    }

    if (mgsuite.overlay.aioSitePref == 'D' && !mgsuite.overlay.aioGestureTab) {
	  // disable gestures
	  mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
	  mgsuite.overlay.aioKillGestInProgress();
	  return;
    }
    mgsuite.overlay.aioBlockActionStatusMsg = "";

    if (mgsuite.overlay.aioIsMac && e.button == mgsuite.const.LMB && e.ctrlKey) var button = mgsuite.const.RMB;
    else button = e.button;

    if (button == mgsuite.overlay.aioDownButton) {
	  mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
	  mgsuite.overlay.aioContent.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelNav, true);
	  if (button == mgsuite.const.RMB && !mgsuite.overlay.aioGestInProgress && !mgsuite.overlay.aioRockTimer) mgsuite.overlay.aioDisplayContextMenu(e);
	  else {
		if (mgsuite.overlay.aioRockTimer) clearTimeout(mgsuite.overlay.aioRockTimer);
		mgsuite.overlay.aioRockTimer = null;
	  }
    }

    if (mgsuite.overlay.aioGestInProgress) {
      var lastgesture = mgsuite.overlay.aioStrokes.join("");

      if (lastgesture) mgsuite.overlay.aioNukeEvent(e);
      mgsuite.trail.eraseTrail();

      if (lastgesture) {
        window.addEventListener("click", mgsuite.overlay.aioGestClickHandler, true);
		var shiftKey = e.shiftKey;

		if ((new Date() - mgsuite.overlay.aioLastEvtTime) < mgsuite.overlay.aioDelay) {
		  setTimeout(function(a){mgsuite.imp.aioFireGesture(a, shiftKey);}, 0, lastgesture);
		  setTimeout(function(){mgsuite.overlay.aioGestClickEnd();}, 200);
		  return;
		}
		else { // abort if user pauses at the end of gesture
		  mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioGetStr("g.aborted"), 2500);
		  setTimeout(function(){mgsuite.overlay.aioGestClickEnd();}, 200);
		}
      }
       else {
          mgsuite.imp.aioStatusMessage("", 0);
          if (button == mgsuite.const.RMB) mgsuite.overlay.aioDisplayContextMenu(e);
      }
      mgsuite.overlay.aioKillGestInProgress();
      mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
    }
  },

  aioDragGesture: function(e) {
    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
    mgsuite.overlay.aioContent.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelNav, true);
    if (mgsuite.overlay.aioGestInProgress) mgsuite.overlay.aioKillGestInProgress();
  },

  /* Scroll Wheel gestures
     Original code by Joe4711. Rewritten by Marc Boullet  */
  aioWheelNav: function(e) {
    mgsuite.overlay.aioNukeEvent(e);
    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
    mgsuite.overlay.aioCCW = e.detail < 0;

    mgsuite.overlay.aioRendering.removeEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
    mgsuite.overlay.aioContent.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelNav, true);
    window.removeEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
    if (mgsuite.overlay.aioGestInProgress) {
       mgsuite.overlay.aioKillGestInProgress(mgsuite.overlay.aioWheelRocker);
       mgsuite.imp.aioStatusMessage("", 0);  //remove gesture indication
    }

    if (mgsuite.overlay.aioWheelRocker) {
       var func = 2 + (!mgsuite.overlay.aioCCW - 0);
       mgsuite.overlay.aioSrcEvent = e;
       mgsuite.overlay.aioPerformRockerFunction(func);
       if (!mgsuite.overlay.aioRockMultiple[func] || (mgsuite.overlay.aioRockMultiple[func] == 2 && mgsuite.overlay.aioRockMode == 0)) mgsuite.overlay.aioWheelRockEnd();
       else {
          mgsuite.overlay.aioRepet[func] = true; mgsuite.overlay.aioRepet[2 + (mgsuite.overlay.aioCCW - 0)] = mgsuite.overlay.aioWheelBothWays;
          window.addEventListener("mouseup", mgsuite.overlay.aioWheelRockUp, true);
          mgsuite.overlay.aioContent.addEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelRocking, true);
       }
       return;
    }

    if (mgsuite.overlay.aioTTNode && mgsuite.overlay.aioShowTitletip && !mgsuite.overlay.aioTTHover) {mgsuite.overlay.aioLinkTooltip(); return;}
    switch (mgsuite.overlay.aioWheelMode) {
      case 1: mgsuite.overlay.aioHistoryWheelNav();
              break;
      case 2: mgsuite.overlay.aioTabWheelNav();
              break;
      case 3: if (mgsuite.overlay.aioCCW == mgsuite.overlay.aioHistIfDown) mgsuite.overlay.aioTabWheelNav();
              else mgsuite.overlay.aioHistoryWheelNav();
    }
  },

  aioWheelRockEnd: function() {
    mgsuite.overlay.aioRestoreListeners();
    mgsuite.util.clearCollectedItems();
  },

  aioWheelRockUp: function(e) {
    window.removeEventListener("mouseup", mgsuite.overlay.aioWheelRockUp, true);
    mgsuite.overlay.aioContent.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioWheelRocking, true);
    mgsuite.overlay.aioWheelRockEnd();
  },

  aioWheelRocking: function(e) {
    var func = 2 + ((e.detail >= 0) - 0);
    if (mgsuite.overlay.aioRepet[func]) {
       mgsuite.overlay.aioSrcEvent = e;
       mgsuite.overlay.aioPerformRockerFunction(func);
    }
    mgsuite.overlay.aioNukeEvent(e);
  },


  /*
    Function prototype for scrolling popups
  */
  aioPopUp: function(pActive, pStart, pLength, pLastFirst, ptype, mouseX, mouseY, revScroll, func1, func2, func3) {
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
    this.createPopup = mgsuite.overlay._aioCreatePU;
    this.updatePopup = mgsuite.overlay._aioUpdatePU;
    this.scrollPopup = mgsuite.overlay._aioScrollPU;
    this.closePopup = mgsuite.overlay._aioClosePU;
    this.scrollerNode = null;
  },

  _aioCreatePU: function(arg1, arg2, arg3) {
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
      if (mgsuite.overlay.aioContent.mTabContainer.childNodes[i]) {
        label = mgsuite.overlay.aioContent.mTabContainer.childNodes[i].label;
      } else {
        label = mgsuite.overlay.aioContent.ownerDocument.title;
      }
      }

        popupElem.setAttribute("class", "menuitem-iconic");
        popupElem.setAttribute("style", "max-width:40em;");
        popupElem.setAttribute("label", label);
        if (arg1) {
           img = (i < this.initialItem) ? mgsuite.const.aioBackURL : (i == this.initialItem) ?
                  mgsuite.overlay.aioContent.mTabContainer.childNodes[mgsuite.overlay.aioContent.mTabContainer.selectedIndex].getAttribute("image") : mgsuite.const.aioNextURL;
      } else {

      if (mgsuite.overlay.aioContent.mTabContainer.childNodes[i]) {
        img = mgsuite.overlay.aioContent.mTabContainer.childNodes[i].getAttribute("image");
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
    mgsuite.overlay.aioMainWin.appendChild(this.scrollerNode);
    this.scrollerNode.addEventListener("popupshowing", this.observeFunc, true);
    this.scrollerNode.openPopupAtScreen(this.popupX, this.popupY, false);
  },

  _aioUpdatePU: function() {
    this.scrollerNode.removeEventListener("popupshowing", this.observeFunc, true);
    if (this.scrollingFunc) mgsuite.overlay.aioMainWin.addEventListener("DOMMouseScroll", this.scrollingFunc, true);
    for (var i = 0; i < arguments.length; i += 2)
      if (arguments[i] >= 0)
         this.scrollerNode.childNodes[arguments[i]].setAttribute(arguments[i + 1], "true");
  },

  _aioScrollPU: function(event) {
    event.preventDefault(); event.stopPropagation();
    this.scrollerNode.childNodes[this.activeRow].removeAttribute("_moz-menuactive");
    var goRight = this.reverseScroll ? event.detail < 0 : event.detail > 0;
    if (goRight) {if (++this.activeRow >= this.popupLength) this.activeRow = 0;}
    else if (--this.activeRow < 0) this.activeRow = this.popupLength - 1;
    this.scrollerNode.childNodes[this.activeRow].setAttribute("_moz-menuactive","true");
  },

  _aioClosePU: function(action) {
    if (this.closeFunc) window.removeEventListener("mouseup", this.closeFunc, true);
    if (this.scrollingFunc) mgsuite.overlay.aioMainWin.removeEventListener("DOMMouseScroll", this.scrollingFunc, true);
    this.scrollerNode.hidePopup();
    switch (action) {
      case 0: break;
      case 1: mgsuite.overlay.aioContent.mTabContainer.selectedIndex = this.activeRow;
              break;
      case 2: if (this.activeRow!=this.initialRow) {
                 var indice = this.lastFirst ? this.popupLength + this.popupStart -1 - this.activeRow
                                             : this.activeRow + this.popupStart;
                 getWebNavigation().gotoIndex(indice);
              }
    }
    mgsuite.overlay.aioMainWin.removeChild(this.scrollerNode);
  },
  // End of Popup prototype

  aioRestoreListeners: function() {
    mgsuite.overlay.aioRendering.addEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
    window.addEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
  },

  aioTabWheelNav: function() {
    var activeTab = mgsuite.overlay.aioContent.mTabContainer.selectedIndex;
    if (activeTab != mgsuite.overlay.aioTabSrc) {
       mgsuite.overlay.aioTabDest = -1;
       mgsuite.overlay.aioTabSrc = activeTab;
    }
    // Create and Display the popup menu
    mgsuite.overlay.aioTabPU = new mgsuite.overlay.aioPopUp(activeTab, 0, mgsuite.overlay.aioTabCount, false, "popup", mgsuite.overlay.aioOldX + 2, mgsuite.overlay.aioOldY + 2,
                            mgsuite.overlay.aioReverseScroll, mgsuite.overlay.aioTabWheelEnd, mgsuite.overlay.aioTabPopping, mgsuite.overlay.aioTabWheeling);
    mgsuite.overlay.aioTabPU.createPopup(0, "", "");
  },

  aioTabPopping: function(e) {
    var row = (mgsuite.overlay.aioTabDest != -1 && mgsuite.overlay.aioTabDest < mgsuite.overlay.aioTabPU.popupLength) ? mgsuite.overlay.aioTabDest : -1;
    if (row != -1)
       mgsuite.overlay.aioTabPU.updatePopup(mgsuite.overlay.aioTabPU.initialRow, "_moz-menuactive", mgsuite.overlay.aioTabPU.initialRow, "aioBold", row, "aioItalic");
    else
       mgsuite.overlay.aioTabPU.updatePopup(mgsuite.overlay.aioTabPU.initialRow, "_moz-menuactive", mgsuite.overlay.aioTabPU.initialRow, "aioBold");

    e.preventDefault(); //no popup
    if (mgsuite.overlay.aioWheelMode == 2) mgsuite.overlay.aioContent.mTabContainer.advanceSelectedTab(mgsuite.overlay.aioCCW != mgsuite.overlay.aioReverseScroll ? -1 : 1, true);
  },

  aioTabWheeling: function(e) {
    mgsuite.overlay.aioTabPU.scrollPopup(e);
    if (mgsuite.overlay.aioTabDest != -1 && mgsuite.overlay.aioTabDest < mgsuite.overlay.aioTabPU.popupLength)
       if (mgsuite.overlay.aioTabPU.activeRow == mgsuite.overlay.aioTabPU.initialRow)
          mgsuite.overlay.aioTabPU.scrollerNode.childNodes[mgsuite.overlay.aioTabDest].setAttribute("aioItalic", "true")
       else mgsuite.overlay.aioTabPU.scrollerNode.childNodes[mgsuite.overlay.aioTabDest].removeAttribute("aioItalic");
    mgsuite.overlay.aioContent.mTabContainer.advanceSelectedTab(e.detail > 0 == mgsuite.overlay.aioReverseScroll ? -1 : 1, true);
  },

  aioTabWheelEnd: function(e) {
    mgsuite.overlay.aioTabPU.closePopup(0);
    mgsuite.overlay.aioRestoreListeners();
    return;
  },

  aioHistoryWheelNav: function() {
    var sessionH = getWebNavigation().sessionHistory;
    if (sessionH.index < 0 || sessionH.count <= 0) { // Firefox bug: untitled tab
       mgsuite.overlay.aioRestoreListeners();
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

    mgsuite.overlay.aioHistPU = new mgsuite.overlay.aioPopUp(sessionH.index, start, count, true, "popup", mgsuite.overlay.aioOldX + 2, mgsuite.overlay.aioOldY + 2,
                             false, mgsuite.overlay.aioHistWheelEnd, mgsuite.overlay.aioHistPopping, mgsuite.overlay.aioHistWheeling);
    mgsuite.overlay.aioHistPU.createPopup(1, "", "");
  },

  aioHistPopping: function() {
    mgsuite.overlay.aioHistPU.updatePopup(mgsuite.overlay.aioHistPU.initialRow, "_moz-menuactive", mgsuite.overlay.aioHistPU.initialRow, "aioBold");
  },

  aioHistWheeling: function(e) {
    mgsuite.overlay.aioHistPU.scrollPopup(e);
  },

  aioHistWheelEnd: function(e) {
    mgsuite.overlay.aioHistPU.closePopup(2);
    mgsuite.overlay.aioRestoreListeners();
  },

  aioLinkTooltip: function(e) {
    mgsuite.overlay.aioTTPU = new mgsuite.overlay.aioPopUp(0, 0, 0, false, "tooltip", mgsuite.overlay.aioOldX, mgsuite.overlay.aioOldY, mgsuite.tooltip.aioHasNewWindowTarget(mgsuite.overlay.aioTTNode),
                           mgsuite.overlay.aioLinkTTEnd, mgsuite.overlay.aioLinkTTPopping, mgsuite.overlay.aioLinkTTNuke);

    mgsuite.overlay.aioTTPU.createPopup(mgsuite.tooltip.aioGetTextForTitle(mgsuite.overlay.aioTTNode), mgsuite.overlay.aioGetHRef(mgsuite.overlay.aioTTNode), "");
  },

  aioLinkTTPopping: function(e) {
    mgsuite.overlay.aioTTPU.updatePopup();
  },

  aioLinkTTNuke: function(e) {
    mgsuite.overlay.aioNukeEvent(e);
  },

  aioLinkTTEnd: function(e) {
    mgsuite.overlay.aioTTPU.closePopup(0);
    mgsuite.overlay.aioTTPU = null; mgsuite.overlay.aioTTNode = null;
    mgsuite.overlay.aioRestoreListeners();
    mgsuite.overlay.aioNukeEvent(e);
  },

  aioSwitchTabs: function(e) {
    if (typeof(TabbrowserService) == "object" || mgsuite.overlay.aioContent.mPanelContainer.childNodes.length <= 1)  return;
    mgsuite.overlay.aioNukeEvent(e);
    mgsuite.overlay.aioContent.mTabContainer.advanceSelectedTab(e.detail > 0 == mgsuite.overlay.aioReverseScroll ? -1 : 1, true);
  },

  aioScrollMove: function(e) {
    switch (mgsuite.overlay.aioScrollMode) {
      case 0: mgsuite.overlay.aioAutoScrollMove(e);
              break;
      case 1: mgsuite.overlay.aioGrabMaybe(e);
              break;
      case 2: mgsuite.overlay.aioGrabNDragMove(e);
    }
  },

  aioScrollWindow: function() {
    mgsuite.overlay.aioScroll.clientFrame.scrollBy(mgsuite.overlay.aioDistX[mgsuite.overlay.aioScrollCount], mgsuite.overlay.aioDistY[mgsuite.overlay.aioScrollCount]);
    if (++mgsuite.overlay.aioScrollCount >= mgsuite.overlay.aioScrollMax) mgsuite.overlay.aioScrollCount = 0;
  },

  aioScrollElem: function() {
    mgsuite.overlay.aioScroll.nodeToScroll.scrollLeft += mgsuite.overlay.aioDistX[mgsuite.overlay.aioScrollCount];
    mgsuite.overlay.aioScroll.nodeToScroll.scrollTop += mgsuite.overlay.aioDistY[mgsuite.overlay.aioScrollCount];
    if (++mgsuite.overlay.aioScrollCount >= mgsuite.overlay.aioScrollMax) mgsuite.overlay.aioScrollCount = 0;
  },

  aioAutoScrollStart: function(e) {
    window.addEventListener("DOMMouseScroll", mgsuite.overlay.aioAutoScrollStop, true);
    window.addEventListener("mouseup", mgsuite.overlay.aioAutoScrollUp, true);
    window.addEventListener("mousedown", mgsuite.overlay.aioAutoScrollUp, true);
    mgsuite.overlay.aioAcceptASKeys = true;
    mgsuite.overlay.aioDistX = [0, 0, 0, 0]; mgsuite.overlay.aioDistY = [0, 0, 0, 0]; mgsuite.overlay.aioScrollCount = 0;
    mgsuite.overlay.aioScrollMode = 0;
    mgsuite.overlay.aioScrollFingerFree = false;

    switch (mgsuite.overlay.aioAddMarker(e)) {
      case 0: mgsuite.overlay.aioIntervalID = setInterval(function(){mgsuite.overlay.aioScrollElem();}, mgsuite.overlay.aioASPeriod);
              break;
      case 1: mgsuite.overlay.aioIntervalID = setInterval(function(){mgsuite.overlay.aioScrollWindow();}, mgsuite.overlay.aioASPeriod);
              break;
      case 2: ;
    }
  },

  aioLogDist: function(aDist) {
    var absDist = Math.abs(aDist);
    for (var i = 1; i < mgsuite.const.aioDist.length; ++i)
       if (absDist < mgsuite.const.aioDist[i]) {
          absDist = Math.round(mgsuite.overlay.aioSofar[i] + (absDist - mgsuite.const.aioDist[i-1]) * mgsuite.const.aioRatio[i]);
          break;
       }
    var tabDist = [0, 0, 0, 0];
    switch (mgsuite.overlay.aioScrollRate) {
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
  },

  aioAutoScrollMove: function(e) {
  // Apply pseudo logarithmic scale
    mgsuite.overlay.aioNukeEvent(e);
    mgsuite.overlay.aioScroll.dX = e.screenX - mgsuite.overlay.aioLastX;
    mgsuite.overlay.aioScroll.dY = e.screenY - mgsuite.overlay.aioLastY;
    mgsuite.overlay.aioDistX = [0, 0, 0, 0]; mgsuite.overlay.aioDistY = [0, 0, 0, 0];
    switch (mgsuite.overlay.aioScroll.scrollType) {
      case 3: break;
      case 0: if (Math.abs(mgsuite.overlay.aioScroll.dX) > Math.abs(mgsuite.overlay.aioScroll.dY)) mgsuite.overlay.aioDistX = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dX);
              else mgsuite.overlay.aioDistY = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dY); // diagonal scrolling is jerky; don't do it
              break;
      case 1: mgsuite.overlay.aioDistY = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dY);
              break;
      case 2: mgsuite.overlay.aioDistX = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dX);
    }
  },

  aioAutoScrollKey: function(e) {
    const VK_LEFT = e.DOM_VK_LEFT, VK_UP = e.DOM_VK_UP;
    const VK_RIGHT = e.DOM_VK_RIGHT, VK_DOWN = e.DOM_VK_DOWN;
    mgsuite.overlay.aioNukeEvent(e);
    switch (e.keyCode) {
      case VK_DOWN :
      case VK_UP   : if (mgsuite.overlay.aioScroll.scrollType < 2) {
                        var inc = e.keyCode == VK_UP ? -20 : 20 ;
                        if (mgsuite.overlay.aioMarker) {
              mgsuite.overlay.aioMarker.moveBy(0, inc);
                        }

                        mgsuite.overlay.aioLastY -= inc;
                        mgsuite.overlay.aioScroll.dY += inc;
                        mgsuite.overlay.aioDistY = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dY);
                     }
                     break;
      case VK_LEFT :
      case VK_RIGHT: if (!(mgsuite.overlay.aioScroll.scrollType & 1)) {
                        inc = e.keyCode == VK_LEFT ? -20 : 20 ;
                        if (mgsuite.overlay.aioMarker) {
                          mgsuite.overlay.aioMarker.moveBy(inc, 0);
                        }

                        mgsuite.overlay.aioLastX -= inc;
                        mgsuite.overlay.aioScroll.dX += inc;
                        mgsuite.overlay.aioDistX = mgsuite.overlay.aioLogDist(mgsuite.overlay.aioScroll.dX);
                     }
                     break;
      default      : mgsuite.overlay.aioAutoScrollStop(e);
   }          
  },

  aioAutoScrollStop: function(e) {
    mgsuite.overlay.aioScrollFingerFree = true;
    mgsuite.overlay.aioAutoScrollUp(e);
  },

  aioScrollEnd: function() {
    window.removeEventListener("click", mgsuite.overlay.aioASClick, true);
  },

  aioASClick: function(e) { // prevent Unix pastes
    mgsuite.overlay.aioNukeEvent(e);
  },

  aioAutoScrollUp: function(e) {
    if (mgsuite.overlay.aioScrollFingerFree || ((new Date() - mgsuite.overlay.aioLastEvtTime) > mgsuite.overlay.aioDelay &&
        (!mgsuite.overlay.aioPanToAS || Math.abs(e.screenX - mgsuite.overlay.aioLastX) >= mgsuite.const.aioHalfMarker || Math.abs(e.screenY - mgsuite.overlay.aioLastY) >= mgsuite.const.aioHalfMarker))) {
	  if (mgsuite.overlay.aioIntervalID) window.clearInterval(mgsuite.overlay.aioIntervalID);
	  mgsuite.overlay.aioIntervalID = null;
	  mgsuite.overlay.aioNukeEvent(e);
  
	  if (e.type == "mousedown") {
		 mgsuite.overlay.aioRemoveMarker();
		 window.removeEventListener("mousemove", mgsuite.overlay.aioScrollMove, true);
	  }
      else {
		mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
		window.removeEventListener("mouseup", mgsuite.overlay.aioAutoScrollUp, true);
		window.removeEventListener("mousedown", mgsuite.overlay.aioAutoScrollUp, true);
		window.removeEventListener("mousemove", mgsuite.overlay.aioScrollMove, true);
		window.removeEventListener("DOMMouseScroll", mgsuite.overlay.aioAutoScrollStop, true);
		mgsuite.overlay.aioAcceptASKeys = false;
		window.addEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
		mgsuite.overlay.aioRendering.addEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
		mgsuite.overlay.aioRemoveMarker();
		setTimeout(function(){mgsuite.overlay.aioScrollEnd();}, 200);
      }
    }
    else mgsuite.overlay.aioScrollFingerFree = true;
  },

  aioFindNodeToScroll: function(initialNode) {

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
    retObj.XMLPrettyPrint = mgsuite.overlay.aioIsUnformattedXML(targetDoc);
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
    if (retObj.isFrame) return mgsuite.overlay.aioFindNodeToScroll(clientFrame.frameElement.ownerDocument.documentElement);
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
  },

  /* Display autoscroll marker */
  aioAddMarker: function(e) {
    mgsuite.overlay.aioScroll = mgsuite.overlay.aioFindNodeToScroll(e.target);
    if (mgsuite.overlay.aioScroll.scrollType == 3) { // nothing to scroll
       mgsuite.overlay.aioScrollFingerFree = true; // exit on next mouse up
       return 2;
    }

    if (mgsuite.overlay.aioSpecialCursor && !mgsuite.overlay.aioNoScrollMarker && !mgsuite.overlay.aioScroll.XMLPrettyPrint) {
      // overlay
      var el = mgsuite.overlay.aioScroll.targetDoc.createElementNS(mgsuite.const.xhtmlNS, "aioOverlay");
      el.style.position = "fixed";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.width = mgsuite.overlay.aioScroll.docWidth + "px";
      el.style.height = mgsuite.overlay.aioScroll.docHeight + "px";
      el.style.zIndex = 10001;
      el.style.background = "transparent";
      el.style.cursor = mgsuite.const.aioCursors[mgsuite.overlay.aioScroll.scrollType];
      mgsuite.overlay.aioScroll.insertionNode.appendChild(el);
      mgsuite.overlay.aioOverlay = el;
    } else {
	  mgsuite.overlay.aioOverlay = null;
    }

    // marker
    var insertionNode;

    if (!mgsuite.overlay.aioNoScrollMarker) {
    switch (mgsuite.overlay.aioWindowType) {
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

    mgsuite.overlay.aioMarkerX = e.screenX - window.mozInnerScreenX - mgsuite.const.aioHalfMarker;
    mgsuite.overlay.aioMarkerY = e.screenY - window.mozInnerScreenY - mgsuite.const.aioHalfMarker;

    var canvas = document.createElementNS(mgsuite.const.xhtmlNS, "canvas");
    canvas.id = mgsuite.const.aioMarkerIds[mgsuite.overlay.aioScroll.scrollType];
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
      ctx.drawImage(img, mgsuite.overlay.aioMarkerX, mgsuite.overlay.aioMarkerY);
    }
    img.src = mgsuite.const.aioMarkers[mgsuite.overlay.aioScroll.scrollType];

    mgsuite.overlay.aioMarker = canvas;
    mgsuite.overlay.aioMarker.moveBy = function(shiftX, shiftY) {
      ctx.clearRect(mgsuite.overlay.aioMarkerX, mgsuite.overlay.aioMarkerY, mgsuite.const.aioMarkerSize, mgsuite.const.aioMarkerSize)
      mgsuite.overlay.aioMarkerX += shiftX;
      mgsuite.overlay.aioMarkerY += shiftY;
      ctx.drawImage(img, mgsuite.overlay.aioMarkerX, mgsuite.overlay.aioMarkerY);
    };

    } else {
    mgsuite.overlay.aioMarker = null;
    }

    return (mgsuite.overlay.aioScroll.isXML || mgsuite.overlay.aioScroll.isBody) - 0;
  },

  aioRemoveMarker: function() {
    if (mgsuite.overlay.aioMarker) {
      try {
        mgsuite.overlay.aioMarker.parentNode.removeChild(mgsuite.overlay.aioMarker);
    }
    catch(err) {}
      mgsuite.overlay.aioMarker = null;
    }
    if (mgsuite.overlay.aioOverlay) {
      try {
        mgsuite.overlay.aioOverlay.parentNode.removeChild(mgsuite.overlay.aioOverlay);
    }
    catch(err) {}
      mgsuite.overlay.aioOverlay = null;
    }
  },

  aioWheelScroll: function(e) {
    if (typeof(sw_EnableThisExtension) == "boolean") return; // if smoothWheel is present, use it
    var scrollObj = mgsuite.overlay.aioFindNodeToScroll(e.target);
    if (scrollObj.scrollType == 3 || scrollObj.isXML || (scrollObj.isBody && !(scrollObj.isFrame &&
        scrollObj.clientFrame.frameElement.nodeName.toLowerCase() == "iframe") && scrollObj.scrollType != 2)) return; // Moz scrolling
    mgsuite.overlay.aioNukeEvent(e);
    var inc = (e.detail > 0) ? mgsuite.overlay.aioSmoothInc : -mgsuite.overlay.aioSmoothInc;
    if (mgsuite.overlay.aioSmoothScroll)
       if (mgsuite.overlay.aioSmooth) { //we're currently scrolling
          var directionChanged = (mgsuite.overlay.aioSmooth.smoothScrollBy < 0) != (inc < 0)
          if (directionChanged || mgsuite.overlay.aioSmooth.node != scrollObj.nodeToScroll) {
             mgsuite.overlay.aioSmooth.totalToScroll = directionChanged ? -inc : 0;
             mgsuite.overlay.aioSmooth.scrolledSoFar = 0;
             mgsuite.overlay.aioSmooth.node = scrollObj.nodeToScroll; mgsuite.overlay.aioSmooth.scrollHz = scrollObj.scrollType == 2;
          }
          mgsuite.overlay.aioSmooth.totalToScroll += inc;
          mgsuite.overlay.aioSmooth.smoothScrollBy = Math.ceil((mgsuite.overlay.aioSmooth.totalToScroll - mgsuite.overlay.aioSmooth.scrolledSoFar) / 10);    
       }
       else {
          mgsuite.overlay.aioSmooth = {node: scrollObj.nodeToScroll, totalToScroll: inc, smoothScrollBy: inc / 10,
                       scrolledSoFar: 0, scrollHz: scrollObj.scrollType == 2};
          mgsuite.overlay.aioSmoothInterval = setInterval(function(){mgsuite.overlay.aioSmoothLoop();}, mgsuite.const.aioSmoothPeriod);
       }
    else
       if (scrollObj.scrollType != 2) scrollObj.nodeToScroll.scrollTop += inc;
       else scrollObj.nodeToScroll.scrollLeft += inc;
  },

  aioSmoothLoop: function() {
    if (mgsuite.overlay.aioSmooth.scrollHz) mgsuite.overlay.aioSmooth.node.scrollLeft += mgsuite.overlay.aioSmooth.smoothScrollBy;
    else mgsuite.overlay.aioSmooth.node.scrollTop += mgsuite.overlay.aioSmooth.smoothScrollBy;
    mgsuite.overlay.aioSmooth.scrolledSoFar += mgsuite.overlay.aioSmooth.smoothScrollBy;
    if ((mgsuite.overlay.aioSmooth.scrolledSoFar >= mgsuite.overlay.aioSmooth.totalToScroll && mgsuite.overlay.aioSmooth.smoothScrollBy >= 0) ||
        (mgsuite.overlay.aioSmooth.scrolledSoFar <= mgsuite.overlay.aioSmooth.totalToScroll && mgsuite.overlay.aioSmooth.smoothScrollBy <= 0)) {
       if (mgsuite.overlay.aioSmoothInterval) window.clearInterval(mgsuite.overlay.aioSmoothInterval);
       mgsuite.overlay.aioSmooth = null;
    }
  },

  aioGrabMaybe: function(e) {
    if (Math.abs(e.screenX - mgsuite.overlay.aioLastX) < 3 && Math.abs(e.screenY - mgsuite.overlay.aioLastY) < 3) return;
    mgsuite.overlay.aioRendering.removeEventListener("mouseup", mgsuite.overlay.aioStartAS, true);
    mgsuite.overlay.aioGrabNDrag(mgsuite.overlay.aioGrabTarget);
    mgsuite.overlay.aioGrabNDragMove(e);
  },

  aioStartAS: function(e) {
     mgsuite.overlay.aioRendering.removeEventListener("mouseup", mgsuite.overlay.aioStartAS, true);
     mgsuite.overlay.aioAutoScrollStart(e);
     mgsuite.overlay.aioScrollFingerFree = true;
     if (mgsuite.overlay.aioScroll.scrollType == 3) mgsuite.overlay.aioAutoScrollUp(e);
  },

  aioGrabNDrag: function(target) {
    mgsuite.overlay.aioScrollMode = 2;
    window.addEventListener("mouseup", mgsuite.overlay.aioGrabNDragMouseUp, true);
    mgsuite.overlay.aioScroll = mgsuite.overlay.aioFindNodeToScroll(target);
    if (mgsuite.overlay.aioScroll.scrollType == 3) return; // nothing to scroll
    if (!mgsuite.overlay.aioScroll.isXML && mgsuite.overlay.aioScroll.nodeToScroll.nodeName.toLowerCase() != "select") {
       mgsuite.overlay.aioScroll.cursorChangeable = true;
       mgsuite.overlay.aioScroll.nodeToScroll.style.cursor = "url(chrome://allinonegest/content/allscroll.png), move";
    }
    if (mgsuite.overlay.aioScrollAlaAcrobat) {mgsuite.overlay.aioScroll.ratioX = -1; mgsuite.overlay.aioScroll.ratioY = -1; }
  },

  aioGrabNDragMove: function(e) {
    if (mgsuite.overlay.aioScroll.scrollType == 3) return;
    mgsuite.overlay.aioScrollCount = 0;
    mgsuite.overlay.aioDistX[0] = mgsuite.overlay.aioNoHorizScroll ? 0 : Math.ceil((e.screenX - mgsuite.overlay.aioLastX) * mgsuite.overlay.aioScroll.ratioX);
    mgsuite.overlay.aioDistY[0] = Math.ceil((e.screenY - mgsuite.overlay.aioLastY) * mgsuite.overlay.aioScroll.ratioY);
    mgsuite.overlay.aioLastX = e.screenX; mgsuite.overlay.aioLastY = e.screenY;
    if (mgsuite.overlay.aioScroll.isXML || mgsuite.overlay.aioScroll.isBody) mgsuite.overlay.aioScrollWindow();
    else mgsuite.overlay.aioScrollElem();
  },

  aioGrabNDragMouseUp: function(e) {
    mgsuite.overlay.aioNukeEvent(e);
    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
    window.removeEventListener("mouseup", mgsuite.overlay.aioGrabNDragMouseUp, true);
    window.removeEventListener("mousemove", mgsuite.overlay.aioScrollMove, true);
    window.addEventListener("mouseup", mgsuite.overlay.aioMouseUp, true);
    mgsuite.overlay.aioRendering.addEventListener("mousedown", mgsuite.overlay.aioMouseDown, true);
    if (mgsuite.overlay.aioScroll.cursorChangeable)
       mgsuite.overlay.aioScroll.nodeToScroll.style.cursor = "auto";
    setTimeout(function(){mgsuite.overlay.aioScrollEnd();}, 200);
  },

  // Disable clickheat.js events, because they cause delays in gestures
  // See http://www.labsmedia.com/clickheat/index.html
  aioDisableClickHeatEvents: function(e) {
    var targetWin = e.target.ownerDocument.defaultView.wrappedJSObject;

    if (typeof targetWin.catchClickHeat == "function") {
    mgsuite.overlay._aioRemoveEventsForFunction(targetWin.document, targetWin.catchClickHeat);

    var f=targetWin.document.getElementsByTagName("iframe");
    for (var i=0; i<f.length; i++) {
      mgsuite.overlay._aioRemoveEventsForFunction(f[i], targetWin.catchClickHeat);
    }

    mgsuite.overlay.aioBlockActionStatusMsg += "<" + mgsuite.overlay.aioGetStr("g.ClickHeatDisabled") + ">";
    mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioBlockActionStatusMsg, 1000);
    }
  },

  // remove all event listeners for function on given target
  _aioRemoveEventsForFunction: function(target, func) {
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
}


/*
 * linkTooltip.js
 * For licence information, read licence.txt
 *
 * handling of link tooltips
 *
 */
mgsuite.tooltip = {
  
  aioHasNewWindowTarget: function(node) { // code from Chris Cook's Tabbrowser Preferences
    function notExistingFrameName(containerFrame, targetFrame) {
      for (var i = 0; i < containerFrame.length; ++i) {
         if (containerFrame[i].name == targetFrame) return false;
         if (containerFrame[i].frames.length && !notExistingFrameName(containerFrame[i].frames, targetFrame))
            return false;
      }
      return true;
    }

    var aiotarget = node.getAttribute("aiotarget");
    if (aiotarget) return aiotarget == "true";
    var target = node.getAttribute("target");
    // If link has no target attribute, check if there is a <base> with a target attribute
    if (!target) {
       var bases = node.ownerDocument.documentElement.getElementsByTagName("base");
       for (var i = bases.length - 1; i >= 0; --i) {
          target = bases[i].getAttribute("target");
          if (target) break;
       }
    }
    var hasNewWindow = target && (target == "_blank" || (target != "_self" && target !=" _parent" && target != "_top"
          && notExistingFrameName(document.commandDispatcher.focusedWindow.top.frames, target)));
    node.setAttribute("aiotarget", hasNewWindow ? "true": "false");
    return hasNewWindow;
  },

  aioGetTextForTitle: function(linkNode) { // from pageInfo.js; modified by M.B.
    function getTitleAltText(node) {
      if (node.hasAttribute("title")) {
         var altText = node.getAttribute("title");
         node.removeAttribute("title");
         return altText;
      }
      if (node.alt) return node.alt;
      altText = "";
      var length = node.childNodes.length;
      for (var i = 0; i < length; i++)
         if ((altText = getAltText(node.childNodes[i]) != undefined)) return altText;
      return "";
    }

    const nsIImageElement = Components.interfaces.nsIDOMHTMLImageElement;
    const nsIAreaElement = Components.interfaces.nsIDOMHTMLAreaElement;
    var s, childNode, nodeType;
    if (linkNode.hasAttribute("aioTitle")) return linkNode.getAttribute("aioTitle");
    if (linkNode.hasAttribute("title")) {
       var valueText = linkNode.getAttribute("title");
       linkNode.removeAttribute("title");
    }
    else {
       valueText = "";
       if (linkNode instanceof nsIAreaElement) valueText = linkNode.alt;
       else {
          var length = linkNode.childNodes.length;
          for (var i = 0; i < length; i++) {
            childNode = linkNode.childNodes[i];
            nodeType = childNode.nodeType;
            if (nodeType == Node.TEXT_NODE) valueText += " " + childNode.nodeValue;
            else if (nodeType == Node.ELEMENT_NODE)
              if (childNode instanceof nsIImageElement) {
                 s = getTitleAltText(childNode);
                 if (s) {
                    valueText = s; break;
                 }
              } 
              else valueText += " " + mgsuite.tooltip.aioGetTextForTitle(childNode);
          }
       }
    }
    var middleRE = /\s+/g;
    var endRE = /(^\s+)|(\s+$)/g;
    valueText = valueText.replace(middleRE, " ").replace(endRE, "")
    linkNode.setAttribute("aioTitle", valueText);
    return valueText;
  },

  aioShowTitle: function(e) {
    if (mgsuite.overlay.aioDownButton != mgsuite.const.NoB || mgsuite.overlay.aioTTShown || (mgsuite.overlay.aioShiftForTitle && !e.shiftKey)) return;
    var linkNode = mgsuite.overlay.aioFindLink(e.target, false);
    if (!linkNode) return;
    mgsuite.tooltip.aioGetTextForTitle(linkNode); // prevent native title to popup
    if (mgsuite.overlay.aioTTTimer) clearTimeout(mgsuite.overlay.aioTTTimer);
    linkNode.addEventListener("mouseout", mgsuite.tooltip.aioEraseTitlePopup, true);
    window.addEventListener("mousedown", mgsuite.tooltip.aioEraseTitlePopup, true);
    window.addEventListener("DOMMouseScroll", mgsuite.tooltip.aioEraseTitlePopup, true);
    mgsuite.overlay.aioTTNode = linkNode;
    mgsuite.overlay.aioTTTimer = setTimeout(function(a, b){mgsuite.tooltip.aioShowTitlePopup(a, b);},
                            mgsuite.overlay.aioShiftForTitle ? 50 : mgsuite.overlay.aioTitleDelay, e.screenX, e.screenY);
  },

  aioShowTitlePopup: function(X, Y) {
    mgsuite.overlay.aioTTShown = true;
    mgsuite.overlay.aioTTTimer = null;
    mgsuite.overlay.aioTTPU = new mgsuite.overlay.aioPopUp(0, 0, 0, false, "tooltip", X, Y, mgsuite.tooltip.aioHasNewWindowTarget(mgsuite.overlay.aioTTNode),
                           null, mgsuite.overlay.aioLinkTTPopping, null);
    mgsuite.overlay.aioTTPU.createPopup(mgsuite.tooltip.aioGetTextForTitle(mgsuite.overlay.aioTTNode), mgsuite.overlay.aioGetHRef(mgsuite.overlay.aioTTNode), "");
    mgsuite.overlay.aioTTTimer = setTimeout(function(){mgsuite.tooltip.aioEraseTitlePopup(null);}, mgsuite.overlay.aioTitleDuration);
  },

  aioEraseTitlePopup: function(e) {
    if (mgsuite.overlay.aioTTTimer) {
       clearTimeout(mgsuite.overlay.aioTTTimer);
       mgsuite.overlay.aioTTTimer = null;
    }
    mgsuite.overlay.aioTTNode.removeEventListener("mouseout", mgsuite.tooltip.aioEraseTitlePopup, true);
    window.removeEventListener("mousedown", mgsuite.tooltip.aioEraseTitlePopup, true);
    window.removeEventListener("DOMMouseScroll", mgsuite.tooltip.aioEraseTitlePopup, true);
    if (mgsuite.overlay.aioTTShown) mgsuite.overlay.aioTTPU.closePopup(0);
    mgsuite.overlay.aioTTPU = null; mgsuite.overlay.aioTTNode = null;
    if (e && e.type == "mousedown") {
       mgsuite.overlay.aioTTShown = true;
       setTimeout(function(){mgsuite.overlay.aioTTShown = false;}, 2000);
    }
    else mgsuite.overlay.aioTTShown = false;
  }
}



window.addEventListener("load",
  function() {
     if (mgsuite.overlay.aioInitStarted) return;
     mgsuite.overlay.aioStartUp();
  },
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
