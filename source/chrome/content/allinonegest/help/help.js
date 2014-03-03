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
  aioBundle = aioCreateStringBundle("chrome://allinonegest/locale/allinonegest.properties");

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

window.addEventListener("DOMContentLoaded", function() {
  aioTraslate();
});
