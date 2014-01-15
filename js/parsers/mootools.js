
(function(window, document, $, VisualEvent){

/*global MooTools*/

VisualEvent.parsers.push( function () {
	if ( typeof MooTools == 'undefined' ) {
		return [];
	}

	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen;
	var events, mooEvent;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		events = all[i].retrieve('events', {});

		if ( !$.isEmptyObject( events ) ) {
			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( mooEvent in events ) {
				elements[ elements.length-1 ].listeners.push( {
					"type": mooEvent,
					"func": events[mooEvent].keys.toString(),
					"removed": false,
					"source": 'MooTools'
				} );
			}
		}
	}

	return elements;
} );

})(window, document, jQuery, VisualEvent);
