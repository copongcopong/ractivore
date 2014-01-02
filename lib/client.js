function View(map, renderSubs) {
	
	var view = function(map){
		if(Ractive === undefined) throw new Error("Ractive.js required!");
		if(jQuery === undefined) throw new Error("jQuery.js required!");
		
		this.$ = jQuery;
		this.ractive = Ractive;
		this.rmap = map;
		this.subs = {};
	}
	
	view.prototype.makeSubRactive = function(id, opts) {
		var copts = this.$.extend(true, {}, opts);
		$('#' + id).data('ractivity', copts);
		
		opts.el = $('#' + id);
		opts.complete = function() {
		
			if(opts._events !== undefined) {
				opts.__ev = {};
				for(ev in opts._events) {
					//console.log(opts._events[ev]);
					var func = opts._events[ev];
					eval("opts.__ev['" + ev + "'] = " + func + ";");
					this.on(ev, opts.__ev[ev]);
				}
			}
		
		};
		
		var ractive = new this.ractive(opts);
		$('#' + id).data('ractive', ractive); 
		this.subs[id] = ractive;
		
	}
	
	view.prototype.createSubs = function() {
		var subs = this.rmap.children;
		for(sub in subs) {
			this.makeSubRactive(sub, subs[sub]);
		}
	}
	
	var rv = new view(map);
	
	if(renderSubs !== undefined && renderSubs === false) return rv;
	
	rv.createSubs();
	
	return rv;
	
	
}