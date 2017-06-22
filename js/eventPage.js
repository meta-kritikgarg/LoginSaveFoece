/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

loadScripts();

// Opens notice page upon upgrade.
chrome.runtime.onInstalled.addListener(
  function(details){

    if(details.reason == "update"){
      openReleaseNotesPage();
    }

    if(details.reason == "install"){
      openForceComLoginsWebPage();
    }
  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.name !== "login") return;

    var submitCode = 
        "var form = document.createElement('form');" + 
        "form.setAttribute('method', 'post');" + 
        "form.setAttribute('action', '" + request.postData.url + "');" + 
        "var username_input = document.createElement('input');" + 
        "username_input.setAttribute('type', 'hidden');" + 
        "username_input.setAttribute('name', 'un');" + 
        "username_input.setAttribute('value', '" + request.postData.un + "');" + 
        "form.appendChild(username_input);" + 
        "var pw_input = document.createElement('input');" + 
        "pw_input.setAttribute('type', 'hidden');" + 
        "pw_input.setAttribute('name', 'pw');" + 
        "pw_input.setAttribute('value', '" + request.postData.pw + "');" + 
        "form.appendChild(pw_input);" + 
        "var startUrl_input = document.createElement('input');" + 
        "startUrl_input.setAttribute('type', 'hidden');" + 
        "startUrl_input.setAttribute('name', 'startURL');" + 
        "startUrl_input.setAttribute('value', '" + request.postData.startUrl + "');" + 
        "form.appendChild(startUrl_input);" + 
        "document.body.appendChild(form);" + 
        "form.submit();";

    chrome.tabs.executeScript(request.tabId, {code:submitCode, runAt:"document_end"});
  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.name !== "autoBackup") return;

    /* Google Drive Backup */
    //takeDriveBackup();
  }
);

function logGDriveAutoBackupStart(){
    transaction = getTransaction();

    if(!transaction.gdriveAutoBackup){
        transaction.gdriveAutoBackup = {
            lastAttemptedDate : null,
            lastAttemptSucceed : false,
            successMessage : "",
            errorMessage : ""
        };
    }

    transaction.gdriveAutoBackup.lastAttemptedDate = (new Date()).getTime();
    saveTransaction(transaction);
}

function logGDriveAutoBackupSucceed(dt, filename){
    transaction = getTransaction();
    transaction.gdriveAutoBackup.lastAttemptSucceed = true;
    transaction.gdriveAutoBackup.lastCreatedDate = dt.getTime();
    transaction.gdriveAutoBackup.successMessage = "Last backup taken is " + filename;
    saveTransaction(transaction);
}

function logGDriveAutoBackupFailed(error){
    console.error(error);
    transaction = getTransaction();
    transaction.gdriveAutoBackup.lastAttemptSucceed = false;
    transaction.gdriveAutoBackup.errorMessage = error;
    saveTransaction(transaction);
}

function takeDriveBackup(callback){

    var config = getConfig();

    if(!hasValidLicense()) return false;
    if(config.driveBackupEnabled !== true) return false;

    logGDriveAutoBackupStart();

    try{
      // get auth token from google cache
      chrome.identity.getAuthToken({ 'interactive': true }, function(access_token) {

        try{

          gapi.auth.setToken({
            access_token: access_token
          });

          // get drive folder
          getDriveFiles(  "title='"+driveBackupFolderName+"' and mimeType='" + driveBackupFolderMimeType + "' and trashed=false", 
                          "createdDate desc", 1, function(res){

            console_log(res, config.debug);

            if(res.error){
                logGDriveAutoBackupFailed("Failed to get folder from GDrive : " + res.error.message);
                return;
            }

            // folder is not yet created or manually deleted.
            if(res.items.length == 0){

              // create folder
              createDriveFolder(driveBackupFolderName, function(res){
                
                console_log(res, config.debug);

                if(res.error){
                  logGDriveAutoBackupFailed("Failed to create folder on GDrive : " + res.error.message);
                  return;
                }

                // upload backup data
                var folderId = res.id;
                uploadBackupData(folderId, function(res){
                  console_log(res, config.debug);

                  if(res.error){
                    logGDriveAutoBackupFailed("Failed to upload backup to GDrive : " + res.error.message);
                    return;
                  }

                  logGDriveAutoBackupSucceed((new Date(res.createdDate)), res.originalFilename);

                  if(callback) callback(res);
                });
              });
            }
            // folder is found.
            else{

              var folderId = res.items[0].id;

              // upload backup data.
              uploadBackupData(folderId, function(res){
                console_log(res, config.debug);

                if(res.error){
                  logGDriveAutoBackupFailed("Failed to upload backup to GDrive : " + res.error.message);
                  return;
                }

                logGDriveAutoBackupSucceed((new Date(res.createdDate)), res.originalFilename);

                if(callback) callback(res); 

                // check how many backups are already taken, and if more than limit then delete.
                getDriveFiles(  "title contains '" + driveBackupFilenamePrefix + "' and '" + folderId + "' in parents and mimeType='" + driveBackupFileMimeType + "' and trashed=false", 
                                " createdDate asc", null, function(res){

                  var numOfBackups = res.items.length;
                  var backupNumLimit = Number(config.driveAutoBackupNumber) > 0 ? Number(config.driveAutoBackupNumber) : -1;

                  console_log(numOfBackups + " backup files found.", config.debug);
                  console_log(backupNumLimit + " is the upper limit.", config.debug);

                  // delete the old backup data
                  if(backupNumLimit > 0 && numOfBackups > backupNumLimit){

                    for(var i=0; i<res.items.length-backupNumLimit; i++){
                      console_log("deleting " + res.items[i].title, config.debug);
                      deleteDriveFile(res.items[i].id, function(res){

                        if(res.error){
                          console_log(res.error);
                          return;
                        }
                      });
                    }
                  }
                });
              });
            }
          });
        }catch(e){
            logGDriveAutoBackupFailed(e);
        }
      });
    }catch(e){
        logGDriveAutoBackupFailed(e);
    }
}

function getDriveFiles(query, orderBy, maxResults, callback) {

  var parameters = 'q=' + query + (orderBy != null ? '&orderBy=' + orderBy : '') + (maxResults != null ? '&maxResults=' + maxResults : '');
  console_log('param = ' + parameters, config.debug);
  var request = gapi.client.request({
     'path': '/drive/v2/files?' + parameters,
     'method': 'GET'
  });

  request.execute(callback);
}

function createDriveFolder(folderName, callback) {

   var request = gapi.client.request({
       'path': '/drive/v2/files/',
       'method': 'POST',
       'headers': {
           'Content-Type': 'application/json'
       },
       'body':{
           "title" : folderName,
           "mimeType" : driveBackupFolderMimeType,
       }
  });

  request.execute(callback);
}

function uploadBackupData(folderId, callback){
  var fileName = driveBackupFilenamePrefix + formatDate(new Date(), "-");
  insertFile(fileName, b64toBlob(btoa(export_()), driveBackupFileMimeType), folderId, callback);
}

function insertFile(fileName, fileData, folderId, callback) {

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var metadata = {
      'title': fileName,
      "parents": [{"id":folderId}],
      'mimeType': driveBackupFileMimeType
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + driveBackupFileMimeType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

   var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    request.execute(callback);
  }
}

function deleteDriveFile(fileId, callback) {

   var request = gapi.client.request({
       'path': '/drive/v2/files/' + fileId + '/trash',
       'method': 'POST'
  });

  request.execute(callback);
}

// OmniBox listeners -- BEGINS
chrome.omnibox.onInputStarted.addListener(
  function(){
    
    initConfigOnMem();
    initAccountsOnMem();

    chrome.omnibox.setDefaultSuggestion({description: "Search username/group/description for quick login."});

    for(var i=0; i<accountArray.length; i++){
      var acc = accountArray[i];
      acc.searchKey = acc.username.toLowerCase() + getGroupById(acc.groupid).name.toLowerCase() + acc.description.toLowerCase();
    }
  }
);

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    var suggestions = [];
    var textLowerCase = text.toLowerCase();

    if(!text) return;

    for(var i=0; i<accountArray.length; i++){
      
      var acc = accountArray[i];  
      if(acc.searchKey.indexOf(textLowerCase) == -1) continue;

      //escape keword for RegExp
      var before = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

      // highlight matching words
      var regExp = new RegExp(before, "ig");
      var groupName = getGroupById(acc.groupid).name.replace(regExp, "<match>$&</match>");
      var accountName = acc.username.replace(regExp, "<match>$&</match>");
      var desc = acc.description.replace(regExp, "<match>$&</match>");

      var contentValue = acc.username + "|" + acc.orgType + (acc.orgType == "OTHER" ? "|" + acc.baseUrl : "");
      var descValue = "[" + groupName + "] <url>" + accountName + "</url> | " + (acc.orgType == "OTHER" ? acc.baseUrl : orgTypeLabelMap[acc.orgType]) + (acc.description != "" ? " - <dim>" + desc + "</dim>" : "");

      suggestions.push({content: contentValue, description: descValue});
    }
    suggest(suggestions);
  }
);

chrome.omnibox.onInputEntered.addListener(
  function(text) {

    if(!hasValidLicense()){
      alert("You need paid license to use quick login feature.");
      return;
    }
    
    var username = null;
    var orgType = null;
    var baseUrl = null;
    try{
      username = text.split('|')[0];
      orgType = text.split('|')[1];
      baseUrl = text.split('|')[2];
    }catch(e){}

    if(username != null && orgType != null){
      var acc = getAccountByUsernameAndOrgType(username, orgType, baseUrl);
      if(acc) openTabPagePOST(acc);
    }
  }
);
// OmniBox listeners -- END

function loadScripts(){

    /*
    //Google Drive Backup
    var scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'https://apis.google.com/js/client:plusone.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);
    */

    var scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/blowfish.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/jquery-2.1.4.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/util.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/dao.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/config.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/payment.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/drive.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/main.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/account.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/group.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);

    scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.charset = 'utf-8';
    scriptElem.src = 'js/imexport.js';
    document.getElementsByTagName('head')[0].appendChild(scriptElem);
}
