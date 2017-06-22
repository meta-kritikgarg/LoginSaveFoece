/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

$("#addNewAccountHref").click(function(){addNewAccount();});
$("#importWizardHref").click(function(){
	confirmEncryptionKey(imexportWizard);
});
$("#configHref").click(function(){openOptionPage();});
$("#xmlData").click(function(){this.select();});
$("#importCancelButton").click(function(){init();});
$("#importInitializeButton").click(function(){confirmInitialization();});
$("#importButton").click(function(){confirmImport();});
$("#saveAsBackup").click(function(){showSaveAsDialog();});
$("#saveAs").click(function(){saveAsBackup();});
$("#saveAsCancel").click(function(){
	hideObj("imexportDisable");
	hideObj("backupSaveAsNameDiv");
});
$("#backupName").click(function(){this.select();});
$("#deleteBackup").click(function(){
	showWarning("Are you sure you want to delete this backup?", "このバックアップを削除してもよろしいですか？", 
		function(){
			showObj("imexportDisable");
		}, 
		function(){
			hideObj("imexportDisable");
		}, 
		function(){
			deleteBackup();
		}, 
		function(){});
});
$("#addGrpCancelButton").click(function(){closeAddGroup();});
$("#addGrpButton").click(function(){
	var newGrpName = obj("newGrpName").value;
	addGroup(initGroupWithName(newGrpName));
	takeDriveAutoBackup();

	for(var k=0; k<obj('grpSelect').length; k++){
		if(obj('grpSelect')[k].label == newGrpName){
			obj('grpSelect')[k].selected = true;
		}
	}
});
$("#grpPopupButton").click(function(){showObj('disableAllDiv'); showObj('addGroupDiv'); $('#newGrpName').focus();});
$("#showPasswordJpnHref").click(function(){
	var p = document.getElementById('sfdc_password');
	if(p.type=='password'){
		confirmEncryptionKey(showPassword);
	}
	else{p.type='password'; this.innerText = '表示';}
});
$("#showPasswordEngHref").click(function(){
	var p = document.getElementById('sfdc_password');
	if(p.type=='password'){
		confirmEncryptionKey(showPassword);
	}
	else{p.type='password'; this.innerText = 'show';}
});
$("#sfdc_sectoken").click(function(){this.select();});
$("#orgType").change(function(){switchOrgTypeOther();});
$("#landingPage").change(function(){switchLandingPageOther();});
$("#copyAccountInfoHref").click(function(){confirmEncryptionKey(copyAccountInfo)});
$("#copyPwTokenHref").click(function(){confirmEncryptionKey(copyPwToken)});
$("#clearButton").click(function(){hideAccountEditDiv(); init();});
$("#saveButton").click(function(){
	showWarning(
		"Are you sure you want to save?", 
		"アカウント情報を登録してもいいですか？", 
		function(){}, // open action
		function(){ // close action
			hideObj('disableAllDiv');
		},
		function(){	// yes action
			saveAccount(initAccountFromDom());
		},
		function(){} //no action
	);
});
$("#updateButton").click(function(){
	showWarning(
		"Are you sure you want to update?", 
		"アカウント情報を更新してもいいですか？", 
		function(){}, // open action
		function(){ // close action
			hideObj('disableAllDiv');
		},
		function(){	// yes action
			updateAccount(obj("sfdc_id").value, initAccountFromDom());
		},
		function(){} //no action
	);
});
$("#saveAsNewButton").click(function(){
	showWarning(
		"Are you sure you want to save as new entry?", 
		"新しいアカウント情報として登録してもいいですか？", 
		function(){}, // open action
		function(){ // close action
			hideObj('disableAllDiv');
		},
		function(){	// yes action
			saveAccount(initAccountFromDom());
		},
		function(){} //no action
	);
});
$("#deleteButton").click(function(){
	showWarning(
		"Are you sure you want to delete?", 
		"アカウント情報を削除してもいいですか？", 
		function(){}, // open action
		function(){ // close action
			hideObj('disableAllDiv');
		},
		function(){	// yes action
			deleteAccount();
		},
		function(){} //no action
	);
});
$("#keyword").keyup(function(){search(this.value);});

/* enterEncryptionKeyDiv */
$("#closeEncryptionKeyButton").click(function(){closeEncryptionKeyInput();});
$("#encriptionKeyInput").keypress(function(){
	if(window.event.keyCode === 13){
		$("#enterEncryptionKeyButton").click();
	}
});

/* updateGroupDiv */
$("#updateGrpCancelButton").click(function(){
	hideObj("updateGroupDiv");
	hideObj("disableAllDiv");
});
$("#updateGrpButton").click(function(){
	updateGroup(obj("updateGrpId").value, obj("updateGrpName").value);
});
$("#deleteGrpButton").click(function(){
	showWarning(
		"You are about to delete this group and all accounts that belong to this group.<br/> Are you sure you want to do this?", 
		"グループと、このグループに所属する全てのアカウントを削除します。<br/>本当に削除して良いですか？", 
		function(){},	// open action
		function(){}, // close action
		function(){	// yes action
			forceDeleteGroup(obj("updateGrpId").value);
			hideObj('updateGroupDiv');
		},
		function(){} //no action
	);
});

$("#").on("mouseover", function(){document.getElementById('xx').style.display='block';});
$("#").on("mouseout", function(){document.getElementById('xx').style.display='block';});

// Enable jQuery-ui tooktip feature
$(function(){
	$(document).tooltip();
});

// ---- CLEANING [BEGIN] -----
// set account creation order based on current element order in array
var daccounts = getAccounts();
if(daccounts.length > 0 && daccounts[0].createdTime === undefined){
	for(var i=0; i<daccounts.length; i++){
		setAccountCreatedTime(daccounts[i], i+1);
	}
	saveAccounts(daccounts);
}

// remove accounts with invalid groupid ----
var grps = getGroups();
var grpIds = new Array();
for(var i=0; i<grps.length; i++){
	grpIds.push(grps[i].id);
}

var maccounts = getAccounts();
var vaccounts = new Array();
for(var i=0; i<maccounts.length; i++){
	var a = maccounts[i];

	if(grpIds.contains(a.groupid)){
		vaccounts.push(a);
	}
}
if(maccounts.length != vaccounts.length){
	try{
		saveAccounts(vaccounts);
	}catch(e){}
}
// remove accounts with invalid groupid ----

// cleaning up the field values from upgrades ----
maccounts = getAccounts();
for(var i=0; i<maccounts.length; i++){
	var a = maccounts[i];

	// clearn up the baseUrl, we don't keep this in storage anymore.
	if(a.orgType != "OTHER"){
		a.baseUrl = "";
	}

	// clean up the landingPage for certain cases user got undefined set during upgrades.
	if(a.landingPage === "undefined" || a.landingPage === undefined){
		a.landingPage = "HOME";
	}
}
saveAccounts(maccounts);
// cleaning up the field values from upgrades ----
// ---- CLEANING [END] -----

//If sync is enabled, you need to wait until sync is done before doing anything.
if(config.syncEnabled){
	try{
		sync(
			function(){
				init();
				showAddAccountDivOnLoad();
				applyLang();
			}
		);
	}catch(e){
		alert(e.messageE);
	}
}else{
	init();
	showAddAccountDivOnLoad();
	applyLang();
}
