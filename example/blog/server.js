var http = require('http');
var path = require('path');
var fs = require('fs');

var viewdir =__dirname + '/tpl';
var basedir = viewdir + '/base';
var subsdir = viewdir + '/posts';

var dir = __dirname;
var pages = [];

fs.readdirSync(subsdir).forEach(function(child){
	//var stats = fs.statSync(child);
	//if(stats.isDirectory()) {
	pages.push(child);
	//}
});

var view = require('./baseview');

function dispatcher(req, res) {
	var url = req.url.substr(1);
	if(url.indexOf('favicon') > -1) return;
	
	if(url === '') {
		url = 'home';
	}
	
	var tail = url.substr(url.length - 1);
	if(tail === '/') {
		url = url.substr(0, url.length - 1);
	}
	
	console.log('request ' + req.url);
	
	if(pages.indexOf(url) > -1) {
		
		view(req, res, url);
		
	} else {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end("nada.");
	}
	
}

var server = http.createServer(function (req, res) {
			dispatcher(req, res);
});

server.listen(3001);