
# jQuery SPBITEC Recently viewed 1.0 
	
	
	Version: 		1.0.4
	Url: 			http://spbitec.ru/
	Description: 	Recently viewed items.
	Support types:
					вЂ” http://schema.org/Product					
						- image
						- name
						- offers
						вЂ” http://schema.org/Offer
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
	
 
