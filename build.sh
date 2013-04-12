#!/bin/sh

echo ""
if [ "$1" = "-h" ]; then
	echo "  Visual Event build script - usage:
    ./build.sh [loader-dir] [debug]
      loader-dir - The web-address of the build files. Note that the build
        directory name is automatically appended. For example:
          localhost/VisualEvent/builds - default if no option is provided
          sprymedia.co.uk/VisualEvent/builds
      debug - Debug indicator. Will not compress the Javascript

    Example deploy build:
      ./build.sh sprymedia.co.uk/VisualEvent/builds

    Example debug build:
      ./build.sh localhost/VisualEvent/builds debug
"
	exit
elif [ "$1" = "clean" ]; then
	echo "Cleaning Visual Event builds"
	rm -Rf $(pwd)/builds/VisualEvent*
	exit
fi

# OPTIONS
SCRIPT_LOC=$1
DEBUG=$2

if [ "$SCRIPT_LOC" = "debug" ]; then
	DEBUG="debug"
	SCRIPT_LOC="localhost/VisualEvent/builds"
fi

if [ -z "$1" ]; then
	SCRIPT_LOC="localhost/VisualEvent/builds"
fi

# DEFAULTS
UGLIFYJS=/Users/allan/node_modules/uglify-js/bin/uglifyjs
JSDOC3=/usr/local/jsdoc/jsdoc

BUILD_DIR=VisualEvent-$(date +%s)
BUILD_BASE=$(pwd)/builds
BUILD=$(pwd)/builds/${BUILD_DIR}
BUILD_JS=${BUILD}/js
BUILD_CSS=${BUILD}/css
BUILD_DOCS=${BUILD}/docs

JS=$(pwd)/js
CSS=$(pwd)/css

echo "Building VisualEvent"
echo "  Creating media directory ${BUILD}"

mkdir -p "$BUILD"


# JAVASCRIPT
echo "  Javascript"
mkdir "$BUILD_JS"

echo "    Combining Javascript files"
cp  "$JS/VisualEvent_Loader.js"                                               "$BUILD_BASE/VisualEvent_Loader.js"
cat "$JS/jquery.js" "$JS/shCore.js" "$JS/VisualEvent.js" "$JS"/parsers/*.js > "$BUILD_JS/VisualEvent-jQuery.js"
cat                 "$JS/shCore.js" "$JS/VisualEvent.js" "$JS"/parsers/*.js > "$BUILD_JS/VisualEvent.js"

if [ "$DEBUG" != "debug" -a -e $UGLIFYJS ]; then
	echo "    Compressing Javascript"
	$UGLIFYJS $BUILD_BASE/VisualEvent_Loader.js > $BUILD_BASE/VisualEvent_Loader.min.js
	$UGLIFYJS $BUILD_JS/VisualEvent-jQuery.js   > $BUILD_JS/VisualEvent-jQuery.min.js
	$UGLIFYJS $BUILD_JS/VisualEvent.js          > $BUILD_JS/VisualEvent.min.js
	
	mv "$BUILD_BASE/VisualEvent_Loader.min.js" "$BUILD_BASE/VisualEvent_Loader.js"
	mv "$BUILD_JS/VisualEvent-jQuery.min.js"   "$BUILD_JS/VisualEvent-jQuery.js"
	mv "$BUILD_JS/VisualEvent.min.js"          "$BUILD_JS/VisualEvent.js"
fi

sed "s#__BUILD_URL__#//${SCRIPT_LOC}/${BUILD_DIR}#g" "$BUILD_BASE/VisualEvent_Loader.js" > "$BUILD_BASE/VisualEvent_Loader.tmp.js"
mv "$BUILD_BASE/VisualEvent_Loader.tmp.js" "$BUILD_BASE/VisualEvent_Loader.js"


# CSS
echo "  Combining CSS files"
mkdir "$BUILD_CSS"
cat "$CSS/VisualEvent.css" "$CSS/shCore.css" > "$BUILD_CSS/VisualEvent.css"


# Docs
if [ -e $JSDOC3 -a "$DEBUG" != "debug" ]; then
	echo "  Documentation"
	$JSDOC3 -d $BUILD_DOCS -t JSDoc-DataTables $JS/VisualEvent.js $JS/VisualEvent_Loader.js
fi

echo "Done :-)"
echo ""

