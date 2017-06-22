/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var groupNameMaxLen = 30;

function closeAddGroup(){
	obj('newGrpName').value = '';
	obj('addGroupErrorDiv').innerHTML = '';
	hideObj('disableAllDiv');
	hideObj('addGroupDiv');
}

function closeDeleteGrpWarning(){
	hideObj('disableAllDiv');
	hideObj('deleteGrpWarningDiv');
}

function initGroup(id, name){

	var group = {
		id : id,
		name : trim(name)
	};
	return group;
}

function initGroupWithName(name){
	var grpId = "grp_" + getStringDT();
	return initGroup(grpId, name);
}

function saveCurrentGroupOrder(){
	var grpDivArray = $('.grpTitle');

	var newGroupArray = new Array();
	for(var i=0; i<grpDivArray.length; i++){
		var g = getGroupById(grpDivArray[i].id);
		if(g !== null){
			newGroupArray.push(g);
		}
	}

	saveGroups(newGroupArray);
	takeDriveAutoBackup();
}

function getGroupById(grpId){
	for(var i=0; i<groupArray.length; i++){
		if(groupArray[i].id === grpId) return groupArray[i];
	}
	return null;
}

function listRecentlyUsedGroups(keyword){
	//create group select menu
	var grpTd = obj("grpTd");
	
	var selectObj = obj("grpSelect");
	if(selectObj){
		grpTd.removeChild(selectObj);
	}
	
	selectObj = document.createElement("select");
	//selectObj.setAttribute("size", "1");
	selectObj.setAttribute("id", "grpSelect");
	selectObj.setAttribute("name", "grpSelect");
	
	for(var i = 0; i < groupArray.length; i++){
		grp = groupArray[i];
		
		var option1 = document.createElement("option");
		option1.setAttribute("label", grp.name);
		option1.setAttribute("value", grp.id);
		selectObj.appendChild(option1);
	}
	grpTd.appendChild(selectObj);
	
	// create group and account list
	var baseDiv = obj("accountDiv");
	
	var grpDiv = obj("grpDiv");
	if(grpDiv)
		baseDiv.removeChild(grpDiv);
	
	grpDiv = document.createElement("div");
	grpDiv.setAttribute("style", "width:100%");
	grpDiv.setAttribute("id", "grpDiv");
	
	//Recently used accounts --
	var recentlyUsedDiv = document.createElement("div");
	recentlyUsedDiv.setAttribute("id", "recentlyUsedDiv");
	
	var inner_ru = document.createElement("div");
	inner_ru.setAttribute("class", "nonCollapsableGrpTitle");
	
	var text_ru = document.createTextNode(props.recentGrpName);
	inner_ru.appendChild(text_ru);
	
	var accDiv_ru = buildRecentAccountTbl(numOfRecentAccts, false);
	
	recentlyUsedDiv.appendChild(inner_ru);
	recentlyUsedDiv.appendChild(accDiv_ru);
	
	//Recently used accounts --
	
	var viewAllDiv = document.createElement("div");
	viewAllDiv.setAttribute("style", "width:100%; text-align:center; margin:20px;");
	
	var viewAllA = document.createElement("a");
	viewAllA.addEventListener("click", function(){
		listGroups();
	}, false);
	viewAllA.setAttribute("class", "accountA");
	viewAllText = document.createTextNode("view all");
	viewAllA.appendChild(viewAllText);
	viewAllDiv.appendChild(viewAllA);
	
	grpDiv.appendChild(recentlyUsedDiv);
	grpDiv.appendChild(viewAllDiv);
	
	baseDiv.appendChild(grpDiv);
	
	showRecentlyUsedGroup = false;
	
}

function listGroups(keyword){
	
	//create group select menu
	var grpTd = obj("grpTd");
	
	var selectObj = obj("grpSelect");
	if(selectObj){
		grpTd.removeChild(selectObj);
	}
	
	selectObj = document.createElement("select");
	//selectObj.setAttribute("size", "1");
	selectObj.setAttribute("id", "grpSelect");
	selectObj.setAttribute("name", "grpSelect");
	
	for(var i = 0; i < groupArray.length; i++){
		grp = groupArray[i];
		
		var option1 = document.createElement("option");
		option1.setAttribute("label", grp.name);
		option1.setAttribute("value", grp.id);
		selectObj.appendChild(option1);
	}
	grpTd.appendChild(selectObj);
	
	// create group and account list
	var baseDiv = obj("accountDiv");
	
	var grpDiv = obj("grpDiv");
	if(grpDiv)
		baseDiv.removeChild(grpDiv);
	
	grpDiv = document.createElement("div");
	grpDiv.setAttribute("style", "width:100%; padding-bottom:50px;");
	grpDiv.setAttribute("id", "grpDiv");
	
	var firstHitFlg = false;
	for(var i = 0; i < groupArray.length; i++){
		grp = groupArray[i];

		var draggableDiv = document.createElement("div");
		draggableDiv.setAttribute("class", "ui-state-default");
		
		var inner = document.createElement("div");
		inner.setAttribute("id", grp.id);

		if(keyword && keyword != ""){
			inner.setAttribute("class", "nonCollapsableGrpTitle");
			var text = document.createTextNode(grp.name);
			inner.appendChild(text);
		}else{
			if(grp.collapsed === true){
				inner.setAttribute("class", "grpTitle grpTitleCollapsed");
			}else{
				inner.setAttribute("class", "grpTitle");
			}

			// group expand-collapse toggle anchor
			var grpAnchor = document.createElement("a");
			var text = document.createTextNode(grp.name);
			grpAnchor.param_grpId = grp.id;
			grpAnchor.appendChild(text);
			grpAnchor.addEventListener("click", function(){
				toggleGroup(this.param_grpId);
			}, false);

			inner.appendChild(grpAnchor);
		}
		
		//sort toggle icon
		var sortIcon = document.createElement("img");
		sortIcon.setAttribute("title", "Drag up/down to change display order.");
		sortIcon.setAttribute("src", "../img/sort.png");
		sortIcon.setAttribute("style", "width:12px; margin-top:1px;float:right; cursor:move;");
		sortIcon.setAttribute("class", "sort-handle");
		inner.appendChild(sortIcon);

		//config icon
		if(grp.id != props.defGrpId){
			var deleteAnchor = document.createElement("a");
			var delImg = document.createElement("img");
			delImg.setAttribute("src", "../img/config.png");
			delImg.setAttribute("style", "width:12px; margin-top:2px;");
			deleteAnchor.appendChild(delImg);
			deleteAnchor.setAttribute("href" ,"#header");
			deleteAnchor.param_grpid = grp.id;
			deleteAnchor.addEventListener("click", function(){configureGroup(this.param_grpid);}, false);
			deleteAnchor.setAttribute("style", "float:right; margin-right:6px; margin-top:-1px; font-weight:normal;");
			inner.appendChild(deleteAnchor);
		}
		
		var accDiv = buildAccountTbl(grp.id, keyword, firstHitFlg);

		var accCount = accDiv.getElementsByTagName("a").length;
		if(grpAnchor) grpAnchor.text += " ("+accCount+")";

		draggableDiv.appendChild(inner);

		if(accDiv && accDiv.childNodes && accDiv.childNodes.length>0){
			draggableDiv.appendChild(accDiv);
			
			var inputObjs = accDiv.getElementsByTagName("input");
			if(inputObjs && inputObjs.length > 0){
				firstHitFlg = true;
			}
		}

		//Group shouldn't be collapsable in search result
		if(keyword && keyword != ""){
			inner.setAttribute("class", "nonCollapsableGrpTitle");
		}

		//Group should be collpased only when it's not search result and group is set as collpased.
		if(grp.collapsed === true && (keyword == false || trim(keyword) == "")){
			accDiv.setAttribute("style", "display:none");
		}

		grpDiv.appendChild(draggableDiv);
	}

	baseDiv.appendChild(grpDiv);

	$('#grpDiv').sortable({
		update: function(ev, ui) {
			saveCurrentGroupOrder();
		},
		axis: "y",
		opacity: 0.4,
		handle: '.sort-handle'
    });
}

function addGroup(group){

	var result = validateGroup(group);
	if(result !== true){
		obj('addGroupErrorDiv').innerHTML = (lang == props.lngJpn) ? result.jpn : result.eng;
		return;
	}

	result = checkForDuplicatedGroup(groupArray, group, -1);
	if(result !== true){
		obj('addGroupErrorDiv').innerHTML = (lang == props.lngJpn) ? result.jpn : result.eng;
		return;	
	}

	groupArray.push(group);

	try{
		saveGroups(groupArray);
	}catch(e){
		closeAddGroup();
		init();
		showNotice(e.messageE, e.messageJ);
		return;
	}

	closeAddGroup();
	init();
}

function validateGroup(group){
	if(group.id !== "default" && trim(group.name) == ''){
		return {
			eng : 'Please enter valid group name.',
			jpn : 'グループ名が不正です。'
		}
	}
	
	var nameLen = group.name.length;
	if(nameLen > groupNameMaxLen){
		return {
			eng : 'Group name has to be less than ' + groupNameMaxLen + ' characters.',
			jpn : 'グループ名は' + groupNameMaxLen + '文字以内で指定してください。'
		}
	}

	return true;	
}

function checkForDuplicatedGroup(groups, group, index, updateFlg){
	for(var i=0; i<groups.length; i++){

		if(i == index) continue;

		if(updateFlg !== true && group.id != 'default' && groups[i].id == group.id){
			return {
				eng : "Group ID is invalid.",
				jpn : "グループIDが不正です。"
			};
		}

		if(group.id != groups[i].id && groups[i].name == group.name){
			return {
				eng : "This group name already exists.",
				jpn : "このグループ名は既に存在します。"
			};
		}
	}
	return true;
}

function configureGroup(grpid){
	if(!grpid){
		grpid = getValueFromSelect("grpSelect");
	}
	
	if(grpid == props.defGrpId){
		error('You can not update default group here.', "デフォルトグループはここから編集できません。");
		return;
	}

	var grpName = '';
	for(var i=0; i<groupArray.length; i++){
		if(groupArray[i].id == grpid){
			grpName = groupArray[i].name;
		}
	}

	obj("updateGrpName").value = grpName;
	obj("updateGrpId").value = grpid;

	showObj('disableAllDiv');
	showObj("updateGroupDiv");

	return;
}

function toggleGroup(grpId){
	var toggleResult = toggle(grpId + "_acc");
	var collapsedFlag = false;
	if(toggleResult === "hidden"){
		$("#" + grpId).addClass("grpTitleCollapsed");
		collapsedFlag = true;
	}else{
		$("#" + grpId).removeClass("grpTitleCollapsed");
	}

	for(var i=0; i<groupArray.length; i++){
		if(groupArray[i].id == grpId){
			groupArray[i].collapsed = collapsedFlag;
		}
	}
	saveGroups(groupArray);
}

function updateGroup(grpId, grpName){

	var group = {
		id : grpId,
		name : grpName
	};

	var result = validateGroup(group);
	if(result !== true){
		obj('updateGroupErrorDiv').innerHTML = (lang == props.lngJpn) ? result.jpn : result.eng;
		return;
	}

	result = checkForDuplicatedGroup(groupArray, group, -1, true);
	if(result !== true){
		obj('updateGroupErrorDiv').innerHTML = (lang == props.lngJpn) ? result.jpn : result.eng;
		return;	
	}

	for(var i=0; i<groupArray.length; i++){
		if(groupArray[i].id == group.id){
			groupArray[i].name = group.name;
		}
	}

	try{
		saveGroups(groupArray);
	}catch(e){
		init();
		showNotice(e.messageE, e.messageJ);
		return;
	}

	closeAddGroup();
	init();
}

function deleteGroup(grpid){
	if(!grpid){
		grpid = getValueFromSelect("grpSelect");
	}
	
	if(grpid == props.defGrpId){
		error('You can not delete default group.', "デフォルトグループは削除できません。");
		return;
	}

	showWarning(
		"You are about to delete this group and all accounts that belong to this group.<br/> Are you sure you want to do this?", 
		"グループと、このグループに所属する全てのアカウントを削除します。<br/>本当に削除して良いですか？", 
		function(){	// open action
			obj("warningDialogParam1").value = grpid;
		},
		function(){ // close action
			hideObj('disableAllDiv');
		},
		function(){	// yes action
			forceDeleteGroup(obj("warningDialogParam1").value);
		},
		function(){} //no action
	);

	return;
}
	
function forceDeleteGroup(grpid){
	for(var i=0; i<groupArray.length; i++){
		if(groupArray[i].id == grpid){
			groupArray.splice(i, 1);
		}
	}
	
	saveGroups(groupArray);
	deleteAccountByGrp(grpid);
	
	init();
}
