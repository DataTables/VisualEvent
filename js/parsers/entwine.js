/**
 * Visual Event parser for jquery.entwine
 * @author Luke Hudson <github@speak.geek.nz>
 */
/* global jQuery, VisualEvent */
"use strict";

(function(window, document, $, VE) {

    function entwineParser() {
        if (!jQuery || !jQuery.fn.entwine) {
            return [];
        }

        var out = [];

        for(var namespace in jQuery.entwine.namespaces) {
            if (!jQuery.entwine.namespaces.hasOwnProperty(namespace)) {
                continue;
            }

            var store = jQuery.entwine.namespaces[namespace].store;

            for(var key in store) {

                if (!store.hasOwnProperty(key)) {
                    continue;
                }

                // only look for events, entwine allows other functions too.
                if (!key.match(/^on/)) {
                    continue;
                }

                var eventName = key.replace(/^on/, '');

                for(var i=0; i < store[key].length; i++) {
                    var binding = store[key][i];

                    if (typeof binding !== 'object' || !binding.selector) {
                        continue;
                    }

                    var nodes = $(binding.selector.selector);

                    for (var j = 0; j < nodes.length; j++) {
                        out.push({
                            node: nodes[j],
                            listeners: [{
                                type: eventName,
                                func: binding.func.toString(),
                                removed: false,
                                source: "jquery.entwine"
                            }]
                        });
                    } // end node loop
                } // end store[key] contents loop
            } // end store keys loop
        }
        return out;
    }

    VE.parsers.push(entwineParser);
})(window, document, jQuery, VisualEvent);
