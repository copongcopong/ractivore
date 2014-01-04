module.exports = function(req, res, ractivore, basedir, subsdir, ctrls) {
		
	var BaseView = function(config) {
		var deepmerge = require('deep-extend');
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
		
		var newConfig = deepmerge(pageConfig, config);
		
		var page = ractivore();
		
		page.create(newConfig)
			.then(function(){
				page.rhtml.set('html.footer', 'Rendered in ' + page.getElapseTime() +' secs');
				var view = page.rhtml.toHTML();
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(view);
			
			});
	};
	
	
	var unoDataCallback = function(resolve) {
		
			this.setData({
				contentTitle: "Base-layout function approach",
				content: " Using a base-layout view function. ",
				contentHTML: "<p><em>Configuration and setup is merged by the base-layout/base-view function.</em><br /><br /><strong>Uses case</strong>: global layout for pages with changing sub views.</p>",
			});
	
			resolve();
	}
	
	var config = {
		subs: {
			uno: {
				dir: subsdir + '/uno',
				data: unoDataCallback
			}
		}
	};		
	
	
	BaseView(config);

}