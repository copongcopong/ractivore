var path = require('path');

var rtpl = function(ractive) {
	
	if(ractive === undefined) {
		ractive = require('ractive/Ractive');
	}
	
	if(ractive === undefined) {
		console.error("Ractive is required for templater.");
	}
	
	this.ractive = ractive;
	this.fs = require('fs');
	this.vcache = {};
	
};

rtpl.prototype.getFile = function(file, cb) {
	var self = this;
	this.fs.readFile(file, 'utf8', function(err, tpl){
		if(err) {
			console.error(err);
			cb(err, null, self);
		}

		cb(null, tpl, self);
	});		

	return self;
}

rtpl.prototype.parse = function(file, cb) {
	var self = this;
	var file = path.resolve(file);
	self.getFile(file, function(err, tpl){
		if(err) {
			console.error(err);
			cb(err, null, self);
		}
		var ctpl = self.ractive.parse(tpl);
		self.vcache[file] = {t: tpl, c: ctpl};
		cb(null, ctpl, self);
	
	});		

	return self;
}

rtpl.prototype.qparse = function(file) {
	var self = this;
	var q = require('kew');
	var d = q.defer();
	var file = path.resolve(file);
	self.getFile(file, function(err, tpl){
		if(err) {
			console.error(err);
			d.reject(err);
		}
		
		var ctpl = self.ractive.parse(tpl);
		
		self.vcache[file] = {t: tpl, c: ctpl};
		d.resolve(self);
	
	});		

	return d;
}
rtpl.prototype.setTpls = function(files) {
	
	return this.init.apply(this, files);
}

rtpl.prototype.init = function() {
	var q = require('kew');
	var d = q.defer();
	
	if(arguments.length > 0) {
		var b = Array.prototype.slice.call(arguments);
		//console.log(typeof arguments, b);
		args = b.slice(0, b.length);
	} else {
		args = undefined;
	}
	
	var self = this;
	
	
	var parseList = [];
	for(i=0; i<args.length; i++){
		parseList.push( self.qparse(args[i]) );
	}
	
	var self = this;
	
	q.all(parseList)
		.then(function(){
			d.resolve(self);
		})
		.fail(function(err){
			console.error(err);
			d.reject(err);
		});
	
	return d;
	
	
}

module.exports = function(ractive, templates) {
	
	var rt = new rtpl(ractive);
	
	if(templates !== undefined) {
		return rt.setTpls(templates);
	}
	
	return rt;
	
};
