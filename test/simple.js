var test = require('tape');
var ractivore = require('../index.js');

test('simple boot dir no template', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/no-template'}
		view.create(config).then(function(){
			//test to fail
			
		}).fail(function(err){
			t.pass("simulate failure.");
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


test('using config to setup template and data', function (t) {
		
		var view = ractivore();
		var config = {
			template: __dirname + '/views/one/template.html',
			data: {
				"header": "header",
				"content": "content"
			}
		};
		
		view.create(config).then(function(){
			var html = view.rhtml.toHTML();
			
			t.ok((html.indexOf('<h1>header</h1>') > -1), "header found");
			t.ok((html.indexOf('<p>content</p>') > -1), "content found");
			t.end();
		});
    
});

test('using config - data via callback using ractivore.setData() ', function (t) {
		
		var view = ractivore();
		var config = {
			template: __dirname + '/views/one/template.html',
			data: function(resolve) {
				this.setData({
					"header": "header",
					"content": "content"
				});
				resolve();
			}
		};
		
		view.create(config).then(function(){
			var html = view.rhtml.toHTML();
			
			t.ok((html.indexOf('<h1>header</h1>') > -1), "header found");
			t.ok((html.indexOf('<p>content</p>') > -1), "content found");
			t.end();
		});
    
});


test('using config - data added via callback using ractivore.callstack() ', function (t) {
		
		var view = ractivore();
		var config = {
			template: __dirname + '/views/one/template.html',
			data: {
				"header": "header",
			},
			callstack: function(resolve) {
				this.setData({
					"content": "content"
				});
				resolve();
			}
		};
		
		view.create(config).then(function(){
			var html = view.rhtml.toHTML();
			
			t.ok((html.indexOf('<h1>header</h1>') > -1), "header found");
			t.ok((html.indexOf('<p>content</p>') > -1), "content found");
			t.end();
		});
    
});

test('using config - data added via callback using ractivore.beforeCreate() ', function (t) {
		
		var view = ractivore();
		var config = {
			template: __dirname + '/views/one/template.html',
			data: {
				"header": "header",
			},
			beforeCreate: function(resolve) {
				this.setData({
					"content": "content"
				});
				resolve();
			}
		};
		
		view.create(config).then(function(){
			var html = view.rhtml.toHTML();
			
			t.ok((html.indexOf('<h1>header</h1>') > -1), "header found");
			t.ok((html.indexOf('<p>content</p>') > -1), "content found");
			t.end();
		});
    
});

test('using addTemplate and setData to setup', function (t) {
		
		var view = ractivore();
		var data = {
			"header": "header",
			"content": "content"
		};
		
		//not good approach though. async library to the rescue!
		view.addTemplate(__dirname + '/views/one/template.html')
			.then(function(){
				view.setData(data).then(function(){
					view.create().then(function(){
						var html = view.rhtml.toHTML();
			
						t.ok((html.indexOf('<h1>header</h1>') > -1), "header found");
						t.ok((html.indexOf('<p>content</p>') > -1), "content found");
						t.end();
					});
				});
		
			});
		
    
});

test('simple boot dir with partial file "footer.part.html"', function (t) {
		
		var view = ractivore();
		var config = {dir: __dirname + '/views/one-with-partial'}
		view.create(config).then(function(){
			t.ok(view.partials.footer, "footer in views.partials");
			
			var html = view.rhtml.toHTML();
				
			t.ok((html.indexOf('<footer>end</footer>') > -1), "footer partial rendered");
			
			t.end();
		});
    
});

test('load partials at config', function (t) {
		var dt = require(__dirname + '/views/one-with-partial/data.json');
		console.log(dt);
		var view = ractivore();
		var config = {
			template: __dirname + '/views/one-with-partial/template.html',
			data: dt,
			partials: {
				footer:  __dirname + '/views/one-with-partial/footer.part.html'
			}
			
		};
		
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