# Visual Event - visually inspect Javascript events

Visual Event is a Javascript bookmarklet which provides debugging information about events that have been attached to DOM elements. Visual Event shows:

* Which elements have events attached to them
* The type of events attached to an element
* The code that will be run with the event is triggered
* The source file and line number for where the attached function was defined (Webkit browsers and Opera only)

In addition to being useful for debugging your own code, Visual Event can be used as an educational tool, showing how many web-sites have been authored.


## Make it go!

As Visual Event is a bookmarklet, installing and running it on any web-page is extremely simple:

* Open the [Visual Event bookmarklet page](http://sprymedia.co.uk/VisualEvent) and drag the "Visual Event" link to your bookmark bar
* Load a web-page which uses one of the supported Javascript libraries
* Click "Visual Event" in your bookmark bar
* View the event handlers which are attached to the document elements.

A demo of Visual Event that is automatically loaded is [available](http://sprymedia.co.uk/VisualEvent/demo). This demo uses [DataTables](http://datatables.net) to create a test page with a number of events attached to different elements.


## How it works

It turns out that there is no standard method provided by the W3C recommended DOM interface to find out what event listeners are attached to a particular element. While this may appear to be an oversight, there was a proposal to include a property called [eventListenerList](http://www.w3.org/TR/2002/WD-DOM-Level-3-Events-20020208/changes.html) to the level 3 DOM specification, but was unfortunately been removed in later drafts. As such we are forced to looked at the individual Javascript libraries, which typically maintain a cache of attached events (so they can later be removed and perform other useful abstractions).

As such, in order for Visual Event to show events, it must be able to parse the event information out of a Javascript library. Currently the following libraries are supported by Visual Event:

* DOM 0 events
* jQuery 1.2+
* YUI 2
* MooTools 1.2+
* Prototype 1.6+
* Glow


## How to get involved

Any help with improvements and suggestions for Visual Event are very welcome indeed! If you hit a specific problem, then please open an issue on GitHub for the problem you are encountering, including a link to the page where the problem occurs. Forks and pull requests are also very much encouraged!

One area which may be of interest to you is how to add support for additional Javascript libraries. The key thing that is needed is access to the event cache that the library uses, since without that it is impossible to determine what nodes have events and the attached code.

The VisualEvent class has a static array called `VisualEvent.parsers` which is an array of functions - to add a new parser, just push your function onto this array. The function must return a Javascript array of objects with the following parameters:

```javascript
[
	{
		"node": {element},            // The DOM element that has attached events
		"listeners": [                // Array of attached events
			{
				"type": {string},     // The event type - click, change, keyup etc
				"func": {string},     // The code that will handle the event, from Function.toString()
				"removed": {boolean}, // If the event has been removed or not (typically will be false, but used if the library doesn't remove the event from its cache)
				"source": {string}    // Library name and version that attached the event (e.g. "jQuery 1.7")
			},
			...
		]
	},
	...
]
```

## Building Visual Event

In order to run a local copy of Visual Event you must build it, since this process does file concatenation, which brings in the library parsers to the main file. The build process will also build the JSDoc documentation and compress the Javascript files (unless made with debug).

To build Visual Event, all you need is a system which will run bash scripts and enter the command `./build.sh debug` in your terminal. This will create a new directory in the "builds" directory with the correct loader and the build Visual Event directory (note the timestamp is used to help prevent caching issues for the bookmarklet, both during development and when deployed). The following is the usage for the build script:

```text
Visual Event build script - usage:
  ./build.sh [loader-dir] [debug]
    loader-dir - The web-address of the build files. Note that the build
      directory name is automatically appended and \"http:\\\\\" is
      automatically prepended. For example:
        localhost/VisualEvent/builds - default if no option is provided
        sprymedia.co.uk/VisualEvent/builds
    debug - Debug indicator. Will not compress the Javascript

  Example deploy build:
    ./build.sh sprymedia.co.uk/VisualEvent/builds

  Example debug build:
    ./build.sh localhost/VisualEvent/builds debug
```

The file `bookmarklet.html` is provided to build your own bookmarklet loader nice and easily. Typically you'll only need to modify the path for the bookmarklet. The link is updated on each keypress and you install it just as you would with any other bookmarklet :-).


## About the author

Allan Jardine is a freelance web UI developer, broadcasting from Scotland and just loves creating usable and useful developer tools. If you'd like to work with Allan on a project, please do [get in touch](http://sprymedia.co.uk/contact)!






