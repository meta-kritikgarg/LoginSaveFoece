/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var arg = new Object;
var pair=location.search.substring(1).split('&');

for(var i=0;pair[i];i++) {
    var kv = pair[i].split('=');
    arg[kv[0]]=kv[1];
}

var postData = JSON.parse(decrypt(unescape(arg["postdata"]), "post-data-encryption-key"));

var form = document.createElement("form");
form.setAttribute("method", "post");
form.setAttribute("action", postData.url);

var username_input = document.createElement("input");
username_input.setAttribute("type", "hidden");
username_input.setAttribute("name", "un");
username_input.setAttribute("value", postData.un);
form.appendChild(username_input);

var pw_input = document.createElement("input");
pw_input.setAttribute("type", "hidden");
pw_input.setAttribute("name", "pw");
pw_input.setAttribute("value", postData.pw);
form.appendChild(pw_input);

document.body.appendChild(form);
form.submit();
