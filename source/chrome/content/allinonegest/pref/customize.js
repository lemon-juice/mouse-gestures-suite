/*
 * customize.js
 *
 * handling of gesture customization tree
 *
 */
"use strict";

//******** define a js object to implement nsITreeView
function gestCustomizeTreeView(columnids) {
  // columnids is an array of strings indicating the names of the columns, in order
  this.columnids = columnids;
  this.colcount = columnids.length

  this.copycol = -1;
  this.rows = 0;
  this.tree = null;
  this.data = new Array;
  this.selection = null;
  this.sortcol = null;
  this.sortdir = 0;
  this.stdRowCount = -1;
  this.hoveredRow = -1;
  this.topOrBottom = false;
  this.before = false;
}

gestCustomizeTreeView.prototype = {
  set rowCount(c) { throw "rowCount is a readonly property"; },
  get rowCount() { return this.rows; },

  setTree: function(tree) {
    this.tree = tree;
  },

  getCellText: function(row, column) {
    return this.data[row].row[column.index] || "";
  },

  setCellText: function(row, column, value) {
    this.data[row].row[column.index] = value;
  },

  addRow: function(row, type, token, metaData) {
    this.rows = this.data.push(
        {
          "row": row,
          "type": type,
          "token": token,
          "metaData": metaData || null
        });
    this.rowCountChanged(this.rows - 1, 1);
  },

  removeLastRow: function() {
    this.data.pop();
    this.rowCountChanged(--this.rows, -1);
  },

  rowCountChanged: function(index, count) {
    this.tree.rowCountChanged(index, count);
  },

  invalidate: function() {
    this.tree.invalidate();
  },

  getRowProperties: function(row, prop) {
    if (this.getCellText(row, functionCol) == ""
        && this.getCellText(row, gestureCol) == "") {
      return "separator";
    }
    
    if (row == this.hoveredRow) {
      if (this.topOrBottom) {
        return "aioHoverCol";
      } else {
        return "aioHovered";
      }
    }
    return "";
  },

  setCellValue: function(row, column, value) { },
  handleCopy: function(row) { },
  performActionOnRow: function(action, row) { },

  getCellProperties: function(row, column) {
    if (column.id == "enabledColId") {
      if (this.getCellText(row, functionCol) == ""
          && this.getCellText(row, gestureCol) == "") {
        return "noMarker";
      } else if (isEnabledTable[row]) {
        return "aioGestDisabled";
      } else {
        return "aioGestEnabled";
      }
    }
    if (column.id == "infoColId") {
      if (this.getCellText(row, functionCol) == ""
          && this.getCellText(row, gestureCol) == "") {
        return "separator";
      }
      
      var token = this.getActionToken(row);
      var props = token ? "hasInfo" : "";
      if (token && helpTable[token]) {
        props += " documented";
      }
      return props;
    }
    return "";
  },
  getColumnProperties: function(column) { },
  isContainer: function(index) {return false;},
  isContainerOpen: function(index) {return false;},
  isSeparator: function(index) {
    var cells = this.data[index].row;
    return cells[0] == "" && cells[1] == "" && cells[2] == "" && cells[3] == "";
  },
  isSorted: function() { },
  canDrop: function(index, orientation) {
     this.before = orientation == -1;
     return false;
  },
  drop: function(row, orientation) {return false;},
  getParentIndex: function(index) {return -1;},
  hasNextSibling: function(index, after) {return false;},
  getLevel: function(index) {return 0;},
  getImageSrc: function(row, column) { },
  getProgressMode: function(row, column) { },
  getCellValue: function(row, column) { },
  toggleOpenState: function(index) { },
  cycleHeader: function(col) { },
  selectionChanged: function() { },
  cycleCell: function(row, column) { },
  isEditable: function(row, column) {return false;},
  performAction: function(action) { },
  performActionOnCell: function(action, row, column) { },
  
  getActionToken: function(row) {
    return this.data[row] ? this.data[row].token : null;
  },
  setActionToken: function(token, row) {
    this.data[row].token = token;
  },
  getRowType: function(row) {
    return this.data[row] ? this.data[row].type : null;
  },
  setRowType: function(type, row) {
    this.data[row].type = type;
  },
  getRowMetaData: function(row) {
    return this.data[row] ? this.data[row].metaData : null;
  },
  setRowMetaData: function(metaData, row) {
    this.data[row].metaData = metaData;
  },
  changeRowMetaData: function(row, key, val) {
    this.data[row].metaData[key] = val;
  }
};

const kAioMime = "text/allinone-row";
const kSAIID = Components.interfaces.nsISupportsArray;
const kSSIID = Components.interfaces.nsISupportsString;
const kDragContractId = "@mozilla.org/widget/dragservice;1";
const kDSIID = Components.interfaces.nsIDragService;
const kXferableContractID = "@mozilla.org/widget/transferable;1";
const kXferableIID = Components.interfaces.nsITransferable;
const kAtomService = Components.classes["@mozilla.org/atom-service;1"].createInstance(Components.interfaces.nsIAtomService);
const kNumberOfWheelGestures = 2;

var gestView, treeBoxView;
var gestureTree, treeBox, swapArea, customGestArea, funcArea, rowCount, rockerCount, totalCount;
var infoCol, functionCol, gestureCol, enabledCol;
var undoFunc = [], swapFunc = [], undoVal = [], swapVal = [], undoId = [];
var gUndoId = 0;
var swapping = false, editing = true, funcEditing = false, addingGest = false;
var edfuncLabel, addgestLabel, edfuncButton;
var rockerRow = -1, funcVal;
var bundle;
var localizedGest = [];
var abbrLocalizedGest = [];
var selTable = [], selHasRocker = false, selMissingDup = false;
var dragService = Components.classes[kDragContractId].getService(kDSIID);
var customGestSeparatorLabel;

// Contains abbreviated gesture definitions for each row like L, R, UDR, etc.
// Empty string if no gesture defined. '?' for rocker and scrollwheel gestures
var abbrTable = [];
var isEnabledTable = [];

// Contains array of built-in numeric function id's where key is row index
var funcNbTable = [];
var rowIdTable = [];
var rockFuncTable = [];
var helpTable = {};
var uniqueRowId;
var hidePopupTimer;


// When you want to remove an action change its name to "g.nullAction" in the table
// below. Such an action will not appear in customization preferences and its
// gesture sequence will not be saved to prefs on next save.
// Do not re-use the index - when you want to add new action then create it with the
// next index in sequence, otherwise it may not appear in customization pane.

var gestActionTableTokens = [
      "g.browserBack", //0
      "g.browserForward", //1
      "g.browserReload", //2
      "g.browserReloadSkipCache", //3
      "g.browserStop", //4
      "g.browserHome", //5
      "g.openNewWindow", //6
      "g.duplicateWindow", //7
      "g.upDir", //8
      "g.browserOpenTabInFg", //9
      "g.duplicateTab", //10
      "g.nextTab", //11
      "g.previousTab", //12
      "g.closeOther", //13
      "g.restMaxWin", //14
      "g.minWin", //15
      "g.fullScreen", //16
      "g.openSelection", //17
      "g.closeDoc", // 18
      "g.viewPageSource", //19
      "g.viewFrameSource", //20
      "g.viewSiteCookies", //21
      "g.pageInfo", //22
      "g.jsConsole", //23
      "g.nullAction", //24
      "g.addBookmark", //25
      "g.doubleStackWin", //26
      "g.doubleImageSize", //27
      "g.halveImageSize", //28
      "g.hideObject", //29
      "g.zoomIn", //30
      "g.zoomOut", //31
      "g.resetZoom", //32
      "g.w3cValidate", //33
      "g.linksInWindows", //34
      "g.linksInTabs", //35
      "g.metaInfo", //36
      "g.scrollDown", //37
      "g.scrollUp", //38
      "g.scrollToTop", //39
      "g.scrollToBottom", //40
      "g.resetImage", //41
      "g.nullAction", //42
      "g.hideFlash", //43
      "g.URLToClipboard", //44
      "g.firstPage", //45
      "g.showGestures", //46
      "g.closeTab", //47
      "g.incURL", //48
      "g.decURL", //49
      "g.clearDigitFlipper", //50
      "g.linksInFiles", //51
      "g.undoCloseTab", //52
      "g.printPreview", //53
      "g.browserOpenTabInBg", //54
      "g.deleteSiteCookies", //55
      "g.undoHideObject", //56
      "g.openFav1", //57
      "g.openFav2", //58
      "g.openBlankTab", //59
      "g.closeWindow", //60
      "g.openWindowInBg", //61
      "g.frameInfo", //62
      "g.aioOptions", //63
      "g.nullAction", //64
      "g.bookmarkMgr", //65
      "g.translate", //66
      "g.downloadMgr", //67
      "g.savePageAs", //68
      "g.prevSelectedTab", //69
      "g.showHideStatusBar", //70
      "g.reloadFrame", //71
      "g.enlargeObject", //72
      "g.reduceObject", //73
      "g.resetSize", //74
      "g.nullAction", //75
      "g.reloadAllTabs", //76
      "g.nextLink", //77
      "g.fastForward", //78
      "g.searchSelection", //79
      "g.saveImageAs", //80
      "g.prevLink", //81
      "g.lastTab", //82
      "g.pasteAndGo", //83
      "g.smartBack1", //84
      "g.smartBack2", //85
      "g.smartForward1", //86
      "g.smartForward2", //87
      "g.print", //88
      "g.openImageInTab", //89,
      "g.openImageInWin", //90
      "g.detachTab", //91
      "g.detachTabAndDoubleStack", //92
      "g.doubleStack2Windows", //93
      "g.toggleSidebar", //94
      "g.openPrivateWindow", //95
      "g.toggleBookmarksToolbar", //96
      "g.closeTabsToTheRight", //97
      "g.saveImage", //98
    ];
var gestActionTable = [];
var rockerGestName = [
      "g.leftRocker",
      "g.rightRocker",
      "g.forwardWheel",
      "g.backwardWheel"
    ];
    
function removeFromUndoList(rowId) {
  for (var i = 0; i < undoFunc.length; i++)
    if (undoFunc[i] == rowId) {
       undoId.splice(i, 1); undoFunc.splice(i, 1);
       undoVal.splice(i, 1); swapFunc.splice(i, 1);
    }
  buttEnable(["undoId"], [undoFunc.length]);
}

function setScrollGesturesVisibility(show) {
  if (rockerCount == rockerGestName.length) {
     if (show) return;
     var j = rockerCount - kNumberOfWheelGestures;
     for (var i = totalCount - kNumberOfWheelGestures; i < totalCount; ++i, j++) {
        rockFuncTable[j] = isEnabledTable[i] + funcNbTable[i];
        removeFromUndoList(rowIdTable[i]);
     }  
     rockerCount -= kNumberOfWheelGestures; totalCount -= kNumberOfWheelGestures;
     for (i = 0; i < kNumberOfWheelGestures; ++i) gestView.removeLastRow();
  }
  else {
     if (!show) return;
     var k = rockerCount;
     rockerCount += kNumberOfWheelGestures;
     var j = totalCount;
     totalCount += kNumberOfWheelGestures;
     for (var i = k; i < rockerCount; ++i, ++j) {
        if (rockFuncTable[i].charAt(0) == "/") {
           rockFuncTable[i] = rockFuncTable[i].substr(1);
           isEnabledTable[j] = "/";
        }
        else isEnabledTable[j] = "";
        
        gestView.addRow(["", gestActionTable[rockFuncTable[i] - 0], "", rockerGestName[i]], "rocker", null);
        abbrTable[j] = "?";
        funcNbTable[j] = rockFuncTable[i];
        rowIdTable[j] = ++uniqueRowId + "";
     }
  }
  treeBox.invalidate();
  setTimeout(function(){selectRow(0);}, 0);
}

function returnCustomizedString(aCase) {
  var gestTable = [];
  var funcWritten = [] ;
  
  for (var i = 0; i < rowCount; ++i) {
    funcWritten[i] = false;
  }
  
  if (aCase == 2) {
    // info for rockerString pref
    for (i = rowCount + 1; i < totalCount; ++i) {
      gestTable.push(isEnabledTable[i] + funcNbTable[i]);
    }
    if (rockerCount < rockerGestName.length) {
      for (i = rockerCount; i < rockerGestName.length; ++i) {
        gestTable.push(rockFuncTable[i]);
      }
    }
    return gestTable.join("|");
  }
  
  var j = 0;
  for (i = 0; i < rowCount; ++i) {
    if (gestView.getRowType(i) == 'native') {
      // get info only for built-in functions
      if (!abbrTable[i] && (funcNbTable[i] == funcNbTable[i + 1] || funcWritten[funcNbTable[i]])) continue;
      funcWritten[funcNbTable[i]] = true;
      if (aCase == 1) {
        // info for functionString pref
        gestTable[j++] = funcNbTable[i];
      }
      else if (aCase == 0) {
        // info for gestureString pref
        gestTable[j++] = isEnabledTable[i] + abbrTable[i];
      }
    }
  }
  return gestTable.join("|");
}

/**
 * Get custom gestures in a format to be stored in a pref
 * (but not yet JSON encoded)
 * @returns {array} Array of gesture objects
 */
function getCustomGestures() {
  var gestures = [];
  
  for (var i = 0; i < rowCount; ++i) {
    if (gestView.getRowType(i) == 'custom') {
      let data = gestView.getRowMetaData(i);
      data.name = gestView.getCellText(i, functionCol);
      data.shape = isEnabledTable[i] + abbrTable[i];
      
      if (data.script) {
        if (data.scope == "content") {
          delete data.winTypes;
        }
      }
      
      if (typeof data.winTypes == 'object') {
        // shorter notation for pref
        data.winTypes = data.winTypes.join(",");
      }
      gestures.push(data);
    }
  }
  
  return gestures;
}

/**
 * Generate new auto-increment id for custom gesture
 * @returns {Number}
 */
function generateNewCustomGestureId() {
  var gestures = getCustomGestures();
  var id = 0;
  
  for (var i=0; i<gestures.length; i++) {
    if (gestures[i].id && gestures[i].id > id) {
      id = gestures[i].id;
    }
  }
  
  return id + 1;
}

/**
 * @param {string} aGesturesString
 * @param {string} aFuncsString
 * @param {string} aRockerString rockerString pref
 * @param {Array} customGestures Array of custom gestures object as defined in pref
 */
function populateTree(aGesturesString, aFuncsString, aRockerString, customGestures) {
  edfuncButton = document.getElementById("edfuncId");
  edfuncLabel = edfuncButton.label;
  addgestLabel = document.getElementById("addId").label;
  bundle = document.getElementById("allinonegestbundle");
  customGestSeparatorLabel = " " + bundle.getString("opt.listCustomFunctions") + ":";

  var maxActions = gestActionTableTokens.length;
  
  // load help descriptions for each action
  var parser = new DOMParser();
  var helpDoc = parser.parseFromString(ReadFile("chrome://mgsuite-en/content/help-options.html"), "text/html");
  var docTrs = helpDoc.querySelectorAll("table.gestlist tbody tr");
  var tds, matches, txt;
  for (var i=0; i<docTrs.length; i++) {
    tds = docTrs[i].getElementsByTagName('td');
    if (tds.length >= 4) {
      matches = /^\{([\w.]+)\}$/.exec(tds[0].firstChild.data.trim());
      if (matches && tds[3].textContent.trim()) {
        helpTable[matches[1]] = tds[3].innerHTML;
      }
    }
  }
  
  for (var i = 0; i < maxActions; ++i) {
    gestActionTable[i] = (gestActionTableTokens[i] != "g.nullAction") ? bundle.getString(gestActionTableTokens[i]) : gestActionTableTokens[i];
  }
  rockerCount = rockerGestName.length;
  for (i = 0; i < rockerCount; ++i)
     rockerGestName[i] = bundle.getString(rockerGestName[i]);
  localizedGest["R"] = bundle.getString("full.right");
  localizedGest["L"] = bundle.getString("full.left");
  localizedGest["U"] = bundle.getString("full.up");
  localizedGest["D"] = bundle.getString("full.down");
  localizedGest["+"] = bundle.getString("full.any");
  abbrLocalizedGest["R"] = bundle.getString("abbreviation.right");
  abbrLocalizedGest["L"] = bundle.getString("abbreviation.left");
  abbrLocalizedGest["U"] = bundle.getString("abbreviation.up");
  abbrLocalizedGest["D"] = bundle.getString("abbreviation.down");
  abbrLocalizedGest["+"] = "+";

  //inputBox = document.getElementById("customTextbox");
  //editArea = document.getElementById("customEdit");
  swapArea = document.getElementById("customSwap");
  customGestArea = document.getElementById("customGesturesControl");
  funcArea = document.getElementById("customEditFunc");
  gestureTree = document.getElementById("gesttree");
  treeBox = gestureTree.treeBoxObject;
  
  gestView = new gestCustomizeTreeView(["infoColId", "functionId", "enabledColId", "gestTextId"]);
  infoCol = gestureTree.columns["infoColId"];
  functionCol = gestureTree.columns["functionId"];
  gestureCol = gestureTree.columns["gestTextId"];
  enabledCol = gestureTree.columns["enabledColId"];
  treeBoxView = gestView;

  treeBox.view = gestView;
  var abbrT = aGesturesString.split("|");
  var funcNb = aFuncsString.split("|");
  rockFuncTable = aRockerString.split("|");
  var maxFunc = 0, j = 0, func;
  
  for (i = 0; i < abbrT.length; ++i) {
    func = funcNb[i] - 0;
    if (func < 0 || func >= maxActions || gestActionTable[func] == 'g.nullAction') {
      continue;
    }
    
    funcNbTable[j] = funcNb[i];
    
    if (abbrT[i].charAt(0) == "/") {
       abbrTable[j] = abbrT[i].substr(1);
       isEnabledTable[j] = "/";
    }
    else {
       abbrTable[j] = abbrT[i];
       isEnabledTable[j] = "";
    }
    rowIdTable[j] = j + "";
    gestView.addRow(["", gestActionTable[func], "", expandedText(abbrTable[j])], "native", gestActionTableTokens[func]);
    maxFunc = Math.max(maxFunc, func);
    ++j;
  }
  
  rowCount = abbrTable.length;
  for (i = maxFunc + 1; i < maxActions; ++i) { // enter actions new to this version
    gestView.addRow(["", gestActionTable[i], "", expandedText("")], "native", gestActionTableTokens[i]);
    abbrTable[rowCount] = "";
    funcNbTable[rowCount] = i + "";
    rowIdTable[rowCount] = rowCount + "";
    isEnabledTable[rowCount++] = "";
  }
  gestView.stdRowCount = rowCount;
  
  if (customGestures.length) {
    // custom gestures separator
    gestView.addRow([customGestSeparatorLabel, "", "", ""], "separator", null);  // separator
    abbrTable[rowCount] = "";
    rowCount++;
  }

  // populate custom gestures
  for (var i=0; i<customGestures.length; i++) {
    let rowData = {
      "id": customGestures[i].id,
      "menuId": customGestures[i].menuId,
      "script": customGestures[i].script,
      "scope": customGestures[i].scope,
      "winTypes": customGestures[i].winTypes ? customGestures[i].winTypes.split(',') : [],
    }
    var shape = customGestures[i].shape;
    
    if (shape.charAt(0) == "/") {
      isEnabledTable[rowCount] = "/";
      shape = shape.substr(1);
    } else {
      isEnabledTable[rowCount] = "";
    }
    
    gestView.addRow(["", customGestures[i].name, "", expandedText(shape)]
                    , "custom"
                    , null
                    , rowData);
    
    abbrTable[rowCount] = shape;
    rowIdTable[rowCount] = rowCount + "";
    rowCount++;
  }
  
  gestView.addRow([" " + bundle.getString("opt.listRockerAndScrollWheel") + ":", "", "", ""], "separator", null);  // separator
  
  abbrTable[rowCount] = "";
  funcNbTable[rowCount] = "";
  rowIdTable[rowCount] = rowCount + "";
  totalCount = rowCount + rockerCount + 1;
  
  // rocker gestures
  j = rowCount + 1;
  var label;
  
  for (i = 0; i < rockerCount; ++i, ++j) {
    if (rockFuncTable[i].charAt(0) == "/") {
      rockFuncTable[i] = rockFuncTable[i].substr(1);
      isEnabledTable[j] = "/";
    }
     else {
      isEnabledTable[j] = "";
    }
    func = rockFuncTable[i];
    
    if (func.charAt(0) == 'c') {
      // custom function
      label = getCustomFunctionNameById(func.substr(1));
      
    } else {
      // built-in function
      func = func - 0;
      if (func < 0 || func >= maxActions) {
        rockFuncTable[i] = "0";
      }
      
      label = gestActionTable[rockFuncTable[i] - 0];
    }
    
    gestView.addRow(["", label, "", rockerGestName[i]], "rocker", null);
    abbrTable[j] = "?";
    funcNbTable[j] = rockFuncTable[i];
    rowIdTable[j] = j + "";
  }
  
  uniqueRowId = totalCount;
  clearSelectionTable();
  setTimeout(function(){selectRow(0);}, 0); // some sync
  
  window.addEventListener("mousedown", hidePopupInfo, true);
  window.addEventListener("blur", hidePopupInfo, false);
}

function ReadFile(file) {
    var ioService=Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var scriptableStream=Components
        .classes["@mozilla.org/scriptableinputstream;1"]
        .getService(Components.interfaces.nsIScriptableInputStream);

    var channel=ioService.newChannel(file,null,null);
    var input=channel.open();
    scriptableStream.init(input);
    var str=scriptableStream.read(input.available());
    scriptableStream.close();
    input.close();
    
    var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].
        getService(Components.interfaces.nsIUTF8ConverterService);
    var str = utf8Converter.convertURISpecToUTF8(str, "UTF-8"); 
    
    return str;
}

// replace {placeholders} with transated text from .properties file
function aioTraslate(docFragment) {
  var elems = docFragment.querySelectorAll('*');
  var elem, txt, matches;

  for (var i = 0; i < elems.length; i++) {
    elem = elems[i];

    if (elem.firstChild && elem.firstChild.nodeName == '#text' && elem.firstChild.data) {
      txt = elem.firstChild.data.trim();
      matches = /^\{([\w.]+)\}$/.exec(txt);

      if (matches) {
        elem.firstChild.data = bundle.getString(matches[1]);
      }
    }
  }
}

function buttEnable(idTable, condTable) {
  var el;
  for (var i = 0; i < idTable.length; ++i) {
     el = document.getElementById(idTable[i]);
     if (condTable[i]) el.removeAttribute("disabled");
     else el.setAttribute("disabled", "true");
  }
}

function clearButtonsButUndo() {
  buttEnable(["clearId", "editId", "swapId", "edfuncId", "removeCustom", "undoId"], [false, false, false, false, false, undoFunc.length]);
}

function expandedText(aString) {
  if (aString.length) {
     var result = "", sep = "";
     for (var i = 0; i < aString.length; ++i) {
        result += sep + localizedGest[aString.charAt(i)];
        sep = "-";
     }
     return result;
  }
  return "----------";
}

function clearSelectionTable() {
  for (var i = 0; i < totalCount; ++i) selTable[i] = false;
}

function selectRow(aRow) {
  treeBoxView.selection.select(aRow);
  treeBox.ensureRowIsVisible(aRow);
}

function getSelections() {
  var sels = [];
  selHasRocker = false;
  selMissingDup = false;
  var count = treeBoxView.selection.getRangeCount();
  var min = { }, max = { };
  for (var i = 0; i < count; i++) {
    treeBoxView.selection.getRangeAt(i, min, max);
    if ((min.value > 1 && funcNbTable[min.value] == funcNbTable[min.value - 1]) ||
         (max.value > 0 && max.value < rowCount && funcNbTable[max.value] == funcNbTable[max.value + 1])) {
      selMissingDup = true;
    }
    
    for (var k = min.value; k <= max.value; ++k) {
      if (k != -1) {
        sels.push(k);
        selTable[k] = true;
        if (k >= rowCount) selHasRocker = true;
      }
    }
  }
  return sels;
}

function isDuplicable(row) {
   var action = funcNbTable[row];
   for (var i = row; i < rowCount; ++i) {
      if (funcNbTable[i] != action) break;
      if (!abbrTable[i]) return false;
   }  
   for (i = row - 1; i >= 0; --i) {
      if (funcNbTable[i] != action) break;
      if (!abbrTable[i]) return false;
   }
   return true;  
}

function getRowFromRowId(aNb) {
   for (var i = 0; i < totalCount; ++i) {
      if (aNb == rowIdTable[i]) return i;
   }
   dump("AiOGest:" + aNb + " not found in getRow...\n");
   return -1;
}

/**
 * Get custom function name from rendered tree view
 * @returns {String}
 */
function getCustomFunctionNameById(id) {
  var rowCount = gestView.rowCount;
  
  for (var row=0; row<rowCount; row++) {
    var meta = gestView.getRowMetaData(row);
    
    if (meta && meta.id && meta.id == id) {
      return gestView.getCellText(row, functionCol);
    }
  }
  
  return null;
}

function setFunctionText(fVal, aRow) {
  treeBox.focused = true;
  selectRow(aRow);
  funcNbTable[aRow] = fVal;
  var label = (fVal.substr(0,1) == "c")
    ? getCustomFunctionNameById(fVal.substr(1))
    : gestActionTable[fVal - 0];
  
  gestView.setCellText(aRow, functionCol, label);
  treeBox.invalidateRow(aRow);
}  

function setGestureText(aRow, aString) {
  treeBox.focused = true;
  treeBoxView.selection.select(aRow);
  abbrTable[aRow] = aString;
  gestView.setCellText(aRow, gestureCol, expandedText(aString));
  treeBox.invalidateRow(aRow);
}

function mouseUpInTree(e) {
  gestureTree.removeEventListener("mouseup", mouseUpInTree, true);
  setTimeout(function() {gestureTree.setAttribute("seltype", "multiple");}, 500);
  if (rockerRow != -1) {
    setTimeout(function(a, b){
      setFunctionText(a, b);
    }, 100, funcVal, rockerRow);
    rockerRow = -1;
  }
}

function mouseDownInTree(e) {
  if (e.originalTarget.localName != "treechildren") return;
  var r = {}, c = {}, type = {};
  treeBox.getCellAt(e.clientX, e.clientY, r, c, type);
  
  if (c.value == enabledCol && !e.ctrlKey && !e.shiftKey) {
    // toggle enabled marker
    if (isEnabledTable[r.value]) isEnabledTable[r.value] = "";
    else isEnabledTable[r.value]= "/";
    treeBox.invalidateCell(r.value, c.value);
    return;
  }
  
  if (c.value && c.value.id == 'infoColId') {
    showPopupInfo(r.value, e);
  }
  
  if (swapping || editing || funcEditing) {
     if (swapping) { // on the selected row since selectionInTree has not been called
        swapping = false;
        undoFunc.pop();
        undoVal.pop();
        undoId.pop();
        swapFunc.pop();
        swapArea.setAttribute("hidden", "true");
        customGestArea.removeAttribute("hidden");
        buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId"], [true, true, true, isDuplicable(r.value), undoFunc.length]);
     }
     else if (editing) {
        editing = false;
        //editArea.setAttribute("hidden", "true");
        buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId"], [true, true, true, isDuplicable(r.value), undoFunc.length]);
     }
     else { // funcEditing
        funcEditing = false;
        undoFunc.pop();
        undoVal.pop();
        undoId.pop();
        swapFunc.pop();
        funcArea.setAttribute("hidden", "true");
        customGestArea.removeAttribute("hidden");
        buttEnable(["edfuncId", "undoId"], [true, undoFunc.length]);
     }
     gestureTree.addEventListener("mouseup", mouseUpInTree, true);
  }
}

function dblClickInTree(e) {
  if (e.originalTarget.localName != "treechildren") return;
  var r = {}, c = {}, type = {};
  treeBox.getCellAt(e.clientX, e.clientY, r, c, type);
  
  if (c.value && (c.value.id == 'gestTextId' || c.value.id == 'functionId')) {
    // run default action only if its button is not disabled
    if (document.getElementById('editId').getAttribute('disabled') != 'true') {
      editCurrentRow(false);
    } else if (document.getElementById('edfuncId').getAttribute('disabled') != 'true') {
      editFunction();
    }
  }
}

function showPopupInfo(row, e) {
  // show info popup
  var token = gestView.getActionToken(row);
  var popup = document.getElementById('infoPopup');
  
  if (token && helpTable[token] && popup.row != row) {
    if (hidePopupTimer) {
      clearTimeout(hidePopupTimer);
      hidePopupTimer = null;
    }
    
    popup.row = row;
    popup.openPopup(null, "after_start", e.clientX - 14, e.clientY - 4, false, false);
    
    var div = document.getElementById('infoPopupContent');
    
    while(div.firstChild) 
        div.removeChild(div.firstChild);
    
    var html = '<h1 id="title"></h1>' + helpTable[token];
    
    //safely convert HTML string to a simple DOM object, stripping it of JavaScript and more complex tags
    var parserUtils = Components.classes["@mozilla.org/parserutils;1"]
                  .getService(Components.interfaces.nsIParserUtils);
    
    var injectHTML = parserUtils.parseFragment(html, 0, false, null, div);
    aioTraslate(injectHTML);
    injectHTML.firstChild.textContent = bundle.getString(token);
    
    div.appendChild(injectHTML);
  }
}

function hidePopupInfo() {
  var popup = document.getElementById('infoPopup');
  popup.hidePopup();
}

function infoPopupHidden(e) {
  hidePopupTimer = setTimeout(function() {
    var popup = document.getElementById('infoPopup');
    popup.row = null;
  }, 500);
}

function selectionInTree() {
  var sels = getSelections();
  if (sels.length != 1) {
     if (sels.length && !selHasRocker)
        buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId"], [true, false, false, false, undoFunc.length]);
     else clearButtonsButUndo();
     return;
  }
  var currRow = sels[0];
  var rowType = gestView.getRowType(currRow);
  
  if (swapping || editing || funcEditing) {
     if (editing) {
        editing = false;
        //editArea.setAttribute("hidden", "true");
     }
     else if (swapping) {
        swapping = false;
        if (currRow >= rowCount || rowType == "separator") {
          // cancel swap
          undoFunc.pop();
          undoVal.pop();
          undoId.pop();
          swapFunc.pop();
        }
        else {
          // perform swap
          var last = undoFunc.length - 1;
          swapFunc[last] = rowIdTable[currRow];
          var s = abbrTable[currRow];
          swapVal.push(s);
          setGestureText(currRow, undoVal[last]);
          setGestureText(getRowFromRowId(undoFunc[last]), s);
        }
        swapArea.setAttribute("hidden", "true");
        customGestArea.removeAttribute("hidden");
     }
     else { // funcEditing
        funcEditing = false;
        funcArea.setAttribute("hidden", "true");
        
        rockerRow = getRowFromRowId(undoFunc[undoFunc.length - 1]);
        var metaData = gestView.getRowMetaData(currRow);
        
        if (metaData && metaData.id) {
          // custom function - value is "c" + custom function id
          funcVal = "c" + metaData.id;
          
        } else {
          // built-in function - value is function index in gestActionTableTokens
          funcVal = funcNbTable[currRow];
          if (currRow == rowCount) {
            undoFunc.pop();
            undoVal.pop();
            undoId.pop();
            swapFunc.pop();
            funcVal = funcNbTable[rockerRow];
          }
        }
     }
     gestureTree.addEventListener("mouseup", mouseUpInTree, true);
  }
  
  if (rowType == "native" || rowType == "custom") {
    edfuncButton.label = addgestLabel;
    buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId", "addCustom", "removeCustom"], [true, true, true, isDuplicable(currRow), undoFunc.length, true, (rowType == "custom")]);
  }
  else if (rowType == "separator") {
    clearButtonsButUndo();
  }
  else {
    // rocker & scrollwheel
    edfuncButton.label = edfuncLabel;
    buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId", "addCustom", "removeCustom"], [false, false, false, true, undoFunc.length, true, false]);
  }
}

function saveForUndo(aRow, saveId) {
  undoFunc.push(rowIdTable[aRow]);
  undoVal.push(abbrTable[aRow] == "?" ? funcNbTable[aRow] : abbrTable[aRow]);
  undoId.push(saveId);
  swapFunc.push("");
}

function clearRows() {
  var saveId = ++gUndoId;
  var sels = getSelections();
  for (var i = 0; i < sels.length; ++i) {
     saveForUndo(sels[i], saveId);
     setGestureText(sels[i], "");
  }
  buttEnable(["edfuncId", "undoId"], [false, undoFunc.length]);
}

function editCurrentRow(newRow) {
  var row = getSelections()[0];
  editGesture(gestView.getRowType(row), false);
  //gestureTree.setAttribute("seltype", "single");
  //buttEnable(["clearId", "swapId", "edfuncId", "undoId"], [false, false, false, false]);
  //inputBox.value = "";
  //editArea.removeAttribute("hidden");
  //editing = true;
  //addingGest = newRow; 
  //setTimeout(function(){setTextBox();}, 0); // if no sync delay, select() doesn't work
}

//function setTextBox() {
//  var currRow = getSelections()[0];
//  var s = abbrTable[currRow];
//  var t = "";
//  for (var i = 0; i < s.length; ++i)
//     t += abbrLocalizedGest[s.charAt(i)];
//  inputBox.value = t;
//  if (t) inputBox.select();
//  inputBox.focus();
//}

function addCustomFunction() {
  editGesture("custom", true);
}

function removeCustomFunctions() {
  var sels = getSelections();
  
  for (var i=0; i<sels.length; i++) {
    _removeRow(sels[i]);
  }
  
  var custGestures = getCustomGestures();
  
  if (custGestures.length == 0) {
    // remove separator
    for (var i = 0; i < rowCount; ++i) {
      if (gestView.getRowType(i) == 'separator') {
        _removeRow(i);
        break;
      }
    }
  }
  
  // for now we clear undo to avoid errors because remove action
  // is not yet implemented in undo mechanism
  clearUndoHistory();
}


function reverseLocalizedGest(aChar) {
  for (var i in abbrLocalizedGest)
    if (aChar == abbrLocalizedGest[i]) return i;
  return "";
}

//function openPlayWindow() {
//  var rv = { };
//  rv.trailColor = document.getElementById("trailPickerId").color;
//  rv.trailSize = trailSize;
//  rv.mousebutton = document.getElementById("mousebuttOptions").value;
//  window.openDialog("chrome://mgsuite/content/pref/aioPlayGesture.xul", "",
//       "chrome,centerscreen,modal=yes", rv);
//  if (rv.gestString != undefined) inputBox.value = rv.gestString;
//  inputBox.select(); inputBox.focus();
//}

function insertNewCustomFunction(data) {
  var lastNativeRow, lastCustomRow;
  var type;
  
  for (var i=0; i<totalCount; i++) {
    type = gestView.getRowType(i);
    if (type == "native") {
      lastNativeRow = i;
    } else if (type == "custom") {
      lastCustomRow = i;
    }
  }
  
  var currRow;
  
  if (lastCustomRow) {
    currRow = lastCustomRow;
    
  } else {
    // first custom gesture - need to add separator
    _insertRowAtPosition(lastNativeRow, customGestSeparatorLabel, "", "", "separator", "", null);
    currRow = lastNativeRow + 1;
  }
  
  var metaData = {
    "id": generateNewCustomGestureId(),
    "menuId": data.menuId,
    "winTypes": data.winTypes,
    "script": data.script,
    "scope": data.scope,
  }
  
  _insertRowAtPosition(currRow, "", data.name, data.shape, "custom", "", metaData);
}

/**
 * @param {number} pos
 * @param {string} firstCol content of 1st col. (for separator)
 * @param {string} name action name
 * @param {string} shape e.g. RUL
 * @param {string} rowType
 * @param {string} rowToken
 * @param {object} metaData
 */
function _insertRowAtPosition(pos, firstCol, name, shape, rowType, rowToken, metaData) {
  var currFunc = funcNbTable[pos];
  
  var shapeStr = (firstCol == "" && name != "") ? expandedText(shape) : "";
  gestView.addRow([firstCol, name, "", shapeStr], rowType, rowToken, metaData);
  
  abbrTable[totalCount] = shape;
  funcNbTable[totalCount] = currFunc;
  rowIdTable[totalCount] = ++uniqueRowId + "";
  isEnabledTable[totalCount] = "";
  saveForUndo(totalCount, ++gUndoId);
  swapFunc.pop();
  swapFunc.push("%");
  var rowObj = aioGetRowValue(totalCount);
  pos++;
  for (var i = totalCount; i > pos; --i) {
    aioSetRowValue(i, aioGetRowValue(i - 1));
  }
  
  aioSetRowValue(pos, rowObj);
  totalCount++;
  rowCount++;
  
  if (rowType == "native") {
    gestView.stdRowCount++;
  }
  treeBox.invalidate();
  setTimeout(function(a){selectRow(a);}, 0, pos);
}

function _removeRow(pos) {
  var rowType = gestView.getRowType(pos);
  
  for (var i = pos + 1; i < totalCount; ++i) {
    aioSetRowValue(i - 1, aioGetRowValue(i));
  }
  gestView.removeLastRow();
  
  totalCount--;
  rowCount--;
  if (rowType == "native") {
    gestView.stdRowCount--;
  }
  
  treeBox.invalidate();
  setTimeout(function(a){selectRow(a);}, 0, pos - 1);
}

function changeGestureData(currRow, data) {
  var i, s1;
  var s = data.shape;
  var t = "", prev = "", currChar;
  var isCorrect = true;
  //var currRow = getSelections()[0];
  var rowType = gestView.getRowType(currRow);

  if (s) {
    for (i = 0; i < s.length; ++i) {
      currChar = reverseLocalizedGest(s.charAt(i).toUpperCase());
      if (currChar && currChar != prev && (currChar != "+"  || i == 0)) {
         t += currChar;
         prev = currChar;
      }
      else {
         alert("'" + s.charAt(i) + "' " + bundle.getString("error.invalidChar") + " " + (i+1));
         isCorrect = false;
         break;
      }
    }
    if (isCorrect && t.charAt(0) == "+" && t.length != 3 && t.length != 4) {
       alert(bundle.getString("error.plusChar"));
       isCorrect = false;
    }
    
    if (isCorrect && currRow < gestView.stdRowCount) { // check if not duplicated or conflicting
      for (i = 0; i < gestView.stdRowCount; ++i) {
        s1 = abbrTable[i];
        if (t == s1  || (s1.charAt(0) == "+" && t.length >= s1.length &&
                  t.substr(-s1.length + 1) == s1.substr(-s1.length + 1))) break;
      }
      if (i != gestView.stdRowCount && i != currRow)
        if (t == s1)
           if (confirm(s.toUpperCase() + " " + bundle.getString("error.conflict") +
                 gestView.getCellText(i, functionCol) + "'\n" + bundle.getString("error.swap"))) {
              // swap gestures
              if (!addingGest) ++gUndoId;
              saveForUndo(currRow, gUndoId);
              swapFunc[swapFunc.length -1] = rowIdTable[i];
              swapVal.push(t);
              setGestureText(i, abbrTable[currRow]);
              setGestureText(currRow, t);
              gestureTree.setAttribute("seltype", "multiple");
              //editArea.setAttribute("hidden", "true");
              buttEnable(["clearId", "swapId", "edfuncId", "undoId", "addCustom", "removeCustom"], [true, true, isDuplicable(currRow), true, true, (rowType == "custom")]);
              return true;
           }
           else isCorrect = false;
        else {
          alert (s.toUpperCase() + " " + bundle.getString("error.conflict") +
                   gestView.getCellText(i, functionCol) + "'");
          isCorrect = false;
        }
    }
  }
  if (isCorrect) {
    if (!addingGest) ++gUndoId;
    saveForUndo(currRow, gUndoId);
    setGestureText(currRow, t);
    
    if (data.name) {
      gestView.setCellText(currRow, functionCol, data.name);
    }
    if (data.id) {
      gestView.changeRowMetaData(currRow, "id", data.id);
    }
     if (data.menuId) {
      gestView.changeRowMetaData(currRow, "menuId", data.menuId);
    }
    if (data.winTypes) {
      gestView.changeRowMetaData(currRow, "winTypes", data.winTypes);
    }
    if (data.script) {
      gestView.changeRowMetaData(currRow, "script", data.script);
    }
    if (data.scope) {
      gestView.changeRowMetaData(currRow, "scope", data.scope);
    }
   
    gestureTree.setAttribute("seltype", "multiple");
    buttEnable(["clearId", "swapId", "edfuncId", "undoId", "addCustom", "removeCustom"], [true, true, isDuplicable(currRow), true, true, (rowType == "custom")]);
    editing = false;
  }
  //else setTextBox();
  return isCorrect;
}

function swapTwoRows() {
  gestureTree.setAttribute("seltype", "single");
  buttEnable(["clearId", "editId", "swapId", "edfuncId", "undoId"], [false, false, false, false, false]);
  swapArea.removeAttribute("hidden");
  customGestArea.setAttribute("hidden", "true");
  swapping = true;
  saveForUndo(getSelections()[0], ++gUndoId);
}

function addGesture() {
  var currRow = getSelections()[0];
  var currFunc = funcNbTable[currRow];
  
  _insertRowAtPosition(currRow, "", gestActionTable[currFunc - 0], "", "native", gestActionTableTokens[currFunc - 0], null);
  
  setTimeout(function() {
    editCurrentRow(true);
  }, 100);
}

function undoAddGesture(aRow) {
  for (var i = aRow + 1; i < totalCount; ++i)
     aioSetRowValue(i - 1, aioGetRowValue(i));
  gestView.removeLastRow();
  totalCount--;
  rowCount--;
  gestView.stdRowCount--;
  treeBox.invalidate();
  setTimeout(function(a){selectRow(a);}, 0, aRow - 1);
}       

function editFunction() {
  if (edfuncButton.label == addgestLabel) {
    addGesture();
    return;
  }
  gestureTree.setAttribute("seltype", "single");
  buttEnable(["edfuncId", "undoId"], [false, false]);
  funcArea.removeAttribute("hidden");
  customGestArea.setAttribute("hidden", "true");
  funcEditing = true;
  saveForUndo(getSelections()[0], ++gUndoId);
}

function performUndo() {
  var row, saveId, swFunc;
  
  do {
    saveId = undoId.pop();
    swFunc = swapFunc.pop();
    
    if (swFunc) {
      if (swFunc == "%") {
        // remove row
        undoAddGesture(getRowFromRowId(undoFunc.pop()));
        undoVal.pop();
        continue;
      }   
      else {
        setGestureText(getRowFromRowId(swFunc), swapVal.pop());
      }
    }
    row = getRowFromRowId(undoFunc.pop());
    
    if (abbrTable[row] != "?") {
      setGestureText(row, undoVal.pop());
    }
    else {
      setFunctionText(undoVal.pop(), row);
    }
    
  } while (undoId.length && undoId[undoId.length - 1] == saveId)
  
  treeBox.ensureRowIsVisible(row);
  buttEnable(["undoId"], [undoFunc.length]);
  
  if (row < rowCount) {
    buttEnable(["edfuncId"], [isDuplicable(row)]);
  }
}

function clearUndoHistory() {
  undoFunc = [];
  swapFunc = [];
  undoVal = [];
  swapVal = [];
  undoId = [];
}

/*
function eraseDropFeedback() {
  var rowToInvalidate = gestView.hoveredRow;
  if (rowToInvalidate < 0) return;
  gestView.hoveredRow = -1; gestView.topOrBottom = false;
  treeBox.invalidateRow(rowToInvalidate);
}

function onBeginRowDrag(e) {
  clearSelectionTable();
  var sels = getSelections();
  if (e.originalTarget.localName != "treechildren" || !dragService || selHasRocker || selMissingDup) return;
  var transArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(kSAIID);
  if (!transArray) return;
  var trans = Components.classes[kXferableContractID].createInstance(kXferableIID);
  if (!trans) return;
  if ("init" in trans) trans.init(null);
  gestView.hoveredRow = -1; gestView.topOrBottom = false;
  trans.addDataFlavor(kAioMime);
  var rowData = Components.classes["@mozilla.org/supports-string;1"].createInstance(kSSIID);
  rowData.data = sels.join();
  trans.setTransferData(kAioMime, rowData, rowData.data.length * 2);
  transArray.AppendElement(trans.QueryInterface(Components.interfaces.nsISupports));

  dragService.invokeDragSession(e.target, transArray, null, kDSIID.DRAGDROP_ACTION_COPY + kDSIID.DRAGDROP_ACTION_MOVE);
  e.stopPropagation();
  eraseDropFeedback(); // clean-up if something went wrong
}

function onDragOutTree(e) {
  eraseDropFeedback();
}

function onDragOverTree(e) {
  if (!dragService) return;
  var dragSession = dragService.getCurrentSession();
  if (!dragSession || !dragSession.isDataFlavorSupported(kAioMime)) return;
  var dragRow = -1; var top = false;
  if (e.originalTarget.localName == "treechildren") {
     dragRow = treeBox.getRowAt(e.clientX, e.clientY);
     dragSession.canDrop = dragRow >= 0 && dragRow < rowCount && !selTable[dragRow];
     if (dragRow >= rowCount || selTable[dragRow]) dragRow = -1;
     else if (!dragRow) top = gestView.before;
  }
  if (dragRow != gestView.hoveredRow || top != gestView.topOrBottom) {
     var rowToInvalidate = gestView.hoveredRow;     
     gestView.hoveredRow = dragRow; gestView.topOrBottom = top;
     if (rowToInvalidate >= 0) treeBox.invalidateRow(rowToInvalidate);
     if (gestView.hoveredRow >= 0) treeBox.invalidateRow(gestView.hoveredRow);
  }
  e.stopPropagation();
}

function onDropOnTree(e) {
  if (!dragService) return;
  var dragSession = dragService.getCurrentSession();
  if (!dragSession) return;
  var trans = Components.classes[kXferableContractID].createInstance(kXferableIID);
  if (!trans) return;
  if ("init" in trans) trans.init(null);
  trans.addDataFlavor(kAioMime);
  dragSession.getData(trans, 0);
  var dataObj = {}, bestFlavor = {}, len = {};
  trans.getAnyTransferData(bestFlavor, dataObj, len );
  if (dataObj) dataObj = dataObj.value.QueryInterface(kSSIID);
  if (!dataObj) return;
  var rowStr = dataObj.data.substring(0, len.value / 2).split(",");
  var dragDropRow = treeBox.getRowAt(e.clientX, e.clientY) - (gestView.topOrBottom - 0);
  //move the rows
  for (var i = 0; i < rowStr.length; ++i) {
    if (rowStr[i] >= dragDropRow) break;
    setTimeout(function(a, b){performRowsMove(a, b);}, 1, dragDropRow, rowStr[i] - i);
  }
  for (var j = i; j < rowStr.length; ++j)
      setTimeout(function(a, b){performRowsMove(a, b);}, 1, dragDropRow++, rowStr[j]);
  e.stopPropagation();
}

function performRowsMove(dragEndRow, dragStartRow) {
  var i;
  var initialRowObj = aioGetRowValue(dragStartRow);
  if (dragStartRow <= dragEndRow)
    for (i = dragStartRow; i < dragEndRow; ++i) aioSetRowValue(i, aioGetRowValue(i + 1));
  else {
     ++dragEndRow;
     for (i = dragStartRow; i > dragEndRow; --i) aioSetRowValue(i, aioGetRowValue(i - 1));
  }
  aioSetRowValue(dragEndRow, initialRowObj);
  gestView.hoveredRow = -1;
  treeBox.invalidate();
  setTimeout(function(a){selectRow(a);}, 0, dragEndRow);
}
*/

function aioGetRowValue(aRow) {
  var rowObj = {iTxt: "", fTxt: "", gTxt: "", aTxt: "", fNbr: "", eChr: "", roId: ""};
  rowObj.iTxt = gestView.getCellText(aRow, infoCol);
  rowObj.fTxt = gestView.getCellText(aRow, functionCol);
  rowObj.gTxt = gestView.getCellText(aRow, gestureCol);
  rowObj.aTxt = abbrTable[aRow];
  rowObj.fNbr = funcNbTable[aRow];
  rowObj.eChr = isEnabledTable[aRow];
  rowObj.roId = rowIdTable[aRow];
  rowObj.token = gestView.getActionToken(aRow);
  rowObj.type = gestView.getRowType(aRow);
  rowObj.metaData = gestView.getRowMetaData(aRow);
  return rowObj;
}

function aioSetRowValue(aRow, rowObj) {
  gestView.setCellText(aRow, infoCol, rowObj.iTxt);
  gestView.setCellText(aRow, functionCol, rowObj.fTxt);
  gestView.setCellText(aRow, gestureCol, rowObj.gTxt);
  abbrTable[aRow] = rowObj.aTxt;
  funcNbTable[aRow] = rowObj.fNbr;
  isEnabledTable[aRow] = rowObj.eChr;
  rowIdTable[aRow] = rowObj.roId;
  gestView.setActionToken(rowObj.token, aRow);
  gestView.setRowType(rowObj.type, aRow);
  gestView.setRowMetaData(rowObj.metaData, aRow);
}
