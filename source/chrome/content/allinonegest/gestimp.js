/*
 * gestimp.js
 * For licence information, read licence.txt
 *
 * code for gesture functions
 *
 */
"use strict";

var aioGestTable;
// aioActionTable's 3rd column denotes rocker multiple operations. 0: Not allowed, 1: Allowed 2: Conditional
// 4th column denotes the buddy action if any
// 5th column denotes in what window types action is allowed to be performed:
//  - array of: browser, source, messenger, mailcompose
//  - or null for all window types
var aioActionTable = [
      [function(){aioBackForward(true);}, "g.browserBack", 2, "1", ["browser", "source", "messenger"]], // 0
      [function(){aioBackForward(false);}, "g.browserForward", 2, "0", ["browser", "source", "messenger"]], // 1
      [function(){aioReload(false);}, "g.browserReload", 0, "", ["browser", "source", "messenger"]], // 2
      [function(){aioReload(true);}, "g.browserReloadSkipCache", 0, "", ["browser", "source", "messenger"]], // 3
      [function(){aioStopLoading();}, "g.browserStop", 0, "", ["browser", "messenger"]], // 4
      [function(){aioHomePage();}, "g.browserHome", 0, "", null], // 5
      [function(shiftKey){aioOpenNewWindow(null, shiftKey);}, "g.openNewWindow", 0, "", null], // 6
      [function(shiftKey){aioDupWindow(shiftKey);}, "g.duplicateWindow", 0, "", ["browser", "source", "messenger"]], // 7
      [function(){aioUpDir();}, "g.upDir", 2, "", ["browser"]], // 8
      [function(shiftKey){aioOpenInNewTab(shiftKey);}, "g.browserOpenTabInFg", 0, "", null], // 9
      [function(shiftKey){aioDupTab(shiftKey);}, "g.duplicateTab", 0, "", ["browser", "messenger"]], // 10
      [function(){aioSwitchTab(1);}, "g.nextTab", 1, "12", ["browser", "messenger"]], // 11
      [function(){aioSwitchTab(-1, true);}, "g.previousTab", 1, "11", ["browser", "messenger"]], // 12
      [function(){aioRemoveAllTabsBut();}, "g.closeOther", 0, "", ["browser"]], // 13
      [function(){aioRestMaxWin();}, "g.restMaxWin", 1, "", null], // 14
      [function(){window.minimize();}, "g.minWin", 0, "", null], // 15
      [function(){aioFullScreen();}, "g.fullScreen", 1, "", null], // 16
      [function(shiftKey){aioSelectionAsURL(shiftKey);}, "g.openSelection", 0, "", ["browser", "source", "messenger", "mailcompose"]], // 17
      [function(){aioCloseCurrTab(true);}, "g.closeDoc", 2, "", null], // 18
      [function(){aioViewSource(0);}, "g.viewPageSource", 0, "", ["browser", "messenger"]], // 19
      [function(){aioViewSource(1);}, "g.viewFrameSource", 0, "", ["browser", "messenger"]], // 20
      [function(){aioViewCookies();}, "g.viewSiteCookies", 0, "", ["browser"]], // 21
      [function(){aioPageInfo();}, "g.pageInfo", 0, "", ["browser"]], // 22
      [function(){aioOpenConsole();}, "g.jsConsole", 0, "", null], // 23
      [function(){aioNullAction();}, "g.nullAction", 0, "", null], // 24
      [function(){aioBookmarkCurrentPage();}, "g.addBookmark", 0, "", ["browser"]], // 25
      [function(){aioDoubleWin();}, "g.doubleStackWin", 0, "", ["browser", "source", "messenger"]], // 26
      [function(){aioSetImgSize(true,false);}, "g.doubleImageSize", 1, "28", ["browser", "messenger"]], // 27
      [function(){aioSetImgSize(false,false);}, "g.halveImageSize", 1, "27", ["browser", "messenger"]], // 28
      [function(){aioNukeAnything();}, "g.hideObject", 0, "", ["browser", "messenger"]], // 29
      [function(){aioZoomEnlarge();}, "g.zoomIn", 1, "31", ["browser", "source", "messenger"]], // 30
      [function(){aioZoomReduce();}, "g.zoomOut", 1, "30", ["browser", "source", "messenger"]], // 31
      [function(){aioZoomReset();}, "g.resetZoom", 1, "", ["browser", "source", "messenger"]], // 32
      [function(){aioActionOnPage(0);}, "g.w3cValidate", 0, "", ["browser"]], // 33
      [function(){aioLinksInWindows();}, "g.linksInWindows", 0, "", ["browser", "source", "messenger"]], // 34
      [function(){aioLinksInTabs();}, "g.linksInTabs", 0, "", ["browser", "source", "messenger"]], // 35
      [function(){aioMetaInfo();}, "g.metaInfo", 0, "", ["browser"]], // 36
      [function(){aioVScrollDocument(true,1);}, "g.scrollDown", 1, "38", ["browser", "source", "messenger"]], // 37
      [function(){aioVScrollDocument(true,-1);}, "g.scrollUp", 1, "37", ["browser", "source", "messenger"]], // 38
      [function(){aioVScrollDocument(false,0);}, "g.scrollToTop", 1, "40", ["browser", "source", "messenger"]], // 39
      [function(){aioVScrollDocument(false,1000000);}, "g.scrollToBottom", 1, "39", ["browser", "source", "messenger"]], // 40
      [function(){aioResetImgSize(false);}, "g.resetImage", 1, "", ["browser", "messenger"]], // 41
      [function(){aioNullAction();}, "g.nullAction", 0, "", null], // 42
      [function(){aioNukeFlash();}, "g.hideFlash", 0, "", ["browser"]], // 43
      [function(){aioCopyURLToClipBoard();}, "g.URLToClipboard", 0, "", ["browser"]], // 44
      [function(){getWebNavigation().gotoIndex(0);}, "g.firstPage", 0, "", ["browser"]], // 45
      [function(){aioGesturesPage();}, "g.showGestures", 0, "", ["browser"]], // 46
      [function(){aioCloseCurrTab(false);}, "g.closeTab", 2, "", ["browser", "messenger"]], // 47
      [function(){aioIncURL(1);}, "g.incURL", 2, "49", ["browser"]], // 48
      [function(){aioIncURL(-1);}, "g.decURL", 2, "48", ["browser"]], // 49
      [function(){aioSchemas={};}, "g.clearDigitFlipper", 0, "", ["browser"]], // 50
      [function(){aioLinksInFiles();}, "g.linksInFiles", 0, "", ["browser", "source", "messenger"]], // 51
      [function(){aioUndoCloseTab();}, "g.undoCloseTab", 2, "", ["browser"]], // 52
      [function(){aioPrintPreview();}, "g.printPreview", 0, "", ["browser", "source", "messenger"]], //53
      [function(shiftKey){aioOpenInNewTab(!shiftKey);}, "g.browserOpenTabInBg", 0, "", null], // 54
      [function(){aioDeleteCookies();}, "g.deleteSiteCookies", 0, "", ["browser"]], // 55
      [function(){aioUndoNukeAnything();}, "g.undoHideObject", 0, "", ["browser", "messenger"]], // 56
      [function(){aioFavoriteURL('1');}, "g.openFav1", 0, "", null], // 57
      [function(){aioFavoriteURL('2');}, "g.openFav2", 0, "", null], // 58
      [function(){aioOpenBlankTab();}, "g.openBlankTab", 0, "", null], // 59
      [function(){aioCloseWindow();}, "g.closeWindow", 0, "", null], // 60
      [function(shiftKey){aioOpenNewWindow(null, !shiftKey);}, "g.openWindowInBg", 0, "", null], // 61
      [function(){aioFrameInfo();}, "g.frameInfo", 0, "", ["browser"]], // 62
      [function(){aioOpenAioOptions();}, "g.aioOptions", 0, "", null], // 63
      [function(){aioNullAction();}, "g.nullAction", 0, "", null], // 64
      [function(){aioOpenBookmarksManager();}, "g.bookmarkMgr", 0, "", null], // 65
      [function(){aioActionOnPage(1);}, "g.translate", 0, "", ["browser"]], // 66
      [function(){aioOpenDownloadManager();}, "g.downloadMgr", 0, "", null], // 67
      [function(){aioSavePageAs();}, "g.savePageAs", 0, "", null], // 68
      [function(){aioGoToPreviousSelectedTab();}, "g.prevSelectedTab", 1, "", ["browser"]], // 69
      [function(){aioShowHideStatusBar();}, "g.showHideStatusBar", 1, "", null], // 70
      [function(){aioReloadFrame()}, "g.reloadFrame", 0, "", ["browser", "source", "messenger"]], // 71
      [function(){aioSetImgSize(true,true);}, "g.enlargeObject", 1, "73", ["browser", "source", "messenger"]], // 72
      [function(){aioSetImgSize(false,true);}, "g.reduceObject", 1, "72", ["browser", "source", "messenger"]], // 73
      [function(){aioResetImgSize(true);}, "g.resetSize", 1, "", ["browser", "source", "messenger"]], //74
      [function(){aioNullAction();}, "g.nullAction", 0, "", null], // 75
      [function(){aioContent.reloadAllTabs();}, "g.reloadAllTabs", 0, "", ["browser"]], // 76
      [function(){aioNextPrevLink(true);}, "g.nextLink", 0, "", ["browser"]], // 77
      [function(){aioFastForward();}, "g.fastForward", 0, "", ["browser"]], // 78
      [function(shiftKey){aioSelectionAsSearchTerm(false, shiftKey);}, "g.searchSelection", 0, "", ["browser", "source", "messenger", "mailcompose"]], // 79
      [function(){aioSaveImageAs();}, "g.saveImageAs", 0, "", ["browser", "messenger"]], // 80
      [function(){aioNextPrevLink(false);}, "g.prevLink", 0, "", ["browser"]], // 81
      [function(){aioGotoLastTab();}, "g.lastTab", 0, "", ["browser", "messenger"]], // 82
      [function(){aioCopyClipBoardToURLBar();}, "g.pasteAndGo", 0, "", ["browser"]], // 83
      [function(){aioSmartBackForward(-1, false);}, "g.smartBack1", 1, "86", ["browser"]], // 84
      [function(){aioSmartBackForward(-1, true);}, "g.smartBack2", 1, "87", ["browser"]], // 85
      [function(){aioSmartBackForward(+1, false);}, "g.smartForward1", 1, "84", ["browser"]], // 86
      [function(){aioSmartBackForward(+1, true);}, "g.smartForward2", 1, "85", ["browser"]], // 87
      [function(){aioPrint();}, "g.print", 0, "", null], //88
      [function(){aioImageInTab();}, "g.openImageInTab", 0, "", ["browser", "source", "messenger"]], //89
      [function(){aioImageInWindow();}, "g.openImageInWin", 0, "", ["browser", "source", "messenger"]], //90
      [function(){aioDetachTab();}, "g.detachTab", 0, "", ["browser"]], //91
      [function(){aioDetachTabAndDoubleStack();}, "g.detachTabAndDoubleStack", 0, "", ["browser"]], //92
      [function(){aioDoubleStackWindows();}, "g.doubleStack2Windows", 0, "", null], //93
      [function(){aioToggleSidebar();}, "g.toggleSidebar", 0, "", ["browser", "messenger"]], //94
      [function(shiftKey){aioOpenNewWindow(null, shiftKey, false, true);}, "g.openPrivateWindow", 0, "", null], //95
      [function(){aioToggleBookmarksToolbar();}, "g.toggleBookmarksToolbar", 0, "", ["browser"]], //96
      [function(){aioCloseRightTabs();}, "g.closeTabsToTheRight", 0, "", ["browser"]], // 97
      
// Unused legacy actions:
//      [function(){aioCloseLeftTabs(true);}, "g.CloseAllLeftTab", 0, "", null], // 90
//      [function(){aioCloseRightTabs(false);}, "g.CloseRightTab", 0, "", null], // 91
//      [function(){aioCloseLeftTabs(false);}, "g.CloseLeftTabs", 0, "", null], // 92
//      [function(){aioCloseAllTabs(false);}, "g.CloseAllTabs", 0, "", null], // 93
//      [function(){aioHScrollDocument(false,0);}, "g.scrollToLeft", 0, "", null], // 94
//      [function(){aioHScrollDocument(false,1000000);}, "g.scrollToRight", 0, "", null], // 95
//      [function(){aioCScrollDocument(1000000,1000000);}, "g.scrollToCenter", 0, "", null], // 96
//      [function(){aioFullZoomOperation(1);}, "g.FullZoomEnlarge", 0, "", null], // 97
//      [function(){aioFullZoomOperation(2);}, "g.FullZoomReduce", 0, "", null], // 98
//      [function(){aioFullZoomOperation(0);}, "g.FullZoomReset", 0, "", null], // 99
//      [function(){aioOpenAddonManager();}, "g.addOnMgr", 0, "", null] // 100
     ];
var aioSchemas = {};
var aioLastTabInfo = [];
var aioUndoHide = [];
var aioUnique = 0;
var aioOrigBlurTab;
var aioStatusMessageTO;
const aioKGestures = mgsuite.CHROME_DIR + "show-gestures.html";

function aioStatusMessage(msg, timeToClear, append) {
  if (aioStatusMessageTO) {
    clearTimeout(aioStatusMessageTO);
    aioStatusMessageTO = null;
  }
  
  if (!msg && !append) {
    aioClearFauxStatusBar();
  }
  
  if (append) {
    msg = aioLastStatusMsg + msg;
  }
  
  aioLastStatusMsg = msg;
  
  var bar = document.getElementById("status-bar");
  var s4eBar = document.getElementById("status4evar-status-bar");
  var addonBar = document.getElementById("addon-bar");
  if ((bar && (bar.hidden || bar.getAttribute('moz-collapsed') == "true")) // SM
      || (s4eBar && s4eBar.getAttribute('collapsed') == "true" && aioStatusBar.getAttribute('inactive') == "true") // Fx with S4E
      || (aioStatusBar && aioStatusBar.nodeName == 'statuspanel' && aioStatusBar.getAttribute('inactive') == "true" && addonBar && addonBar.getAttribute('collapsed') == "true") // Pale Moon
    ) {
    // create faux status bar if normal status bar is hidden
    aioShowInFauxStatusBar(msg);
  
  } else if (aioStatusBar) {
    aioStatusBar.label = msg;
  }
  
  if (timeToClear) {
    aioStatusMessageTO = setTimeout(function(){aioStatusMessage("", 0);}, timeToClear );
  }
}

function aioShowInFauxStatusBar(msg) {
  if (!msg) {
    aioClearFauxStatusBar();
    return;
  }
  
  var tooltip = document.getElementById('aioFauxStatusBar');
  
  if (!tooltip) {
    tooltip = document.createElementNS(mgsuite.xulNS, 'tooltip');
    tooltip.id = "aioFauxStatusBar";
    tooltip.setAttribute("noautohide", "true");
    tooltip.setAttribute("orient", "vertical");
    tooltip.style.position = 'fixed';
    tooltip.style.bottom = '10px';
    tooltip.style.left = '10px';
    tooltip.style.pointerEvents = 'none';
    aioContent.appendChild(tooltip);
  }
  
  tooltip.textContent = msg;
  if (tooltip.openPopup == 'function') {
    // openPopup function doesn't exist in Mail
    tooltip.openPopup(null, "after_start", 0, 0, false, false);
  }
}

function aioClearFauxStatusBar() {
  var tooltip = document.getElementById('aioFauxStatusBar');
  
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip);
  }
  aioLastStatusMsg = "";
}

function aioInitGestTable() {
  var i, func, len;
  len = aioActionTable.length;
  if (aioFirstInit)
     for (i = 0; i < len; ++i) aioActionTable[i][1] = aioGetStr(aioActionTable[i][1])
  var gestTable = aioActionString.split("|");
  var funcTable = aioFuncString.split("|");
  aioGestTable = [];
  for (i = 0; i < gestTable.length; ++i) {
    func = funcTable[i] - 0;
    if (gestTable[i] && func >= 0 && func < len) aioGestTable[gestTable[i]] = func;
  }
}

function aioFireGesture(aGesture, shiftKey) {
  var index = aioGestTable[aGesture];
  if (index == null) {
     index = aioGestTable["+" + aGesture.substr(-2)];
     if (index == null)
        index = aioGestTable["+" + aGesture.substr(-3)];
  }
  if (index == null) {
     index = aioGestTable["/" + aGesture];
     if (index == null) aioStatusMessage(aioUnknownStr + ": " + aGesture, 2000);
     else aioStatusMessage(aioGetStr("g.disabled") + ": " + aioActionTable[index][1], 2000);
  }
  else
     try {
       var allowedWinTypes = aioActionTable[index][4];
       
       if (allowedWinTypes === null || allowedWinTypes.indexOf(aioWindowType) >=0) {
         aioStatusMessage(aioActionTable[index][1], 2000);
         aioActionTable[index][0](shiftKey);
       } else {
         aioStatusMessage(aioActionTable[index][1] + " — " + aioGetStr("g.aborted"), 2000);
       }
     }
     catch(err) {}
  aioKillGestInProgress();
  aioDownButton = mgsuite.NoB;
}


/*  Gesture actions */

function aioBackForward(back) {
  if (aioWindowType == 'messenger') {
    back ? goDoCommand('cmd_goBack') : goDoCommand('cmd_goForward');
  } else {
    if (aioGestureTab) {
      var history = aioGestureTab.linkedBrowser.contentWindow.history;
      back ? history.back() : history.forward();
    } else {
      back ? BrowserBack() : BrowserForward();
    }
    content.focus();
  }
}

function aioPreviousSelectedTab() {
  var lTab;
  if (aioTabFocusHistory.length < 2) return null;
  var tabId = aioTabFocusHistory[aioTabFocusHistory.length - 2].focused;
  for (var i = 0; i < aioContent.mTabs.length; ++i) {
    lTab = aioContent.mTabContainer.childNodes[i];
    if (lTab.getAttribute("aioTabId") == tabId) return lTab;
  }
  return null;
}

function aioGoToPreviousSelectedTab() {
  var lTab = aioPreviousSelectedTab();
  if (lTab) {
     aioTabFocusHistory.pop();
     aioContent.selectedTab = lTab;
  }
}


function aioPrint() {
  switch (aioWindowType) {
    case "browser":
    case "source":
      PrintUtils.print();
      break;
   
    case "messenger":
    case "mailcompose":
      goDoCommand("cmd_print");
      break;
  }
}

function aioPrintPreview() {
  switch (aioWindowType) {
    case "browser":
      if (aioIsFx) {
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
}

function aioReload(skipCache) {
  switch (aioWindowType) {
    case "browser":
      if (aioGestureTab) {
        if (skipCache) {
          aioGestureTab.linkedBrowser.reloadWithFlags(Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
        } else {
          aioGestureTab.linkedBrowser.reload();
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
}

function aioReloadFrame() {
  switch (aioWindowType) {
    case "browser":
      if (aioGestureTab) {
        aioReload(false);
        
      } else {
        // reload frame
        aioSrcEvent.target.ownerDocument.location.reload();
      }
      break;

    case "messenger":
    case "source":
      aioReload(false);
      break;
  }
}

function aioStopLoading() {
  switch (aioWindowType) {
    case "browser":
      if (aioGestureTab) {
        aioGestureTab.linkedBrowser.stop();
      } else {
        BrowserStop();
      }
      break;

    case "messenger":
      goDoCommand("cmd_stop");
      break;
  }
}

function aioFavoriteURL(suffix) {
  var shortcutURL = null;
  var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Components.interfaces.nsINavBookmarksService);
  var keyword = aioGetStr("g.keywordForGesture") + suffix;
  var shortcutURI = bmsvc.getURIForKeyword(keyword);
  if (shortcutURI) shortcutURL = shortcutURI.spec;
  if (!shortcutURL) {
    alert(aioGetStr("g.keywordMissing") + " " + keyword);
    return;
  }
  
  switch (aioWindowType) {
    case "browser":
      loadURI(shortcutURL);
      break;
    
    default:
      if (aioIsFx) {
        openNewTabWith(shortcutURL);
      } else {
        openNewTabWindowOrExistingWith(kNewTab, shortcutURL, null, false);
      }
  }
}

function aioIncURL(inc) { // derived from MagPie by Ben Goodger
  var currSchema, newValue, newIndex, str, url; 
  var currSpec = aioContent.selectedBrowser.webNavigation.currentURI.spec;
  for (var i in aioSchemas) {
     if (currSpec.substr(0, i.length) != i) continue;
     currSchema = aioSchemas[i];
     newValue = parseInt(currSpec.substring(currSchema.startIndex, currSchema.endIndex), 10);
     inc > 0 ? ++newValue : --newValue;
     if (newValue < 0) {
        alert(aioGetStr("noDecrement"));
        return;
     }
     newIndex = newValue.toString();
     str = "";
     for (var j = newIndex.length; j < currSchema.selectedLength; ++j) str += "0";
     str += newIndex;
     url = currSpec.substr(0, currSchema.startIndex) + str + currSpec.substr(currSchema.endIndex);
     aioSchemas[i].endIndex = currSchema.startIndex + str.length;
     aioContent.selectedBrowser.loadURI(url);
     return;
  }

  if (aioTrustAutoSelect) {
     var RE = /\d+/g;
     var rtn, startIndex = -1, endIndex;
     while ((rtn = RE.exec(currSpec)) != null) {
       startIndex = rtn.index;
       endIndex = startIndex + rtn[0].length;
     }
     if (startIndex == -1) return;
     var key = currSpec.substr(0, startIndex);
     aioSchemas[key] = {startIndex: startIndex, endIndex: endIndex, selectedLength: endIndex - startIndex};
     aioIncURL(inc);
     return;
  }

  aioClearRocker();
  var rv = { };
  openDialog(mgsuite.CHROME_DIR + "aioSchemaBuilder.xul", "", "chrome,centerscreen,modal=yes", currSpec, rv);
  if ("key" in rv) {
     aioSchemas[rv.key] = {startIndex: rv.startIndex, endIndex: rv.endIndex, selectedLength: rv.endIndex - rv.startIndex};
     aioIncURL(inc);
  }
}

function aioShowLocalizedGestures(doc) {
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
        if (aioShortGest[aStr.charAt(i)] == null) {
           imageName = (aStr.charAt(i) == '+') ? "other" : "nomov";
           lStr += aStr.charAt(i);
        }
        else lStr += aioShortGest[aStr.charAt(i)];
    if (!imageName)
       if (aStr.length < 5) imageName = aStr; else imageName = "other";
    return lStr;
  }
  var locGest = aioGetStr("w.gesture").replace(/\'/g, "&#39;");
  var locFunc = aioGetStr("w.function").replace(/\'/g, "&#39;");
  var locMove = aioGetStr("w.move").replace(/\'/g, "&#39;");
  const K1 = '<th width="100" class="thTop" nowrap="nowrap">&nbsp;' + locGest + '&nbsp;</th>';
  const imgURL = '<img src="chrome://allinonegest/content/gest-imgs/';
  var divCode = '<div class="buttons">';
  divCode += '<button onclick="openOptions()">' + aioGetStr('g.aioOptions') + '</button>';
  divCode += '<button onclick="openHelp(2)">Help</button>';
  divCode += '</div>';
  divCode += '<table width="100%" cellpadding="2" cellspacing="1" class="forumline">';
  divCode += '<tr><th class="thCornerL" height="30" nowrap="nowrap">&nbsp;' + locFunc + '&nbsp;</th>';
  divCode += K1 + '<th width="50" class="thTop" nowrap="nowrap">&nbsp;' + locMove + '&nbsp;</th>';
  divCode += '<th class="thTop" height="30" nowrap="nowrap">&nbsp;' + locFunc + '&nbsp;</th>';
  divCode += K1 + '<th width="50" class="thCornerR" nowrap="nowrap">&nbsp;' + locMove + '&nbsp;</th></tr>';
  var gestTable = aioActionString.split("|");
  var funcTable = aioFuncString.split("|");
  var func, actionName;
  var cols = [[], []], colNum = 0, c;
  var splitColAt = Math.ceil(gestTable.length / 2);
  
  for (var i = 0; i < gestTable.length; ++i) {
    if (i == splitColAt) {
      colNum++;
    }
    func = funcTable[i] - 0;
    if (func < 0 || func >= aioActionTable.length) {continue;}
    actionName = aioActionTable[func][1].replace(/\'/g, "&#39;");
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
  var title = aioGetStr("w.gestTable").replace(/\'/g, "&#39;");
  var str = "(function(){window.addEventListener('load',function(e){document.title='" + title +
       "';document.body.innerHTML='" + divCode + "';},false);})();"
  var script = doc.createElement("script");
  script.appendChild(doc.createTextNode(str));
  doc.body.appendChild(script);
}

function aiogestDOMLoaded(e) {  
  var doc = e.originalTarget.defaultView.document;
  if (doc.location.href == aioKGestures) aioShowLocalizedGestures(doc);
}

function aioGesturesPage() {
  aioContent.addEventListener("DOMContentLoaded", aiogestDOMLoaded, false);
  if (!/^about:(blank|newtab|home)/.test(window.content.document.location.href)) {
    aioLinkInTab(aioKGestures, false, false);
  } else {
    loadURI(aioKGestures);
  }
}

function aioCopyURLToClipBoard() {
  var lstr = "";
  try {
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    if (!str) return;
    if (aioOnLink.length) {
       for (var i = 0; i < aioOnLink.length; ++i) {
           if (lstr) lstr += "\r\n";
           lstr += aioOnLink[i].href;
       }
       str.data = lstr;
    }
    else str.data = window.content.document.location.href;
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return;
	// Since data from the web content are copied to the clipboard, the privacy context must be set.
	var sourceWindow = aioSrcEvent.target.ownerDocument.defaultView;
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
}

function aioCopyClipBoardToURLBar() {
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
    alert(aioGetStr("g.clipboardEmpty"));
  }
  if (data) {
     data = data.value.QueryInterface(Components.interfaces.nsISupportsString);
     var url = data.data.substring(0, dataLen.value / 2);
     if (gURLBar) gURLBar.value = url;
     aioLinkInTab(url, false, false);
  }
}

function _aioGetElemsByTagNameForAllFrames(frameDoc, tagName) {
  var elsWithTag = [];
  var frames = frameDoc.getElementsByTagName("frame");
  for (var i = 0; i < frames.length; ++ i)
      elsWithTag = elsWithTag.concat(_aioGetElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
  frames = frameDoc.getElementsByTagName("iframe");
  for (i = 0; i < frames.length; ++ i)
      elsWithTag = elsWithTag.concat(_aioGetElemsByTagNameForAllFrames(frames[i].contentDocument, tagName));
  var lEls = frameDoc.getElementsByTagName(tagName);
  for (i = 0; i < lEls.length; ++i) elsWithTag.push(lEls[i]);
  return elsWithTag;
}

function aioNukeFlash() {
  var currFlash, height, width, top, next, span, text, view, disp, style;
  var topDocument = aioSrcEvent.target.ownerDocument.defaultView.top.document;
  var embeds = _aioGetElemsByTagNameForAllFrames(topDocument, "embed");
  embeds = embeds.concat(_aioGetElemsByTagNameForAllFrames(topDocument, "object"));
  
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
       span = document.createElementNS(mgsuite.xhtmlNS, "span");
       text = document.createTextNode("[" + aioGetStr("g.clickToView") + "]");
       span.appendChild(text);
       top.insertBefore(span, next);
       span.setAttribute("style", "height:" + (height - 2) + "px;width:" + (width - 2) + "px;border:1px solid black;display:-moz-inline-box;");
       span.setAttribute("aioFlash", disp);
       span.addEventListener("click", aioPlayFlash, true);
    }
  }
}

function aioPlayFlash(e) {
  e.currentTarget.removeEventListener("click", aioPlayFlash, true);
  var flashNode = e.currentTarget.nextSibling;
  var disp = e.currentTarget.getAttribute("aioFlash");
  e.currentTarget.parentNode.removeChild(e.currentTarget);
  var style = flashNode.getAttribute("style") || "";
  flashNode.setAttribute("style", style + "display:" + disp + ";");
}

function aioNukeAnything() {
  var node = aioSrcEvent.target;
  if (!node) return;
  var view = node.ownerDocument.defaultView;
  var disp = view.getComputedStyle(node, "").getPropertyValue("display");
  node.setAttribute("aioDisp", "display:" + disp + ";");
  var style = node.getAttribute("style") || "";
  node.setAttribute("style", style + "display:none;");
  aioUndoHide.push(node);
}

function aioUndoNukeAnything() {
  try {
    var node = aioUndoHide.pop();
    if (!node || !node.hasAttribute("aioDisp")) return;
    var style = node.getAttribute("style") || "";
    node.setAttribute("style", style + node.getAttribute("aioDisp"));
  }
  catch(err) {}
}

function aioVScrollDocument(relativeScroll, aValue) {
  var scrollObj = aioFindNodeToScroll(aioSrcEvent.target);
  if (scrollObj.scrollType >= 2) return;
  var useScrollToBy = scrollObj.isXML || scrollObj.isBody;
  if (relativeScroll) {
     var val = Math.round(scrollObj.realHeight * 0.9 * aValue)
     if (!val) val = aValue;
	 if (useScrollToBy) scrollObj.clientFrame.scrollBy(0, val);
     else scrollObj.nodeToScroll.scrollTop += val;
  }     
  else
	 if (useScrollToBy) scrollObj.clientFrame.scrollTo(scrollObj.clientFrame.pageXOffset, aValue);
     else scrollObj.nodeToScroll.scrollTop = aValue;
}

function aioSelectionAsURL(reverseBg) {
  var focusedWindow = document.commandDispatcher.focusedWindow;
  var winWrapper = new XPCNativeWrapper(focusedWindow, 'getSelection()');
  var url = winWrapper.getSelection().toString();
  
  // the following by Ted Mielczarek
  //url = url.replace(/\s/g, ""); // Strip any space characters
  url = url.replace(/^[^a-zA-Z0-9]+/, ""); // strip bad leading characters
  url = url.replace(/[\.,\'\"\)\?!>\]]+$/, ""); // strip bad ending characters
  url = url.replace(/\\/g,"/"); // change \ to /
  url = url.trim();
  
  var invalidUrl = (!url || !/\./.test(url) || /\s/.test(url));
  
  if (url.indexOf("about:") == 0) {
    invalidUrl = false;
  }

  if (invalidUrl) {
    // invalid address, do web search instead
    aioSelectionAsSearchTerm(true, reverseBg);
    return;
  }
  
  if (url.search(/^\w+:/) == -1) // make sure it has some sort of protocol
     if (url.indexOf("@") == -1) url = "http://" + url;
     else url = "mailto:" + url;
   
  
  aioLinkInTab(url, false, false, reverseBg);
}

/**
 * Search for selected text. If no text selected, open search page.
 */
function aioSelectionAsSearchTerm(alwaysNewTab, reverseBg) {
  if (aioIsFx && aioWindowType == 'browser') {
    var newWinOrTab = !/^about:(blank|newtab|home)/.test(window.content.document.location.href);
    var searchStr = getBrowserSelection();

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
  
  var focusedWindow = document.commandDispatcher.focusedWindow;
  var winWrapper = new XPCNativeWrapper(focusedWindow, 'getSelection()');
  var searchStr = winWrapper.getSelection().toString();
  
  try {
    // this will not work in Fx
    var openTabPref = aioPrefRoot.getBoolPref("browser.search.opentabforcontextsearch");
    var loadInBgPref = aioPrefRoot.getBoolPref("browser.tabs.loadInBackground");
  } catch (err) {};
  
  switch (aioWindowType) {
    case "browser":
      var searchBar = BrowserSearch.searchBar;
      if (searchBar) searchBar.value = searchStr;
      
      var newWinOrTab = !/^about:(blank|newtab|home)/.test(window.content.document.location.href);

      if (alwaysNewTab) {
        // always force opening in new tab
        aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", true);
        
        if (reverseBg) {
          aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", !loadInBgPref);
        }
        
        BrowserSearch.loadSearch(searchStr, newWinOrTab);
        
        aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", openTabPref);
        
        if (reverseBg) {
          aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
        }
        
      } else {
        // may open in tab or window depending on browser prefs
        if (openTabPref && reverseBg) {
          // we can easily control background opening in new tab but not in new window
          aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", !loadInBgPref);
        }
        
        BrowserSearch.loadSearch(searchStr, newWinOrTab);
        
        if (openTabPref && reverseBg) {
          aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
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
      aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", reverseBg);
      
      if (alwaysNewTab) {
        aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", true);
        MsgOpenSearch(searchStr);
        aioPrefRoot.setBoolPref("browser.search.opentabforcontextsearch", openTabPref);
      
      } else {
        // may open in tab or window depending on browser prefs
        MsgOpenSearch(searchStr);
      }
      
      aioPrefRoot.setBoolPref("browser.tabs.loadInBackground", loadInBgPref);
      
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
      if (aioIsFx) {
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
}

function aioZoomEnlarge() {
  switch (aioWindowType) {
    case 'source':
      ZoomManager.enlarge();
      break;
    
    default:
      FullZoom.enlarge();
  }
}

function aioZoomReduce() {
  switch (aioWindowType) {
    case 'source':
      ZoomManager.reduce();
      break;
    
    default:
      FullZoom.reduce();
  }
}

function aioZoomReset() {
  switch (aioWindowType) {
    case 'source':
      ZoomManager.reset();
      break;
    
    default:
      FullZoom.reset();
  }
}

function aioSetImgSize(aEnlarge, aMixed) {
  if (!aioOnImage) {
     if (!aMixed) return;
     if (aEnlarge) aioZoomEnlarge();
     else aioZoomReduce();
     return;
  }
  var imgStr = aioOnImage.getAttribute("aioImgSize");
  var imgTab;
  
  if (!imgStr) {
    var view = aioOnImage.ownerDocument.defaultView;
    // get actual img w & h
    var w = parseInt(view.getComputedStyle(aioOnImage).getPropertyValue("width"));
    var h = parseInt(view.getComputedStyle(aioOnImage).getPropertyValue("height"));
    imgTab = [];
    imgTab[0] = w; imgTab[1] = h; imgTab[2] = 1;
    
    aioOnImage.aioOldStyles = {
      width: aioOnImage.style.getPropertyValue("width"),
      height: aioOnImage.style.getPropertyValue("height"),
      maxWidth: aioOnImage.style.getPropertyValue("max-width"),
      maxHeight: aioOnImage.style.getPropertyValue("max-width"),
      minWidth: aioOnImage.style.getPropertyValue("min-width"),
      minHeight: aioOnImage.style.getPropertyValue("min-height"),
    };
    
  } else {
    imgTab = imgStr.split("|");
  }
  
  aioOnImage.style.setProperty("max-width","none", "important");
  aioOnImage.style.setProperty("max-height","none", "important");
  aioOnImage.style.setProperty("min-width","0", "important");
  aioOnImage.style.setProperty("min-height","0", "important");
  
  imgTab[2] *= aEnlarge ? 2 : 0.5;
  aioOnImage.setAttribute("aioImgSize", imgTab.join("|"));
  w = Math.round(imgTab[0] * imgTab[2]); h = Math.round(imgTab[1] * imgTab[2]);
  
  if (w && h && w != imgTab[0] && h != imgTab[1]) {
    aioOnImage.style.width = w + "px";
    aioOnImage.style.height = h + "px";
  }
  else aioResetImgSize(false);
}

function aioResetImgSize(aMixed) {
  if (!aioOnImage) {
     if (!aMixed) return;
     aioZoomReset();
     return;
  }
  var imgStr = aioOnImage.getAttribute("aioImgSize");
  if (!imgStr) return;
  
  aioOnImage.removeAttribute("aioImgSize");
  
  if (aioOnImage.aioOldStyles) {
    // restore size
    aioOnImage.style.setProperty("width", aioOnImage.aioOldStyles.width, "");
    aioOnImage.style.setProperty("height", aioOnImage.aioOldStyles.height, "");
    
    // restore max/min styles
    aioOnImage.style.setProperty("max-width", aioOnImage.aioOldStyles.maxWidth, "");
    aioOnImage.style.setProperty("max-height", aioOnImage.aioOldStyles.maxHeight, "");
    aioOnImage.style.setProperty("min-width", aioOnImage.aioOldStyles.minWidth, "");
    aioOnImage.style.setProperty("min-height", aioOnImage.aioOldStyles.minHeight, "");
    
    delete aioOnImage.aioOldStyles;
  }
}

function aioSaveImageAs() {
  if (!aioOnImage) return;
  if (aioFxV18) saveImageURL(aioOnImage.src, null, "SaveImageTitle", false, false,
                         aioOnImage.ownerDocument.documentURIObject, aioOnImage.ownerDocument);
  else 
     saveImageURL(aioOnImage.src, null, "SaveImageTitle", false,
       false, aioOnImage.ownerDocument.documentURIObject);

}

function aioCloseCurrTab(lastTabClosesWindow) {
  if (aioClosePrintPreview()) {
    return;
  }
  
  switch (aioWindowType) {
    case "browser":
      if (aioContent.mTabContainer.childNodes.length > 1 || !lastTabClosesWindow) {
        if (aioGestureTab) {
          aioContent.removeTab(aioGestureTab);
        } else {
          aioContent.removeCurrentTab();
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
}

function aioUndoCloseTab() {
  try { // Fx
    undoCloseTab();
  }
  catch (e) { // SM
    gBrowser.undoCloseTab(0);
  }
}

function aioGotoLastTab() {
  switch (aioWindowType) {
    case "browser":
      aioContent.selectedTab = aioContent.mTabContainer.childNodes[aioContent.mTabContainer.childNodes.length - 1];
      break;
    
    case "messenger":
      var tabmail = GetTabMail();
      
      if (tabmail) {
        tabmail.tabContainer.selectedIndex = tabmail.tabContainer.childNodes.length - 1;
      }
      break;
  }
}

function aioRemoveAllTabsBut() {
  if (aioWindowType == 'browser') {
    gBrowser.removeAllTabsBut(aioGestureTab ? aioGestureTab : aioContent.mCurrentTab);
  }
}

function _aioIsRTL() {
  var chromedir;
  try {
    var pref = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch);
    var locale = pref.getCharPref("general.useragent.locale");
    chromedir = pref.getCharPref("intl.uidirection." + locale);
  } catch(e) {}
  
  return chromedir == "rtl";
}

function aioCloseRightTabs() {
  var tab = aioGestureTab ? aioGestureTab : aioContent.mCurrentTab;
  
  if (typeof gBrowser.removeTabsToTheEndFrom == 'function') {
    gBrowser.removeTabsToTheEndFrom(tab); // Fx
    
  } else {
    if (_aioIsRTL()) {
      _aioCloseTabsBefore(tab);
    } else {
      _aioCloseTabsAfter(tab);
    }
  }
}

function _aioCloseTabsBefore(tab) {
  var tabs = gBrowser.tabContainer.childNodes;
  var i;
  for( i=tabs.length-1; tabs[i] != tab; i--) {}
  for (i--; i>=0; i--) {
    if(!tabs[i].pinned){
      gBrowser.removeTab(tabs[i]);
    }
  }
}

function _aioCloseTabsAfter(tab) {
  var tabs = gBrowser.tabContainer.childNodes;
  for (var i=tabs.length-1; tabs[i] != tab; i--) {
    if(!tabs[i].pinned) {
      gBrowser.removeTab(tabs[i]);
    }
  }
}


function aioGetReferrer() {
  try {
    var refURL = aioSrcEvent.target.ownerDocument.location.href;
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    if (refURL) return ioService.newURI(refURL, null, null);
  }
  catch (e) {}
  return null;
}

/**
 * @param {string} url
 * @param {boolean} userPref Whether to respect pref "Switch to new tabs
 * from opened links" in tabbed browsing preferences
 * @param {boolean} bg Whether to open in background tab 
 * @param {boolean} [reverseBg] Whether to reverse final background setting
 * @returns {object|null} New tab if invoked from a browser window
 */
function aioLinkInTab(url, usePref, bg, reverseBg) {
  url = aioSanitizeUrl(url);
  
  if (aioWindowType == "browser") {
    var tab = aioContent.addTab(url, aioGetReferrer());
    var loadInBg = (usePref && (aioPrefRoot.getBoolPref("browser.tabs.loadInBackground") != bg)) || (!usePref && bg);
    
    if (reverseBg) {
      loadInBg = !loadInBg;
    }
    
    if (!loadInBg) aioContent.selectedTab = tab;
    return tab;
  
  } else {
    if (reverseBg) {
      bg = !bg;
    }
    
    if (aioIsFx) {
      openNewTabWith(url);
    } else {
      openNewTabWindowOrExistingWith(kNewTab, url, null, !!bg);
    }
    return null;
  }
}

function aioSanitizeUrl(url) {
    if (url.indexOf("view-source:") == 0) {
      url = url.substr(12);
    }
    return url;
}

function aioDupTab(reverseBg) {
  switch (aioWindowType) {
    case "browser":
      var url = aioGestureTab ? aioGestureTab.linkedBrowser.contentDocument.location.href : window.content.document.location.href;
      aioLinkInTab(url, true, false, reverseBg);
      break;
    
    case "messenger":
      MsgOpenNewTabForMessage();
      break;
    
  }
}

function aioOpenInNewTab(bg) {
  if (aioOpenLinkInNew && aioOnLink.length) {
     aioLinkInTab(aioOnLink[0].href, false, bg);
  }
  else {
    if (aioWindowType == "browser") {
      if (aioGestureTab) {
        // open new tab next to selected tab
        var selectedTabPos = aioContent.getTabIndex ? aioContent.getTabIndex(aioGestureTab) : aioGestureTab._tPos;
      }
      
      if (!bg) {
        if (aioIsRocker && !aioGestureTab && aioSrcEvent) {
          // prevent selection from staying in unfinished state
          _aioSendMouseUpEvent(aioSrcEvent);
        }

        BrowserOpenTab();
        if (aioGestureTab) {
          aioContent.moveTabTo(aioContent.mCurrentTab, selectedTabPos + 1);
        
          if (aioIsRocker && aioSrcEvent && aioSrcEvent.button == aioLMB) {
            setTimeout(function() {
              aioContent.mTabContainer.selectedIndex = selectedTabPos + 1;
            }, 100);
          }
        }
        
      } else {
        var newTab = aioLinkInTab("about:blank", false, true);
        if (aioGestureTab) {
          aioContent.moveTabTo(newTab, selectedTabPos + 1);
        }
      }
    
    } else {
      if (aioIsFx) {
        openNewTabWith("about:blank");
      } else {
        openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, !!bg);
      }
    }
  }
}

function aioLinksInTabs() {
  if (aioWindowType == "browser") {
    for (var i = 0; i < aioOnLink.length; ++i) {
      aioContent.addTab(aioSanitizeUrl(aioOnLink[i].href), aioGetReferrer());
    }
  
  } else {
    if (aioOnLink.length > 0) {
      if (aioIsFx) {
        openNewTabWith(aioSanitizeUrl(aioOnLink[0].href));
      } else {
        openNewTabWindowOrExistingWith(kNewTab, aioSanitizeUrl(aioOnLink[0].href), null, false);
      }
      
      var links = [];
      for (var i = 1; i < aioOnLink.length; ++i) {
        links.push(aioSanitizeUrl(aioOnLink[i].href));
      }
      
      setTimeout(function() {
        for (var i = 0; i < links.length; ++i) {
          if (aioIsFx) {
            openNewTabWith(links[i]);
          } else {
            openNewTabWindowOrExistingWith(kNewTab, links[i], null, false);
          }
        }
      }, 500);
    }
  }
}

function aioLinksInFiles() {
  var hRefLC, dontAskBefore;
  try {dontAskBefore = aioPrefRoot.getBoolPref("browser.download.useDownloadDir");}
  catch(err) {dontAskBefore = false;}
  for (var i = 0; i < aioOnLink.length; ++i) {
    hRefLC = aioOnLink[i].href.toLowerCase();
    if (hRefLC.substr(0, 7) != "mailto:" && hRefLC.substr(0, 11) != "javascript:" &&
        hRefLC.substr(0, 5) != "news:" && hRefLC.substr(0, 6) != "snews:")
       if (aioFxV18) saveURL(aioOnLink[i].href, aioGetTextForTitle(aioOnLink[i].node), null, true, dontAskBefore,
	                      aioOnLink[i].node.ownerDocument.documentURIObject, aioOnLink[i].node.ownerDocument);
	   else saveURL(aioOnLink[i].href, aioGetTextForTitle(aioOnLink[i].node), null, true, dontAskBefore);

  }
}

function aioNewWindow(url, flag, noSanitize) {
  if (!noSanitize) url = aioSanitizeUrl(url);
  
  var chromeURL = aioIsFx ? "chrome://browser/content/" : "chrome://navigator/content/";
  
  if (window.content && window.content.document) {
     var charsetArg = "charset=" + window.content.document.characterSet;
     return window.openDialog(chromeURL, "_blank", "chrome,all,dialog=no" + flag, url, charsetArg);
  }
  return window.openDialog(chromeURL, "_blank", "chrome,all,dialog=no" + flag, url);
}

function aioLinksInWindows() {
  if (!aioOnLink.length) return;
  if (aioSingleNewWindow) {
    var win = aioNewWindow(aioOnLink[0].href, "");
    
    var gestureLinks = [];
    for (var i = 1; i < aioOnLink.length; ++i) {
      gestureLinks.push(aioOnLink[i].href);
    }
    
    win.addEventListener("load", function () {
      setTimeout(function() {
        for (var i = 0; i < gestureLinks.length; ++i) {
          win.gBrowser.addTab(aioSanitizeUrl(gestureLinks[i]));
        }
      }, 100);
    }, true);
  }
  else
     for (var i = 0; i < aioOnLink.length; ++i) {
        aioNewWindow(aioSanitizeUrl(aioOnLink[i].href), "");
     }
}

function aioSetToNormalZ(aWindow) {
  window.focus();
  var treeowner = aWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem).treeOwner;
  var xulwin = treeowner.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIXULWindow);
  xulwin.zLevel = xulwin.normalZ;
}

/**
 * @param {?string} url URL to open, if null then URL will be detected from the underlying
 * link or image.
 * @param {boolean} background
 * @param {boolean} [noSanitize]
 * @param {boolean} [priv] indicates opening private window
 */
function aioOpenNewWindow(url, background, noSanitize, priv) {
  var flags = (background && aioIsWin) ? ",alwaysLowered" : "";
  
  if (priv) {
    flags += ",private";
  }
  
  if (url === null) {
    if (aioOpenLinkInNew && aioOnLink.length) {
       url = aioOnLink[0].href;
    }
    else {
       url = "";
    }    
  }
  
  if (url == "" && priv) {
    url = "about:privatebrowsing";
  }
  
  var win = aioNewWindow(url, flags, noSanitize);
  
  if (background) {
    if (aioIsWin) {
      setTimeout(function(a){aioSetToNormalZ(a);}, 500, win);
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
}

function aioDupWindow(background) {
  switch (aioWindowType) {
    case "browser":
    case "source":
      var url = aioGestureTab ? aioGestureTab.linkedBrowser.contentDocument.location.href : window.content.document.location.href;
      
      aioOpenNewWindow(url, background, true);
      break;
    
    case "messenger":
      MsgOpenNewWindowForMessage();
      break;
  }
}

function aioCloseWindow() {
  if (aioClosePrintPreview()) {
    return;
  }
  
  switch (aioWindowType) {
    case "mailcompose":
      goDoCommand('cmd_close');
      break;
    
    default:
    if ("BrowserTryToCloseWindow" in window)
        window.setTimeout(function() { BrowserTryToCloseWindow(); }, 10);
      else
        window.setTimeout(function() { window.close(); }, 10);      
  }
}

// open link in new window and double stack
function aioDoubleWin() {
  var link = aioOnLink.length ? aioOnLink[0].href : "about:blank";
  window.moveTo(screen.availLeft, screen.availTop);
  
  if (aioIsWin) {
    // only on Win screen.availWidth & screen.availHeight are correct
    var win = aioNewWindow(link, "");
    window.resizeTo(screen.availWidth / 2, screen.availHeight);
    win.moveTo(screen.availWidth / 2 + screen.availLeft, screen.availTop);
    win.resizeTo(screen.availWidth / 2, screen.availHeight);
   
  } else {
    var win = aioNewWindow(link, "top=" + screen.availTop + ",left=" + screen.availLeft + ",outerWidth=" + screen.availWidth + ",outerHeight=" + screen.availHeight);
    
    var shift = 5; // prevent overlapping on linux

    win.addEventListener("load", function () {
      win.resizeTo(win.outerWidth / 2 - shift, win.outerHeight);
      setTimeout(function() {
        window.resizeTo(win.outerWidth, win.outerHeight);
        win.moveTo(win.outerWidth + screen.availLeft + shift, screen.availTop);
      }, 100);
    }, true);
  }
}

function aioNextPrevLink(next) { // submitted by Christian Kruse
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
  var doc = aioSrcEvent.target.ownerDocument;
  var links = doc.getElementsByTagName("link");
  var imgElems;
  for (var i = 0; i < links.length; ++i)
    if (links[i].getAttribute("rel") && links[i].getAttribute("rel").toLowerCase() == relStr)
       if (links[i].href) {loadURI(links[i].href); return;}
  if (!aioNextsString) return;
  var nextArray = next ? aioNextsString.split("|") : aioPrevsString.split("|");
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
}

function aioSmartBackForward(aRwnd, aCurrDomainEndPoint) { // derived from SHIMODA "Piro" Hiroshi Rewind/Fastforward buttons
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
}

function aioFastForward() {
  var sessionH = getWebNavigation().sessionHistory;
  if (sessionH.index < 0 || sessionH.count <= 0) return; // Firefox bug
  if (sessionH.index + 1 < sessionH.count) BrowserForward();
  else aioNextPrevLink(true);
}

function aioHomePage() {
  if (aioIsFx) {
    
    switch (aioWindowType) {
      case "browser":
        var url = gHomeButton.getHomePage();
        if (aioGoUpInNewTab && !/^about:(blank|newtab|home)/.test(window.content.document.location.href)) {
          aioLinkInTab(url, false, false);
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
    switch (aioWindowType) {
      case "browser":
        var homePage = getHomePage();
        var where = (aioGoUpInNewTab && !/^about:(blank|newtab|home)/.test(window.content.document.location.href)) ? 'tab' : 'current';
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
}

function aioUpDir() { // from Stephen Clavering's GoUp
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
  var url = getUp(window.content.document.location.href);
  if (!url) return;
  if (aioGoUpInNewTab) aioLinkInTab(url, false, false);
  else loadURI(url);
}

function aioRestMaxWin() {
  if (window.fullScreen) {
    window.fullScreen = false;
    return;
  }
  
  if (window.windowState == STATE_MAXIMIZED) window.restore();
  else window.maximize();
 }

function aioFullScreen() {
  switch (aioWindowType) {
    case 'browser':
      BrowserFullScreen();
      break;
    
    default:
      aioRestMaxWin();
  }
}

function aioDebugProps(obj) {
  var s="";
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] != "function") {
      s += key + "=" + obj[key] + "\n";
    }
  }
  
  alert(s);
}

function aioPageInfo() {
  BrowserPageInfo(aioGestureTab ? aioGestureTab.linkedBrowser.contentWindow.document : null);
}

function aioFrameInfo() {
  var targetDoc = aioSrcEvent.target.ownerDocument;
  if (targetDoc.defaultView.frameElement) BrowserPageInfo(targetDoc); // it's a frame
  else BrowserPageInfo(aioGestureTab ? aioGestureTab.linkedBrowser.contentWindow.document : null);
}

function aioShowHideStatusBar() {
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
}

function aioToggleBookmarksToolbar() {
  var bar = document.getElementById("PersonalToolbar");
  if (bar) {
    if (aioIsFx) {
      window.setToolbarVisibility(bar, bar.collapsed);
    } else {
      goToggleToolbar('PersonalToolbar');
    }
  }
}

function aioViewSource(frame) {
  if (aioWindowType == "messenger") {
    goDoCommand("cmd_viewPageSource");
    
  } else {
    if (frame) {
      BrowserViewSourceOfDocument(aioGestureTab ? aioGestureTab.linkedBrowser.contentWindow.document : aioSrcEvent.target.ownerDocument);
    } else {
      BrowserViewSourceOfDocument(aioGestureTab ? aioGestureTab.linkedBrowser.contentWindow.document : window.content.document);
    }
  }
}

function aioViewCookies() {
  var cookieStr = "";
  var cookies = _aioGetDomainCookies(window.content.document);
  
  if (cookies.length) {
    for (var i=0; i<cookies.length; i++) {
      var cookie = cookies[i];
      cookieStr += cookie.host + ": " + cookie.name + "=" + cookie.value + "\n";
    }
    
    alert(aioGetStr("cookies") + "\n\n" + cookieStr);
  
  } else {
    alert(aioGetStr("noCookies"));
  }
}

function aioDeleteCookies() {
  var cookies = _aioGetDomainCookies(window.content.document);
  if (!cookies.length) {
    alert(aioGetStr("noCookies"));
    return;
  }
  
  var confMsg = aioGetStr("deleteCookies").replace("%", cookies.length);
  
  if (!confirm(confMsg)) {
    return;
  }
  
  var cookie;
  for (var i=0; i<cookies.length; i++) {
    cookie = cookies[i];
    Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).remove(cookie.host, cookie.name, cookie.path, false);
  }
  
  aioStatusMessage(aioGetStr("cookiesDeleted"), 4000);
}

// Get all cookies in domain of given document
function _aioGetDomainCookies(doc) {
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
}

function aioBookmarkCurrentPage() {
  PlacesCommandHook.bookmarkCurrentPage(true, PlacesUtils.bookmarksMenuFolderId);
}

function aioMetaInfo() {
  var metas, metastr, mymeta;
  metas = window.content.document.getElementsByTagName("meta");
  if (metas.length) {
    metastr = aioGetStr("meta") + "\n\n";
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
  else alert(aioGetStr("noMeta"));
}

function aioActionOnPage(caseNb) { // code by Ben Basson aka Cusser
  var service, serviceDomain;
  switch(caseNb) {
    case 0: service = "http://validator.w3.org/check?uri=";
            serviceDomain = "validator.w3.org";
            break;
    case 1: service = aioGetStr("g.translateURL");
            serviceDomain = "translate.google.com";
  }
  var targetURI = getWebNavigation().currentURI.spec; 
  if (targetURI.indexOf(serviceDomain) >= 0) BrowserReload(); // already activated
  else loadURI(encodeURI(service + targetURI));
}

function aioOpenAioOptions() {
  window.openDialog(mgsuite.CHROME_DIR + "pref/aioOptions.xul", "", "chrome,dialog,modal,resizable");
}

function aioOpenBookmarksManager() {
  if (aioIsFx) {
    PlacesCommandHook.showPlacesOrganizer('AllBookmarks');
  } else {
    toOpenWindowByType("bookmarks:manager",
      "chrome://communicator/content/bookmarks/bookmarksManager.xul");
  }
}

function aioOpenDownloadManager() {
  if (aioIsFx) {
    BrowserDownloadsUI();
  } else {
    toOpenWindowByType("Download:Manager",
                            "chrome://communicator/content/downloads/downloadmanager.xul",
                            "chrome,dialog=no,resizable");
  }
}

function aioImageInWindow() {
   if (aioOnImage) aioNewWindow(aioOnImage.src);
}

function aioImageInTab() {
   if (aioOnImage) aioLinkInTab(aioOnImage.src, false, false);
}

function aioSwitchTab(advanceBy) {
  switch (aioWindowType) {
    case "browser":
      aioContent.mTabContainer.advanceSelectedTab(advanceBy, true);
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
}

function aioOpenBlankTab() {
  switch (aioWindowType) {
    case "browser":
      if (aioGestureTab) {
        // open new tab next to selected tab
        var selectedTabPos = aioContent.getTabIndex ? aioContent.getTabIndex(aioGestureTab) : aioGestureTab._tPos;
      }
      
      if (aioIsRocker && !aioGestureTab && aioSrcEvent) {
        // prevent selection from staying in unfinished state
        _aioSendMouseUpEvent(aioSrcEvent);
      }

      BrowserOpenTab();
      if (aioGestureTab) {
        aioContent.moveTabTo(aioContent.mCurrentTab, selectedTabPos + 1);
        
        if (aioIsRocker && aioSrcEvent && aioSrcEvent.button == aioLMB) {
          setTimeout(function() {
            aioContent.mTabContainer.selectedIndex = selectedTabPos + 1;
          }, 100);
        }
      }
      break;
    
    default:
      if (aioIsFx) {
        openNewTabWith("about:blank");
      } else {
        openNewTabWindowOrExistingWith(kNewTab, "about:blank", null, false);
      }
  }
}

function aioSavePageAs() {
  switch (aioWindowType) {
    case "browser":
    case "source":
      saveDocument(aioGestureTab ? aioGestureTab.linkedBrowser.contentWindow.document : window.content.document);
      break;
    
    case "messenger":
      MsgSaveAsFile();
      break;
  }
}

// Detach tab to new window
function aioDetachTab() {
  var tabLength = gBrowser.tabContainer.childNodes.length;
  if (tabLength <= 1) return;

  _aioDetachTab(aioGestureTab ? aioGestureTab : gBrowser.selectedTab);
}

// detach next tab and double stack windows
function aioDetachTabAndDoubleStack() {
  var tabLength = gBrowser.tabContainer.childNodes.length;
  if (tabLength <= 1) return;
  
  if (aioGestureTab) {
    aioContent.selectedTab = aioGestureTab;
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
  
  var newWin =_aioDetachTab(tabToDetach);
  
  setTimeout(function() {
    _aioDoubleStack2Windows(window, newWin);
  }, 500);
}

// detach given tab to new window
// returns opened window object
var aioClonedData;

function _aioDetachTab(tabToDetach) {
  var tabLength = gBrowser.tabContainer.childNodes.length;
  if (tabLength <= 1) return null;

  aioClonedData = _aioGetClonedData(tabToDetach);
  gBrowser.removeTab(tabToDetach);
  
  var openedWindow = window.openDialog(getBrowserURL(), '_blank', 'chrome,all,dialog=no');

  // Wait until session history is available in the new window
  openedWindow.addEventListener('load',
      function() {
        _aioWaitForSessionHistory(10, openedWindow);
      }, false);
  
  return openedWindow;
}

function _aioWaitForSessionHistory(attempts, openedWindow) {
  // Test if sessionHistory exists yet
  var webNav = openedWindow.getBrowser().webNavigation;
  try {
    webNav.sessionHistory;
  }

  // webNav.sessionHistory is not yet available, try again later
  catch (err) {
    if (attempts)
      window.setTimeout(_aioWaitForSessionHistory, 100, --attempts, openedWindow);
    return;
  }
  if ((webNav.sessionHistory == null) && attempts) {
    window.setTimeout(_aioWaitForSessionHistory, 100, --attempts, openedWindow);
    return;
  }

  _aioSetClonedData(openedWindow.getBrowser().selectedTab, aioClonedData);
}

/* getClonedData
 * get the data from the tab which is to be cloned.
 *
 * @param aTab:       tabbrowser tab which should be cloned.
 * returns object containing the data which should be cloned.
 */
function _aioGetClonedData(aTab)
{
  var browser = aTab.ownerDocument.defaultView.gBrowser.getBrowserForTab(aTab);
  var clonedData = new Array();
  clonedData[0] = _aioCopyTabHistory(browser.webNavigation.sessionHistory);
  clonedData[1] = browser.contentWindow.scrollX;
  clonedData[2] = browser.contentWindow.scrollY;
  clonedData[3] = browser.markupDocumentViewer.textZoom;
  clonedData[4] = browser.markupDocumentViewer.fullZoom;

  return clonedData;
}

/* setClonedData
 * sets the data cloned from the original tab into a new tab.
 * @param aTab:        the new tab the data has to be set to.
 * @param aClonedData: object containing the data.
 *
 * returns  boolean to indicate successfullness
 */
function _aioSetClonedData(aTab, aClonedData)
{
  var browser = aTab.ownerDocument.defaultView.gBrowser.getBrowserForTab(aTab);
  function setTextZoom(attempts) {
    browser.markupDocumentViewer.textZoom = aClonedData[3];
    if (attempts && browser.markupDocumentViewer.textZoom != aClonedData[3])
      setTimeout(setTextZoom, 10, --attempts)
  }

  function setFullZoom(attempts) {
    browser.markupDocumentViewer.fullZoom = aClonedData[4];
    if (attempts && browser.markupDocumentViewer.fullZoom != aClonedData[4])
      setTimeout(setFullZoom, 10, --attempts)
  }

  function setScrollPosition(attempts) {
    browser.contentWindow.scrollTo(aClonedData[1], aClonedData[2]);
    if (attempts && (browser.contentWindow.scrollX != aClonedData[1] || browser.contentWindow.scrollY != aClonedData[2]))
      setTimeout(setScrollPosition, 10, --attempts);
  }

  if (aClonedData[0].length == 0)
    return false;

  _aioCloneTabHistory(browser.webNavigation, aClonedData[0]);
  setScrollPosition(15);
  setTextZoom(15);
  setFullZoom(15);

  return true;
}

// Clone an array of history entries into a browsers webNavigation.sessionHistory
// Argument1 webNav: The webNavigation object of a newly created browser.
// Argument2 originalHistory: an array containing history entries from the original browser
function _aioCloneTabHistory(webNav, originalHistory)
{
  var newHistory = webNav.sessionHistory;

  newHistory.QueryInterface(Components.interfaces.nsISHistoryInternal);

  // delete history entries if they are present
  if (newHistory.count > 0)
    newHistory.PurgeHistory(newHistory.count);

  for (var i = 0; i < originalHistory.length; i++) {
    var entry = originalHistory[i].QueryInterface(Components.interfaces.nsISHEntry);
    var newEntry = _aioCloneHistoryEntry(entry);
    if (newEntry)
      newHistory.addEntry(newEntry, true);
  }

  // Go to current history location
  if (originalHistory.index < originalHistory.length)
    gotoHistoryIndex(10);

  function gotoHistoryIndex(attempts) {
    try {
      webNav.gotoIndex(originalHistory.index);
    }
    catch(e) {
      // do some math to increase the timeout
      // each time we try to update the history index
      if (attempts)
        setTimeout(gotoHistoryIndex, (11 - attempts) * (15 - attempts), --attempts);
    }
  }
}

function _aioCloneHistoryEntry(aEntry) {
  if (!aEntry)
    return null;
  aEntry = aEntry.QueryInterface(Components.interfaces.nsISHContainer);
  var newEntry = aEntry.clone();
  newEntry = newEntry.QueryInterface(Components.interfaces.nsISHContainer);
  newEntry.loadType = Math.floor(aEntry.loadType);
  if (aEntry.childCount) {
    for (var j = 0; j < aEntry.childCount; j++) {
        var childEntry = _aioCloneHistoryEntry(aEntry.GetChildAt(j));
        if (childEntry)
          newEntry.AddChild(childEntry, j);
    }
  }
  return newEntry;
}

// copy a sessionHistory and put it into an array
// Argument1 originalHistory: webNavigation.sessionHistory browser history to be copied
// returns: an array containing a copy of the history
function _aioCopyTabHistory(originalHistory)
{
  var range = {start: 0, index: originalHistory.index, length: originalHistory.count};

  var copiedHistory = new Array();
  for (var i = range.start; i < range.length; i++) {
    copiedHistory.push(originalHistory.getEntryAtIndex(i, false));
  }
  copiedHistory.index = range.index;

  return copiedHistory;
}


// double stack 2 windows: current and previously focused
function aioDoubleStackWindows() {
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
  
  _aioDoubleStack2Windows(win1, win2);
  
  setTimeout(function() {
    window.focus();
  }, 200);
}

function _aioDoubleStack2Windows(win1, win2) {
  function positionWindows(availHeight) {
    var shift = aioIsWin ? 0 : 5; // prevent overlapping on linux
    win1.resizeTo(screen.availWidth / 2 - shift, availHeight);
    win2.resizeTo(screen.availWidth / 2 - shift, availHeight);
    
    setTimeout(function() {
      win1.moveTo(screen.availLeft, screen.availTop);
      win2.moveTo(screen.availWidth / 2 + screen.availLeft, screen.availTop);
    }, 100);
  }
  
  if (aioIsWin) {
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
}

function aioClosePrintPreview() {
  if (document.getElementById("print-preview-toolbar")) {
    PrintUtils.exitPrintPreview();
    return true;
  }

  return false;
}

function aioToggleSidebar() {
  switch (aioWindowType) {
    case "browser":
      if (aioIsFx) {
        toggleSidebar('viewBookmarksSidebar');
      } else {
        SidebarShowHide();
      }
      break;
    
    case "messenger":
      MsgToggleFolderPane(true);
      break;
  }
}

function aioTabFocus(e) {
  var activeTab = aioContent.mTabContainer.childNodes[aioContent.mTabContainer.selectedIndex];
  var activeId = activeTab.getAttribute("aioTabId");
  
  if (activeId) {
     if (aioTabFocusHistory[aioTabFocusHistory.length - 1].focused == activeId) {
      return; // already at top
    
     } else {
        for (var i = 0; i < aioTabFocusHistory.length; ++i) //search for a duplicated entry
          if (aioTabFocusHistory[i].focused == activeId) {
             aioTabFocusHistory.splice(i, 1); // Found: delete it
          }
        aioTabFocusHistory.push({focused: activeId});
     }
     
  } else { // tab's never been visited
     activeId = "t" + aioUnique++;
     activeTab.setAttribute("aioTabId", activeId);
     aioTabFocusHistory.push({focused: activeId});
  }
}

function aioOpenConsole() {
  if (aioIsFx) {
    if (gDevToolsBrowser) {
      gDevToolsBrowser.toggleToolboxCommand(gBrowser);
    }
    
  } else {
    toJavaScriptConsole();
  }
}

function aioNullAction() {
  alert("This action does not exist");
}

function _aioSendMouseUpEvent(e) {
  var dwu = e.view.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowUtils);
  
  dwu.sendMouseEvent("mouseup", e.clientX, e.clientY, 0, 1, 0);
}
