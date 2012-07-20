
(function(window, document, $, VisualEvent) {

  function dumpListeners(event) {
    var listeners = [];

    for (var eventType in event) {
      var handlers = event[eventType];

      for (var i = 0, len = handlers.length; i < len; i++) {
        listeners.push({
          "type": eventType,
          "func": handlers[i].handler.toString(),
          "removed": false,
          "source": 'Prototype 1.7+'
        });
      }
    }

    return listeners;
  }

  VisualEvent.parsers.push(function() {
    if (typeof Prototype == 'undefined') {
      return [];
    }

    var elements = [], event;

    for (var e in Event.cache) {
      event = Event.cache[e];
      elements.push({
        "node": event.element,
        "listeners": dumpListeners(event)
      });
    }

    return elements;
  });

})(window, document, jQuery, VisualEvent);
