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
	
	var unoConfig = {
		dir: subsdir + '/uno',
		data: {
			content: "content",
			contentHTML: "<p><em>yeah</em></p>",
			
		}
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