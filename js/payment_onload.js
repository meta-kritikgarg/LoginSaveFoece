/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

google.payments.inapp.getPurchases({
  'parameters': {'env': 'prod'},
  'success': onLicenseUpdate,
  'failure': onLicenseUpdateFail
});

$("#purchaseLicense").click(function(){purchaseLicense()});
$("#maxAccountsForFreeSpan").text(props.maxAccountsForFree);

$("#activateWithCode").click(function(){
	$('#activateModal').modal();
});
$("#activateButton").click(function(){activate(obj("activationCode").value)});
