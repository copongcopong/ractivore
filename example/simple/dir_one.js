module.exports = function(req, res, ractivore, basedir, subsdir, ctrls) {
	
	var pageConfig = {
		layout: basedir + '/template_with_subs.html',
		data: {
			html: {
				title: "Ractivore - " + req.url,
				footer: "<em>2014</em>",
				controllers: ctrls
			}
		}
	};
	
	var unoConfig = {
		dir: subsdir + '/dir_one',
	};
	
	pageConfig.subs = {
		uno: unoConfig
	}
	
	var page = ractivore();
	page
		.create(pageConfig)
		.then(function(){
			var view = page.rhtml.toHTML();
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(view);
			
		});
}