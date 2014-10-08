/**
 * @summary     Visual Event
 * @description Visual Event - show Javascript events which have been attached to objects, and
 *              the event's associated function code, visually.
 * @file        VisualEvent_Loader.js
 * @author      Allan Jardine (www.sprymedia.co.uk)
 * @license     GPL v2
 * @contact     www.sprymedia.co.uk/contact
 *
 * @copyright Copyright 2007-2013 Allan Jardine.
 *
 * This source file is free software, under the GPL v2 license:
 *   http://www.gnu.org/licenses/gpl-2.0.html
 */

(function(window, document, $){

/*global VisualEvent,VisualEvent_Loader,VisualEvents,VisualEventSyntaxHighlighter*/


/** 
 * Visual Event will show, visually, which DOM elements on a web-page have events attached to
 * them, information about those events and the code accossiated with each handler for the 
 * event. It does this by parsing through the cache of Javascript libraries (as there is no DOM
 * method to get the information required), thus a major part of Visual Event are the library
 * parsers. A result of this is that universal display of events is not possible - there must
 * be a parser available.
 * 
 * Visual Event's display is broken into four major areas:
 *   - Label - The information toolbar at the bottom of the window (fixed) showing Visual Event
 * controls (close and help), the name of the program and information about the events that have
 * been found on the page.
 * 
 *   - Help - The help view is a completely blocking layer which shows information about Visual
 * Event and how to use it. A single click will remove the help layer and restore the standard
 * Visual Event view.
 * 
 *   - Display - A layer which provides a background to Visual Event (thus when Visual Event is 
 * active is it blocking to the web-page below it) and acts as a container for the boxes (DIVs)
 * which serve as a visual indicator that there is an event attached to the element below it
 * (sized to match the element with the event attached).
 * 
 *   - Lightbox - The event information and code display of attached events.
 * 
 * Note that currently there can only be one instance of Visual Event at a time, due to 
 * practicality (no point in showing the same thing twice, at the same time) and the use of
 * element IDs in the script.
 * 
 *  @class VisualEvent
 *  @constructor
 * 
 *  @example
 *     new VisualEvent();
*/
window.VisualEvent = function ()
{
	// Sanity check
	if ( ! this instanceof VisualEvent ) {
		alert( "VisualEvent warning: Must be initialised with the 'new' keyword." );
		return;
	}

	// Only one instance of VisualEvent at a time, in the current running mode. So if there is a
	// current instance, shut it down first
	if ( VisualEvent.instance !== null ) {
		VisualEvent.instance.close();
	}
	VisualEvent.instance = this;


	/**
	 * Settings object containing customisable information for the class instance
	 * @namespace
	 */
	this.s = {
		/** 
		 * Array of objects containing information about the nodes which have been found to have
		 * events attached to them. Each object contains the following parameters:
		 *   {element} node The DOM element in question
		 *   {array} listeners Array of objects which with details about each of the events on this node
		 *     {string} func Source of the event handler (from Function.toString())
		 *     {string} source Library name / version
		 *     {string} type Type of event (click, change, keyup etc)
		 *     {boolean} removed Flag to indicate if the event has been removed (for API)
		 *  @type     array
		 *  @default  null
		 */
		"elements": null,

		/** 
		 * setTimeout reference for delayed hiding of the lightbox layer
		 *  @type     int
		 *  @default  null
		 *  @private
		 */
		"mouseTimer": null,

		/** 
		 * Counter for the number of events which have been found from a JS library's cache, but
		 * are not currently available in the document's DOM
		 *  @type     int
		 *  @default  null
		 *  @private
		 */
		"nonDomEvents": 0,

		/** 
		 * Array of objects holding information about each SCRIPT tag that is found in the DOM. Each
		 * object contains the parameters:
		 *   {string} src The URL of the script source (or inline string if no src attribute)
		 *   {string} code The code (.text) from the script
		 *  @type     array
		 *  @default  []
		 *  @private
		 */
		"scripts": []
	};

	/**
	 * DOM elements used by the class instance
	 * @namespace
	 */
	this.dom = {
		/**
		 * Label layer - for showing that Visual Event is currently running and information and
		 * controls, about and for this instance
		 *  @type     element
		 *  @default  See code
		 */
		"label": $(
			'<div id="Event_Label">'+
				'<span class="Event_LabelClose">x</span>'+
				'<span class="Event_LabelHelp">?</span>'+
				'Visual Event <span class="Event_LabelBy">by <a href="http://sprymedia.co.uk/" target="_blank">Allan Jardine</a>.</span>'+
				'<span class="Event_LabelEvents"></span> events were found attached to '+
				'<span class="Event_LabelNodes"></span> nodes. '+
				'<span class="Event_LabelNonDom"></span> events were attached to elements not currently in the document.'+
			'</div>')[0],

		/**
		 * Display layer - background layer and container for Visual Event visual node indicators
		 *  @type     element
		 *  @default  See code
		 */
		"display": $('<div id="Event_Display"></div>')[0],

		/**
		 * Lightbox layer - Template for information display about a given node, and the code for
		 * a given event handler
		 *  @type     element
		 *  @default  See code
		 */
		"lightbox": $(
			'<div id="Event_Lightbox">'+
				'<div class="Event_NodeName">Node: <i></i>'+
					'<div class="Event_NodeRemove">Remove from display</div>'+
				'</div>'+
				'<div>'+
					'<div class="Event_Nav">'+
						'<ul></ul>'+
					'</div>'+
				'</div>'+
				'<div class="Event_Code"></div>'+
			'</div>')[0],

		/**
		 * Help layer - information about Visual Event and how to use it
		 *  @type     element
		 *  @default  See code
		 */
		"help": $(
			'<div id="Event_Help">'+
				'<div class="Event_HelpInner">'+
					'<h1>Visual Event help</h1>'+
					'<p>Visual Event will show which elements on any given page have Javascript events attached '+
						'to them, what those events are and the code associated with the events. In Webkit '+
						'browsers and Opera, Visual Event will also indicate where the code in question was '+
						'defined.</p>'+
					'<p>Note that Visual Event is only able to show events for Javascript libraries for which '+
						'it has a parser. This is currently: DOM0 events, Glow, jQuery, MooTools, Prototype and YUI2.</p>'+
					'<p>Commands:</p>'+
					'<table cellpadding="0" cellspacing="0" border="0">'+
						'<tr>'+
							'<td>Double click element with event</td>'+
							'<td>Hide event indicator. Allows access to nodes underneath</td>'+
						'</tr>'+
						'<tr>'+
							'<td>Key: space</td>'+
							'<td>Restore all events to be visible</td>'+
						'</tr>'+
						'<tr>'+
							'<td>Key: esc</td>'+
							'<td>Quit out of Visual Event</td>'+
						'</tr>'+
						'<tr>'+
							'<td>Key: h</td>'+
							'<td>Show / hide this help box</td>'+
						'</tr>'+
						'<tr>'+
							'<td>Key: r</td>'+
							'<td>Reload and display events on page</td>'+
						'</tr>'+
					'</table>'+
					'<p>The colour of the elements that have been detected to have an event reflect the type of '+
					'events that are attached to the element:</p>'+
					'<table cellpadding="0" cellspacing="0" border="0" class="Event_LabelColorInfo">'+
						'<tr>'+
							'<td width="15%"><div class="EventLabel Event_LabelColour Event_bg_blue"></div></td>'+
							'<td width="14%"><div class="EventLabel Event_LabelColour Event_bg_red"></div></td>'+
							'<td width="14%"><div class="EventLabel Event_LabelColour Event_bg_yellow"></div></td>'+
							'<td width="14%"><div class="EventLabel Event_LabelColour Event_bg_green"></div></td>'+
							'<td width="14%"><div class="EventLabel Event_LabelColour Event_bg_purple"></div></td>'+
							'<td width="14%"><div class="EventLabel Event_LabelColour Event_bg_orange"></div></td>'+
							'<td width="15%"><div class="EventLabel Event_LabelColour Event_bg_black"></div></td>'+
						'</tr>'+
						'<tr>'+
							'<td>Mouse event</td>'+
							'<td>UI event</td>'+
							'<td>HTML event</td>'+
							'<td>Mouse + HTML</td>'+
							'<td>Mouse + UI</td>'+
							'<td>HTML + UI</td>'+
							'<td>Mouse + HTML + UI</td>'+
						'</tr>'+
					'</table>'+
					'<p>Visual Event is open source software (GPLv2). If you would like to contribute an '+
						'enhancement, please fork the project on '+
						'<a href="https://github.com/DataTables/VisualEvent" target="_blank">Github</a>!</p>'+
					'<p class="Event_HelpClose">Click anywhere to close this help box.</p>'+
				'</div>'+
			'</div>')[0],


		/**
		 * Reference to the visual event node indicator - so we have a reference to what node we are
		 * showing the lightbox information about
		 *  @type     element
		 *  @default  See code
		 */
		"activeEventNode": null
	};

	this._construct();
};


VisualEvent.prototype = {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods
	 */

	/**
	 * Shutdown Visual Event and return to the original page
	 * @param {event} e Event object
	 */
	"close": function ( e )
	{
		// Remove all events that we've added
		$('*').unbind('.VisualEvent');
		$(document).unbind( 'keydown.VisualEvent' );

		$(this.dom.display).remove();
		$(this.dom.lightbox).remove();
		$(this.dom.label).remove();
		$(this.dom.help).remove();

		if ( typeof VisualEvent_Loader !== 'undefined' && !VisualEvent_Loader.jQueryPreLoaded ) {
			$.noConflict();
		}

		VisualEvent.instance = null;
	},


	/**
	 * Reinitialise Visual Event (i.e. bring it up-to-date with any new events which might have
	 *   been added
	 */
	"reInit": function ()
	{
		$('*').unbind('.VisualEvent');
		$(document).unbind( 'keydown.VisualEvent' );

		$(this.dom.display).empty();
		$(this.dom.display).remove();
		$(this.dom.lightbox).remove();
		$(this.dom.label).remove();
		$(this.dom.help).remove();

		this.s.elements.splice(0, this.s.elements.length);
		this.s.nonDomEvents = 0;

		this._construct();
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Visual Event constructor
	 *  @private
	 */
	"_construct": function ()
	{
		var that = this;
		var i, iLen;
		var windowHeight = $(document).height();
		var windowWidth = $(document).width();

		/* Prep the DOM */
		this.dom.display.style.width = windowWidth+'px';
		this.dom.display.style.height = windowHeight+'px';

		document.body.appendChild( this.dom.display );
		document.body.appendChild( this.dom.lightbox );
		document.body.appendChild( this.dom.label );

		/* Event handlers */
		$(this.dom.lightbox).bind('mouseover.VisualEvent', function (e) {
			that._timerClear( e );
		} ).bind( 'mousemove.VisualEvent', function (e) {
			that._timerClear( e );
		} ).bind( 'mouseout.VisualEvent', function (e) {
			that._lightboxHide();
		} );

		$('div.Event_NodeRemove', this.dom.lightbox).bind('click.VisualEvent', function (e) {
			that.dom.activeEventNode.style.display = "none";
			that.dom.lightbox.style.display = "none";
		} );

		$(document).bind( 'keydown.VisualEvent', function( e ) {
			if ( e.which === 0 || e.which === 27 ) { // esc
				that.close();
			}
			if ( e.which === 72 ) { // 'h'
				if ( $(that.dom.help).filter(':visible').length === 0 ) {
					that._help();
				}
				else {
					that._hideHelp();
				}
			}
			else if ( e.which === 32 ) { // space
				$('div.EventLabel').css('display', 'block');
				e.preventDefault();
			}
			else if ( e.which === 82 ) { // r
				that.reInit();
			}
		} );

		/* Build the events list and display */
		this.s.elements = this._eventsLoad();
		for ( i=0, iLen=this.s.elements.length ; i<iLen ; i++ ) {
			this._eventElement( this.s.elements[i] );
		}

		this._renderLabel();

		/* Load the text of all the Javascript on the page so we can try to find source */
		this._scriptsLoad();
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * User help
	 */

	/**
	 * Show the help box
	 *  @private
	 */
	"_help": function () {
		document.body.appendChild( this.dom.help );
	},


	/**
	 * Hide hte help box
	 *  @private
	 */
	"_hideHelp": function () {
		document.body.removeChild( this.dom.help );
	},



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Javascript source handling
	 */

	/**
	 * Parse the DOM for script tags and store the Javascript that is found. For any scripts which
	 * have a 'src' attribute, add them to a queue for Ajax loading and then start the queue running
	 *  @private
	 */
	"_scriptsLoad": function ()
	{
		// Don't load scripts again if they are already loaded
		if ( this.s.scripts.length > 0 ) {
			return;
		}

		var loadQueue = [];
		var scripts = document.getElementsByTagName('script');
		for ( var i=0, iLen=scripts.length ; i<iLen ; i++ ) {
			if ( scripts[i].src  && scripts[i].src !== "" ) {
				if ( scripts[i].src.indexOf('VisualEvent') === -1 ) {
					loadQueue.push( scripts[i].src );
				}
			}
			else {
				this.s.scripts.push( {
					"src": "Inline script",
					"code": scripts[i].text
				} );
			}
		}

		this._scriptLoadQueue( loadQueue );
	},


	/**
	 * Pull an item off the script loading queue and load it up by an Ajax return. When done, loop
	 * back and load the next item off the queue, until all done.
	 *  @private
	 */
	"_scriptLoadQueue": function ( loadQueue )
	{
		/* Check if we still have anything to do or not */
		if ( loadQueue.length === 0 ) {
			return;
		}

		var that = this;
		var url = loadQueue.shift();

		$.ajax( {
			"dataType": 'text',
			"type": "GET",
			"url": url,
			"success": function (text) {
				that.s.scripts.push( {
					"src": url,
					"code": text
				} );
				that._scriptLoadQueue( loadQueue );
			},
			"error": function () {
				that._scriptLoadQueue( loadQueue );
			}
		} );
	},


	/**
	 * Attempt to find the source location (file and line number) for a given function and
	 * format a return string which is human readable explaining where the source might come from
	 *  @param {string} func The function string to search for
	 *  @returns {string} Formatted string with information about the source
	 *  @private
	 */
	"_scriptSource": function ( func )
	{
		var origin = "";
		var srcFiles = [];
		var i, iLen, a;

		// Webkit reformats the prototype for the function, so the whitespace might not match our
		// intended target. Remove the prototype - it means we are more likely to get a clash, but
		// don't see much choice if we want to do matching other than trying all variations
		func = $.trim( func.replace(/^(function.*?\))/, '') );

		for ( i=0, iLen=this.s.scripts.length ; i<iLen ; i++ ) {
			if ( this.s.scripts[i].code.indexOf( func ) !== -1 ) {
				a = this.s.scripts[i].code.split( func );
				srcFiles.push( {
					"src": this.s.scripts[i].src,
					"line": a[0].split('\n').length
				} );
			}
		}

		// Firefox reformats the functions from toString() rather than keeping the original format
		// so we'll never be able to find the original. Should we just return an empty string
		// for Firefox?

		if ( srcFiles.length === 0 ) {
			origin = "Function definition could not be found automatically<br/>";
		} else if ( srcFiles.length === 1 ) {
			origin = 'Function defined in ';
			if (srcFiles[0].src != 'Inline script') {
				origin += '<a href="' + srcFiles[0].src + '">'+this._scriptName(srcFiles[0].src)+'</a>:'+ srcFiles[0].line + "<br/>";
			} else {
				origin += srcFiles[0].src+"<br />";
			}
		} else {
			origin = "Function could originate in multiple locations:<br/>";
			for ( i=0, iLen=srcFiles.length ; i<iLen ; i++ ) {
				origin += (i+1)+'. '+
					' in <a href="'+srcFiles[i].src+'" target="_blank">'+this._scriptName(srcFiles[i].src)+'</a>:'+srcFiles[i].line+'<br/>';
			}
		}

		return origin;
	},


	/**
	 * Get the name of a file from a URL (i.e. the last part in a slash seperated string)
	 *  @param {string} src URL to get the file name from
	 *  @returns {string} File name
	 *  @private
	 */
	"_scriptName": function ( src )
	{
		var a = src.split('/');
		return a[ a.length-1 ];
	},



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Display
	 */

	/**
	 * Build the list of nodes that have events attached to them by going through all installed
	 * parsers
	 *  @returns {array} List of nodes with their associated events
	 *  @private
	 */
	"_eventsLoad": function ()
	{
		var i, iLen;
		var elements=[], libraryListeners;

		/* Gather the events from the supported libraries */
		for ( i=0, iLen=VisualEvent.parsers.length ; i<iLen ; i++ ) {
			// Given the millions of environments that the parsers will run in, it is quite possible one
			// will hit an error - if it does, just ignore it and pass on.
			try {
				libraryListeners = VisualEvent.parsers[i]();
				elements.push.apply( elements, libraryListeners );
			} catch (e) {
				console.log( 'Visual Event parser error:', e );
			}
		}

		/* Add the API array information - if it is available */
		if ( typeof VisualEvents == 'object' ) {
			if ( this._ceckIntegrity( VisualEvents ) ) {
				elements = this._combineEvents( elements, VisualEvents );
			}
		}

		/* Group the events */
		return this._merge( elements );
	},


	/**
	 * A node has at least one event subscribed to it - draw it visually
	 *  @param {object} eventNode Event information for this node in the same format as 
	 *    VisualEvent.s.elements objects
	 *  @private
	 */
	"_eventElement": function ( eventNode )
	{
		var that = this;
		var i, iLen;
		var pos;
		var label;

		// Element is hidden
		if ( $(eventNode.node).filter(':visible').length === 0 ) {
			this.s.nonDomEvents += 1;
			return;
		}

		pos = $(eventNode.node).offset();

		label = document.createElement( 'div' );
		label.style.position = "absolute";
		label.style.top = pos.top+"px";
		label.style.left = pos.left+"px";
		label.className = 'EventLabel Event_bg_'+this._getColorFromTypes( eventNode.listeners );

		/* If dealing with the html or body tags, don't paint over the whole screen */
		if ( eventNode.node != document.body && eventNode.node != document.documentElement ) {
			label.style.width = (eventNode.node.offsetWidth-4)+'px';
			label.style.height = (eventNode.node.offsetHeight-4)+'px';
		}

		/* Event listeners for showing the lightbox for this element */
		$(label).bind( 'dblclick.VisualEvent', function (e) {
			this.style.display = "none";
			return false;
		} ).bind( 'mouseover.VisualEvent', function (e) {
			that.dom.activeEventNode = this;
			that._lightboxList( e, eventNode.node, eventNode.listeners );
		} ).bind( 'mouseout.VisualEvent', function (e) {
			that._lightboxHide();
		} );

		/* Finally have the html engine render our output */
		this.dom.display.appendChild( label );
	},



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Lightbox
	 */

	/**
	 * Show the list of event types which are attached to this node and add event listeners to show
	 * the code when required (mouseover on the list)
	 *  @param {event} e The mouse event that triggered this display
	 *  @param {element} node The node with the attached listeners
	 *  @param {array} listeners List of listeners attached to the element
	 *  @private
	 */
	"_lightboxList": function ( e, node, listeners )
	{
		var that = this;
		var i, iLen;
		var ul;

		this._timerClear();

		$('i', this.dom.lightbox).html( this._renderNodeInfo(node) );
		$('div.Event_Code', this.dom.lightbox).empty();

		ul = $('ul', this.dom.lightbox).empty();
		for ( i=0, iLen=listeners.length ; i<iLen ; i++ ) {
			ul.append( $('<li>'+listeners[i].type+'</li>').bind( 'mouseover.VisualEvent',
				this._lightboxCode(e, node, listeners[i]) )
			);
		}

		/* Show the code for the first event in the list */
		$('li:eq(0)', this.dom.lightbox).mouseover();

		this._lightboxPosition( this.dom.lightbox, node );
	},


	/**
	 * Create a function which will build the HTML needed for the display of the code for an
	 * event handler
	 *  @param {event} e Original mouse event that triggered the lightbox to be shown
	 *  @param {element} node The node with the attached listeners
	 *  @param {object} listener Listener attached to the element
	 *  @returns {function} Function which will display the code for the event when called
	 *  @private
	 */
	"_lightboxCode": function ( e, node, listener )
	{
		var that = this;

		return function () {
			$('li', this.parentNode).removeClass( 'Event_EventSelected' );
			$(this).addClass( 'Event_EventSelected' );

			var evt = that._createEvent( e, listener.type, e.target );
			that._renderCode( e, listener.func, listener.source, listener.type,
				evt===null ? null : function() {
					node.dispatchEvent(evt);

					// Might cause stuff to move around by the activation of the event, so re-init
					setTimeout( function () {
						that.reInit.call(that);
					}, 200 );
				}
			);
		};
	},


	/**
	 * Position the lightbox relative to the element which has an event attached to it
	 *  @param {element} target The lightbox node to move (note there is only one this.dom.lightbox
	 *    but this keeps it nice and generic!)
	 *  @param {element} parent The element with the event attached to it
	 *  @private
	 */
	"_lightboxPosition": function ( target, parent )
	{
		var offset = $(parent).offset();
		var targetT = offset.top + 15; // magic number - height of info button
		var targetL = offset.left;
		var viewportW = $(window).width() - 25; // use window rather than document, since the target could cause the document to resize
		var viewportH = $(document).height();
		var targetW = $(target).width();
		var targetH = $(target).height();

		// Correct for over-run
		if ( targetL + targetW > viewportW ) {
			targetL -= (targetL + targetW) - viewportW;
		}

		if ( targetT + targetH > viewportH ) {
			targetH -= (targetT + targetH) - viewportH;
		}

		// Correct for under-run
		if ( targetT < 0 ) {
			targetT = 0;
		}

		if ( targetL < 0 ) {
			targetL = 0;
		}

		target.style.top = targetT+'px';
		target.style.left = targetL+'px';
		target.style.display = 'block';
	},


	/**
	 * Close the lightbox - use a cancellable timer for the hiding of the lightbox, so we can move 
	 * the mouse from element to element without having it flicker.
	 *  @private
	 */
	"_lightboxHide": function ()
	{
		var that = this;
		this.s.mouseTimer = setTimeout( function () {
				that.dom.lightbox.style.display = 'none';
			},
		200 );
	},



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rendering methods
	 */

	/**
	 * Display a tooltip with event information for a particular event handler
	 *  @param {event} e Target node information
	 *  @param {function} func The function string
	 *  @param {string} type Event type
	 *  @param {function|null} trigger Function to trigger the event
	 *  @private
	 */
	"_renderCode": function( e, func, source, type, trigger )
	{
		var that = this;
		var eventElement = e.target;
		var i, iLen;

		this._timerClear( e );

		if ( trigger === null ) {
			$('div.Event_Code', this.dom.lightbox).html( '<div id="Event_inner"><p><i>'+type+
				'</i> event subscribed by '+source+'<br/>'+
				this._scriptSource( func )+
				'</p><pre id="Event_code" class="brush: js"></pre></div>' );
		}
		else {
			$('div.Event_Code', this.dom.lightbox).html( '<div id="Event_inner"><p><i>'+type+
				'</i> event subscribed by '+source+' ('+
				'<span id="Event_Trigger">trigger event</span>)<br/>'+
				this._scriptSource( func )+
				'</p><pre id="Event_code" class="brush: js"></pre></div>' );
			$('#Event_Trigger').bind( 'click.VisualEvent', trigger );
		}

		/* Modify the function slightly such that the white space that is found at the start of the
		 * last line in the function is also put at the start of the first line. This allows
		 * SyntaxHighlighter to be cunning and remove the block white space - otherwise it is all
		 * shifted to the left, other than the first line
		 */
		var lines = func.split('\n');
		if ( lines.length > 1 ) {
			var last = lines[lines.length-1].match(/^(\s*)/g);
			lines[0] = last + lines[0];
			func = lines.join('\n');
		}

		/* Inject the function string here incase it includes a '</textarea>' string */
		$('pre', this.dom.lightbox).html(
			func.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		);

		VisualEventSyntaxHighlighter.highlight( null, document.getElementById('Event_code') );
	},


	/**
	 * Show information about a particular node - the node name, ID and class (if it has either/both
	 * of the last two)
	 *  @param {element} node The element to inspect
	 *  @returns {string} Information about the element
	 *  @private
	 */
	"_renderNodeInfo": function ( node )
	{
		var s = node.nodeName.toLowerCase();

		var id = node.getAttribute('id');
		if ( id && id !== '' ) {
			s += '#'+id;
		}

		var className = node.className;
		if ( className !== '' ) {
			s += '.'+className;
		}

		return s;
	},


	/**
	 * Display the Visual Event toolbar, writing in the required information and adding the event
	 * handlers as needed
	 *  @private
	 */
	"_renderLabel": function ()
	{
		var that = this,
			events = 0, i, iLen;

		for (i=0, iLen=this.s.elements.length ; i<iLen ; i++ ) {
			events += this.s.elements[i].listeners.length;
		}

		$('span.Event_LabelEvents', this.dom.label).html( events );
		$('span.Event_LabelNodes', this.dom.label).html( this.s.elements.length );
		$('span.Event_LabelNonDom', this.dom.label).html( this.s.nonDomEvents );

		//this.dom.label.innerHTML = "Visual Event";
		$('span.Event_LabelClose', this.dom.label).bind( 'click.VisualEvent', function () {
			that.close();
		} );

		$('span.Event_LabelHelp', this.dom.label).bind( 'click.VisualEvent', function () {
			that._help();
		} );

		$(this.dom.help).bind( 'click.VisualEvent', function () {
			that._hideHelp();
		} );
	},



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Support methods
	 */

	/**
	 * Create an event oject based on the type to trigger an event - cross-platform
	 *  @param {event} originalEvt The original event (click) which caused this function to run
	 *  @param {string} type Type of event
	 *  @param {node} target Target node of the event
	 *  @returns {event} The constructed event
	 *  @private
	 */
	"_createEvent": function( originalEvt, type, target )
	{
		var evt = null;
		var offset = $(target).offset();
		var typeGroup = this._eventTypeGroup( type );

		if ( document.createEvent ) {
			switch ( typeGroup ) {
				case 'mouse':
					evt = document.createEvent( "MouseEvents" );
					evt.initMouseEvent( type, true, true, window, 0, offset.left, offset.top,
						offset.left, offset.top, originalEvt.ctrlKey, originalEvt.altKey, originalEvt.shiftKey,
						originalEvt.metaKey, originalEvt.button, null );
					break;

				case 'html':
					evt = document.createEvent( "HTMLEvents" );
					evt.initEvent( type, true, true );
					break;

				case 'ui':
					evt = document.createEvent( "UIEvents" );
					evt.initUIEvent( type, true, true, window, 0 );
					break;

				default:
					break;
			}
		}
		else if ( document.createEventObject ) {
			switch ( typeGroup ) {
				case 'mouse':
					evt = document.createEventObject();
					evt.screenX = offset.left;
					evt.screenX = offset.top;
					evt.clientX = offset.left;
					evt.clientY = offset.top;
					evt.ctrlKey = originalEvt.ctrlKey;
					evt.altKey = originalEvt.altKey;
					evt.metaKey = originalEvt.metaKey;
					evt.button = originalEvt.button;
					evt.relatedTarget = null;
					break;

				case 'html':
					/* fall through to basic event object */

				case 'ui':
					evt = document.createEventObject();
					break;

				default:
					break;
			}
		}

		return evt;
	},


	/**
	 * Cancel tooltip mouse timer
	 *  @param {event} e Mouse event
	 *  @private
	 */
	"_timerClear": function ( e )
	{
		if ( this.s.mouseTimer !== null ) {
			clearTimeout( this.s.mouseTimer );
			this.s.mouseTimer = null;
		}
	},


	/**
	 * Combine the main events array, so that each node only has one element
	 *  @param {array} main The main source array
	 *  @returns {array} Augmented internal representation
	 *  @private
	 */
	"_merge": function ( main )
	{
		var ret = [];
		var found, i, iLen, j, jLen;

		for ( i=0, iLen=main.length ; i<iLen ; i++ ) {
			found = false;

			for ( j=0, jLen=ret.length ; j<jLen ; j++ ) {
				if ( ret[j].node == main[i].node ) {
					ret[j].listeners = ret[j].listeners.concat( main[i].listeners );
					found = true;
					break;
				}
			}

			if ( !found ) {
				ret.push( main[i] );
			}
		}

		return ret;
	},


	/**
	 * Combine the API array into the internal representation.
	 * The input structure MUST be valid for this to work - two types of objects are allowed as 
	 *   array entries:
	 *     { node: '', source: '', func: '', type: '', removed: bool }
	 *     { node: '', source: '', listeners: [ func: '', type: '', removed: bool, ... ] }
	 *  @param {array} main The main source array
	 *  @param {array} api The API array
	 *  @returns {array} Augmented internal representation
	 *  @private
	 */
	"_combineEvents": function ( main, api )
	{
		var i, j,
			found, found2;

		for ( i=0 ; i<api.length ; i++ ) {
			if ( typeof api[i].listeners != 'undefined' ) {
				main.push( api[i] );
			}
			else {
				found = -1;

				/* Want to combine single definitions into our single entry for each node array */
				for ( j=0 ; j<main.length ; j++ ) {
					if ( main[j].node == api[i].node ) {
						found = j;
						break;
					}
				}

				if ( found == -1 ) {
					main.push( {
						"node": api[i].node,
						"source": api[i].source,
						"listeners": [ {
							"type": api[i].type,
							"func": api[i].func,
							"removed": api[i].removed
						} ]
					} );
				}
				else {
					/* Check to see if this exact event has already been added at some point */
					found2 = -1;
					for ( j=0 ; j<main[ found ].listeners.length ; j++ ) {
						if ( main[ found ].listeners[j].type == api[i].type &&
								 main[ found ].listeners[j].func == api[i].func )
						{
							/* Update removed variable */
							main[ found ].listeners[j].removed = api[i].removed;
							found2 = j;
							break;
						}
					}

					/* If not found - then add it in */
					if ( found2 != -1 ) {
						main[ found ].listeners.push( {
							"type": api[i].type,
							"func": api[i].func,
							"removed": api[i].removed
						} );
					}
				}
			}
		}

		return main;
	},


	/**
	 * Group the event types as per w3c groupings
	 *  @param {string} type Event type
	 *  @returns {string} Event grouping
	 *  @private
	 */
	"_eventTypeGroup": function ( type )
	{
		switch ( type ) {
			case 'click':
			case 'dblclick':
			case 'mousedown':
			case 'mousemove':
			case 'mouseout':
			case 'mouseover':
			case 'mouseup':
			case 'scroll':
				return 'mouse';

			case 'change':
			case 'focus':
			case 'blur':
			case 'select':
			case 'submit':
				return 'html';

			case 'keydown':
			case 'keypress':
			case 'keyup':
			case 'load':
			case 'unload':
				return 'ui';

			default:
				return 'custom';
		}
	},


	/**
	 * Compute the background colour of the event indicator from the event types
	 *  @param {array} events Events information
	 *  @returns {string} Color
	 *  @private
	 */
	"_getColorFromTypes": function ( events )
	{
		var hasMouse = false;
		var hasHtml = false;
		var hasUi = false;
		var group, i;

		for ( i=0 ; i<events.length ; i++ ) {
			group = this._eventTypeGroup( events[i].type );

			switch ( group ) {
				case 'mouse':
					hasMouse = true;
					break;

				case 'html':
					hasHtml = true;
					break;

				case 'ui':
					/* We call 'custom' and 'unknown' types UI as well */
					hasUi = true;
					break;

				default:
					hasUi = true;
					break;
			}
		}

		/*
		 * Since we have three event groups which can be in any combination - then we can group the
		 * resultant colours via the colour wheel
		 *        
		 *                        Red (UI)
		 *                         +++++
		 *                       ++     ++
		 *                     ++         ++
		 *                     ++         ++
		 *       Yellow (Html)   ++     ++   Blue (mouse)
		 *                         +++++
		 */
	 if ( hasMouse && hasHtml && hasUi ) {
			return 'black';
		}
		else if ( !hasMouse && hasHtml && hasUi ) {
			return 'orange';
		}
		else if ( hasMouse && !hasHtml && hasUi ) {
			return 'purple';
		}
		else if ( hasMouse && hasHtml && !hasUi ) {
			return 'green';
		}
		else if ( hasMouse ) {
			return 'blue';
		}
		else if ( hasHtml ) {
			return 'yellow';
		}
		else if ( hasUi ) {
			return 'red';
		}
	}
};



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Javascript library parsers which will find information about the nodes and events which are
 * used in the page. This is an array of functions which must return an array of objects with
 * the following parameters
 *   {element} node The DOM element in question
 *   {array} listeners Array of objects which with details about each of the events on this node
 *     {string} func Source of the event handler (from Function.toString())
 *     {string} source Library name / version
 *     {string} type Type of event (click, change, keyup etc)
 *     {boolean} removed Flag to indicate if the event has been removed (for API)
 *  @type array
 *  @default []
 *  @static
 */
VisualEvent.parsers = [];


/**
 * Reference to the currently running VisualEvent instance (one at a time only)
 *  @type object
 *  @default null
 *  @static
 *  @private
 */
VisualEvent.instance = null;


/**
 * Close Visual Event, removing all DOM elements and event handlers
 *  @static
 */
VisualEvent.close = function ()
{
	VisualEvent.instance.close();
	VisualEvent.instance = null;
};


/**
 * Compare two version strings
 *  @static
 *  @param {string} v1 Version 1 string
 *  @param {string} operator '<', '<=', '==', '>=' or '>' - logic operation to
 *    perform
 *  @param {string} v2 Version 2 string
 *  @returns {boolean} true if condition is correct, false otherwise
 */
VisualEvent.versionCompare = function ( v1, operator, v2 ) {
	var a1 = v1.split('.');
	var a2 = v2.split('.');
	var i1, i2;
	var test = 0;

	for ( var i=0, iLen=a2.length ; i<iLen ; i++ ) {
		i1 = parseInt( a1[i], 10 ) || 0;
		i2 = parseInt( a2[i], 10 ) || 0;

		// Parts are the same, keep comparing
		if ( i1 < i2 ) {
			test = -1;
			break;
		}
		else if ( i1 > i2 ) {
			test = 1;
			break;
		}
	}

	if ( operator === '<' ) {
		return test === -1;
	}
	else if ( operator === '<=' ) {
		return test === -1 || test === 0;
	}
	else if ( operator === '==' ) {
		return test === 0;
	}
	else if ( operator === '>=' ) {
		return test === 0 || test === 1;
	}
	else if ( operator === '>' ) {
		return test === 1;
	}
	throw 'Unknown operator: '+operator;
};


})(window, document, jQuery);
