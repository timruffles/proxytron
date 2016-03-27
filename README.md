# Proxytron

[![Build Status](https://travis-ci.org/timruffles/proxytron.svg?branch=master)](https://travis-ci.org/timruffles/proxytron)
[![Latest Stable Version](https://img.shields.io/npm/v/proxytron.svg)](https://www.npmjs.com/package/proxytron)
[![Test Coverage](https://img.shields.io/codecov/c/github/timruffles/proxytron/master.svg)](https://codecov.io/github/timruffles/proxytron?branch=master)

`proxytron` provides proxying between NodeJS `EventEmitter`s. Zero dependencies, ES5+, browser support via browserify or EventEmitter shim.

### Goals

- reliability - the library has 100% statement/branch coverage + type checking via flow
- API readability - proxying needs to be clear as it's potentially confusing

## Example

```js
// es6 example, proxytron works fine in es5 (or browser via browserify)
const proxy = require("proxytron");
const EventEmitter = require("events").EventEmitter;

const one = new EventEmitter;
const two = new EventEmitter;

// proxy API emphasises explicitness, so it's clear
// where events are proxied from and where they're going
const deproxy = proxy.all({
  from: one,
  to: two,
});

two.on("A", function(message) {
  console.log("heard A proxied with message '" + message  + "'");
});

one.emit("A", "proxied");

deproxy();

// this will not cause an event to be emitted from two as we've deproxied
one.emit("A", "again");
```

## Installation

```sh
npm install --save proxytron
```

## API

#### `proxy({ from: EventEmitter, to: EventEmitter, events: { [sourceEvent: string]: targetEvent }}): deproxyFunction`

Proxies all events in the `events` object that are emitted on `from`. They will be re-emitted with all
arguments on the emitter `to`.

Provide `null` or `undefined` as the `targetEvent` to reuse the original event name, or provide a string
to rename the event that will be emitted from `to`.

Call the returned `deproxyFunction` to stop proxying.

#### `proxy.all({ from: EventEmitter, to: EventEmitter, rename: { [sourceEvent: string]: targetEvent }}): deproxyFunction`

Proxies all events emitted by `from`, meaning they will be re-emitted with all arguments on the emitter `to`.

Provide a string as the `targetEvent` in rename to rename event that will be emitted from `to`.

Call the returned `deproxyFunction` to stop proxying.

## Contributing

Contributors welcome! Open up a PR and I'll make you a contributor.

Look at the `package.json` for how to run tests/typechecks etc.
