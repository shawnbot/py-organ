"""
Organ is a collection of tools for "digesting" tabular data.
"""

VERSION = "0.4.2"

def templategetter(tmpl):
    """
    This is a dirty little template function generator that turns single-brace
    Mustache-style template strings into functions that interpolate dict keys:

    >>> get_name = templategetter("{first} {last}")
    >>> get_name({'first': 'Shawn', 'last': 'Allen'})
    'Shawn Allen'
    """
    tmpl = tmpl.replace('{', '%(')
    tmpl = tmpl.replace('}', ')s')
    return lambda data: tmpl % data

def sorter(expr):
    """
    This is a sorting function generator that takes an expression optionally
    prefixed with a "+" (ascending, the default) or "-" (descending) character.

    >>> sorted([{'a': 12}, {'a': 1}, {'a': 4}], sorter("+a"))
    [{'a': 1}, {'a': 4}, {'a': 12}]
    >>> sorted([{'a': 24}, {'a': 16}, {'a': 32}], sorter("-a"))
    [{'a': 32}, {'a': 24}, {'a': 16}]
    """
    order = ascending
    if not callable(expr):
        if ',' in expr:
            sorts = map(sorter, expr.split(','))
            return multisorter(*sorts)
        if expr[0] == '-':
            order = descending
            expr = expr[1:]
        elif expr[0] == '+':
            expr = expr[1:]
        expr = expression(expr)
    def _sort(a, b):
        return order(expr(a), expr(b))
    return _sort

def multisorter(*sorts):
    def _sort(aa, bb):
        for sort in sorts:
            order = sort(aa, bb)
            if order != 0:
                return order
        return 0
    return _sort

def ascending(aa, bb):
    return (aa > bb and 1 or (aa < bb and -1 or 0))

def descending(aa, bb):
    return (aa > bb and -1 or (aa < bb and 1 or 0))

def organize(data, key):
    """
    Iterate over a collection and group its values by the provided key
    function. If the key is not callable (a function), then we wrap it in
    templategetter(), so that you can simply do:

    >>> organize([{'foo': 1}, {'foo': 2}, {'foo': 1}], "{foo}")
    {'1': [{'foo': 1}, {'foo': 1}], '2': [{'foo': 2}]}
    """
    groups = {}
    if not callable(key):
        key = templategetter(key)
    for row in data:
        k = key(row)
        if groups.has_key(k):
            groups[k].append(row)
        else:
            groups[k] = [row]
    return groups

def expression(expr):
    """
    Returns a function that treats the keys of a dictionary as locals, and
    returns the expression, e.g.:

    >>> expression("foo")({'foo': 'bar'})
    'bar'
    >>> expression("bar + 1")({'bar': 2})
    3
    """
    if callable(expr):
        return expr

    if len(expr) == 0:
        return lambda d: None

    def _expr(data, **kwargs):
        context = locals()
        context.update(data)
        context.update(kwargs)
        return eval(expr, globals(), context)
    _expr.__doc__ = expr
    return _expr

def map_expression(expr):
    """
    Returns a function that maps a dict to a new dict with unique keys and
    values, kind of like a SQL SELECT clause, e.g.:

    >>> map_expression("foo=bar")({'bar': 1})
    {'foo': 1}
    >>> map_expression("foo=bar+1")({'bar': 1})
    {'foo': 2}
    """
    if callable(expr):
        return expr

    # first, split the string on commas to get key/value bits
    # XXX: should we allow people to escape commas here?
    # XXX: what's a good test case for commas in an expression?
    bits = expr.split(',')
    # then, split each bit on '=' to get the key and expression strings
    exprs = [
        (bit[0].strip(), len(bit) > 1 and bit[1].strip() or '')
        for bit in [bit.split('=') for bit in bits]
    ]
    # then, convert those into a dict where each key indicates an expression()
    keys = [
        (k[0], k[1] and expression(k[1]) or None)
        for k in exprs
    ]
    key_dict = dict(keys)
    def _expr(data, **kwargs):
        vals = {}
        for key, expr in key_dict.items():
            # the SQL * selects all keys
            if key == '*':
                vals.update(data)
                continue
            # and if there's no expression, just grab the named key
            elif not expr:
                vals[key] = data.get(key)
                continue
            # otherwise, execute the expression
            # XXX: this will throw an exception if the named key doesn't exist
            # in the data dict!
            else:
                vals[key] = expr(data, **kwargs)
        return vals
    _expr.__doc__ = expr
    _expr.keys = map(lambda k: k[0], keys)
    return _expr

