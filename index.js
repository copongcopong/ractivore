var templater = require('./lib/templater');
var view = require('./lib/viewmaker');
var ractive = require('ractive/Ractive');
var ractivoreTpl = templater(ractive);	
var rview = new view({}, ractive, ractivoreTpl);

exports = module.exports = function(options) {
	rview.startTimer();
	rview.initOptions(options);
	if(options && options.parserOpts !== undefined) {
		rview.tpls.setParserOptions(options.parserOpts);
	}
	return rview;
}