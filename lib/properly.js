/*
 * Properly v0.1.1
 */
(function(exports) {

exports.Properly = (function() {
    /**
     * Properly(prop) returns an object with get(), set() and rem() methods that
     * correspond to Properly.getter(prop), Properly.setter(prop), and
     * Properly.remover(prop).
     *
     * This function works with and without the new keyword, so you can use it
     * like a class if you like:
     *
     * var p1 = Properly("name");
     * var p2 = new Properly("name");
     */
    var Properly = function(prop) {
        if (this instanceof Properly) {
            this.get = Properly.getter(prop);
            this.set = Properly.setter(prop);
            this.rem = Properly.remover(prop);
        } else {
            return {
                get: Properly.getter(prop),
                set: Properly.setter(prop),
                rem: Properly.remover(prop)
            };
        }
    };

    /**
     * Create a function that gets the named property from the function's first
     * argument.
     *
     * var getName = Properly.getter("name"),
     *     user = {name: "Joe"};
     * console.log(getName(user)); // "Joe"
     */
    Properly.getter = function(prop) {
        var fields = Properly.parseFieldNames(prop),
            len = fields.length;
        if (len > 1) {
            return function(d) {
                for (var i = 0; i < len; i++) {
                    var field = fields[i];
                    d = d[field];
                }
                return d;
            };
        } else {
            return function(d) {
                return d[prop];
            };
        }
    };

    // shorthand for Properly.getter(prop)(obj, value);
    Properly.get = function(obj, prop) {
        return Properly.getter(prop).call(null, obj);
    };

    /**
     * Create a function that gets multiple properties of an object as an array.
     * `propOrProps` can be an Array of property names; otherwise, property
     * names may be specified as multiple arguments. These are equivalent:
     *
     * Properly.multigetter("foo", "bar");
     * Properly.multigetter(["foo", "bar"]);
     */
    Properly.multigetter = function(propOrProps) {
        var fields = (propOrProps instanceof Array)
            ? propOrProps
            : _slice(arguments);
        var getters = fields.map(Properly.getter);
        return function(d) {
            return getters.map(function(get) {
                return get(d);
            });
        };
    };

    // shorthand for Properly.multigetter(prop)(obj);
    Properly.multiget = function(obj, propOrProps) {
        return Properly.multigetter.apply(null, _slice(arguments, 1))
            .call(null, obj);
    };

    /**
     * Create a function that sets the named Properly on the function's first
     * argument to the second value:
     *
     * var setter = Properly.setter("name"),
     *     user = {name: "Joe"};
     * setter(user, "Bill");
     * console.log(user.name); // "Bill"
     */
    Properly.setter = function(prop) {
        var fields = Properly.parseFieldTypes(prop),
            len = fields.length;
        if (len > 1) {
            return function(d, value) {
                for (var i = 0; i < len; i++) {
                    var field = fields[i];
                    if (field.type) {
                        d = d[field.name] || (d[field.name] = new field.type);
                    } else if (d instanceof Array && field.name === "") {
                        d.push(value);
                    } else {
                        d[field.name] = value;
                    }
                }
                return d;
            };
        } else {
            return function(d, value) {
                return d[prop] = value;
            };
        }
    };

    // shorthand for Properly.setter(prop)(obj, value);
    Properly.set = function(obj, prop, value) {
        return Properly.setter(prop).call(null, obj, value);
    };

    /**
     * Create a function that sets multiple properties on an object, specified
     * as a dictionary of key/value pairs:
     *
     * var blah = {foo: },
     *     set = Properly.multisetter({foo: 0, bar: 1});
     * set(blah);
     * console.log(blah.foo, blah.bar); // 0, 1
     */
    Properly.multisetter = function(keyValues) {
        var items = [];
        for (var key in keyValues) {
            items.push({
                set: Properly.setter(key),
                value: keyValues[key]
            });
        }
        return function(d) {
            return items.map(function(item) {
                return item.set(d, item.value);
            });
        };
    };

    // shorthand for Properly.multisetter(keyValues)(obj);
    Properly.multiset = function(obj, keyValues) {
        return Properly.multisetter(keyValues).call(null, obj);
    };

    /**
     * Create a function that deletes the named property from the object
     * provided as the first argument.
     *
     * var removeFoo = Properly.remove("foo"),
     *     stuff = {foo: "foo", bar: "bar"};
     * removeFoo(stuff);
     * console.log(stuff.foo); // undefined
     */
    Properly.remover = function(prop) {
        var fields = Properly.parseFieldNames(prop),
            len = fields.length;
        if (len > 1) {
            return function(d, value) {
                for (var i = 0; i < len; i++) {
                    var field = fields[i];
                    if (i === len - 1) {
                        delete d[field];
                    } else {
                        d = d[field];
                        // break if we can't get that far down
                        if (typeof d === "undefined") break;
                    }
                }
            };
        } else {
            return function(d) {
                delete d[prop];
            };
        }
    };

    // shorthand for Properly.remover(prop)(obj);
    Properly.remove = function(obj, prop) {
        return Properly.remover(prop).call(null, obj);
    };

    /**
     * Create a function that removes multiple named properties from the object
     * provided as its first argument.
     */
    Properly.multiremover = function(propOrProps) {
        var fields = (propOrProps instanceof Array)
            ? propOrProps
            : _slice(arguments);
        var len = fields.length;
        return function(d) {
            for (var i = 0; i < len; i++) {
                Properly.remove(obj, fields[i]);
            }
        };
    };

    // shorthand for Properly.multiremover(props)(obj);
    Properly.multiremove = function(obj, props) {
        return Properly.multiremover(props).call(null, obj);
    };

    /**
     * Creates an object with get(), set() and rem() functions that get, set and
     * remove properties on the provided object.
     */
    Properly.wrap = function(obj) {
        return {
            get: function(prop) {
                return Properly.get(obj, prop);
            },
            set: function(prop, value) {
                return Properly.set(obj, prop, value);
            },
            rem: function(prop) {
                return Properly.remove(obj, prop);
            }
        };
    };

    /**
     * Creates an object with get(), set() and rem() functions that get, set and
     * remove the named property on the provided object.
     */
    Properly.wrap.prop = function(obj, prop) {
        var p = Properly(prop);
        return {
            get: function() {
                return p.get(obj);
            },
            set: function(value) {
                return p.set(obj, value);
            },
            rem: function() {
                 return p.rem(obj);
            }
        };
    };

    /**
     * Create a function that formats an object's properties using the
     * Mustache-style string template.
     *
     * var user = {name: {first: "Joe", last: "Plumber"}},
     *     tmpl = Properly.template("{first} the {last}");
     * console.log(tmpl(user)); // "Joe the Plumber"
     */
    Properly.template = function(tmpl) {
        return function(d) {
            return tmpl.replace(/{([^}]+)}/g, function(match, prop) {
                return Properly.get(d, prop);
            });
        };
    };

    /**
     * Parse a named property into an array of field names (for getting).
     */
    Properly.parseFieldNames = function(prop) {
        return Properly.parseFieldTypes(prop).map(function(type) {
            return type.name;
        });
    };

    /**
     * Parse a named property into an array of field name and type, used in deep
     * setters.
     *
     * TODO: document?
     */
    Properly.parseFieldTypes = function(prop) {
        var fields = [],
            field = {name: ""};

        function pushField() {
            if (fields.length && fields[fields.length - 1].type === Array) {
                var index = parseInt(field.name);
                if (!isNaN(index)) {
                    field.name = index;
                }
            }
            fields.push(field);
            field = {name: ""};
        }

        while (prop.length) {
            var chr = prop.charAt(0);
            prop = prop.substr(1);
            if (chr === ".") {
                field.type = Object;
            } else if (chr === "[") {
                field.type = Array;
            } else if (chr === "]") {
                if (prop.length) {
                    var next = prop.charAt(0);
                    switch (next) {
                        case ".": field.type = Object; break;
                        case "[": field.type = Array; break;
                        default:
                            throw "Expected '.' or '[' after ']'; got '" + next + "'";
                    }
                }
                chr = "";
                prop = prop.substr(1);
            }

            if (field.type) {
                pushField();
            } else {
                field.name += chr;
            }
        }
        pushField();
        return fields;
    };

    return Properly;
})();

function _slice(a, b, c) {
    return Array.prototype.slice.call(a, b, c);
}

function _map(a, b) {
    return Array.prototype.map.call(a, b);
}

})(typeof module === "undefined" ? this : module.exports);
