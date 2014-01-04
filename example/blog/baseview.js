var ractivore = require('../../index.js');
var viewdir = __dirname + '/tpl';
var basedir = viewdir + '/base';
var subsdir = viewdir + '/posts';
var deepmerge = require('deep-extend');
var fs = require('fs');

var pages = [];
fs.readdirSync(subsdir).forEach(function(child){
	//var stats = fs.statSync(child);
	//if(stats.isDirectory()) {
		if(child !== 'home') {
			pages.push(child);
		}
	//}
});

var BaseView = function(options, req, res) {
		
	var baseConfig = {
		dir: basedir,
		data: function(resolve) {
			var nbase = {pages: pages, urlpath: req.url};
			var base = merge(this.data.base, nbase);
			this.setData({base: base});
			resolve();
		},
		beforeCreate: function(resolve) {
			//any subs/data.json>base will be merge with the base/data.json>base
			//a way for sub content push data to the baselayout
			baseData = this.data.base;
			if(this.subs['content'].view.preOpt !== undefined) {
				var data = this.subs['content'].view.preOpt._data;
				if(data.base !== undefined) {
					this.data.base = deepmerge(data.base, baseData);
				}
			}
		
			resolve();
		}
		//layout: basedir + '/template.html',
		//data: basedir + '/data.json',
		//partials: {
		//	footer: basedir + '/footer.part.html'
		//}
	};
	
	config = deepmerge(baseConfig, options);
	
	page = ractivore();
	
	page.create(config).then(function(){
		
		page.rhtml.set('html.footer', 'Rendered in ' + page.getElapseTime() +' secs');
		var view = page.rhtml.toHTML();
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(view);
		
	});	
}

module.exports = function(req, res, dir) {
	
	var options = {
		subs: {
			content: {
				dir: subsdir + '/' + dir
			}
		}
	}
	//console.log(options);	
	BaseView(options, req, res);
	
}