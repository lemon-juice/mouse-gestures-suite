const aioDir = "chrome://allinonegest/content/";

function aioCreateStringBundle(propFile) {
  try {
    var strBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService().
            QueryInterface(Components.interfaces.nsIStringBundleService);
    return strBundleService.createBundle(propFile);
  }
  catch (err) {
    return null;
  }
}

function aioGetStr(str) {
  if (aioBundle) {
    try {
      return aioBundle.GetStringFromName(str);
    } catch (err) {
      return str;
    }
  }
  return str;
}

// replace {placeholders} with transated text from .properties file
function aioTraslate() {
  var elems = document.body.getElementsByTagName('*');
  var elem, txt, matches;

  for (var i = 0; i < elems.length; i++) {
    elem = elems[i];

    if (elem.firstChild && elem.firstChild.nodeName == '#text' && elem.firstChild.data) {
      txt = elem.firstChild.data.trim();
      matches = /^\{([\w.]+)\}$/.exec(txt);

      if (matches) {
        elem.firstChild.data = aioGetStr(matches[1]);
      }
    }
  }
}

// insert currently assigned gesture definitions into the 2nd column of the table
function aioInsertGesturesToTable() {
  var trs = document.querySelectorAll("table.gestlist tbody tr");
  var tds, matches;
  
  for (var i=0; i<trs.length; i++) {
    tds = trs[i].getElementsByTagName('td');
    
    if (tds[0].firstChild && tds[0].firstChild.data) {
      matches = /^\{([\w.]+)\}$/.exec(tds[0].firstChild.data.trim());
      
      if (matches && tds[1]) {
        while (tds[1].firstChild) {
          tds[1].removeChild(tds[1].firstChild);
        }
        tds[1].appendChild(document.createTextNode(aioPropertyToGestureString(matches[1])));
      }
    }
  }
}

// for the given property describing gesture return currently assigned
// gesture in the form of (localized) gesture string, e.g. "RUL"
function aioPropertyToGestureString(prop) {
  var gStr = "";
  
  for (var i=0; i<aioActionTable.length; i++) {
    if (aioActionTable[i][1] == prop) {
      gStr = getLocalizedShortGesture(gesturePrefs[i]);
      break;
    }
  }
  
  return gStr;
}

// translate gesture preference string like "RUL" into current locale
function getLocalizedShortGesture(prefGesture) {
  if (!prefGesture) {
     return "";
  }
  var lStr = "";
  for (var i = 0; i < prefGesture.length; ++i)
      if (aioShortGest[prefGesture.charAt(i)] == null) {
         lStr += prefGesture.charAt(i);
      }
      else lStr += aioShortGest[prefGesture.charAt(i)];
  return lStr;
}



window.addEventListener("DOMContentLoaded", function() {
  aioBundle = aioCreateStringBundle("chrome://allinonegest/locale/allinonegest.properties");

  var aioPrefService = Components.classes["@mozilla.org/preferences-service;1"]
          .getService(Components.interfaces.nsIPrefService);
  
  var gest = aioPrefService.getBranch("allinonegest.").getCharPref("gestureString").split("|");
  var func = aioPrefService.getBranch("allinonegest.").getCharPref("functionString").split("|");
  
  // create key=>value object with gesture string
  gesturePrefs = {};
  
  for (var i=0; i<func.length; i++) {
    gesturePrefs[func[i]] = gest[i] ? gest[i] : "";
  }
  
  aioShortGest = {
    R: aioGetStr("abbreviation.right"),
    L: aioGetStr("abbreviation.left"),
    U: aioGetStr("abbreviation.up"),
    D: aioGetStr("abbreviation.down"),
  };
   
  
  aioInsertGesturesToTable();
  aioTraslate();
});
