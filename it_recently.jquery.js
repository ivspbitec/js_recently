/*######## jQuery SPBITEC Recently viewed  ###################################################
	
	Version: 		1.0.5
	Url: 			http://spbitec.ru/
	Repository:  
	Description: 	Recently viewed items.
	Support types:
					— http://schema.org/Product					
						- image
						- name
						- offers
						— http://schema.org/Offer
							- url
							- sku
							- serialNumber
							- price
							- priceCurrency
							- availability
	
	Markups:
	
	*******************************************************	
	SET DATA http://site.com/item_page/:
 
	<div itemscope itemtype="http://schema.org/Product" data-recently-set="watch_scope">
	
	  <img itemprop="image" src="dell-30in-lcd.jpg" alt="A Dell UltraSharp monitor"/>
	  <span itemprop="name">Dell UltraSharp 30" LCD Monitor</span>
 
	  <div itemprop="offers" itemscope itemtype="http://schema.org/AggregateOffer">
		<span itemprop="lowPrice">$1250</span>
		
		to <span itemprop="highPrice">$1495</span>
		from <span itemprop="offerCount">8</span> sellers
		Sellers:
		<div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
			<a itemprop="url" href="save-a-lot-monitors.com/dell-30.html">
			Save A Lot Monitors - $1250</a>
		</div>
		<div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
			<a itemprop="url" href="jondoe-gadgets.com/dell-30.html">
			Jon Doe's Gadgets - $1350</a>
		</div>
	  </div>
	  ...
	</div>	

	
	*******************************************************		 
	GET DATA http://site.com/item_page/:
		
	1. 	Generate items content on Markup	
		<div data-recently-get="watch_scope"></div> 	
	
	2. 	Generate items content on Method
		<div id="it_recently"></div> 
	
		<script>$('#it_recently').it_recently('get',{name:"watch_scope"})</script>
		
	3. 	$("#recent_items").it_recently("get",{
			count:4,
			scope_id:'watch_scope',
			item_template:
			'<div class="it-recent-item">'+
			'<div class="it-recent-item-inner">'+
				'<a class="_image" href="%item._url%"><img src="%item.image%"></a> '+
				'<a class="_brand" href="%item.brand.url%">%item.brand.name%</a> '+
				'<a class="_name" href="%item._url%">%item.name%</a>'+
				'<div class="_price">%item.offers.price%</div>'+
			'</div>'+
			'</div>',
			item_fields_process:{
				'item.offers.price':function(v){
					return '234';
				}
			}	
			});		
	
	*******************************************************	
	Events
	
	window.on('it_recently_created',function(){});	 //when structure created
	
*/

(function ($) {

	$.it_recently_ = function (options, element) {
		this.$o = $(element);
		this._init(options);
	};

	$.it_recently_.defaults = { //Default parametrs
		debug: false,// Verbosre work		 
		renew: false,// Recreate instance on call (for dynamic ajax content)
		items_count: 4,// Get items count 
		items_limit: 12,// Get items count 
		item_template: '<div class="it-recent-item"><div class="it-recent-item-inner"><a class="_image" href="%item._url%"><img src="%item.image%"></a> <a class="_brand" href="%item.brand.url%">%item.brand.name%</a> <a class="_name" href="%item._url%">%item.name%</a></div></div>',
		scope_id: 'default',
		storage: 'window', //'tab' | 'window' -  Storage type - browser / tab
		item_fields_process: {}, // array of functions to prepare values item_fields_process:{'item.offers.price':function(v){}}
		callback: false // functions after get dom create
	};

	var _error = function (message) { //1.0 Error reporting
		if (console) {
			console.error(message);
		}
	};

	$.it_recently_.prototype = {
		_init: function (options) {	//1.1		

			var _this = this;
			/*######## Assign options  ###################################################*/
			_this.options = $.extend(true, {}, $.it_recently_.defaults, options);

			_this.storageName = this.options.storage == 'tab' ? 'sessionStorage' : 'localStorage';

			//this.id=this.$o.data('scope');			
			//_this.scope=_this._load_scope(temp_element_id);

			var itemData = false;

			_this.scope_id = _this.$o.attr('data-recently-set') ? _this.$o.attr('data-recently-set') : (_this.$o.attr('data-recently-get') ? _this.$o.attr('data-recently-get') : _this.options.scope_id);

			_this._debug('_init(' + _this.scope_id + ')');
			_this.scope = new _this._scope(_this.scope_id, _this);


			if (_this.$o.attr('data-recently-set')) {
				_this._debug('Recent set mode');
				var scope_num = _this.scope.find('_url', location.href);
				if (scope_num === false) {
					_this.set();
				} else {
					_this.scope.up(scope_num);
				}
			}

		},
		/** parse Item Information */
		set: function () {
			var _this = this;

			_this._debug('set(' + _this.scope_id + ')');

			if (_this.$o.attr('itemscope') !== undefined) { //schema.org markup
				itemData = {};
				var scho_get_text = function ($element, itemprop) {

					var ret = '';
					ret = $element.attr('content');
					if (!ret && itemprop == 'url') {
						if (!ret) ret = $element.attr('href');
					}
					if (!ret && itemprop == 'image') {
						if (!ret) ret = $element.attr('src');
					}
					if (!ret) {
						if (!ret) ret = $element.text();
					}

					return ret;
				}


				var scho_get = function ($root) {	//1.1				
					var ret = {};
					$root.find('[itemprop]').each(function () {
						if ($(this).data('it-recently-parsed') != 1) {
							var v = ''
							var p = $(this).attr('itemprop');
							if ($(this).attr('itemscope') !== undefined) {
								v = scho_get($(this));
							} else {
								v = scho_get_text($(this), p);
							}
							$(this).data('it-recently-parsed', 1);
							ret[p] = v;
						}

					});

					return ret;
				}


				var $offers = _this.$o.find('[itemprop=offers]');
				itemData = scho_get(_this.$o);
				itemData._url = location.href;
			}

			if (itemData) {
				_this.scope.add(itemData);
			}

			this._events();


		},


		_events: function () {

		},

		/** Display debug information in debug mode */
		_debug: function (text) {
			if (this.options.debug) {
				console.log('$.it_recently: ', text);
			}
		},

		_array_append: function (a1, a2) {
			var new_items = [];
			for (var n in a1) new_items[new_items.length] = a1[n];
			for (var n in a2) new_items[new_items.length] = a2[n];
			return new_items;
		},


		_scope: function (id, parent) { //scope object
			this.data = {};
			this.id = id;
			this.parent = parent;
			this.staticPrefix = 'sit_recentlys6_';

			this.save = function () {
				this.save_data(this.staticPrefix + this.id, this.data);
			},

				this.load = function () {
					this.parent._debug('load()');
					var scope = this.load_data(this.staticPrefix + this.id);
					this.data = (!scope) ? {} : scope;
					this.parent._debug(this.data);
				},

				this.delete = function () {
					this.save_data(this.staticPrefix + id, '');
				},

				this.find = function (key, value) { //1.2 Return key
					for (var n in this.data.items) {
						if (this.data.items[n][key] !== undefined && value !== undefined && this.data.items[n][key] == value) return n;
					}
					return false;
				}

			this.up = function (num) { //1.2 Move item to 0 pos									 		
				if (this.data.items[0] == this.data.items[num]) return
				var new_items = [];
				new_items[0] = this.data.items[num];
				delete this.data.items[num];
				for (var n in this.data.items) {
					if (n < this.parent.options.items_limit)
						new_items[new_items.length] = this.data.items[n];
				}
				this.data.items = new_items;
				this.save();
			}

			this.add = function (item) { //1.2 Add item to 0 pos	
				this.parent._debug('add()');
				this.parent._debug(item);
				this.parent._debug(this.data.items);
				var new_items = [];
				new_items[0] = item;

				for (var n in this.data.items) {
					if (this.data.items[n])
						if (n < this.parent.options.items_limit)
							new_items[new_items.length] = this.data.items[n];
				}
				this.data.items = new_items;
				this.save();
			}

			this.remove = function (item) { //1.2 Remove item  
				this.parent._debug('remove()');
				this.parent._debug(item);

				var ret=false;

				var new_items = [];				

				for (var n in this.data.items) {					
					if (this.data.items[n]!=item){
						new_items.push(this.data.items[n]);
						ret=true;
					}
				}
				this.data.items = new_items;
				this.save();
				return true;
			}

			this.save_data = function (key, json) {
				this.parent._debug('Save data to ' + this.parent.storageName + ':');
				this.parent._debug(json);
				window[this.parent.storageName].setItem(key, JSON.stringify(json));
			},

				this.load_data = function (key) {
					try {
						this.parent._debug('Load data from ' + this.parent.storageName + ' (' + key + '):');
						eval('var data=' + window[this.parent.storageName].getItem(key));
						this.parent._debug(data);
						return data;
					} catch (e) {
						return false;
					}
				}

			this.load();


		},

		/*######## Public ###################################################*/
		_item_node: function (item) {
			var $node = $('<div class="it-recent-node"/>');
			for (var n in item) {
				if (typeof item[n] === 'object') {
					$node.append(this._item_node(item[n]));
				} else {
					var $subnode = $('<div/>');
					$subnode.text(item[n]);
					$subnode.attr('class', 'it-recent-' + n);
					$node.append($subnode);
				}

			}
			return $node;
		},

		get_construct: function () {
			var $container = $('<div class="it-recent-node"/>');
			var is = this.scope.data.items;
			for (var n in is) {
				$container.append(this._item_node(is[n]));
			}
			this.$o.append($container);
		},

		_item_template_parse: function (item, item_template) {//1.1
			var new_item_template = item_template;
			var v = '';
			var val = '';

			ms = new_item_template.match(/\%([^%]+)?\%/g);

			for (var n in ms) {
				val = '';
				v = ms[n].replace(/\%/g, '');

				try {
					eval('val=' + v);
				} catch (e) {
				}
				val = val == undefined ? '' : val;

				if (this.options.item_fields_process[v] !== undefined && typeof this.options.item_fields_process[v] === 'function')
					val = this.options.item_fields_process[v](val);
				new_item_template = new_item_template.replace(ms[n], val);
			}
			return new_item_template;

		},

		get: function () {
			var is = this.scope.data.items;
			var k = 1;
			var $item = null;
			for (var n in is) {
				k++;
				if (k <= this.options.items_count + 1) {
					$item = $(this._item_template_parse(is[n], this.options.item_template));
					$item.data('it_recently', this);
					$item.data('it_recently_item', is[n]);
					this.$o.append($item);
				}

			}

			if (this.options.callback !== undefined && typeof this.options.callback === 'function') this.options.callback.apply(this);
		}



	};

	$.fn.it_recently = function (options, method_options) {

		if (typeof options === 'string') {
			var args = Array.prototype.slice.call(arguments, 1);

			this.each(function () {
				var instance = $(this).data('it_recently');

				if (!instance) {
					$(this).data('it_recently', new $.it_recently_(method_options, this));
					instance = $(this).data('it_recently');
				}

				if (!$.isFunction(instance[options])) {
					_error("it_recently: No such method '" + options + "' in instance");
					return;
				}

				if (options.charAt(0) === "_") {
					_error("it_recently: Try to execute private method '" + options + "' for instance");
					return;
				}
				//instance[options].apply(this,args); 
				instance[options]();
			});

		} else {
			this.each(function () {
				var instance = $(this).data('it_recently');
				if (!instance || options.renew) {
					$(this).data('it_recently', new $.it_recently_(options, this));
				}
			});
		}
		return this;
	};

	/*######## Autoassign  ###################################################*/

	$(function () {
		$('[data-recently-set]').it_recently();
		$('[data-recently-get]').it_recently('get', { count: 4 });
	})

})(jQuery);
