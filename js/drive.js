/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/
 
var driveBackupFolderName = "Force.com LOGINS Backup";
var driveBackupFolderMimeType = "application/vnd.google-apps.folder";
var driveBackupFilenamePrefix = "backup_";
var driveBackupFileMimeType = "text/plain";

function saveDriveBackupSetting(){

  hideObj('drivebacup-save-msg');

  if(!hasValidLicense()){
    alert("You need to purchase license to use Google Drive Backup option.");
    return;
  }

  var enabled = $("#driveBackupEnabled").is(':checked');
  var autoBackup = $("#driveAutoBackupEnabled").is(':checked');
  var numOfAutoBackup = obj("numOfDriveAutoBackup").value;
  config.driveBackupEnabled = enabled;
  config.driveAutoBackupEnabled = autoBackup;
  config.driveAutoBackupNumber = numOfAutoBackup;
  saveConfig(config);

  if(enabled === false){

    chrome.identity.getAuthToken({ 'interactive': true }, function(access_token) {    
      chrome.identity.removeCachedAuthToken({ token: access_token }, function() {});
    });

    showObj('drivebacup-save-msg');
    return;
  }

  chrome.identity.getAuthToken({ 'interactive': true }, function(access_token) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });

  showObj('drivebacup-save-msg');
}

function takeDriveAutoBackup(callback){

  if(!hasValidLicense()) return false;
  if(config.driveBackupEnabled !== true) return false;
  if(config.driveAutoBackupEnabled !== true) return false;

  flushAutoBackupStatus();

  chrome.runtime.sendMessage({
        name : "autoBackup"
      }, function(res){});
}

function succeededAutoBackupStatus(){
  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "#7DBA76");
  },1500);
}

function failedAutoBackupStatus(msg){
  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "red");
  },1500);
}

function flushAutoBackupStatus(){
  $("#gdriveBackupStatus").css("color", "lightgray");

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "#7DBA76");    
  },200);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "lightgray");    
  },400);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "#7DBA76");    
  },600);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "lightgray");    
  },800);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "#7DBA76");    
  },1000);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "lightgray");    
  },1200);

  setTimeout(function(){
    $("#gdriveBackupStatus").css("color", "#7DBA76");    
  },1400);
}
