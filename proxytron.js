// @flow
"use strict";

/*::

// null if target is same name as source
type targetEvent = string | null;

// removes all proxying
type cleanupFunction = () => void;

type callback = (...args: any) => any;

type EventEmitter = {
  on(name: string, callback: callback): any,
  emit(name: string, ...args: any): any,
  removeListener(name: string, callback?: callback): any
}


type ProxySetup = {
  from: EventEmitter,
  to: EventEmitter, 
  events: {
    [sourceEvent: string]: targetEvent
  }, 
}

type ProxyAllSetup = {
  from: EventEmitter,
  to: EventEmitter, 
  rename: {
    [originalName: string]: targetEvent
  }, 
}

*/

module.exports = exports = proxy;

proxy.all = proxyAll;


function proxy(opts /*: ProxySetup */) /*: cleanupFunction */ {

  ensureProvidedEmitterPair(opts);
  if(!opts.events) opts.events = {};

  var events = clone(opts.events);

  var cleanup = [];
  for(var original in events) {
    var newEvent = events[original];
    cleanup.push(proxyOne(opts.from, opts.to, original, newEvent));
  }

  return function() {
    cleanup.forEach(function(f) {
      f(); 
    });
    cleanup = [];
  };
}

function proxyAll(opts /*: ProxyAllSetup */) /*: cleanupFunction */ {

  // we deproxy in softest possible way, not reassigning
  // the function again in case it was wrapped by another decorator etc
  var deproxied = false;

  ensureProvidedEmitterPair(opts);
  if(!opts.rename) opts.rename = {};

  var originalEmit = opts.from.emit;
  opts.from.emit = function(name) {
    var ret = originalEmit.apply(opts.from, arguments);

    if(!deproxied) {
      emit(opts.to, prepareName(name), slice(arguments, 1));
    }

    return ret;
  };

  return function() {
    deproxied = true;
  };

  function prepareName(name) {
    return opts.rename[name] || name;
  }
}

function proxyOne(from/*: EventEmitter */, to /*: EventEmitter */, originalName /*: string */, newName /*: ?targetEvent */) /*: cleanupFunction */ {
  newName = newName || originalName;

  from.on(originalName, proxied);

  return function off() {
    from.removeListener(originalName, proxied); 
  }

  function proxied() {
    emit(to, newName, arguments);
  }
}

// helpers
function ensureProvidedEmitterPair(o) {
  if(!o || !isEmitter(o.from) || !isEmitter(o.to)) {
    throw Error("proxy requires an options object with emitters as .from and .to");
  }

  function isEmitter(e) {
    return e && (typeof e.removeListener === "function");
  }
}



// generic helpers
function clone(o) {
  return assign(Object.create(null), o);
}

function assign(o, other) {
  for(var p in other) {
    o[p] = other[p];
  }
  return o;
}

function slice(x, from, to) {
  return [].slice.call(x, from, to); 
}

function emit(emitter /*: EventEmitter */, name /*: string */, args) {
  return emitter.emit.apply(emitter, [name].concat(slice(args)));
}
