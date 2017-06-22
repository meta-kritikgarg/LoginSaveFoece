/*******************************************************
 * Copyright (C) 2010-2016 Toshihiro Takasu (takasu.biz@gmail.com)
 * 
 * This file is part of Force.com LOGINS.
 * 
 * Force.com LOGINS can not be copied and/or distributed without the express
 * permission of Toshihiro Takasu
 *******************************************************/

var tran = {
	recentAccounts : []
};

if(getTransaction()){
	tran = getTransaction();
}else{
	saveTransaction(tran);
}
