var stringifyObject = require('stringify-object');

helpers = {};

var dataCleaner = function(data) {
	ndata = {};
	for(k in data) {
		if(k.substr(0, 2) !== '__') {
			ndata[k] = data[k];
		}
	}
	return ndata;
}

helpers.__ractive_callback = function(b) {
	var d = {
		data: dataCleaner(this.data),
		//template: this.template,
		partials: this.partials
	};
	//console.log('@@@', this.data);
	var view = this.get('__view');
	var template = view.template['t'];
	
	if(template.indexOf('<html') < 0) {
			d.template = this.template;
	}
	
	
	if(b === undefined) return stringifyObject(d);
	
	return " var " + b + " = " + stringifyObject(d) + ";"; 
}

helpers.__get_fragment = function(name, boot) {
	var view = this.get('__view');
	
	//console.log("v", name, view.subs);
	
	if(view.subs && view.subs[name]) {
		var html = view.subs[name].fragment;
		var js = view.subs[name].jqhook;
		var boot = '';
		if(view.subs[name].ractivate !== undefined && boot !== undefined) {
			boot = view.subs[name].ractivate;
		}
		
		return [html, '<script>', js, boot, '</script>'].join("\n");
	}
}

helpers.__get_subs = helpers.__get_fragment;

helpers.__get_fragment_only = function(name) {
	var view = this.get('__view');
	
	//console.log("v", name, view.subs);
	
	if(view.subs && view.subs[name]) {
		var html = view.subs[name].fragment;
		return html;
	}
}
helpers.__get_subs_only = helpers.__get_fragment_only;

helpers.__boot_fragmentjs = function(name) {
	var view = this.get('__view');
	
	//console.log("v", name, view.subs);
	
	if(view.subs && view.subs[name]) {
		//var html = view.subs[name].fragment;
		html = '<div id="'+name+'"></div>';
		var js = view.subs[name].jqhook;
		var boot = '';
		if(view.subs[name].ractivate !== undefined && boot !== undefined) {
			boot = view.subs[name].ractivate;
		}
		
		return [html, '<script>', js, boot, '</script>'].join("\n");
	}
}

helpers.__boot_subsjs = helpers.__boot_fragmentjs;

helpers.__get_ractivate_code = function(name) {
	var view = this.get('__view');
	if(view.subs[name].ractivate !== undefined) {
		boot = view.subs[name].ractivate;
		return boot;
		
	}
	return '';		
}

helpers.__get_ractive_options = function(b) {
	
	var view = this.get('__view');
	
	
	console.log("e",  view.ractive_callback_all() );
	return "console.log(1)";
	
	
	if(b === undefined) return stringifyObject(d);
	
	return " var " + b + " = " + stringifyObject(d) + ";"; 
}

module.exports = function(resolve) {
		this.setData({'__view': this});
		this.setData(helpers);
		
		resolve(this);
}