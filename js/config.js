/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 *
 * This file is part of Force.com LOGINS.
 *
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var props = {
	defGrpName:"General",
	defGrpId:"default",
	accountDisplayOrder:"createdtime_asc",
	recentGrpName:"Recently Used",
	recentGrpId:"recently_used",
	lngDef:"",
	lngJpn:"jpn",
	lngEng:"eng",
	maxAccountsForFree:10,
	defNumOfAutoBackup:10,
	quotaBytesPerItemBufferSizeInByte:0
};
var config = {
	lang:"",
	defGrpName:props.defGrpName,
	forgetPrevAccount:false,
	accountDisplayOrder:props.accountDisplayOrder,
	numOfRecentAccts:0,
	encryption:false,
	encryptionKey:"",
	syncEnabled:false,
	hasLicense:false,
	numOfAutoBackup: props.defNumOfAutoBackup,
	version:""
};
var lang = "";
var forgetPrevAccount = false;
var numOfRecentAccts = 0;

initConfigOnMem();

if(isValidLang(config.lang)){
	lang = config.lang;
}

if(lang == props.lngDef){
	if(window.navigator.language == "ja"){
		lang = props.lngJpn;
	}else{
		lang = props.lngEng;
	}
}

function initConfigOnMem(){
	// load config
	if(getConfig()){
		config = getConfig();

		if(config.forgetPrevAccount) forgetPrevAccount = config.forgetPrevAccount;
		if(config.numOfRecentAccts) numOfRecentAccts = config.numOfRecentAccts;

		if(!config.numOfAutoBackup){
			config.numOfAutoBackup = props.defNumOfAutoBackup;
			saveConfig(config);
		}
	}
	// save default config (first time running extension)
	else{
		saveConfig(config);
	}
}

function applyLang(){
	tagNameToHide = 'jpn';
	if(lang == props.lngJpn){
		tagNameToHide = 'eng';
		buttons = document.getElementsByTagName("input");
		for(i=0; i<buttons.length; i++){
			if(buttons[i].type == "button"){
				if(buttons[i].value == "No"){
					buttons[i].value = "いいえ";
				}else if(buttons[i].value == "Yes"){
					buttons[i].value = "はい";
				}else if(buttons[i].value == "initialize"){
					buttons[i].value = "初期化";
				}else if(buttons[i].value == "cancel"){
					buttons[i].value = "キャンセル";
				}else if(buttons[i].value == "import"){
					buttons[i].value = "インポート";
				}else if(buttons[i].value == "save"){
					buttons[i].value = "登録";
				}else if(buttons[i].value == "update"){
					buttons[i].value = "更新";
				}else if(buttons[i].value == "save as new"){
					buttons[i].value = "新規登録";
				}else if(buttons[i].value == "delete"){
					buttons[i].value = "削除";
				}else if(buttons[i].value == "save as backup"){
					buttons[i].value = "バックアップ";
				}
			}
		}
	}

	tags = document.getElementsByName(tagNameToHide);
	for(i=0; i<tags.length; i++){
		tags[i].style.display = 'none';
	}
}

function isValidLang(lngval){
	if(lngval == props.lngJpn || lngval == props.lngEng || lngval == props.lngDef) return true;
	else return false;
}

function openReleaseNotesPage(){
  console.log("https://forcecomlogins.jimdo.com/release-notes/");
  //openTabPage("https://forcecomlogins.jimdo.com/release-notes/");
}

function openForceComLoginsWebPage(){
	openTabPage("http://forcecomlogins.jimdo.com/");
}

function save(){
	var currentConfig = getConfig();
	var currentEncryptionSetting = currentConfig.encryption;
	var currentEncryptionKey = currentConfig.encryptionKey;

	hideObj('msg');

	if(!setLanguage(obj('langSelect'))) return;
	if(!setDefGrpName(obj('defGrpName').value)) return;
	if(!setForgetPrevAcc(obj('forgetPrevAccount'))) return;
	if(!setNumOfRecentlyAccessedAcc(obj('numOfRecentlyUsedAccount').value)) return;
	if(!setEncryption(obj('encryption'), obj('encryptionKey'))) return;
	if(!setAccountDisplayOrder()) return;
	config.numOfAutoBackup = obj("numOfAutoBackup").value;

	if(obj('debugMode').checked) config.debug = true;
	else config.debug = false;

	var msgTitle = "\n\n***********!!!! WARNING !!!!!***********\n\n";
	var errorMsg = " will delete ALL YOUR DATA INCLUDING BACKUPS!!!!\n\n Please make perfect sure YOU HAVE EXPORTED ALL DATA YOU NEED before proceeding.\n\n You can import your data back in after changing encryption setting.";
	var errorMsgSuffx = "\n\n\nAre you sure you want to proceed?\n\n";
	if(currentEncryptionSetting){
		if(config.encryption == false){
			if(window.confirm(msgTitle + "Disabling encryption" + errorMsg + "encryption is disabled." + errorMsgSuffx)){
				clearAllData();
				clearBackup();
			}else{
				return;
			}
		}else if(currentEncryptionKey != config.encryptionKey){
			if(window.confirm(msgTitle + "Changing the encryption key" + errorMsg + "encryption key is changed." + errorMsgSuffx)){
				clearAllData();
				clearBackup();
			}else{
				return;
			}
		}
	}else{
		if(config.encryption == true){
			if(window.confirm(msgTitle + "Enabling encryption" + errorMsg + "encryption is enabled." + errorMsgSuffx)){
				clearAllData();
				clearBackup();
			}else{
				return;
			}
		}
	}

	try{
		saveConfig(config);
		showObj('msg');
	}catch(e){
		if(e.name == "SyncQuotaExceededException"){
			showObj('msg');
			alert("Your change was successfully saved locally BUT not synced up because your data size exceeds or is close to sync-able data size limit of " + chrome.storage.sync.QUOTA_BYTES_PER_ITEM + " set by Google, and Sync option has been automatically turned off for your safety. \n\nPlease manage your number of account/group to be smaller for data sync.");
			return false;
		}
	}
}

function setForgetPrevAcc(obj){
	if(obj){
		config.forgetPrevAccount = obj.checked;
	}
	return true;
}

function setLanguage(obj){
	var lngval = getValueFromSelect(obj.id);
	if(!isValidLang(lngval)) return;

	config.lang = lngval;

	return true;
}

function setDefGrpName(grpName){

	if(trim(grpName) == ""){
		alert("Default group name can not be empty.");
		return false;
	}

	var result = checkForDuplicatedGroup(getGroups(), {'id' : 'default', 'name' : grpName}, -1);
	if(result !== true){
		alert(result.eng);
		//alert("This group name already exists : " + grpName);
		return false;
	}

	config.defGrpName = grpName;
	return true;
}

function setNumOfRecentlyAccessedAcc(num){
	if(obj)
		config.numOfRecentAccts = num;
	return true;
}

//--- Encryption ---//
function setEncryption(obj, keyObj){
	if(obj && keyObj){
		if(obj.checked && (keyObj.value == null || keyObj.value == '')){
			alert('You need to enter encryption key to enable encryption.');
			return false;
		}

		config.encryption = obj.checked;
		config.encryptionKey = encryptMaster(keyObj.value);
	}
	return true;
}

function getEncryptionKey(){
	return decryptMaster(config.encryptionKey);
}

function switchEncKeySection(){
	if(obj('encryption').checked){
		obj('encryptionKey').disabled=false;
	}else{
		obj('encryptionKey').value='';
		obj('encryptionKey').disabled=true;
	}
}

function setAccountDisplayOrder(){
	config.accountDisplayOrder = getValueFromSelect("accountDisplayOrder");
	return true;
}

//--- Save Sync Setting ---//
function saveSyncSetting_warn(){

	hideObj('sync-save-msg');

	if(!hasValidLicense()){
		alert("You need to purchase license to use Chrome Sync option.");
		return;
	}

	var currentConfig = getConfig();
	var forceSync = obj("forcePushFlag").checked;
	var syncEnabled = obj("syncEnabled").checked;

	if(forceSync === true && syncEnabled === false){
		alert('You need to enable Chrome Sync setting in order to perform force push.');
		return false;
	}

	if(currentConfig.syncEnabled != syncEnabled){
		if(syncEnabled === true){
			$('#exportTextarea').val(export_());
			$('#syncSaveModal').modal();
		}else{
			disableSync();
			showObj('sync-save-msg');
		}
	}else{
		alert("No change found.");
		return false;
		/*
		config.numOfAutoBackup = obj("numOfAutoBackup").value;

		try{
			saveConfig(config);
			showObj('sync-save-msg');
		}catch(e){
			alert(e.messageE);
			return false;
		}
		*/
	}
}

function saveSyncSetting_copydata(){
	obj('exportTextarea').select();
	obj('exportTextarea').focus();
	document.execCommand('Copy');
}

function saveSyncSetting_check(){

	$('#syncSaveModal').modal("hide");

	var forceSync = obj("forcePushFlag").checked;

	chrome.storage.sync.get(
		"fcl_data",
		function(item){

			if(!isEmpty(item)){
				console_log("data in sync found.", config.debug);

				if(forceSync === true){
					console_log("will force push local data.", config.debug);
					$('#dataInSyncTextareaForForcePush').val(getSyncDataInText(item));
					$('#syncForcePushWarningModal').modal();
				}else{
					console_log("will sync down to local.", config.debug);
					$('#dataInSyncTextarea').val(getSyncDataInText(item));
					$('#syncDownWarningModal').modal();
				}
			}else{
				console_log("no data in sync found.", config.debug);
				$('#syncUpWarningModal').modal();
			}
		}
	);
}

function enableSync(){
	config.syncEnabled = true;
	var noSync = true;
	saveConfig(config, noSync);
}

function disableSync(){
	config.syncEnabled = false;
	saveConfig(config);
}

function saveSyncSetting_syncup(){

	enableSync();

	try{
		syncUp(function(){
			$('#syncUpWarningModal').modal("hide");
			showObj('sync-save-msg');
		});
	}catch(e){
		if(e.name == "SyncQuotaExceededException"){
			alert("Your data size exceeds or is close to sync-able data size limit of " + chrome.storage.sync.QUOTA_BYTES_PER_ITEM + " set by Google. \n\nPlease manage your number of account/group to be smaller.");
		}
		return false;
	}
}

function saveSyncSetting_syncdown(){

	// no need to call enableSync() because config data will be overwritten by data in sync with syncEnabled=true anyways.
	sync(function(){
		$('#syncDownWarningModal').modal("hide");
		showObj('sync-save-msg');
	});
}

function saveSyncSetting_forcepush(){

	enableSync();

	try{
		syncUp(function(){
			$('#syncForcePushWarningModal').modal("hide");
			showObj('sync-save-msg');
		});
	}catch(e){
		if(e.name == "SyncQuotaExceededException"){
			alert("Your data size exceeds or is close to sync-able data size limit of " + chrome.storage.sync.QUOTA_BYTES_PER_ITEM + " set by Google. \n\nPlease manage your number of account/group to be smaller.");
		}
		return false;
	}
}

function getSyncDataInText(item){
	var groupsInSync = "Groups : \n";
	if(item.fcl_data.Accounts.length == 0){
		groupsInSync += "\t<Empty>\n"
	}else{
		for(var i=0; i<item.fcl_data.Groups.length; i++){
			groupsInSync += "\t" + item.fcl_data.Groups[i].name + "\n";
		}
	}

	var accountsInSync = "Accounts : \n";
	if(item.fcl_data.Accounts.length == 0){
		accountsInSync += "\t<Empty>\n"
	}else{
		for(var i=0; i<item.fcl_data.Accounts.length; i++){
			accountsInSync += "\t" + item.fcl_data.Accounts[i].username + "\n";
		}
	}

	var configInSync = "Config : \n";
	configInSync += "\tDefault group name : " + item.fcl_data.Config.defGrpName + "\n";
	configInSync += "\tEncryption : " + item.fcl_data.Config.encryption + "\n";
	configInSync += "\tForget account you accessed last : " + item.fcl_data.Config.forgetPrevAccount + "\n";
	configInSync += "\tNumber of recently accessed accounts : " + item.fcl_data.Config.numOfRecentAccts + "\n";
	configInSync += "\tAuto-backup for chrome sync : " + item.fcl_data.Config.numOfAutoBackup + "\n";
	configInSync += "\tChrome sync enabled : " + item.fcl_data.Config.syncEnabled + "\n";
	configInSync += "\tLicensed : " + (item.fcl_data.Config.hasLicense || item.fcl_data.Config.ac != "") + "\n";

	return groupsInSync + "\n" + accountsInSync + "\n" + configInSync;
}
