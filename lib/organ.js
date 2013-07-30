module.exports = (function() {

  var organ = {
    version: "0.0.1"
  };

  var P = require("./properly").Properly;

  organ.collector = function(key) {
    if (!key) throw "Expected a key, got " + key;

    var o = {},
        vals = {},
        key = key.indexOf("{") > -1
          ? P.template(key)
          : P.getter(key);

    o.add = function(d) {
      var k = key(d);
      if (vals.hasOwnProperty(k)) {
        return vals[k].push(d);
      } else {
        vals[k] = [d];
        return 1;
      }
    };

    o.keys = function() {
      return Object.keys(vals);
    };

    o.values = function(k) {
      return vals[k] || [];
    };

    o.entries = function() {
      return Object.keys(vals).map(function(k) {
        return {key: k, values: vals[k]};
      });
    };

    return o;
  };

  return organ;
})();
