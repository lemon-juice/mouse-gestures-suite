var addNew;
var siteList;
var bundle;
var ruleActionMap;

function initEditRuleConst() {
  if (typeof bundle == 'undefined' || !bundle) {
    bundle = document.getElementById("allinonegestbundle");
  }
  
  ruleActionMap = {
    P: bundle.getString("opt.sitePrefP"),
    D: bundle.getString("opt.sitePrefD"),
    N: bundle.getString("opt.sitePrefN")
  }
}

function initEditRule() {
  initEditRuleConst();
  addNew = (window.location.search.indexOf('new=1') > 0);
  siteList = window.opener.document.getElementById('siteList');
  
  // add radio options
  var actionRadio = document.getElementById('siteAction');
  addRadioOption(actionRadio, 'P', ruleActionMap.P);
  addRadioOption(actionRadio, 'D', ruleActionMap.D);
  addRadioOption(actionRadio, 'N', ruleActionMap.N);
  
  if (addNew) {
    // select first radio
    actionRadio.value = 'P';
  }
  
  if (!addNew) {
    var selItem = siteList.selectedItems[0];
    var cells = selItem.getElementsByTagName('listcell');
    document.getElementById('siteURL').value = cells[0].getAttribute('label');
    
    // set radio
    actionRadio.value = cells[1].getAttribute('value');
  }
}

function addRadioOption(radioGroup, val, label) {
  var radio = document.createElement('radio');
  radio.setAttribute('value', val);
  radio.setAttribute('label', label);
  radioGroup.appendChild(radio);
  return radio;
}

function saveRule() {
  var URL = document.getElementById('siteURL').value.trim();
  var action = document.getElementById('siteAction').value;
  var selectedItem = siteList.selectedItems[0];
  
  if (URL == "") {
    alert("Please enter URL.");
    return false;
  }
  
  if (URL.indexOf('\\') >= 0) {
    alert("Backslash \\ is not allowed in URL.");
    return false;
  }
  
 // try to find find existing url on list
  var existingItem;
  listItems = siteList.getElementsByTagName('listitem');
  
  for (var i=0; i<listItems.length; i++) {
    if (listItems[i].getElementsByTagName('listcell')[0].getAttribute('label') == URL
        && (addNew || listItems[i] != selectedItem)) {
      existingItem = listItems[i];
    }
  }
  
  if (addNew) {
    if (existingItem) {
      if (!confirm("URL '" + URL + "' already exists in the list. Replace?")) {
        return false;
      }
      
      // replace item - set its action
      existingItem.getElementsByTagName('listcell')[1].setAttribute('value', action);
      existingItem.getElementsByTagName('listcell')[1].setAttribute('label', ruleActionMap[action]);
      return true;
    }
    
    // add item
    addSiteListItem(siteList, URL, action, ruleActionMap[action]);
    return true;
  
  } else {
    // edit
    selectedItem.getElementsByTagName('listcell')[0].setAttribute('label', URL);
    selectedItem.getElementsByTagName('listcell')[1].setAttribute('value', action);
    selectedItem.getElementsByTagName('listcell')[1].setAttribute('label', ruleActionMap[action]);
    
    if (existingItem) {
      existingItem.parentNode.removeChild(existingItem);
    }
    
    return true;
  }
}

function addSiteListItem(listBox, url, actionVal, actionLabel) {
  var listItem = document.createElement('listitem');
  var listCell = document.createElement('listcell');
  listCell.setAttribute('label', url);
  listItem.appendChild(listCell);
  
  var listCell = document.createElement('listcell');
  listCell.setAttribute('label', actionLabel);
  listCell.setAttribute('value', actionVal);
  listItem.appendChild(listCell);
  
  listBox.appendChild(listItem);
}

function openSiteListHelp() {
  var win = window.open("chrome://allinonegest-en/content/help-options.html#siteList", "mousegesturessuiteoptions", "chrome=no,scrollbars=yes,resizable=yes,width=850,height=660");
  win.focus(); 
}