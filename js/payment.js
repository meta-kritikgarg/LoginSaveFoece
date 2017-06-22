/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 *
 * This file is part of Force.com LOGINS.
 *
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

function onLicenseUpdate(skus){

  console_log("getPurchases SUCCESS", config.debug);
  console_log(skus, config.debug);
  console_log("hasLicense = " + config.hasLicense, config.debug);
  console_log("hasValidActivationCode = " + isACValid(config.ac), config.debug);

  var noSync = true;
  var products = skus.response.details;
  var count = products.length;
  var hasLicense = false;
  for(var i=0; i<count; i++){

    if(products[i].sku === "pro" &&
      (products[i].state === "ACTIVE" || products[i].state === "CANCELLED" || products[i].state === "CANCELLED_BY_DEVELOPER")){
      hasLicense = true;
    }
  }

  if(hasLicense != config.hasLicense){
    config.hasLicense = hasLicense;
    noSync = false;
  }

  saveConfig(config, noSync);
  console_log("--- updated ---", config.debug);
  console_log("hasLicense = " + config.hasLicense, config.debug);
  console_log("hasValidActivationCode = " + isACValid(config.ac), config.debug);

  // Refresh expiration date on option page, and license status on extension window
  try{
    refreshStatus();
  }catch(e){}

  //Disable sync if user doesn't have license.
  if(!hasValidLicense()){
    config.syncEnabled = false;
    saveConfig(config);
  }

  if(hasValidLicense()) $("#hasLicense").show();
  else $("#noLicense").show();
}

function onLicenseUpdateFail(skus){
  console_log("getPurchases FAILED", config.debug);
  console_log(skus, config.debug);
  console_log("hasLicense = " + config.hasLicense, config.debug);
  console_log("hasValidActivationCode = " + isACValid(config.ac), config.debug);

  if(hasValidLicense()) $("#hasLicense").show();
  else $("#noLicense").show();
}

function purchaseLicense(){
  if(window.confirm("- The license ties to the google account you purchase license with, and you can not activate extension on Chrome signed in with any other google account.\n\n- The license can not be transferred to different google account.\n\n- You will not receive activation code upon purchase as activation code is NOT for commercial.\n\n- The fee will automatically be charged after 7 days of trial. If you do not want to be charged automatically, you need to cancel the subscription before trial period expires.\n\nAre you sure you want to proceed?")){
    google.payments.inapp.buy({
      'parameters': {'env': "prod"},
      'sku': "pro",
      'success': onPurchase,
      'failure': onPurchaseFail
    });
  }else{
    return;
  }
}

function onPurchase(){
  console_log("purchase request success.", config.debug);
  window.location.reload();
}

function onPurchaseFail(res){
  console_log("purchase request failed.", config.debug);
  console_log(res, config.debug);
}

function activate(ac){

  if(isACValid(ac)){
    config.ac = ac;
    saveConfig(config);

    $('#activateModal').modal("hide");
    $("#noLicense").hide();
    $("#hasLicense").show();
  }else{
    alert("Activation failed.");
  }
}

function hasValidLicense(){
  return true;
  if(config.hasLicense == true) return true;
  if(config.ac && isACValid(config.ac)) return true;
  return false;
}

function isACValid(ac){
  if(!ac) return false;

  var dac = encrypt(ac, psk);
  return acArray.contains(dac);
}

var acArray = [
  "k½ÉÙÐàîÛ",
  "þi;EfÓÙÐàîÛ",
  "´²­,-ö/ÙÐàîÛ",
  "ïS­ÝóA=ÙÐàîÛ",
  "{­ìAMªbÙÐàîÛ",
  "B£ópp ÙÐàîÛ"
];
