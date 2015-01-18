/*
 * gestimp.js
 * For licence information, read licence.txt
 *
 * code for gesture functions
 *
 */
"use strict";

if (typeof mgsuite == 'undefined') {
  var mgsuite = {};
}


mgsuite.imp = {
  aioGestTable: null,
  
// mgsuite.imp.aioActionTable's 3rd column denotes rocker multiple operations. 0: Not allowed, 1: Allowed 2: Conditional
// 4th column denotes the buddy action if any
// 5th column denotes in what window types action is allowed to be performed:
//  - array of: browser, source, messenger, mailcompose
//  - or null for all window types
  aioActionTable: [
      [function(){mgsuite.imp.aioBackForward(true);}, "g.browserBack", 2, "1", ["browser", "source", "messenger"]], // 0
      [function(){mgsuite.imp.aioBackForward(false);}, "g.browserForward", 2, "0", ["browser", "source", "messenger"]], // 1
      [function(){mgsuite.imp.aioReload(false);}, "g.browserReload", 0, "", ["browser", "source", "messenger"]], // 2
      [function(){mgsuite.imp.aioReload(true);}, "g.browserReloadSkipCache", 0, "", ["browser", "source", "messenger"]], // 3
      [function(){mgsuite.imp.aioStopLoading();}, "g.browserStop", 0, "", ["browser", "messenger"]], // 4
      [function(){mgsuite.imp.aioHomePage();}, "g.browserHome", 0, "", null], // 5
      [function(shiftKey){mgsuite.imp.aioOpenNewWindow(null, shiftKey);}, "g.openNewWindow", 0, "", null], // 6
      [function(shiftKey){mgsuite.imp.aioDupWindow(shiftKey);}, "g.duplicateWindow", 0, "", ["browser", "source", "messenger"]], // 7
      [function(){mgsuite.imp.aioUpDir();}, "g.upDir", 2, "", ["browser"]], // 8
      [function(shiftKey){mgsuite.imp.aioOpenInNewTab(shiftKey);}, "g.browserOpenTabInFg", 0, "", null], // 9
      [function(shiftKey){mgsuite.imp.aioDupTab(shiftKey);}, "g.duplicateTab", 0, "", ["browser", "messenger"]], // 10
      [function(){mgsuite.imp.aioSwitchTab(1);}, "g.nextTab", 1, "12", ["browser", "messenger"]], // 11
      [function(){mgsuite.imp.aioSwitchTab(-1, true);}, "g.previousTab", 1, "11", ["browser", "messenger"]], // 12
      [function(){mgsuite.imp.aioRemoveAllTabsBut();}, "g.closeOther", 0, "", ["browser"]], // 13
      [function(){mgsuite.imp.aioRestMaxWin();}, "g.restMaxWin", 1, "", null], // 14
      [function(){window.minimize();}, "g.minWin", 0, "", null], // 15
      [function(){mgsuite.imp.aioFullScreen();}, "g.fullScreen", 1, "", null], // 16
      [function(shiftKey){mgsuite.imp.aioSelectionAsURL(shiftKey);}, "g.openSelection", 0, "", ["browser", "source", "messenger", "mailcompose"]], // 17
      [function(){mgsuite.imp.aioCloseCurrTab(true);}, "g.closeDoc", 2, "", null], // 18
      [function(){mgsuite.imp.aioViewSource(0);}, "g.viewPageSource", 0, "", ["browser", "messenger"]], // 19
      [function(){mgsuite.imp.aioViewSource(1);}, "g.viewFrameSource", 0, "", ["browser", "messenger"]], // 20
      [function(){mgsuite.imp.aioViewCookies();}, "g.viewSiteCookies", 0, "", ["browser"]], // 21
      [function(){mgsuite.imp.aioPageInfo();}, "g.pageInfo", 0, "", ["browser"]], // 22
      [function(){mgsuite.imp.aioOpenConsole();}, "g.jsConsole", 0, "", null], // 23
      [function(){mgsuite.imp.aioNullAction();}, "g.nullAction", 0, "", null], // 24
      [function(){mgsuite.imp.aioBookmarkCurrentPage();}, "g.addBookmark", 0, "", ["browser"]], // 25
      [function(){mgsuite.imp.aioDoubleWin();}, "g.doubleStackWin", 0, "", ["browser", "source", "messenger"]], // 26
      [function(){mgsuite.imp.aioSetImgSize(true,false);}, "g.doubleImageSize", 1, "28", ["browser", "messenger"]], // 27
      [function(){mgsuite.imp.aioSetImgSize(false,false);}, "g.halveImageSize", 1, "27", ["browser", "messenger"]], // 28
      [function(){mgsuite.imp.aioNukeAnything();}, "g.hideObject", 0, "", ["browser", "messenger"]], // 29
      [function(){mgsuite.imp.aioZoomEnlarge();}, "g.zoomIn", 1, "31", ["browser", "source", "messenger"]], // 30
      [function(){mgsuite.imp.aioZoomReduce();}, "g.zoomOut", 1, "30", ["browser", "source", "messenger"]], // 31
      [function(){mgsuite.imp.aioZoomReset();}, "g.resetZoom", 1, "", ["browser", "source", "messenger"]], // 32
      [function(){mgsuite.imp.aioActionOnPage(0);}, "g.w3cValidate", 0, "", ["browser"]], // 33
      [function(){mgsuite.imp.aioLinksInWindows();}, "g.linksInWindows", 0, "", ["browser", "source", "messenger"]], // 34
      [function(){mgsuite.imp.aioLinksInTabs();}, "g.linksInTabs", 0, "", ["browser", "source", "messenger"]], // 35
      [function(){mgsuite.imp.aioMetaInfo();}, "g.metaInfo", 0, "", ["browser"]], // 36
      [function(){mgsuite.imp.aioVScrollDocument(true,1);}, "g.scrollDown", 1, "38", ["browser", "source", "messenger"]], // 37
      [function(){mgsuite.imp.aioVScrollDocument(true,-1);}, "g.scrollUp", 1, "37", ["browser", "source", "messenger"]], // 38
      [function(){mgsuite.imp.aioVScrollDocument(false,0);}, "g.scrollToTop", 1, "40", ["browser", "source", "messenger"]], // 39
      [function(){mgsuite.imp.aioVScrollDocument(false,1000000);}, "g.scrollToBottom", 1, "39", ["browser", "source", "messenger"]], // 40
      [function(){mgsuite.imp.aioResetImgSize(false);}, "g.resetImage", 1, "", ["browser", "messenger"]], // 41
      [function(){mgsuite.imp.aioNullAction();}, "g.nullAction", 0, "", null], // 42
      [function(){mgsuite.imp.aioNukeFlash();}, "g.hideFlash", 0, "", ["browser"]], // 43
      [function(){mgsuite.imp.aioCopyURLToClipBoard();}, "g.URLToClipboard", 0, "", ["browser"]], // 44
      [function(){getWebNavigation().gotoIndex(0);}, "g.firstPage", 0, "", ["browser"]], // 45
      [function(){mgsuite.imp.aioGesturesPage();}, "g.showGestures", 0, "", ["browser"]], // 46
      [function(){mgsuite.imp.aioCloseCurrTab(false);}, "g.closeTab", 2, "", ["browser", "messenger"]], // 47
      [function(){mgsuite.imp.aioIncURL(1);}, "g.incURL", 2, "49", ["browser"]], // 48
      [function(){mgsuite.imp.aioIncURL(-1);}, "g.decURL", 2, "48", ["browser"]], // 49
      [function(){mgsuite.imp.aioSchemas={};}, "g.clearDigitFlipper", 0, "", ["browser"]], // 50
      [function(){mgsuite.imp.aioLinksInFiles();}, "g.linksInFiles", 0, "", ["browser", "source", "messenger"]], // 51
      [function(){mgsuite.imp.aioUndoCloseTab();}, "g.undoCloseTab", 2, "", ["browser"]], // 52
      [function(){mgsuite.imp.aioPrintPreview();}, "g.printPreview", 0, "", ["browser", "source", "messenger"]], //53
      [function(shiftKey){mgsuite.imp.aioOpenInNewTab(!shiftKey);}, "g.browserOpenTabInBg", 0, "", null], // 54
      [function(){mgsuite.imp.aioDeleteCookies();}, "g.deleteSiteCookies", 0, "", ["browser"]], // 55
      [function(){mgsuite.imp.aioUndoNukeAnything();}, "g.undoHideObject", 0, "", ["browser", "messenger"]], // 56
      [function(){mgsuite.imp.aioFavoriteURL('1');}, "g.openFav1", 0, "", null], // 57
      [function(){mgsuite.imp.aioFavoriteURL('2');}, "g.openFav2", 0, "", null], // 58
      [function(){mgsuite.imp.aioOpenBlankTab();}, "g.openBlankTab", 0, "", null], // 59
      [function(){mgsuite.imp.aioCloseWindow();}, "g.closeWindow", 0, "", null], // 60
      [function(shiftKey){mgsuite.imp.aioOpenNewWindow(null, !shiftKey);}, "g.openWindowInBg", 0, "", null], // 61
      [function(){mgsuite.imp.aioFrameInfo();}, "g.frameInfo", 0, "", ["browser"]], // 62
      [function(){mgsuite.imp.aioOpenAioOptions();}, "g.aioOptions", 0, "", null], // 63
      [function(){mgsuite.imp.aioNullAction();}, "g.nullAction", 0, "", null], // 64
      [function(){mgsuite.imp.aioOpenBookmarksManager();}, "g.bookmarkMgr", 0, "", null], // 65
      [function(){mgsuite.imp.aioActionOnPage(1);}, "g.translate", 0, "", ["browser"]], // 66
      [function(){mgsuite.imp.aioOpenDownloadManager();}, "g.downloadMgr", 0, "", null], // 67
      [function(){mgsuite.imp.aioSavePageAs();}, "g.savePageAs", 0, "", null], // 68
      [function(){mgsuite.imp.aioGoToPreviousSelectedTab();}, "g.prevSelectedTab", 1, "", ["browser"]], // 69
      [function(){mgsuite.imp.aioShowHideStatusBar();}, "g.showHideStatusBar", 1, "", null], // 70
      [function(){mgsuite.imp.aioReloadFrame()}, "g.reloadFrame", 0, "", ["browser", "source", "messenger"]], // 71
      [function(){mgsuite.imp.aioSetImgSize(true,true);}, "g.enlargeObject", 1, "73", ["browser", "source", "messenger"]], // 72
      [function(){mgsuite.imp.aioSetImgSize(false,true);}, "g.reduceObject", 1, "72", ["browser", "source", "messenger"]], // 73
      [function(){mgsuite.imp.aioResetImgSize(true);}, "g.resetSize", 1, "", ["browser", "source", "messenger"]], //74
      [function(){mgsuite.imp.aioNullAction();}, "g.nullAction", 0, "", null], // 75
      [function(){mgsuite.overlay.aioContent.reloadAllTabs();}, "g.reloadAllTabs", 0, "", ["browser"]], // 76
      [function(){mgsuite.imp.aioNextPrevLink(true);}, "g.nextLink", 0, "", ["browser"]], // 77
      [function(){mgsuite.imp.aioFastForward();}, "g.fastForward", 0, "", ["browser"]], // 78
      [function(shiftKey){mgsuite.imp.aioSelectionAsSearchTerm(false, shiftKey);}, "g.searchSelection", 0, "", ["browser", "source", "messenger", "mailcompose"]], // 79
      [function(){mgsuite.imp.aioSaveImageAs();}, "g.saveImageAs", 0, "", ["browser", "messenger"]], // 80
      [function(){mgsuite.imp.aioNextPrevLink(false);}, "g.prevLink", 0, "", ["browser"]], // 81
      [function(){mgsuite.imp.aioGotoLastTab();}, "g.lastTab", 0, "", ["browser", "messenger"]], // 82
      [function(){mgsuite.imp.aioCopyClipBoardToURLBar();}, "g.pasteAndGo", 0, "", ["browser"]], // 83
      [function(){mgsuite.imp.aioSmartBackForward(-1, false);}, "g.smartBack1", 1, "86", ["browser"]], // 84
      [function(){mgsuite.imp.aioSmartBackForward(-1, true);}, "g.smartBack2", 1, "87", ["browser"]], // 85
      [function(){mgsuite.imp.aioSmartBackForward(+1, false);}, "g.smartForward1", 1, "84", ["browser"]], // 86
      [function(){mgsuite.imp.aioSmartBackForward(+1, true);}, "g.smartForward2", 1, "85", ["browser"]], // 87
      [function(){mgsuite.imp.aioPrint();}, "g.print", 0, "", null], //88
      [function(){mgsuite.imp.aioImageInTab();}, "g.openImageInTab", 0, "", ["browser", "source", "messenger"]], //89
      [function(){mgsuite.imp.aioImageInWindow();}, "g.openImageInWin", 0, "", ["browser", "source", "messenger"]], //90
      [function(){mgsuite.imp.aioDetachTab();}, "g.detachTab", 0, "", ["browser"]], //91
      [function(){mgsuite.imp.aioDetachTabAndDoubleStack();}, "g.detachTabAndDoubleStack", 0, "", ["browser"]], //92
      [function(){mgsuite.imp.aioDoubleStackWindows();}, "g.doubleStack2Windows", 0, "", null], //93
      [function(){mgsuite.imp.aioToggleSidebar();}, "g.toggleSidebar", 0, "", ["browser", "messenger"]], //94
      [function(shiftKey){mgsuite.imp.aioOpenNewWindow(null, shiftKey, false, true);}, "g.openPrivateWindow", 0, "", null], //95
      [function(){mgsuite.imp.aioToggleBookmarksToolbar();}, "g.toggleBookmarksToolbar", 0, "", ["browser"]], //96
      [function(){mgsuite.imp.aioCloseRightTabs();}, "g.closeTabsToTheRight", 0, "", ["browser"]], // 97
      
// Unused legacy actions:
//      [function(){aioCloseLeftTabs(true);}, "g.CloseAllLeftTab", 0, "", null], // 90
//      [function(){mgsuite.imp.aioCloseRightTabs(false);}, "g.CloseRightTab", 0, "", null], // 91
//      [function(){aioCloseLeftTabs(false);}, "g.CloseLeftTabs", 0, "", null], // 92
//      [function(){aioCloseAllTabs(false);}, "g.CloseAllTabs", 0, "", null], // 93
//      [function(){aioHScrollDocument(false,0);}, "g.scrollToLeft", 0, "", null], // 94
//      [function(){aioHScrollDocument(false,1000000);}, "g.scrollToRight", 0, "", null], // 95
//      [function(){aioCScrollDocument(1000000,1000000);}, "g.scrollToCenter", 0, "", null], // 96
//      [function(){aioFullZoomOperation(1);}, "g.FullZoomEnlarge", 0, "", null], // 97
//      [function(){aioFullZoomOperation(2);}, "g.FullZoomReduce", 0, "", null], // 98
//      [function(){aioFullZoomOperation(0);}, "g.FullZoomReset", 0, "", null], // 99
//      [function(){aioOpenAddonManager();}, "g.addOnMgr", 0, "", null] // 100
     ],
     
  aioSchemas: {},
  aioUndoHide: [],
  aioUnique: 0,
  aioStatusMessageTO: null,
  aioClonedData: null,
  showGesturesUrl: mgsuite.const.CHROME_DIR + "show-gestures.html",

  aioStatusMessage: function(msg, timeToClear, append) {
    if (mgsuite.imp.aioStatusMessageTO) {
      clearTimeout(mgsuite.imp.aioStatusMessageTO);
      mgsuite.imp.aioStatusMessageTO = null;
    }
    
    if (!msg && !append) {
      mgsuite.imp.aioClearFauxStatusBar();
    }
    
    if (append) {
      msg = mgsuite.overlay.aioLastStatusMsg + msg;
    }
    
    mgsuite.overlay.aioLastStatusMsg = msg;
    
    var bar = document.getElementById("status-bar");
    var s4eBar = document.getElementById("status4evar-status-bar");
    var addonBar = document.getElementById("addon-bar");
    if ((bar && (bar.hidden || bar.getAttribute('moz-collapsed') == "true")) // SM
        || (s4eBar && s4eBar.getAttribute('collapsed') == "true" && mgsuite.overlay.aioStatusBar.getAttribute('inactive') == "true") // Fx with S4E
        || (mgsuite.overlay.aioStatusBar && mgsuite.overlay.aioStatusBar.nodeName == 'statuspanel' && mgsuite.overlay.aioStatusBar.getAttribute('inactive') == "true" && addonBar && addonBar.getAttribute('collapsed') == "true") // Pale Moon
      ) {
      // create faux status bar if normal status bar is hidden
      mgsuite.imp.aioShowInFauxStatusBar(msg);
    
    } else if (mgsuite.overlay.aioStatusBar) {
      mgsuite.overlay.aioStatusBar.label = msg;
    }
    
    if (timeToClear) {
      mgsuite.imp.aioStatusMessageTO = setTimeout(function(){mgsuite.imp.aioStatusMessage("", 0);}, timeToClear );
    }
  },
  
  aioShowInFauxStatusBar: function(msg) {
    if (!msg) {
      mgsuite.imp.aioClearFauxStatusBar();
      return;
    }
    
    var tooltip = document.getElementById('aioFauxStatusBar');
    
    if (!tooltip) {
      tooltip = document.createElementNS(mgsuite.const.xulNS, 'tooltip');
      tooltip.id = "aioFauxStatusBar";
      tooltip.setAttribute("noautohide", "true");
      tooltip.setAttribute("orient", "vertical");
      tooltip.style.position = 'fixed';
      tooltip.style.bottom = '10px';
      tooltip.style.left = '10px';
      tooltip.style.pointerEvents = 'none';
      mgsuite.overlay.aioContent.appendChild(tooltip);
    }
    
    tooltip.textContent = msg;
    if (tooltip.openPopup == 'function') {
      // openPopup function doesn't exist in Mail
      tooltip.openPopup(null, "after_start", 0, 0, false, false);
    }
  },
  
  aioClearFauxStatusBar: function() {
    var tooltip = document.getElementById('aioFauxStatusBar');
    
    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip);
    }
    mgsuite.overlay.aioLastStatusMsg = "";
  },
  
  aioInitGestTable: function() {
    var i, func, len;
    len = mgsuite.imp.aioActionTable.length;
    if (mgsuite.overlay.aioFirstInit)
       for (i = 0; i < len; ++i) mgsuite.imp.aioActionTable[i][1] = mgsuite.overlay.aioGetStr(mgsuite.imp.aioActionTable[i][1])
    var gestTable = mgsuite.overlay.aioActionString.split("|");
    var funcTable = mgsuite.overlay.aioFuncString.split("|");
    mgsuite.imp.aioGestTable = [];
    for (i = 0; i < gestTable.length; ++i) {
      func = funcTable[i] - 0;
      if (gestTable[i] && func >= 0 && func < len) mgsuite.imp.aioGestTable[gestTable[i]] = func;
    }
  },
  
  aioFireGesture: function(aGesture, shiftKey) {
    var index = mgsuite.imp.aioGestTable[aGesture];
    if (index == null) {
       index = mgsuite.imp.aioGestTable["+" + aGesture.substr(-2)];
       if (index == null)
          index = mgsuite.imp.aioGestTable["+" + aGesture.substr(-3)];
    }
    if (index == null) {
       index = mgsuite.imp.aioGestTable["/" + aGesture];
       if (index == null) mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioUnknownStr + ": " + aGesture, 2000);
       else mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioGetStr("g.disabled") + ": " + mgsuite.imp.aioActionTable[index][1], 2000);
    }
    else
       try {
         var allowedWinTypes = mgsuite.imp.aioActionTable[index][4];
         
         if (allowedWinTypes === null || allowedWinTypes.indexOf(mgsuite.overlay.aioWindowType) >=0) {
           mgsuite.imp.aioStatusMessage(mgsuite.imp.aioActionTable[index][1], 2000);
           mgsuite.imp.aioActionTable[index][0](shiftKey);
         } else {
           mgsuite.imp.aioStatusMessage(mgsuite.imp.aioActionTable[index][1] + " — " + mgsuite.overlay.aioGetStr("g.aborted"), 2000);
         }
       }
       catch(err) {}
    mgsuite.overlay.aioKillGestInProgress();
    mgsuite.overlay.aioDownButton = mgsuite.const.NoB;
  },
  
  
  /*  Gesture actions */
  
  aioBackForward: function(back) {
    if (mgsuite.overlay.aioWindowType == 'messenger') {
      back ? goDoCommand('cmd_goBack') : goDoCommand('cmd_goForward');
    } else {
      if (mgsuite.overlay.aioGestureTab) {
        var history = mgsuite.overlay.aioGestureTab.linkedBrowser.contentWindowAsCPOW.history;
        back ? history.back() : history.forward();
        
      } else {
        back ? BrowserBack() : BrowserForward();
      }
      content.focus();
    }
  },
  
  aioPreviousSelectedTab: function() {
    var lTab;
    if (mgsuite.overlay.aioTabFocusHistory.length < 2) return null;
    var tabId = mgsuite.overlay.aioTabFocusHistory[mgsuite.overlay.aioTabFocusHistory.length - 2].focused;
    for (var i = 0; i < mgsuite.overlay.aioContent.mTabs.length; ++i) {
      lTab = mgsuite.overlay.aioContent.mTabContainer.childNodes[i];
      if (lTab.getAttribute("aioTabId") == tabId) return lTab;
    }
    return null;
  },
  
  aioGoToPreviousSelectedTab: function() {
    var lTab = mgsuite.imp.aioPreviousSelectedTab();
    if (lTab) {
       mgsuite.overlay.aioTabFocusHistory.pop();
       mgsuite.overlay.aioContent.selectedTab = lTab;
    }
  },
  
  
  aioPrint: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
      case "source":
        PrintUtils.print();
        break;
     
      case "messenger":
      case "mailcompose":
        goDoCommand("cmd_print");
        break;
    }
  },
  
  aioPrintPreview: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioIsFx) {
          PrintUtils.printPreview(PrintPreviewListener);
        } else {
          BrowserPrintPreview();
        }
        break;
     
      case "source":
        PrintUtils.printPreview(PrintPreviewListener);
        break;
     
      case "messenger":
      case "mailcompose":
        goDoCommand("cmd_printpreview");
        break;
    }
  },
  
  aioReload: function(skipCache) {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioGestureTab) {
          if (skipCache) {
            mgsuite.overlay.aioGestureTab.linkedBrowser.reloadWithFlags(Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
          } else {
            mgsuite.overlay.aioGestureTab.linkedBrowser.reload();
          }
          
        } else {
          skipCache ? BrowserReloadSkipCache() : BrowserReload();
        }
        break;
  
      case "messenger":
        goDoCommand("cmd_reload");
        break;
  
      case "source":
        ViewSourceReload();
        break;
    }
  },
  
  aioReloadFrame: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioGestureTab) {
          mgsuite.imp.aioReload(false);
          
        } else {
          // reload frame
          mgsuite.overlay.aioSrcEvent.target.ownerDocument.location.reload();
        }
        break;
  
      case "messenger":
      case "source":
        mgsuite.imp.aioReload(false);
        break;
    }
  },
  
  aioStopLoading: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioGestureTab) {
          mgsuite.overlay.aioGestureTab.linkedBrowser.stop();
        } else {
          BrowserStop();
        }
        break;
  
      case "messenger":
        goDoCommand("cmd_stop");
        break;
    }
  },
  
  aioFavoriteURL: function(suffix) {
    var shortcutURL = null;
    var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Components.interfaces.nsINavBookmarksService);
    var keyword = mgsuite.overlay.aioGetStr("g.keywordForGesture") + suffix;
    var shortcutURI = bmsvc.getURIForKeyword(keyword);
    if (shortcutURI) shortcutURL = shortcutURI.spec;
    if (!shortcutURL) {
      alert(mgsuite.overlay.aioGetStr("g.keywordMissing") + " " + keyword);
      return;
    }
    
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        loadURI(shortcutURL);
        break;
      
      default:
        if (mgsuite.overlay.aioIsFx) {
          openNewTabWith(shortcutURL);
        } else {
          openNewTabWindowOrExistingWith(kNewTab, shortcutURL, null, false);
        }
    }
  },
  
  aioIncURL: function(inc) { // derived from MagPie by Ben Goodger
    var currSchema, newValue, newIndex, str, url; 
    var currSpec = mgsuite.overlay.aioContent.selectedBrowser.webNavigation.currentURI.spec;
    for (var i in mgsuite.imp.aioSchemas) {
       if (currSpec.substr(0, i.length) != i) continue;
       currSchema = mgsuite.imp.aioSchemas[i];
       newValue = parseInt(currSpec.substring(currSchema.startIndex, currSchema.endIndex), 10);
       inc > 0 ? ++newValue : --newValue;
       if (newValue < 0) {
          alert(mgsuite.overlay.aioGetStr("noDecrement"));
          return;
       }
       newIndex = newValue.toString();
       str = "";
       for (var j = newIndex.length; j < currSchema.selectedLength; ++j) str += "0";
       str += newIndex;
       url = currSpec.substr(0, currSchema.startIndex) + str + currSpec.substr(currSchema.endIndex);
       mgsuite.imp.aioSchemas[i].endIndex = currSchema.startIndex + str.length;
       mgsuite.overlay.aioContent.selectedBrowser.loadURI(url);
       return;
    }
  
    if (mgsuite.overlay.aioTrustAutoSelect) {
       var RE = /\d+/g;
       var rtn, startIndex = -1, endIndex;
       while ((rtn = RE.exec(currSpec)) != null) {
         startIndex = rtn.index;
         endIndex = startIndex + rtn[0].length;
       }
       if (startIndex == -1) return;
       var key = currSpec.substr(0, startIndex);
       mgsuite.imp.aioSchemas[key] = {startIndex: startIndex, endIndex: endIndex, selectedLength: endIndex - startIndex};
       mgsuite.imp.aioIncURL(inc);
       return;
    }
  
    mgsuite.overlay.aioClearRocker();
    var rv = { };
    openDialog(mgsuite.const.CHROME_DIR + "aioSchemaBuilder.xul", "", "chrome,centerscreen,modal=yes", currSpec, rv);
    if ("key" in rv) {
       mgsuite.imp.aioSchemas[rv.key] = {startIndex: rv.startIndex, endIndex: rv.endIndex, selectedLength: rv.endIndex - rv.startIndex};
       mgsuite.imp.aioIncURL(inc);
    }
  },
  
  // help page that lists all gestures
  aioGesturesPage: function() {
    var tab, browser;
    
    if (!/^about:(blank|newtab|home)/.test(gBrowser.selectedBrowser.currentURI.spec)) {
      tab = mgsuite.imp.aioLinkInTab(mgsuite.imp.showGesturesUrl, false, false);
      browser = gBrowser.getBrowserForTab(tab);
    } else {
      loadURI(mgsuite.imp.showGesturesUrl);
      browser = gBrowser.selectedBrowser;
    }
    
    // create html content
    var imageName;
    const K2 = '<td class="row1" valign="middle" height="30"><span class="forumlink">';
    const K3 = '</span></td><td class="row2" valign="middle"><span class="forumlink">'
    const K4 = '</span></td><td class="row3" valign="middle" align="center">';
    
    function localized(aStr) {
      if (!aStr) {
         imageName = "nomov";
         return "&nbsp;";
      }
      var lStr = ""; imageName = "";
      for (var i = 0; i < aStr.length; ++i)
          if (mgsuite.overlay.aioShortGest[aStr.charAt(i)] == null) {
             imageName = (aStr.charAt(i) == '+') ? "other" : "nomov";
             lStr += aStr.charAt(i);
          }
          else lStr += mgsuite.overlay.aioShortGest[aStr.charAt(i)];
      if (!imageName)
         if (aStr.length < 5) imageName = aStr; else imageName = "other";
      return lStr;
    }
    
    var locGest = mgsuite.overlay.aioGetStr("w.gesture").replace(/\'/g, "&#39;");
    var locFunc = mgsuite.overlay.aioGetStr("w.function").replace(/\'/g, "&#39;");
    var locMove = mgsuite.overlay.aioGetStr("w.move").replace(/\'/g, "&#39;");
    const K1 = '<th width="100" class="thTop" nowrap="nowrap">&nbsp;' + locGest + '&nbsp;</th>';
    const imgURL = '<img src="chrome://mgsuite/content/gest-imgs/';
    
    var divCode = '<div class="buttons">';
    //divCode += '<button onclick="openOptions()">' + mgsuite.overlay.aioGetStr('g.aioOptions') + '</button>';
    divCode += '<button onclick="openHelp(2)">Help</button>';
    divCode += '</div>';
    divCode += '<table width="100%" cellpadding="2" cellspacing="1" class="forumline">';
    divCode += '<tr><th class="thCornerL" height="30" nowrap="nowrap">&nbsp;' + locFunc + '&nbsp;</th>';
    divCode += K1 + '<th width="50" class="thTop" nowrap="nowrap">&nbsp;' + locMove + '&nbsp;</th>';
    divCode += '<th class="thTop" height="30" nowrap="nowrap">&nbsp;' + locFunc + '&nbsp;</th>';
    divCode += K1 + '<th width="50" class="thCornerR" nowrap="nowrap">&nbsp;' + locMove + '&nbsp;</th></tr>';
    var gestTable = mgsuite.overlay.aioActionString.split("|");
    var funcTable = mgsuite.overlay.aioFuncString.split("|");
    var func, actionName;
    var cols = [[], []], colNum = 0, c;
    var splitColAt = Math.ceil(gestTable.length / 2);
    
    for (var i = 0; i < gestTable.length; ++i) {
      if (i == splitColAt) {
        colNum++;
      }
      func = funcTable[i] - 0;
      if (func < 0 || func >= mgsuite.imp.aioActionTable.length) {continue;}
      actionName = mgsuite.imp.aioActionTable[func][1].replace(/\'/g, "&#39;");
      c = K2 + actionName + K3 + localized(gestTable[i]) + K4;
      c += imgURL + imageName + '.png"></td>';
      cols[colNum].push(c);
    }
  
    // insert 2 columns into table
    for (var i=0; i<cols[0].length; i++) {
      divCode += '<tr>';
      divCode += cols[0][i];
      
      if (cols[1][i]) {
        divCode += cols[1][i];
      } else {
        divCode += K2 + "&nbsp;" + K3 + "&nbsp;" + K4;
        divCode += imgURL + 'nomov.png"></td>';
      }
      divCode += '</tr>';
    }
    
    divCode += '</table>';
    
    var title = mgsuite.overlay.aioGetStr("w.gestTable").replace(/\'/g, "&#39;");
    
    browser.messageManager.sendAsyncMessage("MouseGesturesSuite:displayGesturesList", {title: title, content: divCode});
  },
  
  aioCopyURLToClipBoard: function() {
    var lstr = "";
    try {
      var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
      if (!str) return;
      if (mgsuite.util.collectedLinksUrls.length) {
         for (var i = 0; i < mgsuite.util.collectedLinksUrls.length; ++i) {
             if (lstr) lstr += "\r\n";
             lstr += mgsuite.util.collectedLinksUrls[i];
         }
         str.data = lstr;
      }
      else str.data = gBrowser.selectedBrowser.currentURI.spec;
      var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
      if (!trans) return;
      
      // Since data from the web content are copied to the clipboard, the privacy context must be set.
      var sourceWindow = mgsuite.overlay.aioSrcEvent.target.ownerDocument.defaultView;
      
      var privacyContext = sourceWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                                    getInterface(Components.interfaces.nsIWebNavigation).
                                    QueryInterface(Components.interfaces.nsILoadContext);
      if ("init" in trans) trans.init(privacyContext);
      trans.addDataFlavor("text/unicode");
      trans.setTransferData("text/unicode", str, str.data.length * 2);
      var clipId = Components.interfaces.nsIClipboard;
      var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipId);
      if (!clip) return;
      clip.setData(trans, null, clipId.kGlobalClipboard);
    }
    catch(err) {}
  },
  
  aioCopyClipBoardToURLBar: function() {
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
    if (!clip) return;
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return;
    if ("init" in trans) trans.init(null);
    trans.addDataFlavor("text/unicode");
    clip.getData(trans, clip.kGlobalClipboard);
    var data = {}, dataLen = {};
    try {
      trans.getTransferData("text/unicode", data, dataLen);
    }
    catch(err) {
      alert(mgsuite.overlay.aioGetStr("g.clipboardEmpty"));
    }
    if (data) {
       data = data.value.QueryInterface(Components.interfaces.nsISupportsString);
       var url = data.data.substring(0, dataLen.value / 2);
       if (gURLBar) gURLBar.value = url;
       mgsuite.imp.aioLinkInTab(url, false, false);
    }
  },
  
  _aioGetElemsByTagNameForAllFrames: function(frameDoc, tagName) {
    var elsWithTag = [];
    var frames = frameDoc.getElementsByTagName("frame");
    for (var i = 0; i < frames.length; ++ i)
        elsWithTag = elsWithTag.concat(mgsuite.imp._aioGetElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
    frames = frameDoc.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; ++ i)
        elsWithTag = elsWithTag.concat(mgsuite.imp._aioGetElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
    var lEls = frameDoc.getElementsByTagName(tagName);
    for (i = 0; i < lEls.length; ++i) elsWithTag.push(lEls[i]);
    return elsWithTag;
  },
  
  aioNukeFlash: function() {
    var currFlash, height, width, top, next, span, text, view, disp, style;
    var topDocument = mgsuite.overlay.aioSrcEvent.target.ownerDocument.defaultView.top.document;
    var embeds = mgsuite.imp._aioGetElemsByTagNameForAllFrames(topDocument, "embed");
    embeds = embeds.concat(mgsuite.imp._aioGetElemsByTagNameForAllFrames(topDocument, "object"));
    
    for (var i = 0; i < embeds.length; ++i) {
      currFlash = embeds[i];
      if (currFlash.getAttribute("type") != "application/x-shockwave-flash") continue;
      if (currFlash.parentNode.nodeName.toLowerCase() == "object") {
         top = currFlash.parentNode.parentNode; next = currFlash.parentNode;
      }
      else {
         top = currFlash.parentNode; next = currFlash;
      }
      if (next.previousSibling && next.previousSibling.nodeName.toLowerCase() == "span"
          && next.previousSibling.hasAttribute("aioFlash")) continue;
      view = next.ownerDocument.defaultView;
      disp = view.getComputedStyle(next, "").getPropertyValue("display");
      width = currFlash.offsetWidth;
      height = currFlash.offsetHeight;
      
      if (height && width) {
         style = next.getAttribute("style") || "";
         next.setAttribute("style", style + "display:none;");
         span = document.createElementNS(mgsuite.const.xhtmlNS, "span");
         text = document.createTextNode("[" + mgsuite.overlay.aioGetStr("g.clickToView") + "]");
         span.appendChild(text);
         top.insertBefore(span, next);
         span.setAttribute("style", "height:" + (height - 2) + "px;width:" + (width - 2) + "px;border:1px solid black;display:-moz-inline-box;");
         span.setAttribute("aioFlash", disp);
         span.addEventListener("click", mgsuite.imp.aioPlayFlash, true);
      }
    }
  },
  
  aioPlayFlash: function(e) {
    e.currentTarget.removeEventListener("click", mgsuite.imp.aioPlayFlash, true);
    var flashNode = e.currentTarget.nextSibling;
    var disp = e.currentTarget.getAttribute("aioFlash");
    e.currentTarget.parentNode.removeChild(e.currentTarget);
    var style = flashNode.getAttribute("style") || "";
    flashNode.setAttribute("style", style + "display:" + disp + ";");
  },
  
  aioNukeAnything: function() {
    var node = mgsuite.overlay.aioSrcEvent.target;
    if (!node) return;
    var view = node.ownerDocument.defaultView;
    var disp = view.getComputedStyle(node, "").getPropertyValue("display");
    node.setAttribute("aioDisp", "display:" + disp + ";");
    var style = node.getAttribute("style") || "";
    node.setAttribute("style", style + "display:none;");
    mgsuite.imp.aioUndoHide.push(node);
  },
  
  aioUndoNukeAnything: function() {
    try {
      var node = mgsuite.imp.aioUndoHide.pop();
      if (!node || !node.hasAttribute("aioDisp")) return;
      var style = node.getAttribute("style") || "";
      node.setAttribute("style", style + node.getAttribute("aioDisp"));
    }
    catch(err) {}
  },
  
  aioVScrollDocument: function(relativeScroll, aValue) {
    mgsuite.overlay.sendAsyncMessage("MouseGesturesSuite:scrollElement", {relative: relativeScroll, value: aValue});
  },
  
  aioSelectionAsURL: function(reverseBg) {
    var url = mgsuite.util.getSelectedText();
    
    var urlToLoad = mgsuite.util.detectUrl(url);
    
    if (!urlToLoad) {
      // invalid address, do web search instead
      mgsuite.imp.aioSelectionAsSearchTerm(true, reverseBg);
      return;
    }
    
    if (urlToLoad.search(/^(http|https|ftp):\/\//) == -1
        && urlToLoad.indexOf("about:") != 0) {
      // make sure it has some sort of protocol
      urlToLoad = "http://" + urlToLoad;
    }
    
    mgsuite.imp.aioLinkInTab(urlToLoad, false, false, reverseBg);
  },
  
  /**
   * Search for selected text. If no text selected, open search page.
   */
  aioSelectionAsSearchTerm: function(alwaysNewTab, reverseBg) {
    var searchStr = mgsuite.util.getSelectedText();
    
    if (mgsuite.overlay.aioIsFx && mgsuite.overlay.aioWindowType == 'browser') {
      var newWinOrTab = !/^about:(blank|newtab|home)/.test(gBrowser.selectedBrowser.currentURI.spec);
  
      if (searchStr) {
        BrowserSearch.loadSearchFromContext(searchStr);
      } else {
        if (BrowserSearch._loadSearch) {
          BrowserSearch._loadSearch("", newWinOrTab);
        } else { // older Fx
          BrowserSearch.loadSearch("", newWinOrTab);
        }
      }
      
      return;
    }
    
    try {
      // this will not work in Fx
      var openTabPref = mgsuite.overlay.aioPrefRoot.getBoolPref("browser.search.opentabforcontextsearch");
      var loadInBgPref = mgsuite.overlay.aioPrefRoot.getBoolPref("browser.tabs.loadInBackground");
    } catch (err) {};
    
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        var searchBar = BrowserSearch.searchBar;
        if (searchBar) searchBar.value = searchStr;
        
        var newWinOrTab = !/^about:(blank|newtab|home)/.test(gBrowser.selectedBrowser.currentURI.spec);
  
        if (alwaysNewTab) {
          // always force opening in new tab
          mgsuite.overlay.aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", true);
          
          if (reverseBg) {
            mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", !loadInBgPref);
          }
          
          BrowserSearch.loadSearch(searchStr, newWinOrTab);
          
          mgsuite.overlay.aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", openTabPref);
          
          if (reverseBg) {
            mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
          }
          
        } else {
          // may open in tab or window depending on browser prefs
          if (openTabPref && reverseBg) {
            // we can easily control background opening in new tab but not in new window
            mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", !loadInBgPref);
          }
          
          BrowserSearch.loadSearch(searchStr, newWinOrTab);
          
          if (openTabPref && reverseBg) {
            mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
          }
        }
        
        if (!openTabPref && reverseBg) {
          // open in background window - focus on current window
          setTimeout(function() {
            window.focus();
          }, 400);
          setTimeout(function() {
            window.focus();
          }, 800);
        }
        
        break;
     
      case "messenger":
        // in messenger we always open search in foreground tab unless reversed by Shift
        mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", reverseBg);
        
        if (alwaysNewTab) {
          mgsuite.overlay.aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", true);
          MsgOpenSearch(searchStr);
          mgsuite.overlay.aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", openTabPref);
        
        } else {
          // may open in tab or window depending on browser prefs
          MsgOpenSearch(searchStr);
        }
        
        mgsuite.overlay.aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
        
        if (!openTabPref && reverseBg) {
          // open in background window - focus on current window
          setTimeout(function() {
            window.focus();
          }, 400);
          setTimeout(function() {
            window.focus();
          }, 800);
        }
        
        break;
      
      case "source":
      case "mailcompose":
        if (mgsuite.overlay.aioIsFx) {
          openLinkIn("about:blank", "tab", {inBackground: false});
          
          setTimeout(function() {
            var win = Services.wm.getMostRecentWindow("navigator:browser");
            if (win) {
              var bs = win.BrowserSearch;
              if (bs._loadSearch) {
                bs._loadSearch(searchStr, false);
              } else { // older Fx
                bs.loadSearch(searchStr, false);
              }
            }
          }, 500);
          
        } else {
          // SM
          var tabWin = openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, false);
          
          if (tabWin.nodeName && tabWin.nodeName == 'tab') {
            var bs = tabWin.ownerDocument.defaultView.BrowserSearch;
            var searchBar = bs.searchBar;
            if (searchBar) searchBar.value = searchStr;
            bs.loadSearch(searchStr, false);
            
          } else {
            // new window
            tabWin.addEventListener('load', function() {
              var bs = tabWin.BrowserSearch;
              var searchBar = bs.searchBar;
              if (searchBar) searchBar.value = searchStr;
              setTimeout(function() {
                bs.loadSearch(searchStr, false);
              }, 500);
            });
          }
        }
        
        break;
     }
  },
  
  aioZoomEnlarge: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case 'source':
        ZoomManager.enlarge();
        break;
      
      default:
        FullZoom.enlarge();
    }
  },
  
  aioZoomReduce: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case 'source':
        ZoomManager.reduce();
        break;
      
      default:
        FullZoom.reduce();
    }
  },
  
  aioZoomReset: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case 'source':
        ZoomManager.reset();
        break;
      
      default:
        FullZoom.reset();
    }
  },
  
  aioSetImgSize: function(aEnlarge, aMixed) {
    var img = mgsuite.util.collectedImg;
  
    if (!img) {
      if (!aMixed) return;
      if (aEnlarge) mgsuite.imp.aioZoomEnlarge();
        else mgsuite.imp.aioZoomReduce();
      return;
    }
    var imgStr = img.getAttribute("aioImgSize");
    var imgTab;
    
    if (!imgStr) {
      var view = img.ownerDocument.defaultView;
      // get actual img w & h
      var w = parseInt(view.getComputedStyle(img).getPropertyValue("width"));
      var h = parseInt(view.getComputedStyle(img).getPropertyValue("height"));
      imgTab = [];
      imgTab[0] = w; imgTab[1] = h; imgTab[2] = 1;
      
      img.aioOldStyles = {
        width: img.style.getPropertyValue("width"),
        height: img.style.getPropertyValue("height"),
        maxWidth: img.style.getPropertyValue("max-width"),
        maxHeight: img.style.getPropertyValue("max-width"),
        minWidth: img.style.getPropertyValue("min-width"),
        minHeight: img.style.getPropertyValue("min-height"),
      };
      
      if (mgsuite.overlay.aioCrispResize) {
        img.aioOldStyles.imageRendering = img.style.getPropertyValue("image-rendering")
      }
      
    } else {
      imgTab = imgStr.split("|");
    }
    
    
    imgTab[2] *= aEnlarge ? 2 : 0.5;
    img.setAttribute("aioImgSize", imgTab.join("|"));
    w = Math.round(imgTab[0] * imgTab[2]); h = Math.round(imgTab[1] * imgTab[2]);
    
    if (w && h && w != imgTab[0] && h != imgTab[1]) {
      img.style.setProperty("max-width","none", "important");
      img.style.setProperty("max-height","none", "important");
      img.style.setProperty("min-width","0", "important");
      img.style.setProperty("min-height","0", "important");
      img.style.width = w + "px";
      img.style.height = h + "px";
      
      if (mgsuite.overlay.aioCrispResize) {
        if (CSS.supports("image-rendering","-moz-crisp-edges")) {
          img.style.setProperty("image-rendering", "-moz-crisp-edges", "important");
        } else if (CSS.supports("image-rendering","crisp-edges")) {
          img.style.setProperty("image-rendering", "crisp-edges", "important");
        } else if (CSS.supports("image-rendering","optimize-contrast")) {
          img.style.setProperty("image-rendering", "optimize-contrast", "important");
        }
      }
    }
    else {
      mgsuite.imp.aioResetImgSize(false);
    }
  },
  
  aioResetImgSize: function(aMixed) {
    var img = mgsuite.util.collectedImg;
    
    if (!img) {
       if (!aMixed) return;
       mgsuite.imp.aioZoomReset();
       return;
    }
    var imgStr = img.getAttribute("aioImgSize");
    if (!imgStr) return;
    
    img.removeAttribute("aioImgSize");
    
    if (img.aioOldStyles) {
      // restore size
      img.style.setProperty("width", img.aioOldStyles.width, "");
      img.style.setProperty("height", img.aioOldStyles.height, "");
      
      // restore max/min styles
      img.style.setProperty("max-width", img.aioOldStyles.maxWidth, "");
      img.style.setProperty("max-height", img.aioOldStyles.maxHeight, "");
      img.style.setProperty("min-width", img.aioOldStyles.minWidth, "");
      img.style.setProperty("min-height", img.aioOldStyles.minHeight, "");
      
      if (typeof img.aioOldStyles.imageRendering != 'undefined') {
        img.style.setProperty("image-rendering", img.aioOldStyles.imageRendering, "");
      }
      delete img.aioOldStyles;
    }
  },
  
  aioSaveImageAs: function() {
    var img = mgsuite.util.collectedImg;
    if (!img) return;
    
    if (mgsuite.overlay.aioFxV18) saveImageURL(img.src, null, "SaveImageTitle", false, false, img.ownerDocument.documentURIObject, img.ownerDocument);
    else 
       saveImageURL(img.src, null, "SaveImageTitle", false,
         false, img.ownerDocument.documentURIObject);
  
  },
  
  aioCloseCurrTab: function(lastTabClosesWindow) {
    if (mgsuite.imp.aioClosePrintPreview()) {
      return;
    }
    
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioContent.mTabContainer.childNodes.length > 1 || !lastTabClosesWindow) {
          if (mgsuite.overlay.aioGestureTab) {
            mgsuite.overlay.aioContent.removeTab(mgsuite.overlay.aioGestureTab);
          } else {
            mgsuite.overlay.aioContent.removeCurrentTab();
          }
        } else if (typeof(BrowserCloseWindow) == "function") {
          BrowserCloseWindow();
        } else {
          closeWindow(true);
        }
        break;
      
      case "messenger":
        var tabmail = window.top.document.getElementById("tabmail");
        if (tabmail && tabmail.tabContainer.childNodes.length > 1) {
            tabmail.removeCurrentTab();
        } else {
          if (lastTabClosesWindow) {
            closeWindow(true);
          }
        }
        break;
      
      case "mailcompose":
        if (lastTabClosesWindow) {
          goDoCommand('cmd_close');
        }
        break;
      
      default:
        closeWindow(true);
    }
  },
  
  aioUndoCloseTab: function() {
    try { // Fx
      undoCloseTab();
    }
    catch (e) { // SM
      gBrowser.undoCloseTab(0);
    }
  },
  
  aioGotoLastTab: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        mgsuite.overlay.aioContent.selectedTab = mgsuite.overlay.aioContent.mTabContainer.childNodes[mgsuite.overlay.aioContent.mTabContainer.childNodes.length - 1];
        break;
      
      case "messenger":
        var tabmail = GetTabMail();
        
        if (tabmail) {
          tabmail.tabContainer.selectedIndex = tabmail.tabContainer.childNodes.length - 1;
        }
        break;
    }
  },
  
  aioRemoveAllTabsBut: function() {
    if (mgsuite.overlay.aioWindowType == 'browser') {
      gBrowser.removeAllTabsBut(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab : mgsuite.overlay.aioContent.mCurrentTab);
    }
  },
  
  _aioIsRTL: function() {
    var chromedir;
    try {
      var pref = Components.classes["@mozilla.org/preferences-service;1"]
          .getService(Components.interfaces.nsIPrefBranch);
      var locale = pref.getCharPref("general.useragent.locale");
      chromedir = pref.getCharPref("intl.uidirection." + locale);
    } catch(e) {}
    
    return chromedir == "rtl";
  },
  
  aioCloseRightTabs: function() {
    var tab = mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab : mgsuite.overlay.aioContent.mCurrentTab;
    
    if (typeof gBrowser.removeTabsToTheEndFrom == 'function') {
      gBrowser.removeTabsToTheEndFrom(tab); // Fx
      
    } else {
      if (mgsuite.imp._aioIsRTL()) {
        mgsuite.imp._aioCloseTabsBefore(tab);
      } else {
        mgsuite.imp._aioCloseTabsAfter(tab);
      }
    }
  },
  
  _aioCloseTabsBefore: function(tab) {
    var tabs = gBrowser.tabContainer.childNodes;
    var i;
    for( i=tabs.length-1; tabs[i] != tab; i--) {}
    for (i--; i>=0; i--) {
      if(!tabs[i].pinned){
        gBrowser.removeTab(tabs[i]);
      }
    }
  },
  
  _aioCloseTabsAfter: function(tab) {
    var tabs = gBrowser.tabContainer.childNodes;
    for (var i=tabs.length-1; tabs[i] != tab; i--) {
      if(!tabs[i].pinned) {
        gBrowser.removeTab(tabs[i]);
      }
    }
  },
  
  
  aioGetReferrer: function() {
    try {
      var refURL = mgsuite.overlay.aioSrcEvent.target.ownerDocument.location.href;
      var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService);
      if (refURL) return ioService.newURI(refURL, null, null);
    }
    catch (e) {}
    return null;
  },
  
  /**
   * @param {string} url
   * @param {boolean} userPref Whether to respect pref "Switch to new tabs
   * from opened links" in tabbed browsing preferences
   * @param {boolean} bg Whether to open in background tab 
   * @param {boolean} [reverseBg] Whether to reverse final background setting
   * @returns {object|null} New tab if invoked from a browser window
   */
  aioLinkInTab: function(url, usePref, bg, reverseBg) {
    url = mgsuite.imp.aioSanitizeUrl(url);
    
    if (mgsuite.overlay.aioWindowType == "browser") {
      var tab = mgsuite.overlay.aioContent.addTab(url, mgsuite.imp.aioGetReferrer());
      var loadInBg = (usePref && (mgsuite.overlay.aioPrefRoot.getBoolPref("browser.tabs.loadInBackground") != bg)) || (!usePref && bg);
      
      if (reverseBg) {
        loadInBg = !loadInBg;
      }
      
      if (!loadInBg) mgsuite.overlay.aioContent.selectedTab = tab;
      return tab;
    
    } else {
      if (reverseBg) {
        bg = !bg;
      }
      
      if (mgsuite.overlay.aioIsFx) {
        openNewTabWith(url);
      } else {
        openNewTabWindowOrExistingWith(kNewTab, url, null, !!bg);
      }
      return null;
    }
  },
  
  aioSanitizeUrl: function(url) {
      if (url.indexOf("view-source:") == 0) {
        url = url.substr(12);
      }
      return url;
  },
  
  aioDupTab: function(reverseBg) {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        var url = mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.currentURI.spec : gBrowser.selectedBrowser.currentURI.spec;
        mgsuite.imp.aioLinkInTab(url, true, false, reverseBg);
        break;
      
      case "messenger":
        MsgOpenNewTabForMessage();
        break;
      
    }
  },
  
  aioOpenInNewTab: function(bg) {
    var openLink = mgsuite.overlay.aioOpenLinkInNew;
    
    if (mgsuite.overlay.aioGestureTab) {
      // always open blank tab when gesture initiated on tab
      openLink = false;
    }
    
    if (openLink && mgsuite.util.collectedLinksUrls.length) {
      mgsuite.imp.aioLinkInTab(mgsuite.util.collectedLinksUrls[0], false, bg);
    }
    else {
      if (mgsuite.overlay.aioWindowType == "browser") {
        if (mgsuite.overlay.aioGestureTab) {
          // open new tab next to selected tab
          var selectedTabPos = mgsuite.overlay.aioContent.getTabIndex ? mgsuite.overlay.aioContent.getTabIndex(mgsuite.overlay.aioGestureTab) : mgsuite.overlay.aioGestureTab._tPos;
        }
        
        if (!bg) {
          if (mgsuite.overlay.aioIsRocker && !mgsuite.overlay.aioGestureTab && mgsuite.overlay.aioSrcEvent) {
            // prevent selection from staying in unfinished state
            mgsuite.imp._aioSendMouseUpEvent(mgsuite.overlay.aioSrcEvent);
          }
  
          BrowserOpenTab();
          if (mgsuite.overlay.aioGestureTab) {
            mgsuite.overlay.aioContent.moveTabTo(mgsuite.overlay.aioContent.mCurrentTab, selectedTabPos + 1);
          
            if (mgsuite.overlay.aioIsRocker && mgsuite.overlay.aioSrcEvent && mgsuite.overlay.aioSrcEvent.button == aioLMB) {
              setTimeout(function() {
                mgsuite.overlay.aioContent.mTabContainer.selectedIndex = selectedTabPos + 1;
              }, 100);
            }
          }
          
        } else {
          var newTab = mgsuite.imp.aioLinkInTab("about:blank", false, true);
          if (mgsuite.overlay.aioGestureTab) {
            mgsuite.overlay.aioContent.moveTabTo(newTab, selectedTabPos + 1);
          }
        }
      
      } else {
        if (mgsuite.overlay.aioIsFx) {
          openNewTabWith("about:blank");
        } else {
          openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, !!bg);
        }
      }
    }
  },
  
  aioLinksInTabs: function() {
    if (mgsuite.overlay.aioWindowType == "browser") {
      for (var i = 0; i < mgsuite.util.collectedLinksUrls.length; ++i) {
        mgsuite.overlay.aioContent.addTab(mgsuite.imp.aioSanitizeUrl(mgsuite.util.collectedLinksUrls[i]), mgsuite.imp.aioGetReferrer());
      }
    
    } else {
      if (mgsuite.util.collectedLinksUrls.length > 0) {
        if (mgsuite.overlay.aioIsFx) {
          openNewTabWith(mgsuite.imp.aioSanitizeUrl(mgsuite.util.collectedLinksUrls[0]));
        } else {
          openNewTabWindowOrExistingWith(kNewTab, mgsuite.imp.aioSanitizeUrl(mgsuite.util.collectedLinksUrls[0]), null, false);
        }
        
        var links = [];
        for (var i = 1; i < mgsuite.util.collectedLinksUrls.length; ++i) {
          links.push(mgsuite.imp.aioSanitizeUrl(mgsuite.util.collectedLinksUrls[i]));
        }
        
        setTimeout(function() {
          for (var i = 0; i < links.length; ++i) {
            if (mgsuite.overlay.aioIsFx) {
              openNewTabWith(links[i]);
            } else {
              openNewTabWindowOrExistingWith(kNewTab, links[i], null, false);
            }
          }
        }, 500);
      }
    }
  },
  
  aioLinksInFiles: function() {
    var hRefLC, dontAskBefore;
    try {dontAskBefore = mgsuite.overlay.aioPrefRoot.getBoolPref("browser.download.useDownloadDir");}
    catch(err) {dontAskBefore = false;}
    for (var i = 0; i < mgsuite.util.collectedLinks.length; ++i) {
      hRefLC = mgsuite.util.collectedLinksUrls[i].toLowerCase();
      if (hRefLC.substr(0, 7) != "mailto:" && hRefLC.substr(0, 11) != "javascript:" &&
          hRefLC.substr(0, 5) != "news:" && hRefLC.substr(0, 6) != "snews:")
          if (mgsuite.overlay.aioFxV18) saveURL(mgsuite.util.collectedLinksUrls[i], mgsuite.tooltip.aioGetTextForTitle(mgsuite.util.collectedLinks[i]), null, true, dontAskBefore, mgsuite.util.collectedLinks[i].ownerDocument.documentURIObject, mgsuite.util.collectedLinks[i].ownerDocument);
         
          else saveURL(mgsuite.util.collectedLinksUrls[i], mgsuite.tooltip.aioGetTextForTitle(mgsuite.util.collectedLinks[i]), null, true, dontAskBefore);
  
    }
  },
  
  aioNewWindow: function(url, flag, noSanitize) {
    if (!noSanitize) url = mgsuite.imp.aioSanitizeUrl(url);
    
    var chromeURL = mgsuite.overlay.aioIsFx ? "chrome://browser/content/" : "chrome://navigator/content/";
    
    if (gBrowser.selectedBrowser.contentDocumentAsCPOW) {
      var charsetArg = "charset=" + gBrowser.selectedBrowser.contentDocumentAsCPOW.characterSet;
      return window.openDialog(chromeURL, "_blank", "chrome,all,dialog=no" + flag, url, charsetArg);
    }
    return window.openDialog(chromeURL, "_blank", "chrome,all,dialog=no" + flag, url);
  },
  
  aioLinksInWindows: function() {
    if (!mgsuite.util.collectedLinksUrls.length) return;
    if (mgsuite.overlay.aioSingleNewWindow) {
      var win = mgsuite.imp.aioNewWindow(mgsuite.util.collectedLinksUrls[0], "");
      
      var gestureLinks = [];
      for (var i = 1; i < mgsuite.util.collectedLinksUrls.length; ++i) {
        gestureLinks.push(mgsuite.util.collectedLinksUrls[i]);
      }
      
      win.addEventListener("load", function () {
        setTimeout(function() {
          for (var i = 0; i < gestureLinks.length; ++i) {
            win.gBrowser.addTab(mgsuite.imp.aioSanitizeUrl(gestureLinks[i]));
          }
        }, 100);
      }, true);
    }
    else
       for (var i = 0; i < mgsuite.util.collectedLinksUrls.length; ++i) {
          mgsuite.imp.aioNewWindow(mgsuite.imp.aioSanitizeUrl(mgsuite.util.collectedLinksUrls[i]), "");
       }
  },
  
  aioSetToNormalZ: function(aWindow) {
    window.focus();
    var treeowner = aWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem).treeOwner;
    var xulwin = treeowner.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIXULWindow);
    xulwin.zLevel = xulwin.normalZ;
  },
  
  /**
   * @param {?string} url URL to open, if null then URL will be detected from the underlying
   * link or image.
   * @param {boolean} background
   * @param {boolean} [noSanitize]
   * @param {boolean} [priv] indicates opening private window
   */
  aioOpenNewWindow: function(url, background, noSanitize, priv) {
    var flags = (background && mgsuite.overlay.aioIsWin) ? ",alwaysLowered" : "";
    
    if (priv) {
      flags += ",private";
    }
    
    if (url === null) {
      if (mgsuite.overlay.aioOpenLinkInNew && mgsuite.util.collectedLinksUrls.length) {
         url = mgsuite.util.collectedLinksUrls[0];
      }
      else {
         url = "";
      }    
    }
    
    if (url == "" && priv) {
      url = "about:privatebrowsing";
    }
    
    var win = mgsuite.imp.aioNewWindow(url, flags, noSanitize);
    
    if (background) {
      if (mgsuite.overlay.aioIsWin) {
        setTimeout(function(a){mgsuite.imp.aioSetToNormalZ(a);}, 500, win);
      } else {
        win.addEventListener('load', function() {
          setTimeout(function() {
            window.focus();
          }, 400);
          setTimeout(function() {
            window.focus();
          }, 800);
        }, true);
      }
    
    } else if (priv && url == "about:privatebrowsing") {
      win.addEventListener('load', function() {
        setTimeout(function() {
          var inp = win.document.getAnonymousElementByAttribute(win.document.getElementById('urlbar'), 'anonid', 'input');
          inp.value = '';
          inp.focus();
        }, 400);
      });
    }
  },
  
  aioDupWindow: function(background) {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
      case "source":
        var url = mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.currentURI.spec : gBrowser.selectedBrowser.currentURI.spec;
        
        mgsuite.imp.aioOpenNewWindow(url, background, true);
        break;
      
      case "messenger":
        MsgOpenNewWindowForMessage();
        break;
    }
  },
  
  aioCloseWindow: function() {
    if (mgsuite.imp.aioClosePrintPreview()) {
      return;
    }
    
    switch (mgsuite.overlay.aioWindowType) {
      case "mailcompose":
        goDoCommand('cmd_close');
        break;
      
      default:
      if ("BrowserTryToCloseWindow" in window)
          window.setTimeout(function() { BrowserTryToCloseWindow(); }, 10);
        else
          window.setTimeout(function() { window.close(); }, 10);      
    }
  },
  
  // open link in new window and double stack
  aioDoubleWin: function() {
    var link = mgsuite.util.collectedLinksUrls.length ? mgsuite.util.collectedLinksUrls[0] : "about:blank";
    window.moveTo(screen.availLeft, screen.availTop);
    
    if (mgsuite.overlay.aioIsWin) {
      // only on Win screen.availWidth & screen.availHeight are correct
      var win = mgsuite.imp.aioNewWindow(link, "");
      window.resizeTo(screen.availWidth / 2, screen.availHeight);
      win.moveTo(screen.availWidth / 2 + screen.availLeft, screen.availTop);
      win.resizeTo(screen.availWidth / 2, screen.availHeight);
     
    } else {
      var win = mgsuite.imp.aioNewWindow(link, "top=" + screen.availTop + ",left=" + screen.availLeft + ",outerWidth=" + screen.availWidth + ",outerHeight=" + screen.availHeight);
      
      var shift = 5; // prevent overlapping on linux
  
      win.addEventListener("load", function () {
        win.resizeTo(win.outerWidth / 2 - shift, win.outerHeight);
        setTimeout(function() {
          window.resizeTo(win.outerWidth, win.outerHeight);
          win.moveTo(win.outerWidth + screen.availLeft + shift, screen.availTop);
        }, 100);
      }, true);
    }
  },
  
  aioNextPrevLink: function(next) { // submitted by Christian Kruse
    if (next && document.getElementById("nextPleasePopupMenu")) {
       document.getElementById("nextPleasePopupMenu").doCommand();
       return;
    }
    if (!next && document.getElementById("prevPleasePopupMenu")) {
       document.getElementById("prevPleasePopupMenu").doCommand();
       return;
    }
    var re = [];
    var relStr = next ? "next" : "prev" ;
    var doc = mgsuite.overlay.aioSrcEvent.target.ownerDocument;
    var links = doc.getElementsByTagName("link");
    var imgElems;
    for (var i = 0; i < links.length; ++i)
      if (links[i].getAttribute("rel") && links[i].getAttribute("rel").toLowerCase() == relStr)
         if (links[i].href) {loadURI(links[i].href); return;}
    if (!mgsuite.overlay.aioNextsString) return;
    var nextArray = next ? mgsuite.overlay.aioNextsString.split("|") : mgsuite.overlay.aioPrevsString.split("|");
    for (var j = 0; j < nextArray.length; ++j)
       re[j] = new RegExp(nextArray[j], "i");
    links = doc.links;
    for (var j = 0; j < re.length; ++j)
      for (var i = 0; i < links.length; ++i) // search for exact match
        if (links[i].textContent && links[i].textContent.search(re[j]) != -1 &&
            nextArray[j].length == links[i].textContent.length && links[i].href) {
           loadURI(links[i].href);
           return;
        }
    for (var j = 0; j < re.length; ++j)
      for (var i = 0; i < links.length; ++i) { // search for partial match
        if (links[i].textContent && links[i].textContent.search(re[j]) != -1 && links[i].href) {
           loadURI(links[i].href);
           return;
        }
        imgElems = links[i].getElementsByTagName("img"); // Is it an image tag?
        if (imgElems.length > 0 && imgElems[0].src && imgElems[0].src.search(re[j]) != -1 && links[i].href) {
           loadURI(links[i].href);
           return;
        }
      }
  },
  
  aioSmartBackForward: function(aRwnd, aCurrDomainEndPoint) { // derived from SHIMODA "Piro" Hiroshi Rewind/Fastforward buttons
    var webNav = getWebNavigation();
    var sessionH = webNav.sessionHistory;
    var lURI = sessionH.getEntryAtIndex(sessionH.index, false).URI;
    var c_host = lURI ? lURI.host : null ;
    var check = (aRwnd == -1) ? function(aInd) {return aInd >= 0;} : function(aInd) {return aInd < sessionH.count;}
    var start = sessionH.index + aRwnd;
    var t_host;
    for (var i = start; check(i); i += aRwnd) {
       lURI  = sessionH.getEntryAtIndex(i, false).URI;
       t_host = lURI ? lURI.host : null ;
       if ((c_host && !t_host) || (!c_host && t_host) || (c_host != t_host)) {
          if (aCurrDomainEndPoint) {
             if (i == start) {
                c_host = t_host;
                continue;
             }
             i -= aRwnd;
          }
      webNav.gotoIndex(i);
          return;
       }
    }
    webNav.gotoIndex((aRwnd == -1) ? 0 : sessionH.count - 1 );
  },
  
  aioFastForward: function() {
    var sessionH = getWebNavigation().sessionHistory;
    if (sessionH.index < 0 || sessionH.count <= 0) return; // Firefox bug
    if (sessionH.index + 1 < sessionH.count) BrowserForward();
    else mgsuite.imp.aioNextPrevLink(true);
  },
  
  aioHomePage: function() {
    if (mgsuite.overlay.aioIsFx) {
      
      switch (mgsuite.overlay.aioWindowType) {
        case "browser":
          var url = gHomeButton.getHomePage();
          if (mgsuite.overlay.aioGoUpInNewTab && !/^about:(blank|newtab|home)/.test(gBrowser.selectedBrowser.currentURI.spec)) {
            mgsuite.imp.aioLinkInTab(url, false, false);
          } else {
            loadURI(url);
          }
  
          break;
        
        default:
          openLinkIn("about:blank", "tab", {inBackground: false});
          
          setTimeout(function() {
            var win = Services.wm.getMostRecentWindow("navigator:browser");
            if (win) {
              win.BrowserHome();
            }
          }, 500);
      }
      
    } else {
      // SM
      switch (mgsuite.overlay.aioWindowType) {
        case "browser":
          var homePage = getHomePage();
          var where = (mgsuite.overlay.aioGoUpInNewTab && !/^about:(blank|newtab|home)/.test(gBrowser.selectedBrowser.currentURI.spec)) ? 'tab' : 'current';
          openUILinkArrayIn(homePage, where);
          
          break;
        
        default:    
          var tabWin = openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, false);
          
          if (tabWin.nodeName && tabWin.nodeName == 'tab') {
            var win = tabWin.ownerDocument.defaultView;
            var homePage = win.getHomePage();
            win.openUILinkArrayIn(homePage, 'current');
            
          } else {
            // new window
            tabWin.addEventListener('load', function() {
              setTimeout(function() {
                var homePage = tabWin.getHomePage();
                tabWin.openUILinkArrayIn(homePage, 'current');
              }, 250);
            });
          }
      }
    }
  },
  
  aioUpDir: function() { // from Stephen Clavering's GoUp
    function getUp(url) {
      var origUrl = url;
      // trim filename (this makes subdriectory digging easier)
      var matches = url.match(/(^.*\/)(.*)/);
      if (!matches) return ""; //only fails if "url" has no /'s
      url = matches[1];
      if (url != origUrl && !/(index|main)\.(php\d?|html?)/i.test(url)) return url;
      // dig through subdirs
      matches = url.match(/^([^\/]*?:\/\/.*\/)[^\/]+?\//);
      if (matches) return matches[1];
      // we've reach (ht|f)tp://foo.com/, climb up through subdomains
      // split into protocol and domain
      matches = url.match(/([^:]*:\/\/)?(.*)/);
      var protocol = matches[1];
      var domain = matches[2];
      matches = domain.match(/^[^\.]*\.(.*)/);
      if (matches) return (protocol + matches[1]);
      // nothing found
      return "";
    }
    var url = getUp(gBrowser.selectedBrowser.currentURI.spec);
    if (!url) return;
    if (mgsuite.overlay.aioGoUpInNewTab) mgsuite.imp.aioLinkInTab(url, false, false);
    else loadURI(url);
  },
  
  aioRestMaxWin: function() {
    if (window.fullScreen) {
      window.fullScreen = false;
      return;
    }
    
    if (window.windowState == STATE_MAXIMIZED) window.restore();
    else window.maximize();
   },
  
  aioFullScreen: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case 'browser':
        BrowserFullScreen();
        break;
      
      default:
        mgsuite.imp.aioRestMaxWin();
    }
  },
  
  aioDebugProps: function(obj) {
    var s="";
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] != "function") {
        s += key + "=" + obj[key] + "\n";
      }
    }
    
    alert(s);
  },
  
  aioPageInfo: function() {
    BrowserPageInfo(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.contentWindowAsCPOW.document : null);
  },
  
  aioFrameInfo: function() {
    var targetDoc = mgsuite.overlay.aioSrcEvent.target.ownerDocument;
    if (targetDoc.defaultView.frameElement) BrowserPageInfo(targetDoc); // it's a frame
    else BrowserPageInfo(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.contentWindowAsCPOW.document : null);
  },
  
  aioShowHideStatusBar: function() {
    var bar = document.getElementById("status4evar-status-bar");
    if (bar) {
      bar.collapsed = !bar.collapsed;
      return;
    }
    
    var bar = document.getElementById("ctraddon_addon-bar");
    if (bar) {
      bar.collapsed = !bar.collapsed;
      return;
    }
    
    var bar = document.getElementById("addon-bar");
    if (bar) {
      bar.collapsed = !bar.collapsed;
      return;
    }
    
    var bar = document.getElementById("status-bar");
    if (bar) {
      bar.hidden = !bar.hidden;
      return;
    }
  },
  
  aioToggleBookmarksToolbar: function() {
    var bar = document.getElementById("PersonalToolbar");
    if (bar) {
      if (mgsuite.overlay.aioIsFx) {
        window.setToolbarVisibility(bar, bar.collapsed);
      } else {
        goToggleToolbar('PersonalToolbar');
      }
    }
  },
  
  aioViewSource: function(frame) {
    if (mgsuite.overlay.aioWindowType == "messenger") {
      goDoCommand("cmd_viewPageSource");
      
    } else {
      if (frame) {
        BrowserViewSourceOfDocument(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.contentWindowAsCPOW.document : mgsuite.overlay.aioSrcEvent.target.ownerDocument);
      } else {
        BrowserViewSourceOfDocument(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.contentWindowAsCPOW.document : gBrowser.selectedBrowser.contentWindowAsCPOW);
      }
    }
  },
  
  aioViewCookies: function() {
    var cookieStr = "";
    var cookies = mgsuite.imp._aioGetDomainCookies(gBrowser.selectedBrowser.contentDocumentAsCPOW);
    
    if (cookies.length) {
      for (var i=0; i<cookies.length; i++) {
        var cookie = cookies[i];
        cookieStr += cookie.host + ": " + cookie.name + "=" + cookie.value + "\n";
      }
      
      alert(mgsuite.overlay.aioGetStr("cookies") + "\n\n" + cookieStr);
    
    } else {
      alert(mgsuite.overlay.aioGetStr("noCookies"));
    }
  },
  
  aioDeleteCookies: function() {
    var cookies = mgsuite.imp._aioGetDomainCookies(gBrowser.selectedBrowser.contentDocumentAsCPOW);
    if (!cookies.length) {
      alert(mgsuite.overlay.aioGetStr("noCookies"));
      return;
    }
    
    var confMsg = mgsuite.overlay.aioGetStr("deleteCookies").replace("%", cookies.length);
    
    if (!confirm(confMsg)) {
      return;
    }
    
    var cookie;
    for (var i=0; i<cookies.length; i++) {
      cookie = cookies[i];
      Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).remove(cookie.host, cookie.name, cookie.path, false);
    }
    
    mgsuite.imp.aioStatusMessage(mgsuite.overlay.aioGetStr("cookiesDeleted"), 4000);
  },
  
  // Get all cookies in domain of given document
  _aioGetDomainCookies: function(doc) {
    var allCookies = [];
    var host = doc.location.hostname;
    var path = "/";
    var cookie, cookieHost, cookiePath;
  
    var cookieEnumeration = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).enumerator;
    
    // Loop through the cookies and filter
    while(cookieEnumeration.hasMoreElements()) {
      cookie = cookieEnumeration.getNext().QueryInterface(Components.interfaces.nsICookie2);
      
      cookieHost = cookie.host;
      cookiePath = cookie.path;
  
      // If there is a host and path for this cookie
      if(cookieHost && cookiePath)
      {
        if(cookieHost.charAt(0) == ".")
        {
          cookieHost = cookieHost.substring(1);
        }
  
        // If the host and cookie host and path and cookie path match
        if((host == cookieHost || new RegExp("." + cookieHost + "$").test(host)) && (path == cookiePath || cookiePath.indexOf(path) === 0))
        {
          allCookies.push(cookie);
        }
      }
    }
    
    // sort
    allCookies.sort(function(a, b) {
      var s1 = a.host + a.name;
      var s2 = b.host + b.name;
      
      if (s1 > s2) {
        return 1;
      } else if (s1 < s2) {
        return -1
      } else {
        return 0;
      }
    })
    
    return allCookies;
  },
  
  aioBookmarkCurrentPage: function() {
    PlacesCommandHook.bookmarkCurrentPage(true, PlacesUtils.bookmarksMenuFolderId);
  },
  
  aioMetaInfo: function() {
    var metas, metastr, mymeta;
    metas = gBrowser.selectedBrowser.contentDocumentAsCPOW.getElementsByTagName("meta");
    if (metas.length) {
      metastr = mgsuite.overlay.aioGetStr("meta") + "\n\n";
      for (var i = 0; i < metas.length; ++i) {
        mymeta = metas.item(i);
        metastr += "<META ";
        if (mymeta.name) metastr += "name=\"" + mymeta.name + "\" ";
        if (mymeta.httpEquiv) metastr+= "http-equiv=\"" + mymeta.httpEquiv + "\" ";
        if (mymeta.content) metastr += "content=\"" + mymeta.content + "\" ";
        if (mymeta.scheme) metastr += "scheme=\"" + mymeta.scheme + "\" ";
        metastr += ">\n";
      }
      alert(metastr);
    }
    else alert(mgsuite.overlay.aioGetStr("noMeta"));
  },
  
  aioActionOnPage: function(caseNb) { // code by Ben Basson aka Cusser
    var service, serviceDomain;
    switch(caseNb) {
      case 0: service = "http://validator.w3.org/check?uri=";
              serviceDomain = "validator.w3.org";
              break;
      case 1: service = mgsuite.overlay.aioGetStr("g.translateURL");
              serviceDomain = "translate.google.com";
    }
    var targetURI = getWebNavigation().currentURI.spec; 
    if (targetURI.indexOf(serviceDomain) >= 0) BrowserReload(); // already activated
    else loadURI(encodeURI(service + targetURI));
  },
  
  aioOpenAioOptions: function() {
    window.openDialog(mgsuite.const.CHROME_DIR + "pref/aioOptions.xul", "", "chrome,dialog,modal,resizable");
  },
  
  aioOpenBookmarksManager: function() {
    if (mgsuite.overlay.aioIsFx) {
      PlacesCommandHook.showPlacesOrganizer('AllBookmarks');
    } else {
      toOpenWindowByType("bookmarks:manager",
        "chrome://communicator/content/bookmarks/bookmarksManager.xul");
    }
  },
  
  aioOpenDownloadManager: function() {
    if (mgsuite.overlay.aioIsFx) {
      BrowserDownloadsUI();
    } else {
      toOpenWindowByType("Download:Manager",
                              "chrome://communicator/content/downloads/downloadmanager.xul",
                              "chrome,dialog=no,resizable");
    }
  },
  
  aioImageInWindow: function() {
     if (mgsuite.util.collectedImgUrl) mgsuite.imp.aioNewWindow(mgsuite.util.collectedImgUrl);
  },
  
  aioImageInTab: function() {
     if (mgsuite.util.collectedImgUrl) mgsuite.imp.aioLinkInTab(mgsuite.util.collectedImgUrl, false, false);
  },
  
  aioSwitchTab: function(advanceBy) {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        mgsuite.overlay.aioContent.mTabContainer.advanceSelectedTab(advanceBy, true);
        break;
      
      case "messenger":
        var tabmail = GetTabMail();
        
        if (tabmail) {
          var selIndex = tabmail.tabContainer.selectedIndex + advanceBy;
          
          if (selIndex >= tabmail.tabContainer.childNodes.length) {
            selIndex = 0;
          } else if (selIndex < 0) {
            selIndex = tabmail.tabContainer.childNodes.length - 1;
          }
          
          tabmail.tabContainer.selectedIndex = selIndex;
        }
        break;
    }
  },
  
  aioOpenBlankTab: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioGestureTab) {
          // open new tab next to selected tab
          var selectedTabPos = mgsuite.overlay.aioContent.getTabIndex ? mgsuite.overlay.aioContent.getTabIndex(mgsuite.overlay.aioGestureTab) : mgsuite.overlay.aioGestureTab._tPos;
        }
        
        if (mgsuite.overlay.aioIsRocker && !mgsuite.overlay.aioGestureTab && mgsuite.overlay.aioSrcEvent) {
          // prevent selection from staying in unfinished state
          mgsuite.imp._aioSendMouseUpEvent(mgsuite.overlay.aioSrcEvent);
        }
  
        BrowserOpenTab();
        if (mgsuite.overlay.aioGestureTab) {
          mgsuite.overlay.aioContent.moveTabTo(mgsuite.overlay.aioContent.mCurrentTab, selectedTabPos + 1);
          
          if (mgsuite.overlay.aioIsRocker && mgsuite.overlay.aioSrcEvent && mgsuite.overlay.aioSrcEvent.button == aioLMB) {
            setTimeout(function() {
              mgsuite.overlay.aioContent.mTabContainer.selectedIndex = selectedTabPos + 1;
            }, 100);
          }
        }
        break;
      
      default:
        if (mgsuite.overlay.aioIsFx) {
          openNewTabWith("about:blank");
        } else {
          openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, false);
        }
    }
  },
  
  aioSavePageAs: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
      case "source":
        saveDocument(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab.linkedBrowser.contentDocumentAsCPOW : gBrowser.selectedBrowser.contentDocumentAsCPOW);
        break;
      
      case "messenger":
        MsgSaveAsFile();
        break;
    }
  },
  
  // Detach tab to new window
  aioDetachTab: function() {
    var tabLength = gBrowser.tabContainer.childNodes.length;
    if (tabLength <= 1) return;
 
    mgsuite.imp._aioDetachTab(mgsuite.overlay.aioGestureTab ? mgsuite.overlay.aioGestureTab : gBrowser.selectedTab);
  },
  
  // detach next tab and double stack windows
  aioDetachTabAndDoubleStack: function() {
    var tabLength = gBrowser.tabContainer.childNodes.length;
    if (tabLength <= 1) return;
    
    if (mgsuite.overlay.aioGestureTab) {
      mgsuite.overlay.aioContent.selectedTab = mgsuite.overlay.aioGestureTab;
    }
    var curTabIndex = gBrowser.tabContainer.selectedIndex;
    var tabToDetach;
    
    if (curTabIndex < tabLength - 1) {
      // detach next tab
      tabToDetach = gBrowser.tabContainer.childNodes[curTabIndex + 1];
      
    } else {
      // last tab is open - detach current tab
      tabToDetach = gBrowser.selectedTab;
    }
    
    window.fullScreen = false;
    
    var newWin = mgsuite.imp._aioDetachTab(tabToDetach);
    
    setTimeout(function() {
      mgsuite.imp._aioDoubleStack2Windows(window, newWin);
    }, 500);
  },
  
  
  // detach given tab to new window
  // returns opened window object
  _aioDetachTab: function(tabToDetach) {
    var tabLength = gBrowser.tabContainer.childNodes.length;
    if (tabLength <= 1) return null;

    var history = mgsuite.imp.getTabHistory(tabToDetach);
    gBrowser.removeTab(tabToDetach);
    
    var openedWindow = window.openDialog(getBrowserURL(), '_blank', 'chrome,all,dialog=no');
    
    openedWindow.addEventListener('load', function() {
          setTimeout(function() {
            var browser = openedWindow.gBrowser.selectedBrowser;
            browser.messageManager.sendAsyncMessage("MouseGesturesSuite:insertHistory", history);
          }, 100);
        }, false);
    
    return openedWindow;
  },
  
  /*
   * Get history data from the tab which is to be detached.
   *
   * @param aTab: tabbrowser tab which should be cloned.
   * returns object containing the data which should be cloned, history entries are serialized.
   */
  getTabHistory: function(aTab)
  {
    var browser = aTab.ownerDocument.defaultView.gBrowser.getBrowserForTab(aTab);
    var clonedData = {};
    clonedData.entries = mgsuite.imp.getHistoryEntries(browser.webNavigation.sessionHistory);
    clonedData.index = browser.webNavigation.sessionHistory.index;
    var win = browser.contentWindowAsCPOW ? browser.contentWindowAsCPOW : browser.contentWindow;
    clonedData.scrollX = win.scrollX;
    clonedData.scrollY = win.scrollY;
    return clonedData;
  },
  
  // Get serialized essionHistory entries in an array
  // Argument1 originalHistory: webNavigation.sessionHistory browser history to be copied
  // returns: an array containing a copy of the history
  getHistoryEntries: function(originalHistory)
  {
    var range = {start: 0, index: originalHistory.index, length: originalHistory.count};
  
    var entries = [];
    
    for (var i = range.start; i < range.length; i++) {
      var entry = originalHistory.getEntryAtIndex(i, false);
      entries.push(mgsuite.util.serializeEntry(entry));
    }
  
    return entries;
  },
  
  
  // double stack 2 windows: current and previously focused
  aioDoubleStackWindows: function() {
    var lastWin = Application.storage.get("aioLastWindow", null);
    
    if (!lastWin || lastWin.closed) {
      return;
    }
    
    window.fullScreen = false;
    
    switch (lastWin.windowState) {
      case STATE_MINIMIZED:
      case STATE_MAXIMIZED:
        lastWin.restore();
        break;
    }
    
    if (lastWin.screenX < window.screenX) {
      // change order because current window is to the right of the other window
      var win1 = lastWin;
      var win2 = window;
      
    } else {
      // normal order - current window is to the left of the other window
      var win1 = window;
      var win2 = lastWin;
    }
    
    mgsuite.imp._aioDoubleStack2Windows(win1, win2);
    
    setTimeout(function() {
      window.focus();
    }, 200);
  },
  
  _aioDoubleStack2Windows: function(win1, win2) {
    function positionWindows(availHeight) {
      var shift = mgsuite.overlay.aioIsWin ? 0 : 5; // prevent overlapping on linux
      win1.resizeTo(screen.availWidth / 2 - shift, availHeight);
      win2.resizeTo(screen.availWidth / 2 - shift, availHeight);
      
      setTimeout(function() {
        win1.moveTo(screen.availLeft, screen.availTop);
        win2.moveTo(screen.availWidth / 2 + screen.availLeft, screen.availTop);
      }, 100);
    }
    
    if (mgsuite.overlay.aioIsWin) {
      positionWindows(screen.availHeight);
      
    } else {
      var diff = Application.storage.get("aioAvailHeightDiff", null);
      
      if (diff !== null) {
        positionWindows(screen.availHeight - diff);
        
      } else {
        // on Linux screen.availHeight is too large so we workaround this by using
        // outerHeight of a maximized window
        win1.maximize();
        setTimeout(function() {
          var availHeight = win1.outerHeight - 2;
          
          // save amount of error of screen.availHeight so we don't need to execute
          // the maximize hack on subsequent calls
          Application.storage.set("aioAvailHeightDiff", screen.availHeight - availHeight);
          
          win1.restore();
          
          setTimeout(function() {
            positionWindows(availHeight);
          }, 100);
        }, 100);
      }
    }
  },
  
  aioClosePrintPreview: function() {
    if (document.getElementById("print-preview-toolbar")) {
      PrintUtils.exitPrintPreview();
      return true;
    }
  
    return false;
  },
  
  aioToggleSidebar: function() {
    switch (mgsuite.overlay.aioWindowType) {
      case "browser":
        if (mgsuite.overlay.aioIsFx) {
          toggleSidebar('viewBookmarksSidebar');
        } else {
          SidebarShowHide();
        }
        break;
      
      case "messenger":
        MsgToggleFolderPane(true);
        break;
    }
  },
  
  aioTabFocus: function(e) {
    var activeTab = mgsuite.overlay.aioContent.mTabContainer.childNodes[mgsuite.overlay.aioContent.mTabContainer.selectedIndex];
    var activeId = activeTab.getAttribute("aioTabId");
    
    if (activeId) {
       if (mgsuite.overlay.aioTabFocusHistory[mgsuite.overlay.aioTabFocusHistory.length - 1].focused == activeId) {
        return; // already at top
      
       } else {
          for (var i = 0; i < mgsuite.overlay.aioTabFocusHistory.length; ++i) //search for a duplicated entry
            if (mgsuite.overlay.aioTabFocusHistory[i].focused == activeId) {
               mgsuite.overlay.aioTabFocusHistory.splice(i, 1); // Found: delete it
            }
          mgsuite.overlay.aioTabFocusHistory.push({focused: activeId});
       }
       
    } else { // tab's never been visited
       activeId = "t" + mgsuite.imp.aioUnique++;
       activeTab.setAttribute("aioTabId", activeId);
       mgsuite.overlay.aioTabFocusHistory.push({focused: activeId});
    }
  },
  
  aioOpenConsole: function() {
    if (mgsuite.overlay.aioIsFx) {
      if (gDevToolsBrowser) {
        gDevToolsBrowser.toggleToolboxCommand(gBrowser);
      }
      
    } else {
      toJavaScriptConsole();
    }
  },
  
  aioNullAction: function() {
    alert("This action does not exist");
  },
  
  _aioSendMouseUpEvent: function(e) {
    var dwu = e.view.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
              .getInterface(Components.interfaces.nsIDOMWindowUtils);
    
    dwu.sendMouseEvent("mouseup", e.clientX, e.clientY, 0, 1, 0);
  }
}