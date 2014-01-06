var templater = require('./lib/templater');
var view = require('./lib/viewmaker');
var ractive = require('ractive/Ractive');
var ractivoreTpl = templater(ractive);	

exports = module.exports = function(options) {
	
	return new view(options, ractive, ractivoreTpl);
}