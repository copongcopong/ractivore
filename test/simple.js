var test = require('tape');
var ractivore = require('../index.js');

test('simple boot dir no template', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/no-template'}
		view.create(config).then(function(){
			//test to fail
			
		}).fail(function(err){
			t.equal('template file not found!', err, "missing template fail message should be received.");
			t.end();
		});
    
});

test('simple boot dir', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/one'}
		view.create(config).then(function(){
			var html = view.rhtml.toHTML();
			
			t.ok((html.indexOf('<h1>one</h1>') > -1), "header found");
			t.ok((html.indexOf('<p>content</p>') > -1), "content found");
			t.end();
		});
    
});

test('simple boot dir with partial', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/one-with-partial'}
		view.create(config).then(function(){
			t.ok(view.partials.footer, "footer in views.partials");
			
			var html = view.rhtml.toHTML();
				
			t.ok((html.indexOf('<footer>end</footer>') > -1), "footer partial rendered");
			
			t.end();
		});
    
});

test('subview rendering', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/with-subs/base'};
		
		config.subs = {
			subview: {
				dir: __dirname + '/views/with-subs/sub'
			}
		}
		
		view.create(config).then(function(){
			t.ok(view.subs.subview, "subview in views.subs");
			t.ok(view.subs.subview.isSub, "views.subs.isSub is true");
			
			//console.log(view.subs.subview);
			var html = view.rhtml.toHTML();
				
			t.ok((html.indexOf('<em>subcontent</em>') > -1), "subview html rendered");
			
			t.end();
		});
    
});