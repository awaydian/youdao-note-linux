var fs = require('fs');
var Nightmare = require('nightmare');

//to manipuate cookies
var COOKIES = {
	COOKIES_PATH : './.cookies',
	getCookies : function(){
		var self = this;
		return new Promise((resolve,reject) => {
			fs.exists(self.COOKIES_PATH, function( exists ){
			    if(!exists) return reject('.cookies not found , sign in please');
			    fs.readFile(self.COOKIES_PATH,'utf8',function(err,data){
					if(err || data == '' || data == '{}') return reject('.cookies not found , sign in please');
					var obj = JSON.parse(data);
					resolve(obj);
				})
			})
		})
	},
	saveCookies : function(data){
		var self = this;
		return new Promise((resolve,reject) => {
			fs.writeFile(self.COOKIES_PATH,JSON.stringify(data),function(err){
				if(err) return reject(err);
				resolve('save cookies success');
			})
		})	
	},
	clearCookies : function(){
		return this.saveCookies('');
	}
};


var nightmare = Nightmare({ show: true ,dock: true,typeInterval: 100,alwaysOnTop:false,waitTimeout:600000})

//start browser
COOKIES.getCookies().then(function(cookies){
	nightmare.goto('http://note.youdao.com/')
	.cookies.set('YNOTE_CSTK', cookies.YNOTE_CSTK)
	.cookies.set('YNOTE_LOGIN', cookies.YNOTE_LOGIN)
	.cookies.set('YNOTE_SESS', cookies.YNOTE_SESS)
	.cookies.get()
	.wait(500)
	.refresh()
	.catch(function (error) {
		console.error('failed:', error);
	});
},function(err){
	console.log(err);
	nightmare
	.goto('http://note.youdao.com/signIn/index.html')
	//auto fill in and submit
	// .type('[name=username]', 'email')
	// .type('[name=password]', 'password')
	// .click('button[type=submit]')
	// .click('button[type=submit]')
	.wait('.own-info')
	.cookies.get()
	.then((cookies)=>{
		var cookieObj = {};
		if(!cookies) return;
		for (var i = cookies.length - 1; i >= 0; i--) {
			if(cookies[i].name == 'YNOTE_SESS') cookieObj.YNOTE_SESS = cookies[i].value;
			else if(cookies[i].name == 'YNOTE_LOGIN') cookieObj.YNOTE_LOGIN = cookies[i].value;
			else if(cookies[i].name == 'YNOTE_CSTK') cookieObj.YNOTE_CSTK = cookies[i].value;
		};
		if(!(cookieObj.YNOTE_SESS && cookieObj.YNOTE_LOGIN && cookieObj.YNOTE_CSTK)){
			console.log('will not save cookies',cookies);
			return;
		}else{
			console.log('save cookies start')
		}
		COOKIES.saveCookies(cookieObj).then(function(msg){
			console.log(msg)
		},function(err){
			console.log(err);
		})
	})
	.catch(function (error) {
		console.error('failed:', error);
		console.log('please restart');
		exit(1);
	});
})