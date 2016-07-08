// A simple object for storing data shared across all browser windows
// (used instead of Application.storage, which was removed in Fx 47).
var EXPORTED_SYMBOLS = ['MGStorage'];

var MGStorage = {
  data: {},
  
  get: function(key) {
    return typeof this.data[key] != 'undefined' ? this.data[key] : null;
  },
  
  set: function(key, val) {
    this.data[key] = val;
  }
};
