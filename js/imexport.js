/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

function export_(){
	return export__(getAccounts(), getGroups());
}

function export__(accountArray, groupArray){

	var groupData = "<groups>";
	for(var i = 0; i < groupArray.length; i++){
		var grp = groupArray[i];
		groupData += "<group id='" + grp.id + "' name='" + escape(grp.name) + "'/>";
	}
	groupData += '</groups>';
	
	var accountData = "<accounts>";
	for(var i = 0; i < accountArray.length; i++){
		var acc = accountArray[i];
		var baseUrl = getBaseUrl(acc.orgType, acc.baseUrl);
		accountData += "<account groupid='" + escape(acc.groupid) + "' baseUrl='" + escape(baseUrl) + "' orgType='" + escape(acc.orgType) + "' username='" + escape(acc.username) + "' password='" + escape(decrypt(acc.password)) + "' token='" + escape(acc.token) + "' description='" + escape(acc.description) + "' landingPage='" + escape(acc.landingPage) + "' landingPageOtherUrl='" + escape(acc.landingPageOtherUrl) + "'/>";
	}
	accountData += "</accounts>";
	
	return "<root>" + groupData + accountData + "</root>";
}

function confirmInitialization(){

	if(config.syncEnabled){
		showError(
			"For your safety, please disable Chrome Sync option before initializing data.", 
			"安全の為、初期化する前にChrome Syncオプションを無効化してください。", 
			function(){
				showObj('errorDiv');	
				showObj('imexportDisable');		
			},
			function(){
				hideObj('imexportDisable');
			});
		return;
	}

	showWarning(
		"All account information will be deleted. <br/><br/>Are you sure you want to initialize?", 
		"初期化すると全てのアカウント・グループが削除されます。<br/><br/>初期化してもいいですか？", 
		function(){	// open action
			showObj('imexportDisable');
		},
		function(){ // close action
			hideObj('imexportDisable');
		},
		function(){	// yes action
			initializeData();
		},
		function(){} //no action
	);
}

function confirmImport(){

	if(config.syncEnabled){
		showError(
			"For your safety, please disable Chrome Sync option before importing data.", 
			"安全の為、インポートする前にChrome Syncオプションを無効化してください。", 
			function(){
				showObj('errorDiv');
				showObj('imexportDisable');
			},
			function(){
				hideObj('imexportDisable');
			});
		return;
	}

	showWarning(
		"All account information will be deleted and replaced with data you are about to import.<br/><br/>We strongly recommend that you take backup of your current data. <br/><br/>Are you sure you want to import? ", 
		"インポートすると現在登録されている全てのアカウント・グループが削除され、インポートデータで置き換えられます。<br/><br/>インポートする前に、現在登録されているデータのバックアップをとっておく事をお勧めします。<br/><br/>初期化してもいいですか？", 
		function(){	// open action
			showObj('imexportDisable');
		},
		function(){ // close action
			hideObj('imexportDisable');
		},
		function(){	// yes action
			import_();
		},
		function(){} //no action
	);
}

function import_(){

	var xmlData = obj("xmlData").value;
	var parser = new DOMParser();
	var doc = parser.parseFromString(xmlData, 'text/xml');
	
	var groupsDom = doc.getElementsByTagName("group");
	var accountsDom = doc.getElementsByTagName("account");

	// convert dom to array of object
	var groups = new Array();
	for(var i=0; i<groupsDom.length; i++){
		var grp = groupsDom[i];
		groups.push(initGroup(unescape(grp.getAttribute("id")), unescape(grp.getAttribute("name"))));
	}

	var accounts = new Array();
	for(var i=0; i<accountsDom.length; i++){
		var acc = accountsDom[i];
		var baseUrl = unescape(acc.getAttribute("baseUrl"));
		var un = unescape(acc.getAttribute("username"));
		var pass = unescape(acc.getAttribute("password"));
		var token = unescape(acc.getAttribute("token"));
		var desc = unescape(acc.getAttribute("description"));
		var orgType = unescape(acc.getAttribute("orgType"));
		var grpid = unescape(acc.getAttribute("groupid"));
		var landingPage = unescape(acc.getAttribute("landingPage"));
		var landingPageOtherUrl = unescape(acc.getAttribute("landingPageOtherUrl"));
		accounts.push(initAccount(un, pass, token, desc, grpid, orgType, baseUrl, landingPage, landingPageOtherUrl));
	}

	// validate permision
	result = permissionCheck(accounts.length);
	if(result !== true){
		init();
		error(result.eng, result.jpn);
		return;
	}

	// validate group data
	var result;
	for(var i=0; i<groups.length; i++){
		var grp = groups[i];
		result = validateGroup(grp);
		if(result !== true){
			init();
			error(result.eng, result.jpn);
			return;
		}

		result = checkForDuplicatedGroup(groups, grp, i);
		if(result !== true){
			init();
			error(result.eng, result.jpn);
			return;
		}
	}

	// validate account data
	for(var i=0; i<accounts.length; i++){
		var acc = accounts[i];
		result = validateAccount(acc);
		if(result !== true){
			init();
			error(result.eng, result.jpn);
			return;
		}
		
		result = checkForDuplicatedAccount(accounts, acc, i);
		if(result !== true){
			init();
			error(result.eng, result.jpn);
			return;
		}
	}
	
	//start manipulating data 
	clearAllData();
	
	for(var i=0; i<groups.length; i++){
		addGroup(groups[i]);
	}

	for(var i=0; i<accounts.length; i++){
		addThisAccount(accounts[i]);
	}
	
	init();
	takeDriveAutoBackup();
}

function initializeData(){
	clearAllData();
	init();
}

// =====================================
// Backup
// =====================================

function buildBackupSelect(){
	var backup = getBackup();
	backup.sort(sortBackupByCreatedDateTimeInMS_dsc);

	//create backup select menu
	var parentDiv = obj("backupSelectSpan");
	var selectObj = obj("backupSelect");
	if(selectObj){
		parentDiv.removeChild(selectObj);
	}

	selectObj = document.createElement("select");
	selectObj.setAttribute("id", "backupSelect");
	selectObj.setAttribute("name", "backupSelect");
	selectObj.setAttribute("style", "width:150px");
	selectObj.addEventListener("change", selectBackup);

	var optionDefault = document.createElement("option");
	optionDefault.setAttribute("label", "Current Data");
	optionDefault.setAttribute("value", "CURRENT");
	selectObj.appendChild(optionDefault);

	var backup = getBackupSeparately();
	var backupAuto = backup.backupAuto;
	var backupSave = backup.backupSave;
	backupAuto.sort(sortBackupByCreatedDateTimeInMS_dsc);
	backupSave.sort(sortBackupByTitle);

	var option_auto = document.createElement("option");
	var label_auto = "---- Auto Backups ----";
	var key_auto = "";
	option_auto.setAttribute("label", label_auto);
	option_auto.setAttribute("value", key_auto);
	option_auto.setAttribute("disabled", "disabled");
	selectObj.appendChild(option_auto);

	for(var i = 0; i < backupAuto.length; i++){
		var b = backupAuto[i];
		
		var option1 = document.createElement("option");
		var label = (i+1) + ". " + b.Title;
		var key = b.CreatedDateTimeInMS;
		option1.setAttribute("label", label);
		option1.setAttribute("value", key);
		selectObj.appendChild(option1);
	}

	var option_saved = document.createElement("option");
	var label_saved = "---- Saved Backups ----";
	var key_saved = "";
	option_saved.setAttribute("label", label_saved);
	option_saved.setAttribute("value", key_saved);
	option_saved.setAttribute("disabled", "disabled");
	selectObj.appendChild(option_saved);

	for(var i = 0; i < backupSave.length; i++){
		var b = backupSave[i];
		
		var option1 = document.createElement("option");
		var label = b.Title;
		var key = b.CreatedDateTimeInMS;
		option1.setAttribute("label", label);
		option1.setAttribute("value", key);
		selectObj.appendChild(option1);
	}

	parentDiv.appendChild(selectObj);
}

function selectBackup(){

	var key = getValueFromSelect("backupSelect");

	var backup = getBackup();
	obj("xmlData").value = "";

	if(key == "CURRENT"){
		obj("xmlData").value = export_();
		hideObj("deleteBackup");
		showObj("saveAsBackup");
		showObj("importInitializeButton");
		return;
	}
	
	for(var i=0; i< backup.length; i++){
		var b = backup[i];
		if(b.CreatedDateTimeInMS == key){
			obj("xmlData").value = export__(b.Accounts, b.Groups);
			hideObj("importInitializeButton");
			showObj("deleteBackup");

			if(b.Keep){
				hideObj("saveAsBackup");
			}else{
				showObj("saveAsBackup");
			}

			return;
		}
	}
}

function showSaveAsDialog(){
	
	var selectedBackupKey = getValueFromSelect("backupSelect");

	if(selectedBackupKey === "CURRENT"){
		obj("backupName").value = formatDate(new Date());
	}else{
		var b = getBackupByKey(selectedBackupKey);
		obj("backupName").value = b.Title;
	}

	showObj("imexportDisable");
	showObj("backupSaveAsNameDiv");
}

// save current data as backup
function saveAsBackup(){
	var selectedBackupKey = getValueFromSelect("backupSelect");
	var title = obj("backupName").value;
	
	/* Google Drive Backup */
	//var saveTo = $('input[name=saveTo]:checked').val()
	var saveTo = "local";

	if(saveTo === "local"){

		var newBackup;
		if(selectedBackupKey === "CURRENT"){
			newBackup = takeBackup(getAccounts(), getGroups(), true, title);
		}else{
			var backup = getBackup();
			for(var i=0; i< backup.length; i++){
				var b = backup[i];
				if(b.CreatedDateTimeInMS == selectedBackupKey){

					newBackup = $.extend(true, {}, b);
					newBackup.Keep = true;
					newBackup.Title = title;
					backup.push(newBackup);
					break;
				}
			}
			saveBackup(backup);
		}

		showSuccess("Backup has been successfully saved.", "バックアップが正常に保存されました。", 
			function(){
				hideObj("backupSaveAsNameDiv")
				showObj("imexportDisable");
			},
			function(){
				hideObj("imexportDisable");
				initBackupSelect();
			});
	}else{

		if(!hasValidLicense()){
			showError(
				"Please purchase license to use Google Drive Backup option.", 
				"Google Drive Backupは有償ライセンスにて利用できます。", 
				function(){
					showObj('errorDiv');	
					showObj('imexportDisable');		
				},
				function(){
					hideObj('imexportDisable');
				});
			return;
		}

		if(config.driveBackupEnabled !== true){
			showError(
				"Please enable Google Drive Backup at option page. (You need license to enable Google Drive Backup)", 
				"オプションページでGoogle Drive Backupを有効化してください。（有効化にはライセンスが必要です）", 
				function(){
					showObj('errorDiv');	
					showObj('imexportDisable');		
				},
				function(){
					hideObj('imexportDisable');
				});
			return;
		}

		$("body").css("cursor", "wait");
		flushAutoBackupStatus();
		takeDriveBackup(function(res){
			$("body").css("cursor", "default");
			showSuccess("Backup has been successfully updated.", "バックアップが正常に更新されました。", 
				function(){
					hideObj("backupSaveAsNameDiv")
					showObj("imexportDisable");
				},
				function(){
					hideObj("imexportDisable");
				});
		});
	}
}

function deleteBackup(){

	var selectedBackupKey = getValueFromSelect("backupSelect");

	var backup = getBackup();
	for(var i=0; i< backup.length; i++){
		var b = backup[i];
		if(b.CreatedDateTimeInMS == selectedBackupKey){
			backup.splice(i, 1);
			saveBackup(backup);

			showSuccess("Backup has been successfully deleted.", "バックアップが正常に削除されました。", 
				function(){
					showObj("imexportDisable");
				},
				function(){
					hideObj("imexportDisable");
					initBackupSelect();
				});
			return;
		}
	}
}

function initBackupSelect(){
	obj("xmlData").value = export_();
	buildBackupSelect();
	showObj("importInitializeButton");
	showObj("saveAsBackup");
	hideObj("imexportDisable");
	hideObj("deleteBackup");
	hideObj("backupSaveAsNameDiv");
}

