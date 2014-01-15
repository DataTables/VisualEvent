
(function(window, document, $, VisualEvent){

/*global jsBase*/

VisualEvent.parsers.push( function () {
	if ( typeof jsBase == 'undefined' ) {
		return [];
	}

	var elements = [];
	var a = jsBase.aEventCache;
	var i, iLen;

	for ( i=0, iLen=a.length ; i<iLen ; i++ )
	{
		elements.push( {
			"node": a[i].nElement,
			"listeners": [ {
				"type": a[i].type,
				"func": a[i].fn.toString(),
				"removed": false,
				"source": 'jsBase'
			} ]
		} );
	}

	return elements;
} );

})(window, document, jQuery, VisualEvent);
