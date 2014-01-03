module.exports = function(req, res, ractivore, basedir, subsdir, ctrls) {
	
	var pageConfig = {
		layout: basedir + '/template_with_subs.html',
		data: {
			html: {
				title: "Ractivore - Simple",
				footer: "<em>2014</em>",
				controllers: ctrls,
				urlpath: req.url
			}
		}
	};
	
	var unoDataCallback = function(resolve) {
		var self = this;
		setTimeout(function(){
			
			self.setData({
				content: " Data loaded to simulate late data access. ",
				contentHTML: "<p><em>Wait from DB or API</em></p>",
			});
			
			resolve();
			
		}, 200);
	}
	
	var unoConfig = {
		dir: subsdir + '/uno',
		data: unoDataCallback
	};
	
	pageConfig.subs = {
		uno: unoConfig
	}
	
	var page = ractivore();
	page.create(pageConfig)
		.then(function(){
			//console.log(this, pass);
			page.rhtml.set('html.footer', 'Rendered in ' + page.getElapseTime() +' secs');
			var view = page.rhtml.toHTML();
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(view);
			
		});
}