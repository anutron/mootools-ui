/*
---
name: ART.Widget
description: ART Widget Class
requires: [UI.Widget, Core/Class, Core/Element, Core/Element.Events, ART/ART.Base]
provides: ART.Widget
...
*/

(function(){
	
var Widget = ART.Widget = new Class({
	Extends: UI.Widget,
	options: {
		/*
			element: null,
		*/
		tabIndex: -1,
		renderWhileHidden: false
	}
});
	
var widgets = ART.widgets = [];

Widget.implement({
	
	initialize: function(options){
		this.element = this.options.element || new Element('div');
		
		this.element.setStyles({
			position: 'relative', 
			outline: 'none'
		}).store(this.prefix, this).store('widget', this);
		
		this.canvas = new ART;
		$(this.canvas).setStyles({position: 'absolute', top: 0, left: 0}).inject(this.element);
		
		this.currentSheet = {};
		
		var self = this;
		
		this.element.addEvents({

			focus: function(){
				if (!self.getState('focus')) self.focus();
			},

			blur: function(){
				if (self.getState('focus')) self.blur();
			}
			
		});
		
		//integration point for keyboard setup; has to be done before the options are called
		//because the options may contain a keyboard instance, and we'll get a recurrsion error
		if (this._keyboardSetup) this._keyboardSetup(options);
		
		this.parent(options);
		this.setTabIndex(this.options.tabIndex);
		
		widgets.push(this);
		
		this.deferDraw();
	},
	
	/* tab indices */
	
	setTabIndex: function(index){
		this.element.tabIndex = this.tabIndex = index;
	},
	
	getTabIndex: function(){
		return this.tabIndex;
	},
	
	/* ARTSY Stuff */
	
	resize: function(width, height){
		this.element.setStyles({width: width, height: height});
		this.canvas.resize(width, height);
		return this;
	},
	
	draw: function(newSheet){
		var sheet = $merge(this.diffSheet(), newSheet || {});
		for (var property in sheet) this.currentSheet[property] = sheet[property];
		return sheet;
	},
	
	deferDraw: function(){
		if (this._states.destroyed || (!this.options.renderWhileHidden && this.getState('hidden'))) return;
		var self = this;
		clearTimeout(this.drawTimer);
		this.drawTimer = setTimeout(function(){
			// console.log('»', self.id, ':', 'The method', name, 'succeded in getting a redraw.');
			self.draw();
		}, 1);
	},
	
	/* ID */
	
	setID: function(id){
		this.parent(id);
		this.element.set('id', id);
		this.deferDraw();
		return this;
	},
	
	/* classNames */
	
	addClass: function(className){
		this.parent(className);
		this.element.addClass(className);
		this.deferDraw();
		return this;
	},
	
	removeClass: function(className){
		this.parent(className);
		this.element.removeClass(className);
		this.deferDraw();
		return this;
	},
	
	/* states */
	
	_states: {
		hidden: false
	},
	
	enable: function(){
		if (!this.parent()) return false;
		this.setTabIndex(this.oldTabIndex);
		this.deferDraw();
		return true;
	},
	
	disable: function(){
		if (!this.parent()) return false;
		this.oldTabIndex = this.tabIndex;
		this.setTabIndex(-1);
		this.deferDraw();
		return true;
	},
	
	focus: function(){
		if (!this.parent()) return false;
		this.element.focus();
		this.deferDraw();
		return true;
	},
	
	blur: function(){
		if (!this.parent()) return false;
		this.element.blur();
		this.deferDraw();
		return true;
	},
	
	activate: function(){
		if (!this.parent()) return false;
		this.deferDraw();
		return true;
	},
	
	deactivate: function(){
		if (!this.parent()) return false;
		this.deferDraw();
		return true;
	},
	
	hide: function(){
		if (!this.getState('hidden')){
			this.setState('hidden', true);
			this.fireEvent('hide');
			this.deferDraw();
		}
		return this;
	},
	
	show: function(){
		if (this.getState('hidden')){
			this.setState('hidden', false);
			this.fireEvent('hide');
			this.deferDraw();
		}
		return this;
	},
	
	destroy: function(){
		this.parent();
		this.element.destroy();
	},
	/* $ */
	
	toElement: function(){
		return this.element;
	}
	
});
	
})();
