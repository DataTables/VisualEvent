
(function(window, document, $, VE){

/*global jQuery*/

// jQuery 1.3
VE.parsers.push( function () {
	if ( !jQuery || VE.versionCompare( jQuery.fn.jquery, '>', '1.3' ) ) {
		return [];
	}

	var elements = [];
	var cache = jQuery.cache;

	for ( var i in cache ) {
		if ( typeof cache[i].events == 'object' ) {
			var nEventNode = cache[i].handle.elem;

			elements.push( {
				"node": nEventNode,
				"listeners": []
			} );

			for ( var type in cache[i].events )
			{
				var oEvent = cache[i].events[type];
				var iFunctionIndex;
				for ( iFunctionIndex in oEvent) {
					break;
				}

				/* We use jQuery for the Visual Event events... don't really want to display them */
				var func = oEvent[ iFunctionIndex ].toString();
				if ( !func.match(/VisualEvent/) && !func.match(/EventLoader/) )
				{
					elements[ elements.length-1 ].listeners.push( {
						"type": type,
						"func": func,
						"removed": false,
						"source": 'jQuery'
					} );
				}
			}
		}
	}

	return elements;
} );


// jQuery 1.3 live events
VE.parsers.push( function () {
	if ( !jQuery || jQuery.fn.live != 'undefined' ||
		typeof jQuery.data == 'undefined' ||
		typeof jQuery.data(document, "events") == 'undefined' ||
		typeof jQuery.data(document, "events").live == 'undefined' )
	{
		return [];
	}

	var elements = [];
	var cache = jQuery.cache;

	jQuery.each( jQuery.data(document, "events").live || [], function(i, fn) {
		var event = fn.type.split('.');
		event = event[0];
		var selector = fn.data;

		$(selector).each( function(i) {
			elements.push( {
				node: this,
				listeners: [],
			} );

			elements[elements.length - 1].listeners.push({
				type: event,
				func: 'Unable to obtain function from live() bound event.',
				removed: false,
				source: "jQuery 1.3 live"
			} );
		} );
	} );

	return elements;
} );

})(window, document, jQuery, VisualEvent);
