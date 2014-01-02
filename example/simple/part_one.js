module.exports = function(req, res, ractivore, basedir, subsdir, ctrls) {
	
	var pageConfig = {
		layout: basedir + '/template.html',
		data: {
			html: {
				title: "Ractivore - Simple",
				footer: "<em>2014</em>",
				controllers: ctrls
			},
			one: {
				content: "Yeah One!",
				contentHTML: "<strong>One - this is bold.</strong>"
			}
		},
		partials: {
			partUno: basedir + '/partUno.html'
		}
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