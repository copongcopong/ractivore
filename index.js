var templater = require('./lib/templater');
var view = require('./lib/viewmaker');
var ractive = require('ractive/Ractive');

exports = module.exports = function() {
	var ractivoreTpl = templater(ractive);	
	return new view(ractive, ractivoreTpl);
		
}