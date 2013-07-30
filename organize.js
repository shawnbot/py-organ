#!/usr/bin/env node
var async = require("async"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    path = require("path"),
    csv = require("csv"),
    argv = require("optimist")
      .describe("filename", "the filename template")
        .default("filename", "%.csv")
      .describe("key", "the key to organize by")
        .demand("key")
      .describe("filter", "expression by which to filter rows")
        .default("filter", "true")
      .argv,
    argc = argv._,
    organ = require("./lib/organ"),
    iffy = require("./lib/iffy");

var collector = organ.collector(argv.key),
    filter = iffy.fn(argv.filter);

var keys,
    inOptions = {
      header: true,
      columns: true
    },
    outOptions = {
      header: true,
      columns: null
    };

var stream = csv()
  .from(argc.length ? argc[0] : process.stdin, inOptions)
  .transform(function(d) {
    if (filter(d)) {
      // this is so stupid.
      if (!keys) {
        keys = outOptions.columns = Object.keys(d);
      }
      collector.add(d);
      return d;
    }
  })
  .on("end", function() {
    var files = collector.entries()
          .map(function(f) {
            f.filename = argv.filename.replace("%", f.key);
            return f;
          })
          .sort(function(a, b) {
            return a.key > b.key ? 1 : a.key < b.key ? -1 : 0;
          }),
        tasks = files.map(function(f) {
          return function(done) {
            var dest = f.filename,
                dirname = path.dirname(dest),
                filename = path.basename(dest);
            console.log("writing %s (%d rows)", dest, f.values.length);

            mkdirp(dirname);

            var out = csv()
              .from.array(f.values)
              .transform(function(d) {
                console.log("+", dest, d);
                return d;
              })
              .to(dest, outOptions)
              .on("end", done);
            return dest;
          };
        });

    console.log("files:");
    files.forEach(function(f, i) {
      console.log("%d. %s (%d rows)", i + 1, f.filename, f.values.length);
    });

    async.parallel(tasks, function() {
      console.log("wrote %d files.", arguments.length);
    });

  });
