module.exports = function(req, res, ractivore, basedir, subsdir, ctrls) {
	
	var pageConfig = {
		layout: basedir + '/template_with_subs.html',
		data: {
			html: {
				title: "Ractivore - Simple",
				footer: "<em>2014</em>",
				controllers: ctrls
			}
		}
	};
	
	var unoConfig = {
		dir: subsdir + '/uno',
		data: {
			content: "Uses addSubs(\"subname\", options) ",
			contentHTML: "<p><em>yeah</em></p>",
			
		}
	};
	
	
	
	var page = ractivore();
	page.addSubs("uno", unoConfig);
	page.create(pageConfig)
		.then(function(){
			//console.log(this, pass);
			page.rhtml.set('html.footer', 'Rendered in ' + page.getElapseTime() +' secs');
			var view = page.rhtml.toHTML();
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(view);
			
		});
}