(function(exports) {

  var iffy = exports;
  iffy.version = "0.1.0";

  iffy.fn = function(fn) {
    if (typeof fn === "function") {
      return fn;
    } else if (typeof fn !== "string") {
      return function() { return fn; };
    }

    var match = String(fn)
      .trim()
      .match(/^((f|fn|function)\(([^\)]+)\))?\s*(return\s)?(.+)$/);

    if (match) {
      var args = match[3],
          body = match[5];
      if (!args) {
        var d = args = "d",
            reserved = ["this", "true", "false"];
        // ignore functions
        body = body.replace(/(.)\b(\w+)\b(.)/g, function(str, prev, key, next) {
          return prev === "." || next === "(" || reserved.indexOf(key) > -1
            ? [prev, key, next].join("")
            : prev + [d, key].join(".") + next;
        });
      }
      return new Function(args, "return " + body + ";");
    } else {
      throw "Parse error";
    }
  };

})(typeof module === "undefined" ? this.iffy = {} : module.exports);
