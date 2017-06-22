/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var accountArray = new Array();
var recentAccountArray = new Array();
var groupArray = new Array();

function initAccountsOnMem(){
	accountArray = getAccounts();
	groupArray = getGroups();
}

function init(){
	
	initAccountsOnMem();

	refreshStatus();

	if(accountArray.length > 0){
		for(var i=0; i<accountArray.length; i++){
			accountArray[i].id = i;
		}
	}else{
		saveAccounts(accountArray);
	}

	if(tran.recentAccounts.length > 0){
		for(var i=0; i<tran.recentAccounts.length; i++){
			var accountKey = tran.recentAccounts[i];

			var un = accountKey.split(recentAccountKeySeparator)[0];
			var orgType = accountKey.split(recentAccountKeySeparator)[1];
			var customUrl = accountKey.split(recentAccountKeySeparator)[2];
			var ac = getAccountByUsernameAndOrgType(un, orgType, customUrl);
			if(ac) recentAccountArray.push(ac);
		}
	}
	
	if(groupArray.length === 0){
		saveGroups(groupArray);
	}
	
	reset();
	
	if(numOfRecentAccts && numOfRecentAccts > 0 && recentAccountArray.length > 0){
		listRecentlyUsedGroups();
	}
	else listGroups();

	obj("keyword").focus();
}

function refreshStatus(){
	config = getConfig();
	$("#syncStatus").css("color", config.syncEnabled ? "#7DBA76" : "lightgray");
	$("#encryptStatus").css("color", config.encryption ? "#7DBA76" : "lightgray");
	$("#licenseStatus").css("color", hasValidLicense() ? "#7DBA76" : "lightgray");

	/* Google Drive Backup */
	/*
	if($("#gdriveBackupStatus").css("color") == "rgb(211, 211, 211)")
		$("#gdriveBackupStatus").css("color", config.driveBackupEnabled && config.driveAutoBackupEnabled ? "#7DBA76" : "lightgray");
	*/
}

function reset(){
	clearForm();
	
	showObj("saveButton");
	hideObj("saveAsNewButton");
	hideObj("updateButton");
	hideObj("deleteButton");
	hideObj("errorDiv");
	hideObj("successDiv");
	hideObj("warningDiv");
	hideObj("addGroupDiv");
	hideObj("imexportDiv");
	hideObj("disableAllDiv");
	hideObj('imexportDisable');
	hideObj("updateGroupDiv");
}

function getAccount(aid){
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].id == aid) return accountArray[i];
	}
}

function getAccountByUsernameAndOrgType(username, orgType, baseUrl){
	if(orgType == "OTHER"){

		if(!baseUrl) return;

		for(var i=0; i<accountArray.length; i++){
			var a = accountArray[i];
			if(a.username == username && a.orgType == orgType && a.baseUrl == baseUrl) return a;
		}
	}else{
		for(var i=0; i<accountArray.length; i++){
			var a = accountArray[i];
			if(a.username == username && a.orgType == orgType) return a;
		}
	}
}

function clearForm(){
	obj('sfdc_id').value = '';
	obj('sfdc_username').value = '';
	obj('sfdc_password').value = '';
	obj('sfdc_sectoken').value = '';
	obj('sfdc_description').value = '';
	obj("directJumpAccId").value = '';
	obj("directLoginMsg").value = '';
	obj("accountInfo").value = '';
	obj("pwToken").value = '';
	obj("warningDialogParam1").value = '';
	obj("warningDialogParam2").value = '';
	obj("warningDialogParam3").value = '';
	initOrgType();
	initLandingPage();
	document.form.orgType[0].selected = true;
	document.form.landingPage[0].selected = true;
}

function initOrgType(){
	hideObj("orgTypeOtherDiv");
	obj("orgTypeOther").value = 'https://';
}

function initLandingPage(){
	hideObj("landingPageOtherDiv");
	//obj("landingPageOther").value = '/';
}

function showAddAccountDivOnLoad(){
	if(accountArray && accountArray.length == 0){
		showAccountEditDiv();
	}
}

function search(keyword){
	if(event.keyCode == 13 && event.shiftKey){
		directlyOpenWindow();
	}else if(event.keyCode == 13){
		directlyOpenTabPage();
	}else{
		obj("directJumpAccId").value = '';
		listGroups(keyword);
	}
}

function imexportWizard(){
	showObj('imexportDiv');
	showObj('disableAllDiv');
	initBackupSelect();
}

function directlyOpenTabPage(){
	var aid = obj("directJumpAccId").value;
	if(aid && aid != ''){
		openTabPagePOSTById(aid);
	}
}
function directlyOpenWindow(){
	var aid = obj("directJumpAccId").value;
	if(aid && aid != ''){
		openWindowPOST(aid);
	}
}

function openTabPagePOSTById(aid, tabId){
	var acc = getAccount(aid);
	openTabPagePOST(acc, tabId);
}

function openTabPagePOST(acc, tabId){

	setLatestAccount(acc.id);
	setLoginTime(acc.id);
	
	if(!tabId) tabId = createUniqId(acc.url);

	var loginUrl = getBaseUrl(acc.orgType, acc.baseUrl);
	if(acc.landingPage && acc.landingPage !== "null"){
		if(acc.landingPage === "OTHER")
			loginUrl += "?startURL=" + acc.landingPageOtherUrl;
		else
			loginUrl += "?startURL=" + landingPageUrlMap[acc.landingPage];
	}
	
   	var form = document.createElement("form");
    	form.setAttribute("method", "post");
    	form.setAttribute("action", loginUrl);
    	form.setAttribute('target', tabId);
    
    	var username_input = document.createElement("input");
    	username_input.setAttribute("type", "hidden");
    	username_input.setAttribute("name", "un");
    	username_input.setAttribute("value", acc.username);
    	form.appendChild(username_input);

    	var pw_input = document.createElement("input");
    	pw_input.setAttribute("type", "hidden");
    	pw_input.setAttribute("name", "pw");
    	pw_input.setAttribute("value", decrypt(acc.password));
    	form.appendChild(pw_input);
    
    	document.body.appendChild(form);
    	form.submit();
}

function openWindowPOST(aid){
	_openWindowPOST2(aid, false);
}

function openIncogWindowPOST(aid){
	chrome.extension.isAllowedIncognitoAccess(function(isAllowedAccess){
		if(isAllowedAccess === false){
			error("Please allow this extension to run in incognito mode.", "シークレットモードでの実行を許可してください。");
			setTimeout(function(){
				openTabPage("chrome://extensions/?id="+chrome.runtime.id);
			}, 2000);
		}else{
			_openWindowPOST(aid, true);
		}
	});
}

function fillForm(aid){

	var acc = getAccount(aid);

	chrome.windows.getCurrent({}, function(w){
		chrome.tabs.query({windowId:w.id, active:true}, function(tabs) {
	        chrome.tabs.executeScript(
	        	tabs[0].id, 
	        	//{code: "try{document.getElementById('username').value='" + acc.username + "'; document.getElementById('password').value='" + decrypt(acc.password) + "'; document.getElementById('Login').click();}catch(e){}"}, 
	        	{code: "try{document.getElementById('username').value='" + acc.username + "'; document.getElementById('password').value='" + decrypt(acc.password) + "';}catch(e){}"}, 
	        	function() {
	        		//window.close();
	        	}
	        );
		});		
	});
}

/*
	The normal process (fired by extension running on non-incognito window) and incognito process must run separately.
	This method separate script creating window and script posting login data into different process so that it works with opening both normal window and incognito window.
*/
function _openWindowPOST(aid, incognitoFlag){
	var acc = getAccount(aid);
	setLatestAccount(acc.id);
	setLoginTime(acc.id);

	var loginUrl = getBaseUrl(acc.orgType, acc.baseUrl);
	var startUrl = "";
	if(acc.landingPage && acc.landingPage !== "null"){
		if(acc.landingPage === "OTHER")
			startUrl = acc.landingPageOtherUrl;
		else
			startUrl = landingPageUrlMap[acc.landingPage];
	}

	var postData = {
		url : loginUrl,
		startUrl : startUrl,
		un : acc.username,
		pw : decrypt(acc.password)
	};
	
	chrome.windows.create({url:"https://login.salesforce.com/", incognito:incognitoFlag}, function(w){
		chrome.tabs.query({windowId:w.id}, function(tabs) {
		 	chrome.runtime.sendMessage({
		 		name : "login",
		 		tabId:tabs[0].id, 
		 		postData: postData
		 	}, function(res){});
		});
	});
}

function _openWindowPOST2(aid, incognitoFlag){
	var acc = getAccount(aid);
	setLatestAccount(acc.id);
	setLoginTime(acc.id);
	
	var loginUrl = getBaseUrl(acc.orgType, acc.baseUrl);
	if(acc.landingPage && acc.landingPage !== "null"){
		if(acc.landingPage === "OTHER")
			loginUrl += "?startURL=" + acc.landingPageOtherUrl;
		else
			loginUrl += "?startURL=" + landingPageUrlMap[acc.landingPage];
	}

	var postData = {
		url : loginUrl,
		un : acc.username,
		pw : decrypt(acc.password)
	};
	
	// create url with post data encrypted so that it is safe to be shown in url bar of window.
	var url = chrome.runtime.getURL("post.html") + "?postdata=" + 
				 //encrypt GET parameters to hide credentials in url
				escape(encrypt(JSON.stringify(postData), "post-data-encryption-key"));

	// create incognito window with post.html which extracts and decrypt the post data, and execute login script (form submit).
	chrome.windows.create({url:url, incognito:incognitoFlag}, function(nwin){});
}

function clearDiv(objid){
	obj(objid).innerHTML = '';
}

function switchOrgTypeOther(){
	var orgType = getValueFromSelect("orgType");
	if(orgType == "OTHER"){
		showObj("orgTypeOtherDiv");
		obj("orgTypeOther").focus();
	}else{
		initOrgType();
	}
}

function switchLandingPageOther(){
	var landingPage = getValueFromSelect("landingPage");
	if(landingPage == "OTHER"){
		showObj("landingPageOtherDiv");
		obj("landingPageOther").focus();
	}else{
		initLandingPage();
	}
}

function copyAccountInfo(){
	showObj('accountInfo');
	obj('accountInfo').select();
	obj('accountInfo').focus();
	document.execCommand('Copy');
	hideObj('accountInfo');
}

function copyPwToken(){
	showObj('pwToken');
	obj('pwToken').select();
	obj('pwToken').focus();
	document.execCommand('Copy');
	hideObj('pwToken');
}

function createUniqId(un){
	var uid = (un + getStringDT());
	return uid;
}

function openOptionPage(){
	openTabPage(chrome.extension.getURL("../config.html"));

}

function confirmEncryptionKey(callbackAction){
	if(config.encryption){
		showObj("disableAllDiv");
		showObj("enterEncryptionKeyDiv");
		obj("encriptionKeyInput").focus();
		
		$("#enterEncryptionKeyButton").unbind("click");
		$("#enterEncryptionKeyButton").click(function(){submitEncryptionKey(callbackAction);});
		
		return false;
	}else{
		callbackAction();
	}
}

function submitEncryptionKey(callbackAction){

	var encriptionKeyInputValue = obj("encriptionKeyInput").value;
	
	if(getEncryptionKey() == encriptionKeyInputValue){
		closeEncryptionKeyInput();
		callbackAction();
	}else{
		closeEncryptionKeyInput();
		error('Invalid encryption key.', '暗号化キーが正しくありません。');
	}
}

function showPassword(){
	obj("sfdc_password").type = 'text';
	obj("showPasswordJpnHref").innerText = '隠す';
	obj("showPasswordEngHref").innerText = 'hide';
}

function closeEncryptionKeyInput(){
	hideObj("disableAllDiv");
	obj("encriptionKeyInput").value = "";
	hideObj("enterEncryptionKeyDiv");
}

psk = ";afjasipofaeowfjak;ldfjaf;0f098908317lkf;dsafad;9";
