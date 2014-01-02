rv = function(ractive, rtpl) {
	if(ractive === undefined) {
		var ractive = require('ractive/Ractive');
	}
	
	if(ractive === undefined) {
		console.error("Ractive is required!");
	}
	
	if(rtpl === undefined) {
		rtpl = require('./templater');
		this.tpls = rtpl(ractive);
	} else {
		this.tpls = rtpl;
	}

	this.ractive = ractive;
	this._q = q = require('kew');
	this._d = q.defer();
	this.partials = {};
	this.cpartials = {};
	this.data = {};
	this.preOpt = {};
	this.viewmaker = '0.1';
	this.__stime = new Date().getTime();
	return this;
	
};

rv.prototype.callAsync = function() {
	var q = require('kew');
	var d = q.defer();
	
	if(arguments.length > 0) {
		var b = Array.prototype.slice.call(arguments);
		//console.log(typeof arguments, b);
		args = b.slice(0, b.length);
	} else {
		args = undefined;
	}
	var promises = [];
	for(i=0; i<args.length; i++) {
		promises.push(args[i]);
	}
	
	var self = this;
	
	q.all(promises)
		.then(function(){
			//console.log('YYYY', self);
			//process.nextTick(function(){
				d.resolve(self);
				//});
			
		})
		.fail(function(err){
			d.reject(err);
		});
		
		return d;
}

rv.prototype.addTemplate = function(file) {
	var self = this, _d = this._q.defer();
	this.tpls.setTpls([file])
		.then(function(tpls){
			var tpl = tpls.vcache[file];
			self.template = tpl;
			self.ctemplate = tpl['c'];
			_d.resolve(self);
		})
		.fail(function(err){
			_d.reject(err)
		});
		
		return _d;
}
rv.prototype.addPartials = function(kvObj) {
	var self = this;
	var files = [];
	for(k in kvObj) {
		files.push(kvObj[k]);
	}
	
	var _d = this._q.defer();
	this.tpls.setTpls(files)
		.then(function(tpls){
			
			for(kk in kvObj) {
				//console.log("@@@", kvObj[kk]);
				if(tpls.vcache[ kvObj[kk] ] !== undefined) {
						var part = tpls.vcache[ kvObj[kk] ];
						self.partials[kk] = part;
						self.cpartials[kk] = part['c'];
					
				}
			
			}
			
			_d.resolve(self);
			
			
		})
		.fail(function(err){
			_d.reject(err)
		})
		
		return _d;
}

rv.prototype.setData = function(data) {
	
	merge = require('merge');
	
	var self = this;
	var d = this._q.defer();
	var next = function() {
		return d.resolve(self);
	}
	
	if(typeof data === 'function') {
	
		data.call(self, next);
	} else {
		var odata = this.data;
		self.data = merge(odata, data);
	
		d.resolve(self);
	
	}
	
	return d;
}

rv.prototype.addToStack = function(func) {
	
	var self = this;
	var d = this._q.defer();
	
	var next = function() {
		return d.resolve(self);
	}
	
	func.call(self, next);
	
	return d;

}


rv.prototype.setEvents = function(events) {
	
	merge = require('merge');
	
	var self = this;
	var d = this._q.defer();
	var next = function() {
		return d.resolve(self);
	}
	
	if(typeof events === 'function') {
		events.call(self, next);
	} else {
		var oevent = this.events;
		self.events = merge(oevent, events);
	
		d.resolve(self);
	
	}
	
	return d;
}

rv.prototype.create = function(opts) {
	
	merge = require('deep-extend');
	
	if(opts === undefined || opts === null) opts = {};
	
	var options = merge(this.preOpt, opts);
	
	//console.log("@@", options);
	
	var promises = [];
	
	if(options._data !== undefined) {
		promises.push(this.setData(options._data));
	}
	
	if(options.template !== undefined) {
		promises.push(this.addTemplate(options.template));
	}

	if(options.layout !== undefined) {
		promises.push(this.addTemplate(options.layout));
	}

	if(options.partials !== undefined) {
		promises.push(this.addPartials(options.partials));
	}

	if(options.data !== undefined) {
		promises.push(this.setData(options.data));
	}

	if(options.callstack !== undefined) {
		
		if(typeof options.callstack === 'function') {
			 callstack = [options.callstack];
		} else {
			callstack = options.callstack;
		}
		
		for(i=0; i<callstack.length; i++) {
				promises.push(this.addToStack(callstack[i]));
		}
		
	}


	if(options.events !== undefined) {
		promises.push(this.setEvents(options.events));
	}

	if(options.subs !== undefined) {
		for(key in options.subs) {
			promises.push(this.addSubs(key, options.subs[key]));
		}
		
	}

	//auto add default helper
	promises.push(this.setData(require(__dirname + '/tplhelper')));
	
	if(options.helpers !== undefined) {
		promises.push(this.setData(options.helpers));
	}

	var _q = require('kew');
	var d = _q.defer();
	var self = this;	
	
	function ractivate(d, options) {
		var ractive = new self.ractive({
			partials: self.cpartials,
			template: self.ctemplate,
			data: self.data,
			preserveWhitespace: true,
			sanitize: false
		});
	
		ractive.__view = self;
	
		self.rhtml = ractive;
		
		if(options.afterCreate !== undefined && typeof options.afterCreate === 'function') {
			var qq = require('kew');
			var dda = qq.defer();
			
			var next = function() {
				return dda.resolve(self);
			}
			
			options.afterCreate.call(self, next);
			
			dda.then(function(){
				d.resolve(self);
			})
			.fail(function(){
				console.error("afterCreate fail!");
			});
			
		} else {
			d.resolve(self);
		}
		
		
		return d;
	}
	
	function ractivateWithBefore(d, options) {
		var next = function() {
			return dd.resolve(self);
		}
		
		var qq = require('kew');
		var dd = qq.defer();
		
		options.beforeCreate.call(self, next);
		dd.then(function(){
			console.log("beforeCreate done.");
			ractivate(d, options);
		}).fail(function(){
			console.error("beforeCreate fail!");
		});
		
		return d;
	}
	
	q.all(promises)
		.then(function(){
			if(self.ctemplate === undefined) {
				console.error("template file not found!");
			}
			
			//console.log("VVV", options.beforeCreate);
			if(options.beforeCreate !== undefined && typeof options.beforeCreate === 'function') {
				
				return ractivateWithBefore(d, options);
				
			} else {
				return ractivate(d, options);
			}
			
			
				
		})
		.fail(function(err){
			d.reject(err);
		});
		
		return d;
}

rv.prototype.runHelper = function(helper) {
	if(this.rhtml === undefined) {
		console.error("Ractive not yet build!");
		return false;
	}
	if(this.rhtml.data[helper] === undefined) {
		console.error("Helper " + helper + " not found!");
		return false;
	}
	if(arguments.length > 1) {
		var b = Array.prototype.slice.call(arguments);
		//console.log(typeof arguments, b);
		args = b.slice(1, b.length);
	} else {
		args = undefined;
	}
	
	return this.rhtml.data[helper].apply(this.rhtml, args);
}

rv.prototype.asFragment = function(id) {
	
	var html = this.rhtml.toHTML();
	
	if(id === undefined) {
		var id = '__ractivity_' + new Date().getTime();
	}	

	this.__id = id;
	return '<div id="'+id+'">' + html + '</div>';
}

rv.prototype.ractive_callback_all = function(stringify) {
	var data = {};
	data.parent = this.ractive_callback();
	if(this.subs != {}) {
		data.children = {};
		for(sub in this.subs) {
			data.children[sub] = this.subs[sub].view.ractive_callback();
		}
	}
	
	if(stringify !== undefined) return JSON.stringify(data);
	
	return data;
}

rv.prototype.ractive_callback = function() {
	var dataCleaner = function(data) {
		ndata = {};
		for(k in data) {
			if(k.substr(0, 2) !== '__') {
				ndata[k] = data[k];
			}
		}
		return ndata;
	}
	
	var parseEvents = function(events) {
		var evs = {};
		for(k in events) {
			evs[k] = events[k].toString();
		}
		return evs;
	}
	
	var roptions = {
		jqid: this.__id,
		data: dataCleaner(this.rhtml.data),
		//template: this.template,
		partials: this.rhtml.partials,
		_events: parseEvents(this.events)
	};
	//console.log('@@@', this.data);
	var template = this.template['t'];
	
	if(template.indexOf('<html') < 0) {
			roptions.template = this.rhtml.template;
	}
	
	return roptions;
}

rv.prototype.jqHook = function() {
	if(this.__id === undefined) return;
	
	//var data = this.runHelper('__ractive_callback');
	var data = this.ractive_callback();
	data = JSON.stringify(data);
	return "$('#"+this.__id+"').data('ractivity', "+data+");";
}

rv.prototype.addSubs = function(name, view) {
	var self = this;
	if(self.subs === undefined) self.subs = {};
	
	var d = self._q.defer();
	
	
	var callback = function(view) {
		
		var fragment = view.asFragment(name);
	
		var sub = {
			view: view,
			id: view.__id,
			fragment: fragment,
			jqhook: view.jqHook(),
			isSub: true
		};
		
		if(view.rhtml !== undefined) {
			sub.rhtml = view.rhtml;
		}
		
		var cb = function() {
			self.subs[name] = sub;
	
			if(self.rhtml !== undefined) {
				self.rhtml.set('__view', self);
			}
			
			//console.log(sub);
			d.resolve(self);
		}
		
		cb();
		
		
	}
	
	if(view.viewmaker === undefined) {
		
		
		var v = new rv(self.ractive);
		
		if(view.dir !== undefined) {
			var createOpts = {};
			
			for(k in view) {
				if(k !== 'dir') {
					createOpts[k] = view[k];
				}	
			}
			
			v.loadDir(view.dir)
				.then(function(){
					//console.log("dir", view.dir, createOpts, v.preOpt);
					
					v.create(createOpts).then(function(){
						callback(v);
					});
				});
			
	
		} else {
			var viewPromise = v.create(view);
			viewPromise.then(function(){
				callback(v);
			});
	
		}
		
		
		
	} else {
		callback(view);
	}
	
	return d;
	
}

rv.prototype.loadDir = function(dir) {
	
	var fs = require('fs');
	var path = require('path');
	var d = this._q.defer();
	d.__loadDir = true;
	
	function scan(dir) {
	    var stats;
			var fmap = {};
			var parts;
			var folder = path.resolve(dir);
			//console.log(path.resolve(dir));
	    stats = fs.statSync(dir);
	    if (stats.isDirectory())  {
	        fs.readdirSync(dir).forEach(function (child) {
						//console.log(child);
						
						if(child === 'template.html') {
							fmap['template'] = folder + path.sep + child;
						}
						
						if(child.indexOf('.part.') > 0) {
							var p = child.split('.part');
							parts[ p[0] ] = folder + path.sep + child;
						}
						
						if(child === 'data.json') {
							fmap['_data'] = require(folder + path.sep + child);
						}
						
						if(child === 'events.js') {
							fmap['events'] = require(folder + path.sep + child);
						}
						
	        });
					
					if(parts !== undefined) {
						fmap.partials = parts;
					}
					//console.log('!!', fmap);
					return fmap;
	    } 
	}
		
	var fmap = scan(dir);
	//console.log('!!!', fmap);
	this.preOpt = fmap;
	
	d.resolve(this);
	
	return d;
}

rv.prototype.getElapseTime = function(){
	var endtime = new Date().getTime();
	return (endtime - this.__stime)/1000;
}

module.exports = rv;