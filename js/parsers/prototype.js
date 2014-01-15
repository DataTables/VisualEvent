
(function(window, document, $, VisualEvent){

/*global Prototype,Event*/

VisualEvent.parsers.push( function () {
	if ( typeof Prototype == 'undefined' ) {
		return [];
	}

	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen;
	var eventType;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		if ( typeof all[i]._prototypeEventID != 'undefined' ) {
			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( eventType in Event.cache[ all[i]._prototypeEventID ] ) {
				elements[ elements.length-1 ].listeners.push( {
					"type": eventType,
					"func": Event.cache[ all[i]._prototypeEventID ][eventType][0].handler.toString(),
					"removed": false,
					"source": 'Prototype'
				} );
			}
		}
	}

	return elements;
} );

})(window, document, jQuery, VisualEvent);
