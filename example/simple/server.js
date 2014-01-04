var http = require('http');
var path = require('path');
var fs = require('fs');
var ractivore = require('../../index.js');

var viewdir = path.resolve('./example/views');
var basedir = viewdir + '/base';
var subsdir = viewdir + '/subs';

var dir = __dirname;
var ctrls = [];
fs.readdirSync(dir).forEach(function(file){
	if(file !== 'server.js' && file.substr(0, 1) !== '_') {
		var fname = file.split('.')[0];
		ctrls.push(fname);
	}
});


function dispatcher(req, res) {
	var url = req.url.substr(1);
	if(url.indexOf('favicon') > -1) return;
	
	var tail = url.substr(url.length - 1);
	if(tail === '/') {
		url = url.substr(0, url.length - 1);
	}
	
	console.log('request ' + req.url);
	
	//console.log('!!!', tail, url);
	
	//console.log(ctrls);
	if(ctrls.indexOf(url) > -1) {
		require('./' + url)(req, res, ractivore, basedir, subsdir, ctrls);	
	} else {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end("nada.");
	}
	
}

var server = http.createServer(function (req, res) {
	
	
	
	switch(req.url) {
		
		
		case '/':
		case '/home':	
			require('./home')(req, res, ractivore, basedir, subsdir, ctrls);	
		break;	
	
		default:
			dispatcher(req, res);
		break;	
	
	}	

	
	
});

server.listen(3000);