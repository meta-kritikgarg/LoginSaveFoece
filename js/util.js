/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

// Common functions -------
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function trim(target){
	if(target){
		return target.replace(/(^\s+)|(\s+$)/g, "")
	}
	return '';
}

function getStringDT(){
	var d = new Date();
	return ''+d.getYear()+d.getMonth()+d.getDate()+d.getHours()+d.getMinutes()+d.getSeconds();
}

function formatDate(d, delimiter){
	if(delimiter)
		return ''+d.getFullYear()+delimiter+('0'+(d.getMonth()+1)).slice(-2)+delimiter+('0'+d.getDate()).slice(-2)+delimiter+('0'+d.getHours()).slice(-2)+delimiter+('0'+d.getMinutes()).slice(-2)+delimiter+('0'+d.getSeconds()).slice(-2);
	else
		return ''+d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
}

function getCRChars(){
	var sourceCode=""+getCRChars+""
	if(sourceCode.indexOf("\r\n")>-1){
		return "\r\n"
	}else if(sourceCode.indexOf("\n")>-1){
		return "\n"
	}else if(sourceCode.indexOf("\r")>-1){
		return "\r"
	}else{
		return "\n"
	}
}

function obj(objId){
	return document.getElementById(objId);
}

function getValueFromSelect(selectObjId){
	var selectObj = document.getElementById(selectObjId);
	return selectObj[selectObj.selectedIndex].value;
}

function setValueOnSelect(selectObjId, value){
	var selectObj = document.getElementById(selectObjId);
	selectObj.value = value;
}

function toggle(objId){
	if(!obj(objId)) return;

	if(obj(objId).style.display === ""){
		hideObj(objId);
		return "hidden";
	}else if(obj(objId).style.display === "none"){
		showObj(objId);
		return "shown";
	}
}

function showObj(objId){
	if(obj(objId)) obj(objId).style.display = "";
}

function hideObj(objId){
	if(obj(objId)) obj(objId).style.display = "none";
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

String.prototype.bytes = function () {
    var bytes = 0,
        i,c,
        len = this.length;
    for(i=0 ;i < len ; i++){
        c = this[i].charCodeAt(0)
        if (c <= 127){
            bytes += 1;
        } else if (c <= 2047){
            bytes += 2;
        } else {
            bytes += 3;
        }
    }
    return bytes;
};

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

// App specific function ------
function debug(str){
	if(obj("debug") && obj("debug").innerHTML) obj("debug").innerHTML += "<br/>" + str;
}
function console_log(str, enabled){
	if(enabled){
		console.log(str);
		debug(str);
	}
}

// Main window specific functions ------
function error(msgE, msgJ){
	showError(msgE, msgJ, 
		function(){
			showObj('disableAllDiv');
			showObj('errorDiv');			
		},
		function(){
			hideObj('disableAllDiv');
		});
}

function showError(msgE, msgJ, openAction, closeAction){
	
	if(openAction) openAction();

	showObj('disableAllDiv');
	showObj('errorDiv');
	
	if(lang == 'jpn') obj('errormsg').innerHTML = msgJ;
	else obj('errormsg').innerHTML = msgE;

	$("#closeErrorButton").click(function(){
		obj('errormsg').innerHTML = '';
		hideObj("errorDiv");
		if(closeAction) closeAction();
		$("#closeErrorButton").unbind("click");
	});
}

function showSuccess(msgE, msgJ, openAction, closeAction){
	
	if(openAction) openAction();

	showObj("disableAllDiv");
	showObj('successDiv');
	
	if(lang == 'jpn') obj('successmsg').innerHTML = msgJ;
	else obj('successmsg').innerHTML = msgE;

	$("#closeSuccessButton").click(function(){
		obj('successmsg').innerHTML = '';
		hideObj("successDiv");
		if(closeAction) closeAction();
		$("#closeSuccessButton").unbind("click");
	});
}

function showNotice(msgE, msgJ, openAction, closeAction){
	
	if(openAction) openAction();

	showObj("disableAllDiv");
	showObj('noticeDiv');
	
	if(lang == 'jpn') obj('noticemsg').innerHTML = msgJ;
	else obj('noticemsg').innerHTML = msgE;

	$("#closeNoticeButton").click(function(){
		obj('noticemsg').innerHTML = '';
		hideObj("noticeDiv");
		hideObj("disableAllDiv");
		if(closeAction) closeAction();
		$("#closeNoticeButton").unbind("click");
	});
}

function showWarning(msgE, msgJ, openAction, closeAction, yesAction, noAction){
	
	if(openAction) openAction();

	showObj("disableAllDiv");
	showObj('warningDiv');
	
	if(lang == 'jpn') obj('warningmsg').innerHTML = msgJ;
	else obj('warningmsg').innerHTML = msgE;

	$("#warningYesButton").click(function(){
		if(yesAction) yesAction();

		obj('warningmsg').innerHTML = '';
		obj("warningDialogParam1").value = "";
		obj("warningDialogParam2").value = "";
		obj("warningDialogParam3").value = "";
		hideObj("warningDiv");
		if(closeAction) closeAction();

		$("#warningYesButton").unbind("click");
		$("#warningNoButton").unbind("click");
	});

	$("#warningNoButton").click(function(){
		if(noAction) noAction();

		obj('warningmsg').innerHTML = '';
		obj("warningDialogParam1").value = "";
		obj("warningDialogParam2").value = "";
		obj("warningDialogParam3").value = "";
		hideObj("warningDiv");
		if(closeAction) closeAction();

		$("#warningYesButton").unbind("click");
		$("#warningNoButton").unbind("click");
	});
}

function openTabPage(pageUrl){
	chrome.tabs.create({url:pageUrl, selected:true});
}
