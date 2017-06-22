/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var usernameMaxLen = 80;
var descMaxLen = 100;
var usernameDisplayMaxLen = 32;
var landingPageUrlMap = {
	"HOME" : "/",
	"REPORT" : "/00O/o",
	"DASHBOARD" : "/01Z/o",
	"CHATTER" : "/_ui/core/chatter/ui/ChatterPage",
	"OPPORTUNITY" : "/006/o",
	"CASE" : "/500/o",
	"SETUP" : "/setup/forcecomHomepage.apexp",
	"USER" : "/005"
};
var orgTypeLabelMap = {
	"PROD" : "prod",
	"SANDBOX" : "sandox",
	"PRE" : "pre",
	"OTHER" : "custom"
};
var orgTypeUrlMap = {
	"SANDBOX" : "https://test.salesforce.com/",
	"PROD" : "https://login.salesforce.com/",
	"PRE" : "https://prerellogin.pre.salesforce.com/"
};

var recentAccountKeySeparator = "||";

function initAccount(un, pass, token, desc, grpid, orgType, baseUrl, landingPage, landingPageOtherUrl){

	var Account = {
		baseUrl: baseUrl,
		description :desc,
		groupid: grpid,
		landingPage : landingPage,
		landingPageOtherUrl : landingPageOtherUrl,
		orgType: orgType,
		password : encrypt(pass),
		token: token,
		username : un
	}
	return Account;
}

function initAccountFromDom(){
	var orgType = getValueFromSelect("orgType");
	var grpId = getValueFromSelect("grpSelect");
	var landingPage = getValueFromSelect("landingPage");

	return initAccount(
				trim(obj("sfdc_username").value),
				trim(obj("sfdc_password").value),
				trim(obj("sfdc_sectoken").value),
				obj("sfdc_description").value,
				grpId,
				orgType,
				getBaseUrl(orgType, obj("orgTypeOther").value),
				landingPage,
				landingPage === "OTHER" ? obj("landingPageOther").value : ""
			);
}

function updateAccountValues(aid, acc, accountArray){
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].id == aid){
			var a = accountArray[i];
			a.baseUrl = acc.baseUrl;
			a.description = acc.description;
			a.groupid = acc.groupid;
			a.landingPage = acc.landingPage;
			a.landingPageOtherUrl = acc.landingPageOtherUrl;
			a.orgType = acc.orgType;
			a.password = acc.password;
			a.token = acc.token;
			a.username = acc.username;
			setAccountUpdatedTime(a);
		}
	}
}

function addNewAccount(){
	init();
	showAccountEditDiv();
}

function showAccountEditDiv(){
	$("#editDiv").slideDown("fast");
	$("#sfdc_username").focus();
	
	obj("sfdc_password").type = 'password';
	obj("showPasswordJpnHref").innerText = '表示';

	obj("sfdc_password").type = 'password';
	obj("showPasswordEngHref").innerText = 'show';
}

function hideAccountEditDiv(){
	$("#editDiv").slideUp("fast");
}

function grpHasAccount(grpid){
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].groupid == grpid){
			return true;
		}
	}
	return false;
}

function deleteAccountByGrp(grpid){
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].groupid == grpid){
			deleteAccount(accountArray[i].id);
		}
	}
}
	
function buildAccountTbl(grpid, keyword, firstHitFlg){

	var usernameList = new Array();
	var dupUsernameList = new Array();
	for(var i = 0; i < accountArray.length; i++){
		if(!usernameList.contains(accountArray[i].username)) usernameList.push(accountArray[i].username);
		else dupUsernameList.push(accountArray[i].username);
	}
	
	var accountsInGroup = new Array();
	for(var i = 0; i < accountArray.length; i++){		
		if(accountArray[i].groupid == grpid){
			accountsInGroup.push(accountArray[i]);
		}
	}
	
	if(config.accountDisplayOrder == "default"){
		// display as is in the array
	}else if(config.accountDisplayOrder == "login_desc"){
		accountsInGroup.sort(function(a,b){
			if(a.lastLoginTime > b.lastLoginTime) return -1;
			if(a.lastLoginTime < b.lastLoginTime) return 1;
			return 0;
		});
	}else if(config.accountDisplayOrder == "username_asc"){
		accountsInGroup.sort(function(a,b){
			if(a.username < b.username) return -1;
			if(a.username > b.username) return 1;
			return 0;
		});
	}else if(config.accountDisplayOrder == "username_desc"){
		accountsInGroup.sort(function(a,b){
			if(a.username > b.username) return -1;
			if(a.username < b.username) return 1;
			return 0;
		});
	}else if(config.accountDisplayOrder == "updatedtime_asc"){
		accountsInGroup.sort(function(a,b){
			if(a.updatedTime < b.updatedTime) return -1;
			if(a.updatedTime > b.updatedTime) return 1;
			return 0;
		});
	}else if(config.accountDisplayOrder == "updatedtime_desc"){
		accountsInGroup.sort(function(a,b){
			if(a.updatedTime > b.updatedTime) return -1;
			if(a.updatedTime < b.updatedTime) return 1;
			return 0;
		});
	}

	var outer = document.createElement("div");
	outer.setAttribute("id", grpid + "_acc");
	
	for(var i = 0; i < accountsInGroup.length; i++){
		var acc = accountsInGroup[i];
		
		if(keyword && keyword != '' && acc.username.indexOf(keyword) == -1){
			continue;
		}
		
		var inner = document.createElement("div");
		inner.setAttribute("style", "padding:2px;");
		
		var openButton = document.createElement("input");
		openButton.setAttribute("title", "Log in with new tab.", 0);
		openButton.setAttribute("type", "button", 0);
		openButton.setAttribute("value", "tab", 0);
		openButton.param_accId = acc.id;
		openButton.addEventListener("click", function(){openTabPagePOSTById(this.param_accId);}, false);
		
		var openWinButton = document.createElement("input");
		openWinButton.setAttribute("title", "Log in with new window.", 0);
		openWinButton.setAttribute("type", "button", 0);
		openWinButton.setAttribute("value", "windw", 0);
		openWinButton.param_accId = acc.id;
		openWinButton.addEventListener("click", function(){openWindowPOST(this.param_accId);}, false);
		
		var openIncogImg = document.createElement("img");
		openIncogImg.setAttribute("title", "Log in with new incognito window.", 0);
		openIncogImg.setAttribute("src", "../img/incognito_gray.png");
		openIncogImg.param_accId = acc.id;
		openIncogImg.addEventListener("click", function(){openIncogWindowPOST(this.param_accId);}, false);
		
		if((forgetPrevAccount == false && (!keyword || keyword == '') && 
			tran.recentAccounts.length > 0 && twoAccountMatches(acc, recentAccountArray[0])) || 
			(keyword && keyword != '' && acc.username.indexOf(keyword) != -1 && firstHitFlg == false)){
		
			firstHitFlg = true;
			obj("directJumpAccId").value = acc.id;
			openButton.setAttribute("class", "btn-grp-left-selected");
			openWinButton.setAttribute("class", "btn-grp-center-selected");
			
			openIncogImg.setAttribute("src", "../img/incognito_navy.png");
			openIncogImg.setAttribute("class", "img-grp-right-selected");

		}else{
			openButton.setAttribute("class", "btn-grp-left");
			openWinButton.setAttribute("class", "btn-grp-center");
			openIncogImg.setAttribute("class", "img-grp-right");
		}

		inner.appendChild(openButton);
		inner.appendChild(openWinButton);
		inner.appendChild(openIncogImg);
		
		var editA = document.createElement("a");
		editA.setAttribute("class", "accountA");
		editA.param_accId = acc.id;
		editA.addEventListener("click", function(){editAccount(this.param_accId)}, false);
		
		var fullusername = acc.username;
		if(fullusername.length > usernameDisplayMaxLen) fullusername = fullusername.substring(0, usernameDisplayMaxLen/2) + '...' + fullusername.substring(fullusername.length-(usernameDisplayMaxLen/2), fullusername.length);
		var hrefTextLabel = dupUsernameList.contains(acc.username) ? fullusername + " (" + orgTypeLabelMap[acc.orgType] + ")" : fullusername;
		var hrefText = document.createTextNode(hrefTextLabel);
		editA.appendChild(hrefText);
		inner.appendChild(editA);
		outer.appendChild(inner);
		
		if(acc.description != ''){
			editA.addEventListener("mouseover", function(){document.getElementById("desc_" + this.param_accId).style.display='block';}, false);
			editA.addEventListener("mouseout", function(){document.getElementById("desc_" + this.param_accId).style.display='none';}, false);
			
			var descSpan = document.createElement("span");
			var descText = document.createTextNode(acc.description);
			descSpan.appendChild(descText);
			descSpan.setAttribute("id", "desc_" + acc.id);
			descSpan.setAttribute("class", "fukidasipop");
			inner.appendChild(descSpan);
		}
	}
	
	return outer;
}

function buildRecentAccountTbl(num, firstHitFlg){

	var usernameList = new Array();
	var dupUsernameList = new Array();
	for(var i = 0; i < accountArray.length; i++){
		if(!usernameList.contains(accountArray[i].username)) usernameList.push(accountArray[i].username);
		else dupUsernameList.push(accountArray[i].username);
	}

	var outer = document.createElement("div");
	outer.setAttribute("id", "recent_acc");

	var count = 0;
	for(var i = 0; i < recentAccountArray.length && i < num; i++){
		acc = recentAccountArray[i];
		
		var inner = document.createElement("div");
		inner.setAttribute("style", "padding:2px;");
		
		var openButton = document.createElement("input");
		openButton.setAttribute("title", "Log in with new tab.", 0);
		openButton.setAttribute("type", "button", 0);
		openButton.setAttribute("value", "tab", 0);
		openButton.param_accId = acc.id;
		openButton.addEventListener("click", function(){openTabPagePOSTById(this.param_accId);}, false);
		
		var openWinButton = document.createElement("input");
		openWinButton.setAttribute("title", "Log in with new window.", 0);
		openWinButton.setAttribute("type", "button", 0);
		openWinButton.setAttribute("value", "window", 0);
		openWinButton.param_accId = acc.id;
		openWinButton.addEventListener("click", function(){openWindowPOST(this.param_accId);}, false);
		
		var openIncogImg = document.createElement("img");
		openIncogImg.setAttribute("title", "Log in with new incognito window.", 0);
		openIncogImg.setAttribute("src", "../img/incognito_gray.png");
		openIncogImg.param_accId = acc.id;
		openIncogImg.addEventListener("click", function(){openIncogWindowPOST(this.param_accId);}, false);
		
		if(tran.recentAccounts.length > 0 && twoAccountMatches(acc, recentAccountArray[0])){

			firstHitFlg = true;
			obj("directJumpAccId").value = acc.id;

			openButton.setAttribute("class", "btn-grp-left-selected");
			openWinButton.setAttribute("class", "btn-grp-center-selected");
			
			openIncogImg.setAttribute("src", "../img/incognito_navy.png");
			openIncogImg.setAttribute("class", "img-grp-right-selected");
		}else{
			openButton.setAttribute("class", "btn-grp-left");
			openWinButton.setAttribute("class", "btn-grp-center");
			openIncogImg.setAttribute("class", "img-grp-right");
		}
		
		inner.appendChild(openButton);
		inner.appendChild(openWinButton);
		inner.appendChild(openIncogImg);
		
		var editA = document.createElement("a");
		editA.param_accId = acc.id;
		editA.addEventListener("click", function(){editAccount(this.param_accId)}, false);
		editA.setAttribute("class", "accountA");
		
		var fullusername = acc.username;
		if(fullusername.length > usernameDisplayMaxLen) fullusername = fullusername.substring(0, usernameDisplayMaxLen/2) + '...' + fullusername.substring(fullusername.length-(usernameDisplayMaxLen/2), fullusername.length);
		var hrefTextLabel = dupUsernameList.contains(acc.username) ? fullusername + " (" + orgTypeLabelMap[acc.orgType] + ")" : fullusername;
		var hrefText = document.createTextNode(hrefTextLabel);
		editA.appendChild(hrefText);
		inner.appendChild(editA);
		outer.appendChild(inner);
		
		if(acc.description != ''){
			editA.setAttribute("onmouseover", "document.getElementById('desc_" + acc.id + "').style.display='block';");
			editA.setAttribute("onmouseout", "document.getElementById('desc_" + acc.id + "').style.display='none';");
			
			var descSpan = document.createElement("span");
			var descText = document.createTextNode(acc.description);
			descSpan.appendChild(descText);
			descSpan.setAttribute("id", "desc_" + acc.id);
			descSpan.setAttribute("class", "fukidasipop");
			inner.appendChild(descSpan);
		}
	}
	
	numOfRecentAccts = 0;
	
	return outer;
}

function deleteAccount(aid){
	if(!aid){
		aid = obj("sfdc_id").value;
	}
	
	if(!aid){
		error("Please select account first.", "アカウントを選択してください。");
		return;
	}

	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].id == aid){
			accountArray.splice(i,1);
		}
	}
	saveAccounts(accountArray);
	init();
	hideAccountEditDiv();
}

function editAccount(aid){
	var acc = getAccount(aid);
	
	showAccountEditDiv();
	hideObj("saveButton");
	showObj("saveAsNewButton");
	showObj("updateButton");
	showObj("deleteButton");
	obj("sfdc_id").value = acc.id;
	obj("sfdc_username").value = acc.username;
	obj("sfdc_password").value = decrypt(acc.password);
	obj("sfdc_sectoken").value = acc.token;
	obj("sfdc_description").value = acc.description;
	obj("orgTypeOther").value = acc.baseUrl;

	if(acc.landingPage == "OTHER") 
		obj("landingPageOther").value = acc.landingPageOtherUrl;

	try{
		for(var k=0; k<obj('orgType').length; k++){
			if(obj('orgType')[k].value == acc.orgType){
				obj('orgType')[k].selected = true;

				if(acc.orgType == "OTHER"){
					showObj("orgTypeOtherDiv");
				}else{
					initOrgType();
				}
			}
		}
	}catch(e){}

	try{
		for(var k=0; k<obj('landingPage').length; k++){
			if(obj('landingPage')[k].value == acc.landingPage){
				obj('landingPage')[k].selected = true;

				if(acc.landingPage == "OTHER"){
					showObj("landingPageOtherDiv");
				}else{
					initLandingPage();
				}
			}
		}
	}catch(e){}
	
	try{
		for(var k=0; k<obj('grpSelect').length; k++){
			if(obj('grpSelect')[k].value == acc.groupid){
				obj('grpSelect')[k].selected = true;
			}
		}
	}catch(e){}
	
	//Prepare for account info copy.
	var nl = getCRChars();
	var loginUrl = getBaseUrl(acc.orgType, acc.baseUrl);
	
	obj("accountInfo").value = "URL: " + loginUrl + nl + 
		"ID: " + acc.username + nl + 
		"PASS: " + decrypt(acc.password) + nl + 
		"SecurityToken: " + acc.token;

	obj("pwToken").value = decrypt(acc.password) + acc.token;
}

function saveAccount(acc){
	console_log("CREATE", config.debug);
	var result = validateAccount(acc);
	if(result !== true){
		return error(result.eng, result.jpn);
	}

	// duplicate check must be done at final check, right before addThisAccount.
	result = checkForDuplicatedAccount(accountArray, acc, -1);
	if(result !== true){
		return error(result.eng, result.jpn);
	}
	
	addThisAccount(acc);
	takeDriveAutoBackup();
}

function updateAccount(aid, acc){
	console_log("UPDATE", config.debug);
	var result = validateAccount(acc);
	if(result !== true){
		return error(result.eng, result.jpn);
	}

	var accountIndex = -1;
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].id == aid) accountIndex = i;
	}

	result = checkForDuplicatedAccount(accountArray, acc, accountIndex);
	if(result !== true){
		return error(result.eng, result.jpn);
	}

	updateAccountValues(aid, acc, accountArray);
	saveAccounts(accountArray);

	init();
	hideAccountEditDiv();
	takeDriveAutoBackup();
}

function addThisAccount(acc){

	var newAccountArray = [].concat(accountArray);

	setAccountCreatedTime(acc);
	newAccountArray.push(acc);
	
	var result = permissionCheck(newAccountArray.length);
	if(result !== true){
		return error(result.eng, result.jpn);
	}

	try{
		saveAccounts(newAccountArray);
	}catch(e){
		init();
		hideAccountEditDiv();
		showNotice(e.messageE, e.messageJ);
		return;
	}

	init();
	hideAccountEditDiv();
}

function getBaseUrl(orgType, baseUrl){
	if(orgType == "OTHER") return baseUrl;
	
	return orgTypeUrlMap[orgType];
}

function validateAccount(acc){
	if(!acc.username || !acc.password || acc.username == '' || acc.password == ''){
		return {
			eng : "Please enter username and password.",
			jpn : "ユーザ名とパスワードを入力してください。"
		};
	}
	
	var nameLen = acc.username.length;
	if(nameLen > usernameMaxLen){
		return {
			eng : 'Username has to be less than ' + usernameMaxLen + ' characters.',
			jpn : "ユーザ名は" + usernameMaxLen + '文字以内で入力してください。'
		};
	}
	
	var descLen = acc.description.length;
	if(descLen > descMaxLen){
		return {
			eng : 'Description has to be less than ' + descMaxLen + ' characters.',
			jpn : "説明は" +descMaxLen + "文字以内で入力してください。"
		};
	}
	
	if(!hasValidLicense() && (acc.landingPage != "HOME" && acc.landingPage != "undefined")){
		return {
			eng : 'Landing page option is available with paid license.<br/>You can purchase license from option page.',
			jpn : "ランディング設定は有償版で利用可能です。<br/>有償版ライセンスはオプションページから購入可能です。"
		};
	}

	return true;
}

function checkForDuplicatedAccount(accounts, account, index){
	for(var i=0; i<accounts.length; i++){
		if(i == index) continue;
		if(twoAccountMatches(accounts[i], account)){
			return {
				eng : "Duplicated account found. You can not create multimple accounts with the same username and the same org type (login endpoint).",
				jpn : "重複するアカウントがあります。ユーザ名とログインエンドポイント（組織種別）が同じアカウントを複数件登録する事はできません。"
			};
		}
	}
	return true;
}

function permissionCheck(accountSize){
	if(!hasValidLicense() && accountSize > props.maxAccountsForFree){
		return {
			eng : 'You can manage up to ' + props.maxAccountsForFree + ' accounts with Free edition.<br/>You can purchase license from option page.',
			jpn : "無償版では" + props.maxAccountsForFree + "アカウントまで管理可能です。<br/>有償版ライセンスはオプションページから購入可能です。"
		};
	}
	return true;
}

function twoAccountMatches(a1, a2){
	if(!a1 || !a2) return false;
	if(a1.username !== a2.username || a1.orgType !== a2.orgType) return false;
	if(a1.orgType !== "OTHER") return true;
	if(a1.baseUrl == a2.baseUrl) return true;
	return false;
}

function mover(obj){
	obj.style.border = '1px solid gray';
	obj.style.backgroundColor = '#cfe3f7';
	obj.style.fontWeight = 'bold';
}

function moverOut(obj){
	obj.style.border = '';
	obj.style.backgroundColor = 'transparent';
	obj.style.fontWeight = 'normal';
}

function setLatestAccount(aid){
	var acc = getAccount(aid);
	var t = getTransaction();

	var key = acc.username + recentAccountKeySeparator + acc.orgType;
	if(acc.orgType == "OTHER") key += recentAccountKeySeparator + acc.baseUrl;

	t.recentAccounts.unshift(key);

	var uniqueUsernameArray = [];
	$.each(t.recentAccounts, function(i, el){
	    if($.inArray(el, uniqueUsernameArray) === -1) uniqueUsernameArray.push(el);
	});

	if(uniqueUsernameArray.length > config.numOfRecentAccts)
		uniqueUsernameArray.pop();

	t.recentAccounts = uniqueUsernameArray;
	saveTransaction(t);
}

function setAccountCreatedTime(acc, time){
	if(!time) time = (new Date()).getTime();
	acc.createdTime = time;
	acc.updatedTime = time;
	acc.lastLoginTime = 0;
	return acc;
}

function setAccountUpdatedTime(acc, time){
	if(!time) time = (new Date()).getTime();
	acc.updatedTime = time;
	return acc;
}

function setLoginTime(aid){
	for(var i=0; i<accountArray.length; i++){
		if(accountArray[i].id == aid){
			accountArray[i].lastLoginTime = (new Date()).getTime();
		}
	}
	saveAccounts(accountArray);
}

/*
function buildLoginUrl(acc){
	var un = acc.username;
	var pw = decrypt(acc.password);
	var rooturl = getBaseUrl(acc.orgType, acc.baseUrl);

	var encUsername = encodeURIComponent(un);
	var encPassword = encodeURIComponent(pw);
	return rooturl + "?un=" + encUsername + "&pw=" + encPassword;
}
*/
