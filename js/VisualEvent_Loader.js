/**
 * @summary     VisualEvent_Loader
 * @description Loader for VisualEvent - injects the required CSS and Javascript into a page
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

(function(window, document){

/*global VisualEvent,VisualEvent_Loader*/

if ( typeof VisualEvent_Loader == 'undefined' ) {

/** 
 * VisualEvent_Loader is a class which will provide pre-loading of Javascript and CSS files
 * for VisualEvent based on the environment the script is running in (for example if jQuery is
 * already available or not).
 * 
 *  @class VisualEvent_Loader
 *  @constructor
 * 
 *  @example
 *     new VisualEvent_Loader();
*/
window.VisualEvent_Loader = function ()
{
	/* Sanity check */
	if ( ! this instanceof VisualEvent_Loader ) {
		alert( "VisualEvent loader warning: Must be initialised with the 'new' keyword." );
		return;
	}

	/**
	 * Settings object containing the settings information for the instance
	 *  @namespace
	 */
	this.s = {
		/** 
		 * Flag to indicate if loading has finished or not. False until the required JS classes are
		 * found to be available.
		 *  @type     boolean
		 *  @default  false
		 */
		"loadingComplete": false
	};

	/**
	 * DOM elements used by the instance
	 *  @namespace
	 */
	this.dom = {
		/** 
		 * Visual Label to show the end user that Visual Event is being loaded
		 *  @type     element
		 *  @default  div
		 */
		"loading": document.createElement('div')
	};

	this._construct();
};


VisualEvent_Loader.prototype = {
	/**
	 * Constrctor - show a loading element to the end user and then load up the various files
	 * that are needed
	 *  @returns {undefined}
	 *  @private
	 */
	"_construct": function ()
	{
		var that = this,
			loading,
			style,
			protocol = window.location.protocol === 'file:' ?
				'http:' : '';

		/* Check to see if already loaded */
		if ( this.s.loadingComplete === true ) {
			return 0;
		}

		/* Show a label to the user to let them know that Visual Event is currently loading */
		loading = this.dom.loading;
		loading.setAttribute( 'id', 'EventLoading' );
		loading.appendChild( document.createTextNode( 'Loading Visual Event...' ) );

		style = loading.style;
		style.position = 'fixed';
		style.bottom = '0';
		style.left = '0';
		style.color = 'white';
		style.padding = '5px 10px';
		style.fontSize = '11px';
		style.fontFamily = '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
		style.zIndex = '55999';
		style.backgroundColor = '#93a8cf';
		document.body.insertBefore( loading, document.body.childNodes[0] );

		/* Store a static flag to let the VisualEvent instance know if jQuery was already available on
		 * the page or not - used in the "close" method
		 */
		VisualEvent_Loader.jQueryPreLoaded = (typeof jQuery == 'undefined') ? false : true;

		/* Start the polling for ready */
		if ( typeof VisualEvent == 'object' ) {
			this._pollReady();
			return; // Don't need to load any files if its already loaded
		}
		else {
			setTimeout( function () {
				that._pollReady();
			}, 1000 );
		}

		/* Load the required files - note that the token __BUILD_URL__ is replaced by the build
		 * script with the location of the combined Visual Event file (i.e. with the parsers included
		 */
		this._loadFile( protocol+'__BUILD_URL__/css/VisualEvent.css', 'css' );
		if ( typeof jQuery == 'undefined' ) {
			this._loadFile( protocol+'__BUILD_URL__/js/VisualEvent-jQuery.js', 'js' );
		}
		else {
			this._loadFile( protocol+'__BUILD_URL__/js/VisualEvent.js', 'js' );
		}
	},


	/**
	 * Load a new file into the DOM, and have it processed based on its type. This can be a
	 * Javascript file, a CSS file or an image
	 *  @param {string} file URL to the file to load
	 *  @param {string} type The file type. Can be "css", "js" or "image"
	 *  @returns {undefined}
	 *  @private
	 */
	"_loadFile": function ( file, type )
	{
		var n, img;

		if ( type == 'css' ) {
			n = document.createElement('link');
			n.type = 'text/css';
			n.rel = 'stylesheet';
			n.href = file;
			n.media = 'screen';
			document.getElementsByTagName('head')[0].appendChild( n );
		}
		else if ( type == 'image' ) {
			img = new Image( 1, 1 );
			img.src = file;
		}
		else {
			n = document.createElement( 'script' );
			n.setAttribute( 'language', 'JavaScript' );
			n.setAttribute( 'src', file );
			n.setAttribute( 'charset', 'utf8' );
			document.body.appendChild( n );
		}
	},


	/**
	 * Check if VisualEvent components (specifically VisualEvent itself and the SyntaxHighlighter)
	 * have been loaded and are available. If not, wait a little while and try again.
	 *  @returns {undefined}
	 *  @private
	 */
	"_pollReady": function ()
	{
		var that = this,
			tmp;

		if ( typeof VisualEvent == 'function' &&
			 typeof VisualEventSyntaxHighlighter == 'object' )
		{
			this._complete();
		}
		else {
			setTimeout( function() {
				that._pollReady();
			}, 100 );
		}
	},


	/**
	 * Loading is complete, initialise VisualEvent
	 *  @returns {undefined}
	 *  @private
	 */
	"_complete": function ()
	{
		var that = this;

		this.s.loadingComplete = true;

		tmp = new VisualEvent(); // jsLint need to assign it to a var

		/* Tidy up our display */
		document.body.removeChild( this.dom.loading );
	}
};


VisualEvent_Loader.jQueryPreLoaded = false;

} /* /typeof VisualEvent_Loader */


/*
 * If visual event is already defined then we can toggle the display - giving the effect of
 * starting it up and shutting it down when using the loader. Note it's preferable to do this in
 * the bookmarklet code (and is now - but is it for backwards compatability)
 */
var tmp;
if ( typeof VisualEvent != 'undefined' )
{
	if ( VisualEvent.instance !== null ) {
		VisualEvent.close();
	}
	else {
		tmp = new VisualEvent();
	}
}
else {
	tmp = new VisualEvent_Loader();
}


})(window, document);
