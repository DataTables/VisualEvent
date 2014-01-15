
(function(window, document, $, VisualEvent){

/*global glow*/

VisualEvent.parsers.push( function () {
	if ( typeof glow == 'undefined' || typeof glow.events.listenersByObjId == 'undefined' ) {
		return [];
	}

	var listeners = glow.events.listenersByObjId;
	var globalGlow = "__eventId"+glow.UID;
	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen, j, jLen;
	var eventIndex, eventType, typeEvents;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		/* If the element has a "__eventId"+glow.UID parameter, then it has glow events */
		if ( typeof all[i][globalGlow] != 'undefined' ) {
			eventIndex = all[i][globalGlow];

			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( eventType in listeners[eventIndex] ) {
				typeEvents = listeners[eventIndex][eventType];

				/* There is a sub array for each event type in Glow, so we loop over that */
				for ( j=0, jLen=typeEvents.length ; j<jLen ; j++ ) {
					elements[ elements.length-1 ].listeners.push( {
						"type": eventType,
						"func": typeEvents[j][2].toString(),
						"removed": false,
						"source": "Glow"
					} );
				}
			}
		}
	}

	return elements;
} );

})(window, document, jQuery, VisualEvent);
