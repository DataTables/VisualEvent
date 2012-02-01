
(function(window, document, $, VisualEvent){

// jQuery 1.5, 1.6
VisualEvent.parsers.push( function () {
	var version = jQuery.fn.jquery.substr(0,3)*1;
	
	if ( !jQuery || version < 1.5 || version >= 1.7 ) {
		return [];
	}
	
	var elements = [];
	for ( j in jQuery.cache ) {
		jQueryGeneric( elements, jQuery.cache[j] );
	}
	
	return elements;
} );

// jQuery 1.4, 1.7
VisualEvent.parsers.push( function () {
	var version = jQuery.fn.jquery.substr(0,3)*1;
	
	if ( !jQuery || version < 1.4 ) {
		return [];
	}
	
	var elements = [];
	jQueryGeneric( elements, jQuery.cache );
	
	return elements;
} );


function jQueryGeneric (elements, cache)
{
	for ( i in cache ) {
		if ( typeof cache[i].events == 'object' ) {
			var eventAttachedNode = cache[i].handle.elem;
			var func;
			
			for ( type in cache[i].events ) {
				/* Ignore live event object - live events are listed as normal events as well */
				if ( type == 'live' ) {
					continue;
				}
				
				var oEvents = cache[i].events[type];
				
				for ( j in oEvents ) {
					var aNodes = [];
					var sjQuery = "jQuery "+jQuery.fn.jquery;
					
					if ( typeof oEvents[j].selector != 'undefined' && oEvents[j].selector !== null ) {
						aNodes = $(oEvents[j].selector, cache[i].handle.elem);
						sjQuery += " (live event)";
					}
					else {
						aNodes.push( eventAttachedNode );
					}
					
					for ( var k=0, kLen=aNodes.length ; k<kLen ; k++ ) {
						elements.push( {
							"node": aNodes[k],
							"listeners": []
						} );
						
						if ( typeof oEvents[j].origHandler != 'undefined' ) {
							func = oEvents[j].origHandler.toString();
						}
						else if ( typeof oEvents[j].handler != 'undefined' ) {
							func = oEvents[j].handler.toString();
						}
						else {
							func = oEvents[j].toString();
						}
						
						/* We use jQuery for the Visual Event events... don't really want to display them */
						if ( oEvents[j] && oEvents[j].namespace != "VisualEvent" && func != "0" )
						{
							elements[ elements.length-1 ].listeners.push( {
								"type": type,
								"func": func,
								"removed": false,
								"source": sjQuery
							} );
						}
					}

					// Remove elements that didn't have any listeners (i.e. might be a Visual Event node)
					if ( elements[ elements.length-1 ].listeners.length === 0 ) {
						elements.splice( elements.length-1, 1 );
					}
				}
			}
		}
	}
};

})(window, document, jQuery, VisualEvent);
