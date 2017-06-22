/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/
 
$("#driveBackupCloseButton").click(function(){window.close();});
$("#driveBackupEnabled").change(function(){initiateFieldDisabledStatus();});
$("#driveBackupSaveButton").click(function(){saveDriveBackupSetting();});

if(config.driveBackupEnabled === true) $("#driveBackupEnabled").prop('checked', true);
if(config.driveAutoBackupEnabled === true) $("#driveAutoBackupEnabled").prop('checked', true);
obj("numOfDriveAutoBackup").value = config.driveAutoBackupNumber;

initiateFieldDisabledStatus();

function initiateFieldDisabledStatus(){
  var disabled = false;
  if($("#driveBackupEnabled").is(':checked')){
    disabled = false;
  } else {
    disabled = true;
  }

  $("#driveAutoBackupEnabled").prop( "disabled", disabled);
  $("#numOfDriveAutoBackup").prop( "disabled", disabled);
}