(function(window, document, VisualEvent){

function eventsFor(node) {
    var listener = node[Eventi._._key];
    if (listener) {
        var record = {
            node: node,
            listeners: []
        },
        cache = listener.s;
        for (var type in cache) {
            var handlers = cache[type];
            for (var i=0,m=handlers.length; i<m; i++) {
                var handler = handlers[i];
                record.listeners.push({
                    type: handler.text,
                    func: handler.fn.toString(),
                    removed: false,
                    source: 'Eventi'
                });
            }
        }
        if (record.listeners.length) {
            return record;
        }
    }
}

/*global Eventi*/
VisualEvent.parsers.push(function() {
    var list = [];
    if (typeof Eventi !== 'undefined') {
        var key = Eventi._._key,
            nodes = document.getElementsByTagName('*'),
            record;
        if ((record = eventsFor(window))) {
            list.push(record);
        }
        for (var i=0,m=nodes.length ; i<m ; i++ ) {
            if ((record = eventsFor(nodes[i]))) {
                list.push(record);
            }
        }
    }
    return list;
} );

})(window, document, VisualEvent);