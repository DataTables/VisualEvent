
(function(window, document, $, VisualEvent){

/*global YAHOO*/

VisualEvent.parsers.push( function () {
	if ( typeof YAHOO == 'undefined' || typeof YAHOO.util == 'undefined' ||
		 typeof YAHOO.util.Event == 'undefined' )
	{
		return [];
	}

	/*
	 * Since the YUI cache is a private variable - we need to use the getListeners function on
	 * all nodes in the document
	 */
	var all = document.getElementsByTagName('*');
	var i, iLen, j, jLen;
	var elements = [], events;

	for ( i=0, iLen=all.length ; i<iLen ; i++ )
	{
		events = YAHOO.util.Event.getListeners( all[i] );
		if ( events !== null && events.length !== 0 )
		{
			elements.push( {
				"node": events[0].scope,
				"listeners": []
			} );

			for ( j=0, jLen=events.length ; j<jLen ; j++ )
			{
				elements[ elements.length-1 ].listeners.push( {
					"type": events[j].type,
					"func": events[j].fn.toString(),
					"removed": false,
					"source": 'YUI 2'
				} );
			}
		}
	}

	return elements;
} );

})(window, document, jQuery, VisualEvent);
