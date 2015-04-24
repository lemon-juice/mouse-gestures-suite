"use strict";

/**
 * Reading and writing setting files in user profile for storing user scripts
 */
var settingsIO = {
  /**
   * Save data to a file in profile dir
   * @param {string} filename
   * @param {string} data
   */
  saveFile: function(filename, data) {
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
    
    var file = this.getScriptsDir()
    file.append(filename);
    
    var stream = FileUtils.openFileOutputStream(file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE);
    
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                createInstance(Components.interfaces.nsIConverterOutputStream);
    converter.init(stream, "UTF-8", 0, 0);
    converter.writeString(data);
    converter.close();
  },
  
  /**
   * @returns string
   */
  readFile: function(filename) {
    var file = this.getScriptsDir();
    file.append(filename);
    
    var data = new String();
    var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
    var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                        .createInstance(Components.interfaces.nsIScriptableInputStream);
    try {
      fiStream.init(file, 1, 0, false);
      siStream.init(fiStream);
      data += siStream.read(-1);
      siStream.close();
      fiStream.close();
      
    } catch (err) {
      return "";
    }
    
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = "utf-8";
    return converter.ConvertToUnicode(data);
  },
 
  /**
   * @returns {nsIFile}
   */
  getScriptsDir: function() {
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
    return FileUtils.getDir("ProfD", ["MouseGesturesSuite"], true);
  },
  
  /**
   * Get filename for script having the next sequential number after the highest
   * one in directory
   * @returns {string}
   */
  getNextScriptFilename: function() {
    // directory listing
    var file = this.getScriptsDir();
    var entries = file.directoryEntries;
    
    var highestNum = 0;
    
    while (entries.hasMoreElements()) {
      var entry = entries.getNext();
      entry.QueryInterface(Components.interfaces.nsIFile);
      if (entry.isFile()) {
        // extract file number from filename
        var matches = entry.leafName.match(/^script(\d{1,7})\.js$/);
        
        if (matches) {
          var num = parseInt(matches[1], 10);
          
          if (num > highestNum) {
            highestNum = num;
          }
        }
      }
    }
    
    return "script" + (highestNum + 1) + ".js";
  },
  
  /**
   * Delete all js files except...
   * @param {Array} filenames Files to keep
   */
  deleteAllExcept: function(filenames) {
    var file = this.getScriptsDir();
    var entries = file.directoryEntries;
    var toDelete = [];
    
    while (entries.hasMoreElements()) {
      var entry = entries.getNext();
      entry.QueryInterface(Components.interfaces.nsIFile);
      
      if (entry.isFile()) {
        if (/\.js$/i.test(entry.leafName)
            && filenames.indexOf(entry.leafName) < 0) {
          toDelete.push(entry);
        }
      }
    }
    
    for (var i=0; i<toDelete.length; i++) {
      toDelete[i].remove(false);
    }
  }
}