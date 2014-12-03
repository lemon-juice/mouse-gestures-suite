"use strict";

var mgsuite = mgsuite || {};


mgsuite.help = {

  aioCreateStringBundle: function(propFile) {
    try {
      var strBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService().
              QueryInterface(Components.interfaces.nsIStringBundleService);
      return strBundleService.createBundle(propFile);
    }
    catch (err) {
      return null;
    }
  },

  aioGetStr: function(str) {
    if (mgsuite.bundle) {
      try {
        return mgsuite.bundle.GetStringFromName(str);
      } catch (err) {
        return str;
      }
    }
    return str;
  },

  // replace {placeholders} with transated text from .properties file
  aioTraslate: function() {
    var elems = document.body.getElementsByTagName('*');
    var elem, txt, matches;

    for (var i = 0; i < elems.length; i++) {
      elem = elems[i];

      if (elem.firstChild && elem.firstChild.nodeName == '#text' && elem.firstChild.data) {
        txt = elem.firstChild.data.trim();
        matches = /^\{([\w.]+)\}$/.exec(txt);

        if (matches) {
          elem.firstChild.data = mgsuite.help.aioGetStr(matches[1]);
        }
      }
    }
  },

  // insert currently assigned gesture definitions into the 2nd column of the table
  aioInsertGesturesToTable: function() {
    var trs = document.querySelectorAll("table.gestlist tbody tr");
    var tds, matches;

    for (var i=0; i<trs.length; i++) {
      tds = trs[i].getElementsByTagName('td');

      if (tds[0].colSpan > 1) break;

      if (tds[0].firstChild && tds[0].firstChild.data) {
        matches = /^\{([\w.]+)\}$/.exec(tds[0].firstChild.data.trim());

        if (matches && tds[1]) {
          while (tds[1].firstChild) {
            tds[1].removeChild(tds[1].firstChild);
          }
          tds[1].appendChild(document.createTextNode(mgsuite.help.aioPropertyToGestureString(matches[1])));

          // insert available window types
          if (tds[2]) {
            tds[2].classList.add("wintypes");
            tds[2].style.whiteSpace = "nowrap";
            tds[2].innerHTML = mgsuite.help.aioPropertyToWindowTypes(matches[1]);
          }
        }
      }
    }
  },

  // for the given property describing gesture return currently assigned
  // gesture in the form of (localized) gesture string, e.g. "RUL"
  aioPropertyToGestureString: function(prop) {
    var gStr = "";

    for (var i=0; i<mgsuite.imp.aioActionTable.length; i++) {
      if (mgsuite.imp.aioActionTable[i][1] == prop) {
        gStr = mgsuite.help.getLocalizedShortGesture(mgsuite.gesturePrefs[i]);
        break;
      }
    }

    return gStr;
  },

  // for the given property describing gesture return available
  // window types in the form of (localized) space-delimited abbreviations,
  // e.g. "BR MSG"
  aioPropertyToWindowTypes: function(prop) {
    var winTypes, info = "";

    for (var i=0; i<mgsuite.imp.aioActionTable.length; i++) {
      if (mgsuite.imp.aioActionTable[i][1] == prop) {
        winTypes = mgsuite.imp.aioActionTable[i][4];

        if (winTypes === null) {
          winTypes = [
            'browser',
            'source',
            'messenger',
            'mailcompose'
          ];
        }
        for (var i=0; i<winTypes.length; i++) {
          info += '<span class="' + mgsuite.help.aioEscapeHTML(winTypes[i]) + '">' + mgsuite.help.aioEscapeHTML(mgsuite.allWinTypes[winTypes[i]]) + '</span> ';
        }
        return info;
      }
    }

    return "";
  },

  aioEscapeHTML: function(s) {
      s = s.replace(/&/g, '&amp;');
      s = s.replace(/</g, '&lt;');
      s = s.replace(/>/g, '&gt;');
      s = s.replace(/"/g, '&quot;');
      s = s.replace(/'/g, '&#039;');
      return s;
  },

  // translate gesture preference string like "RUL" into current locale
  getLocalizedShortGesture: function(prefGesture) {
    if (!prefGesture) {
       return "";
    }
    var lStr = "";
    for (var i = 0; i < prefGesture.length; ++i)
        if (mgsuite.shortGest[prefGesture.charAt(i)] == null) {
           lStr += prefGesture.charAt(i);
        }
        else lStr += mgsuite.shortGest[prefGesture.charAt(i)];
    return lStr;
  }
}


window.addEventListener("DOMContentLoaded", function() {
  mgsuite.bundle = mgsuite.help.aioCreateStringBundle("chrome://allinonegest/locale/allinonegest.properties");

  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
          .getService(Components.interfaces.nsIPrefService);
  
  var gest = aioPrefService.getBranch("allinonegest.").getCharPref("gestureString").split("|");
  var func = aioPrefService.getBranch("allinonegest.").getCharPref("functionString").split("|");
  
  // create key=>value object with gesture string
  mgsuite.gesturePrefs = {};
  
  for (var i=0; i<func.length; i++) {
    mgsuite.gesturePrefs[func[i]] = gest[i] ? gest[i] : "";
  }
  
  mgsuite.shortGest = {
    R: mgsuite.help.aioGetStr("abbreviation.right"),
    L: mgsuite.help.aioGetStr("abbreviation.left"),
    U: mgsuite.help.aioGetStr("abbreviation.up"),
    D: mgsuite.help.aioGetStr("abbreviation.down"),
  };
  
  mgsuite.allWinTypes = {
    browser: mgsuite.help.aioGetStr("abbreviation.browser"),
    source: mgsuite.help.aioGetStr("abbreviation.source"),
    messenger: mgsuite.help.aioGetStr("abbreviation.messenger"),
    mailcompose: mgsuite.help.aioGetStr("abbreviation.mailcompose")
  };
  
  mgsuite.help.aioInsertGesturesToTable();
  mgsuite.help.aioTraslate();
  
  if (location.hash) {
    setTimeout(function() {
      location.hash = location.hash;
    }, 50);
  }
});
