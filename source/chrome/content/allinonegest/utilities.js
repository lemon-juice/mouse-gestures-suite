/*
 * ulitilities.js
 * For licence information, read licence.txt
 */
"use strict";

var mgsuiteUtil = {
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
  }
}
