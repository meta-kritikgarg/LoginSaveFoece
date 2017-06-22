/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/
 
function saveTransaction(transaction){
	localStorage.Transaction = JSON.stringify(transaction);
}

function getTransaction(){
	return localStorage.Transaction ? JSON.parse(localStorage.Transaction) : null;
}

function saveAccounts(accountArrayParam, noSync){
	localStorage.Accounts = JSON.stringify(accountArrayParam);
	
	if(noSync) return;
	if(config.syncEnabled) syncUp();
}

function getAccounts(){
	var accounts = localStorage.Accounts ? JSON.parse(localStorage.Accounts) : new Array();

	//delete deprecated elements. id is still in used but the id is initiated in main.js#init().
	for(var i=0; i<accounts.length; i++){
		delete accounts[i].id;
		delete accounts[i].latest;
		delete accounts[i].lastaccessedtime;
	}

	return accounts;
}

function saveGroups(groupArrayParam, noSync){
	localStorage.Groups = JSON.stringify(groupArrayParam);
	
	if(noSync) return;
	if(config.syncEnabled) syncUp();
}

function getGroups(){

	var groupArrayTmp = localStorage.Groups ? JSON.parse(localStorage.Groups) : new Array();

	if(groupArrayTmp.length === 0){

		var Group = {
			id : props.defGrpId,
			name : config.defGrpName
		}
		groupArrayTmp.push(Group);
	}else{
		for(i=0; i<groupArrayTmp.length; i++){
			if(groupArrayTmp[i].id == props.defGrpId){
				groupArrayTmp[i].name = config.defGrpName;
			}
		}
	}

	return groupArrayTmp;
}

function saveConfig(configParam, noSync){
	localStorage.Config = JSON.stringify(configParam);
	if(noSync) return;
	if(config.syncEnabled) syncUp();
}

function getConfig(){
	if(localStorage.Config)
		return JSON.parse(localStorage.Config);
	else{
		saveConfig(config);
		return config;
	}
}

function saveBackup(backupArray){
	localStorage.Backup = JSON.stringify(backupArray);	
}

function getBackup(){
	return localStorage.Backup ? JSON.parse(localStorage.Backup) : new Array();
}

function getBackupSeparately(){
	var backup = getBackup();
	var backupAuto = new Array();
	var backupRetain = new Array();

	backup.sort(sortBackupByCreatedDateTimeInMS_dsc);
	for(var i=0; i<backup.length; i++){
		var b = backup[i];
		if(b.Keep) backupRetain.push(b);
		else backupAuto.push(b);
	}

	return {
		backupAuto : backupAuto,
		backupSave : backupRetain
	};
}

function takeBackup(accounts, groups, keep, title){

	var backup = new Array();
	if(localStorage.Backup){
		backup = JSON.parse(localStorage.Backup);
	}

	var backupAuto = new Array();
	var backupRetain = new Array();

	backup.sort(sortBackupByCreatedDateTimeInMS_dsc);
	for(var i=0; i<backup.length; i++){
		var b = backup[i];
		if(b.Keep) backupRetain.push(b);
		else if(backupAuto.length < config.numOfAutoBackup){
			backupAuto.push(b);
		}
	}

	if(backupAuto.length == config.numOfAutoBackup){
		backupAuto.pop();
	}

	var dt = new Date();
	var b = {
		CreatedDateTimeInMS : dt.getTime(),
		Title : title ? title : formatDate(dt),
		Accounts : accounts,
		Groups : groups,
		Keep : keep
	};

	if(keep){
		backupRetain.push(b);
	}else if(!keep && config.numOfAutoBackup > 0){
		backupAuto.push(b);
	}

	backup = backupAuto.concat(backupRetain);
	backup.sort(sortBackupByCreatedDateTimeInMS_dsc);
	localStorage.Backup = JSON.stringify(backup);

	return b;
}

function getBackupByKey(key){
	var backup = getBackup();
	for(var i=0; i< backup.length; i++){
		var b = backup[i];
		if(b.CreatedDateTimeInMS == key){
			return b;
		}
	}
	return;
}

function sortBackupByCreatedDateTimeInMS_dsc(a, b){
	var keyA = a.CreatedDateTimeInMS,
	    keyB = b.CreatedDateTimeInMS;
	// Compare the 2 dates
	if(keyA < keyB) return 1;
	if(keyA > keyB) return -1;
	return 0;
}

function sortBackupByTitle(a, b){
	var keyA = a.Title,
	    keyB = b.Title;
	// Compare the 2 dates
	if(keyA < keyB) return -1;
	if(keyA > keyB) return 1;
	return 0;
}

function clearAllData(){
	accountArray = new Array();
	groupArray = new Array();
	saveAccounts(accountArray);
	saveGroups(groupArray);
}

function clearBackup(){
	saveBackup(new Array());
}

//--- For Google Sync 
function sync(func){

	console_log("sync...", config.debug);

	chrome.storage.sync.get(
		"fcl_data",
		function(item){

			if (chrome.runtime.error) {
				var errorMsg = "Failed to get data in sync: " + chrome.runtime.error;
				error(errorMsg, errorMsg);
				return;
			 }

			if(!isEmpty(item)){
				console_log("data in sync found.", config.debug);
				storeSyncedData(item);
				initAccountsOnMem();
				initConfigOnMem();

				if(func) func();
			}else{
				console_log("no data in sync fund.", config.debug);
				syncUp(func);
			}
		}
	);
}

function syncUp(func){

	console_log("syncing up", config.debug);

	var localData = {
		Config : getConfig(),
		Accounts : getAccounts(),
		Groups : getGroups()
	}
	
	checkSyncSize(localData);

	// for bug investigation
	for(var i=0; i<localData.Accounts.length; i++){
		console_log("BI> " + localData.Accounts[i].username, config.debug);
	}
	console_log("BI> Num of accounts to be pushed:" + localData.Accounts.length, config.debug);
	// for bug investigation
	
	chrome.storage.sync.set({"fcl_data" : localData}, function(){
		if(func) func();
	});
}

function storeSyncedData(item){
	//TODO: switch to take google drive backup, and test it. Auto backup for sync should be depreciated in next release.
	takeBackup(getAccounts(), getGroups(), false);

	console_log("syncing down", config.debug);
	var noSync = true;
	saveConfig(item.fcl_data.Config, noSync);
	saveAccounts(item.fcl_data.Accounts, noSync);
	saveGroups(item.fcl_data.Groups, noSync);
}

function SyncQuotaExceededException(msgE, msgJ) {
   this.messageE = msgE;
   this.messageJ = msgJ;
   this.name = "SyncQuotaExceededException";
}


function checkSyncSize(localData){
	var localDataSize = JSON.stringify(localData).bytes();
	var quotaBytesPerItem = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
	console_log("Local data size : " + localDataSize + ", Max quota for sync : " + quotaBytesPerItem, config.debug);
	if(localDataSize >= quotaBytesPerItem - props.quotaBytesPerItemBufferSizeInByte){
		var c = getConfig();
		c.syncEnabled = false;
		var noSync = true;
		saveConfig(c, noSync);

		console.warn("Data size is now " + localDataSize + " bytes and getting close to QUOTA_BYTES_PER_ITEM of " + quotaBytesPerItem + " bytes.");
		throw new SyncQuotaExceededException(
			"Your data size (" + localDataSize + " byte) exceeds or is reaching to sync-able data size limit of " + quotaBytesPerItem + " byte set by Google. <br/><br/>Sync is now disabled for your safety. <br/>Please manage your data to be smaller and enable Sync again.",
			"データサイズ (" + localDataSize + " byets)がGoogleによる同期可能データサイズ上限の" + quotaBytesPerItem + " bytes を超過もしくは近づいている為、Sync設定をオフにしました。<br/><br/>Syncを有効化する場合は、グループ及びアカウント数を調整してください。");
	}
}

