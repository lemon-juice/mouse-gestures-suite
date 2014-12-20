/*
 * ulitilities.js
 * For licence information, read licence.txt
 */
"use strict";

if (typeof mgsuite == 'undefined') {
  var mgsuite = {};
}

mgsuite.util = {
  getSelectedText: function() {
    let [element, focusedWindow] = BrowserUtils.getFocusSync(document);
    var selection = focusedWindow.getSelection().toString();
    
    if (!selection) {
      var isOnTextInput = function isOnTextInput(elem) {
        // we avoid to return a value if a selection is in password field.
        // ref. bug 565717
        return elem instanceof HTMLTextAreaElement ||
               (elem instanceof HTMLInputElement && elem.mozIsTextField(true));
      };
  
      if (isOnTextInput(element)) {
        selection = element.QueryInterface(Components.interfaces.nsIDOMNSEditableElement)
                          .editor.selection.toString();
      }
    }
    
    if (selection) {
      selection = selection.trim().replace(/\s+/g, " ");
      
      if (selection.length > 250) {
        selection = selection.substr(0, 250);
      }
    }
    
    return selection;
  },
  
  /* Check if string is a URL - return URL if valid */
  detectUrl: function(input) {
    input = input.replace(/^[\s\'\"\(\[<]+/, ""); // strip bad leading characters
    input = input.replace(/[\.,\'\"\)\?!>\]]+$/, ""); // strip bad ending characters
    input = input.trim();
    
    if (input.indexOf("about:") == 0) {
      return input;
    }
    
    if (!input || /\s/.test(input)) {
      return false;
    }
    
    if (/^(http|https|ftp):\/\/\w/i.test(input)) {
      // URL with scheme
      return input;
    }
    
    var host;
    
    if (/\//.test(input)) {
      var segm = input.split('/');
      host = segm[0].toLowerCase();
    } else {
      host = input.toLowerCase();
    }
    // match segments in host
    var matches = /^([^@]+@)?((?:[\w-]+\.)*)([\w-]+)(:\d{1,5})?$/.exec(host);
    
    if (!matches || !matches[3]) {
      return false;
    }
    
    if (matches[1] && !matches[4] && !/\//.test(input)) {
      // probably email address
      return false;
    }
    
    var domain = (typeof matches[2] != 'undefined') ? matches[2] : "";
    domain += (typeof matches[3] != 'undefined') ? matches[3] : "";
    
    if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})+$/.test(domain)
        || domain == 'localhost'
        || /\.localhost$/.test(domain)) {
      // IP or localhost
      return input;
    }
    
    if (!matches[2]) {
      return false;
    }
    
    // check top level domain
    var tld = matches[3];
    
    // load list of top level domains
    // see http://data.iana.org/TLD/tlds-alpha-by-domain.txt
    var str = "";
    var req = new XMLHttpRequest();
    try {
      // this is request for local file via chrome://
      req.open("GET", mgsuite.const.CHROME_DIR + "tlds.txt", false);
      req.send();
      str = req.responseText.trim();
      
    } catch (err){};
    
    var tlds = str.toLowerCase().split(/\s+/);
    
    return (tlds.indexOf(tld) >= 0) ? input : false;
  }

}
