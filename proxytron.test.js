var EventEmitter = require("events").EventEmitter;
var proxy = require("./proxytron");
var assert = require("chai").assert;

describe('poxy-proxy', function() {
  var self = this;

  self.timeout(25);

  beforeEach(setup);

  describe('API saftey', function() {

    it('validates arguments are vaugely event emitter ish', function() {
      assert.throws(function() {
        proxy();
      })
    })

    it("does nothing if no events are provided", function() {
      proxy({
        from: self.one,
        to: self.two,
      });

      self.one.emit("A");
    })
      
  })

  describe('many events', function() {
    it('uses original name for null or undefined', function(done) {
      proxy({
        from: self.one,
        to: self.two,
        events: {
          "A": null,
          "B": undefined,
        }
      });

      self.two.on("A", function() {
        self.one.emit("B");
      });

      self.two.on("B", done);
      self.one.emit("A");
    })

    it('passed event arguments', function(done) {
      proxy({
        from: self.one,
        to: self.two,
        events: {
          "A": null,
        },
      });

      self.two.on("A", function(a, b, c, d) {
        assert.equal(a, 1); 
        assert.isNull(b);
        assert.isUndefined(c);
        assert.equal(d, 4);
        done();
      })

      self.one.emit("A", 1, null, undefined, 4);
    });

    it('uses new names where provide', function(done) {
      proxy({
        from: self.one,
        to: self.two,
        events: {
          "A": "renamed",
        }
      });

      self.two.on("A", function() {
        done(Error("incorrectly renamed")); 
      })
      self.two.on("renamed", done);
      self.one.emit("A");
    })

    it('deproxies all events', function(done) {
      var off = proxy({
        from: self.one,
        to: self.two,
        events: {
          "A": null,
          "B": null,
        }
      });

      self.two.on("A", function() {
        done(Error("should not have heard"));
      })
      self.two.on("B", function() {
        done(Error("should not have heard"));
      })

      off();

      self.one.emit("A");
      self.one.emit("B");

      // ensure whatever mechanism we use to schedule, we have no heard
      // anything
      setTimeout(done, 15);
    })
  })

  describe('all events', function() {
    it('proxies all events', function(done) {
      proxy.all({
        from: self.one,
        to: self.two,
      });

      self.two.on("A", function() {
        self.one.emit("B");
      });

      self.two.on("B", done);
      self.one.emit("A");
    })

    it('uses new names where provided', function(done) {
      proxy.all({
        from: self.one,
        to: self.two,
        rename: {
          "A": "renamed",
        },
      });

      self.two.on("renamed", done);
      self.one.emit("A");
    })

    it('deproxies all events', function(done) {
      var off = proxy.all({
        from: self.one,
        to: self.two,
        rename: {
          "A": "renamed",
        },
      });

      self.two.on("A", function() {
        done(Error("should have been renamed!"));
      })
      self.two.on("renamed", function() {
        done(Error("should not have heard"));
      })
      self.two.on("B", function() {
        done(Error("should not have heard"));
      })

      off();

      self.one.emit("A");
      self.one.emit("B");

      // ensure whatever mechanism we use to schedule, we have no heard
      // anything
      setTimeout(done, 15);
    })
  })


  function setup() {
    self.one = new EventEmitter; 
    self.two = new EventEmitter; 
    self.three = new EventEmitter; 
  }
  
    
})
