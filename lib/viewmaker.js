var _ = require('lodash');
var deepmerge = _.merge;
var merge = _.merge;

var Promise = require('bluebird');
var idgen = require('idgen');
var Rcache = {};
rv = function(options, ractive, rtpl) {
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
	
	this.initOpt = {
		verbose: false,
		dircache: true,
		tplcache: true,
		cacheRactives: true,
	};
	
	if(options !== undefined) {
		this.initOpt = deepmerge(this.initOpt, options);
	}
	
	if(this.initOpt['dircache'] === false) {
		this.tpls.dcache = {};
	}
	if(this.initOpt['tplcache'] === false) {
		this.tpls.vcache = {};
	}
	
	this.tpls.rcache = {};
	 
	this.ractive = ractive;
	this.partials = {};
	this.cpartials = {};
	this.dircache = {};
	this.data = {};
	this.preOpt = {};
	this.viewmaker = '0.2';
	this.__stime = new Date().getTime();
	return this;
	
};

rv.prototype.initOptions = function(options) {
	this.initOpt = deepmerge(this.initOpt, options);
	if(this.initOpt.cacheRactives === false) {
		Rcache = {};
	}
	
}
rv.prototype.startTimer = function() {
	this.__stime = new Date().getTime();
}

rv.prototype.olog = function() {
	if(this.initOpt['verbose'] !== true) return;
	
	var b = Array.prototype.slice.call(arguments);
	var bb = b.length; 
	for(i=0; i < bb; i++) {
		console.log(b[i]);
	}
	
}
rv.prototype.callAsync = function() {
	var defer = Promise.defer();
	
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
	
	Promise.all(promises)
		.then(function(){
			//console.log('YYYY', self);
			//process.nextTick(function(){
				defer.resolve(self);
				//});
			
		})
		.catch(function(err){
			defer.reject(err);
		});
		
		return defer;
}

rv.prototype.addTemplate = function(file) {
	var self = this;
	var defer = Promise.defer();
	
	this.olog("addTemplate :: adding template " + file);
	if(this.tpls.vcache[file] !== undefined) {
		this.olog("tpls cache hit for " + file);
		var tpl = self.tpls.vcache[file];
		self.template = tpl;
		self.ctemplate = tpl['c'];
		defer.resolve(self);
	} else {
		this.tpls.setTpls([file])
			.then(function(tpls){
				var tpl = tpls.vcache[file];
				self.template = tpl;
				self.ctemplate = tpl['c'];
				defer.resolve(self);
			})
			.catch(function(err){
				defer.reject(err)
			});
	}
	
	return defer.promise;
}
rv.prototype.addPartials = function(kvObj) {
	var self = this;
	var files = [];
	for(k in kvObj) {
		if(self.tpls.vcache[ kvObj[k] ] === undefined) {
			files.push(kvObj[k]);
		} else {
			var part = self.tpls.vcache[ kvObj[k] ];
			self.partials[kk] = part;
			self.cpartials[kk] = part['c'];
			this.olog("cache hit for partial " + kvObj[k]);
		}
	}

	var defer = Promise.defer();
	
	if(files.length < 1) {
		defer.resolve(self);
		return defer.promise;
	}

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
			
			defer.resolve(self);
			
			
		})
		.catch(function(err){
			defer.reject(err)
		})
		
		return defer.promise;
}

rv.prototype.setData = function(data) {
	
	var self = this;
	var defer = Promise.defer();
	var next = function() {
		return defer.resolve(self);
	}
	
	if(typeof data === 'function') {
	
		data.call(self, next, defer);
	} else {
		var odata = this.data;
		self.data = merge(odata, data);
	
		defer.resolve(self);
	
	}
	
	return defer.promise;
}

rv.prototype.addToStack = function(func) {
	
	var self = this;
	var defer = Promise.defer();
	
	var next = function() {
		return defer.resolve(self);
	}
	
	func.call(self, next, defer);
	
	return defer.promise;

}


rv.prototype.setEvents = function(events) {
	
	
	var self = this;
	var defer = Promise.defer();
	var next = function() {
		return defer.resolve(self);
	}
	
	if(typeof events === 'function') {
		events.call(self, next, defer);
	} else {
		var oevent = this.events;
		self.events = merge(oevent, events);
	
		defer.resolve(self);
	
	}
	
	return defer.promise;
}

rv.prototype._prepareStack = function(options) {
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
	
	return promises;
}


rv.prototype.create = function(opts) {
	
	if(opts === undefined || opts === null) opts = {};
	
	var options = deepmerge(this.preOpt, opts);
	if(options.guid === undefined) {
		//options.guid = new Date().getTime(); //update me with uuid
		options.guid = this.uid(); //options.dir || options.template;
	}
	//console.log("@@", options);
	var promises = [];
	var self = this;
	var d = Promise.defer();
	

	
	 var ractivate = function(d, options) {
		 //console.log(Rcache[options.guid]);
		 var done = function() {
			 self.olog('DONE', via);
		 }
		 var via;
		
		if(self.data['_guid'] === undefined) {
			self.data['_guid'] = options.guid;
		}
		var cacheId = self.data['_guid'];
		if(Rcache[cacheId] !== undefined) {
			//self.ractives[options.guid] = null;
			via = "Redo";
			self.olog(via + ' Ractive', options);
			Rcache[cacheId].set(self.data, done);
			//Rcache[options.guid].update();
			//for(k in self.data) {
			//	Rcache[options.guid].set(k, self.data[k]);
			//}
			
			self.rhtml = Rcache[cacheId];
			self.olog("rcache update", options.guid);
		} else {
			via = "New";
			self.olog(via + ' Ractive', options);
			
			Rcache[cacheId] = new self.ractive({
				guid: options.guid,
				partials: self.cpartials,
				template: self.ctemplate,
				data: self.data,
				preserveWhitespace: true,
				sanitize: false,
				complete: done
			});
			self.rhtml = Rcache[cacheId];
		}
		
		
		//ractive.__view = self;
		//console.log("guid", options.guid, options);
		
		//process.nextTick(function(){
			
			if(options.afterCreate !== undefined && typeof options.afterCreate === 'function') {
				var qq = Promise;
				var dda = qq.defer();
			
				var next = function() {
					return dda.resolve(self);
				}
			
				options.afterCreate.call(self, next);
			
				dda.then(function(){
					d.resolve(self);
				})
				.catch(function(e){
					var err = "afterCreate fail!";
					console.error(err, e);
					d.reject(err);
				});
			
			} else {
				d.resolve(self);
				
			}
			
			//});
		
		
		
		return d.promise;
	}
	
	var ractivateWithBefore = function(d, options) {
		
		var dd = Promise.defer();
		
		var next = function() {
			return dd.resolve(self);
		}
		//console.log("!", dd);
		
		options.beforeCreate.call(self, next);
		
		dd.promise.then(function(){
			self.olog("beforeCreate done.");
			ractivate(d, options);
		}).catch(function(er){
			var err = "beforeCreate fail!";
			console.error(er, JSON.stringify(options));
			d.reject(err);
		});
		
		return d;
	}
	
	var runStack = function(promises) {
		 Promise.all(promises)
			.then(function(){
				if(self.ctemplate === undefined) {
					console.error("template file not found!");
					d.reject("template file not found!");
				}
			
				//console.log("VVV", options.beforeCreate);
				if(options.beforeCreate !== undefined && typeof options.beforeCreate === 'function') {
					self.olog("runStack>ractivateWithBefore");
					return ractivateWithBefore(d, options);
				
				} else {
					return ractivate(d, options);
				}
			
			
				
			})
			.catch(function(err){
				self.olog("runStack fail!", err);
				d.reject(err);
			});
			
			return d.promise;
	}
		
	
	
	if(options.dir !== undefined) {
		this.loadDir(options.dir, function(newOpts){
			var newpromises = self._prepareStack(newOpts);
			promises = promises.concat(newpromises);
			delete options.dir;
			var stack = self._prepareStack(options);
			promises = promises.concat(stack);
			runStack(promises);
		});
	} else {
		var stack = self._prepareStack(options);
		promises = promises.concat(stack);
		runStack(promises);
	}
	
	return d.promise;
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
	
	if(this.rhtml === null) return false;
	
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
	//console.log("&&&", this);
	var roptions = {
		jqid: this.__id || this.rhtml.data['_guid'],
		guid: this.rhtml.data['_guid'],
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
	
	var d = Promise.defer();
	//console.log("ADD SUBS", name, view);
	
	var callback = function(view, d) {
		
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
			view.rhtml = null;
		}
		
		var cb = function(self, d) {
			self.subs[name] = sub;
	
			if(self.rhtml !== undefined) {
				self.rhtml.set('__view', self);
			}
			//console.log("!name", name, self);
			//console.log(sub);
			d.resolve(self);
		}
		
		cb(self, d);
		
		
	}
	
	if(view.viewmaker === undefined) {
		
		
		var v = new rv(self.initOpt, self.ractive, self.tpls);
		
		if(view.dir !== undefined) {
			var createOpts = {isSub: true};
			
			for(k in view) {
				if(k !== 'dir') {
					createOpts[k] = view[k];
				}	
			}
			
			v.loadDir(view.dir)
				.then(function(){
					//console.log("dir", view.dir, createOpts, v.preOpt);
					
					v.create(createOpts).then(function(){
						//console.log('!!!', v);
						callback(v, d);
					});
				});
			
				
	
		} else {
			var viewPromise = v.create(view);
			viewPromise.then(function(){
				callback(v, d);
			});
	
		}
		
		
		
	} else {
		callback(view, d);
	}
	
	return d.promise;
	
}

rv.prototype.loadDir = function(dir, callback) {
	
	var fs = require('fs');
	var path = require('path');
	var d = Promise.defer();
	d.__loadDir = true;
	
	var scan = function(dir) {
	    var stats;
			var fmap = {};
			var parts;
			var folder = path.resolve(dir);
			//console.log('folder!', path.resolve(dir));
	    stats = fs.statSync(dir);
	    if (stats.isDirectory())  {
				
	        fs.readdirSync(dir).forEach(function (child) {
						//console.log(child);
						
						if(child === 'template.html') {
							fmap['template'] = folder + path.sep + child;
						}
						
						if(child === 'layout.html') {
							fmap['template'] = folder + path.sep + child;
						}
						
						if(child.indexOf('.part.') > 0) {
							if(typeof parts === 'undefined') {
								parts = {};
							}
							var p = child.split('.part');
							//console.log('PP', p, folder + path.sep + child, typeof parts);
							parts[ p[0] ] = folder + path.sep + child;
						}
						
						if(child === 'data.json') {
							fmap['_data'] = require(folder + path.sep + child);
						}
						
						if(child === 'events.js') {
							fmap['events'] = require(folder + path.sep + child);
						}
						
	        });
					
				var _stats = {
					'_dirstats': {
						created: stats.ctime,
						modified: stats.mtime
					}	
				};
				
				if(fmap['_data'] === undefined) {
					fmap['_data'] = _stats;
				} else {
					fmap['_data'] = merge(fmap['_data'], _stats);
				}
				
					if(parts !== undefined) {
						fmap.partials = parts;
					}
					//console.log('!!', fmap, dir);
					return fmap;
	    } 
	}

	var fmap;
	if(this.tpls.dcache[dir] === undefined) {
		fmap = scan(dir);
		this.tpls.dcache[dir] = fmap;
	} else {
		this.olog("dir cache hit " + dir);
		fmap = this.tpls.dcache[dir];
	}	
	
	if(callback !== undefined) {
		return callback(fmap);
	} else {
		this.preOpt = fmap;
	
		d.resolve(this);
	
		return d.promise;
	}
	
	
}

rv.prototype.getElapseTime = function(){
	var endtime = new Date().getTime();
	var to = (endtime - this.__stime)/1000;
	this.olog("elapse time:" + to + ' secs');
	return to;
}

rv.prototype._cleanup = function() {
	for(sub in this.subs) {
		//this.subs[sub].rhtml.data = null;
		if(this.subs[sub].rhtml) {
			this.subs[sub].rhtml.teardown(true);
			if(this.subs[sub].rhtml._depsMap) this.subs[sub].rhtml._depsMap = null;
			if(this.subs[sub].rhtml._deps) this.subs[sub].rhtml._deps = null;
			if(this.subs[sub].rhtml._cache) this.subs[sub].rhtml._cache = null;
			if(this.subs[sub].rhtml._cacheMap) this.subs[sub].rhtml._cacheMap = null;
			//this.subs[sub].rhtml = null;
		
		}
		this.subs[sub].view = null;
	}

	if(this.rhtml) {
		this.rhtml.teardown(true);
		if(this.rhtml._depsMap) this.rhtml._depsMap = null;
		if(this.rhtml._deps) this.rhtml._deps = null;
		if(this.rhtml._cache) this.rhtml._cache = null;
		if(this.rhtml._cacheMap) this.rhtml._cacheMap = null;
		
		//if(this.rhtml.data) this.rhtml.data = null;
		//this.rhtml = null;
	}
		
}

rv.prototype.cleanup = function() {
	this.olog("Cleanup.");
	var self = this;
	process.nextTick(function(){
		//self._cleanup();
	});
}

rv.prototype.uid = function () {
	return 'r' + idgen.hex(6);
};

rv.prototype.getRactiveCache = function() {
	return Rcache || {};
}
module.exports = rv;