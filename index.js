var templater = require('./lib/templater');
var view = require('./lib/viewmaker');
var ractive = require('ractive/Ractive');
var ractivoreTpl = templater(ractive);	
var rview = new view({}, ractive, ractivoreTpl);

exports = module.exports = function(options) {
	rview.startTimer();
	rview.initOptions(options);
	return rview;
}