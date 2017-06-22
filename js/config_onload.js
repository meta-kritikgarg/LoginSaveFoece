/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/
 
if(config && config.lang){
	var opts = obj('langSelect').options;
	for(i=0; i<opts.length; i++){
		if(config.lang == opts[i].value) opts[i].selected = true;
	}
}

var grpName = 'General';
if(config && config.defGrpName && config.defGrpName != ""){
	grpName = config.defGrpName;
}
obj('defGrpName').value = grpName;

if(config && config.forgetPrevAccount == true){
	obj('forgetPrevAccount').checked = true;
}

if(config && config.numOfRecentAccts){
	obj('numOfRecentlyUsedAccount').value = config.numOfRecentAccts;
}

if(config && config.encryption == true){
	obj('encryption').checked = true;
	obj('encryptionKey').value = decryptMaster(config.encryptionKey);
}

if(config && config.syncEnabled == true){
	obj('syncEnabled').checked = true;
}

obj("numOfAutoBackup").value = config.numOfAutoBackup;

if(config && config.accountDisplayOrder){
	var opts = obj('accountDisplayOrder').options;
	for(i=0; i<opts.length; i++){
		if(config.accountDisplayOrder == opts[i].value) opts[i].selected = true;
	}
}

obj('debugMode').checked = (config.debug ? true : false);

$("#configSaveButton").click(function(){save();});
$("#configCloseButton").click(function(){window.close();});
$("#encryption").click(function(){switchEncKeySection();});

//--- Save Sync Setting ---//
$("#syncCloseButton").click(function(){window.close();});
$("#syncSaveButton").click(function(){saveSyncSetting_warn();});
$("#copyExportedData").click(function(){saveSyncSetting_copydata();});
$("#dataIsSafeButton").click(function(){saveSyncSetting_check()});
$("#syncDownButton").click(function(){saveSyncSetting_syncdown()});
$("#syncUpButton").click(function(){saveSyncSetting_syncup()});
$("#syncForcePushButton").click(function(){saveSyncSetting_forcepush()});

var localData = {
		Config : getConfig(),
		Accounts : getAccounts(),
		Groups : getGroups()
	}
var localDataSize = JSON.stringify(localData).bytes();
var quotaBytesPerItem = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
$("#syncDataSizeLimit").text(quotaBytesPerItem);
$("#currentDataSize").text(localDataSize);
if(localDataSize >= quotaBytesPerItem - props.quotaBytesPerItemBufferSizeInByte){
	$("#currentDataSize").css("color", "red");
}

/*
var accs = getAccounts();
accs[0].username = "ys";

var localData = {
	Config : getConfig(),
	Accounts : accs,
	Groups : getGroups()
}

chrome.storage.sync.set({"fcl_data" : localData}, function(){
	if (chrome.runtime.error) {
		var errorMsg = "Failed to sync up: " + chrome.runtime.error;
		error(errorMsg, errorMsg);
		return;
	 }
});
*/