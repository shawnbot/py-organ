# Organ

Organ is a tabular data digester and organizer. To install the command-line

## csvfilter
A tool for performing map and filter operations on CSV data:

```
Usage: csvfilter [options] [--filter <FILTER>] [--map <MAP>] [<CSV>]

Options:
  -h, --help            show this help message and exit
  -F FILTER_EXPR, --filter=FILTER_EXPR
                        An optional Python expression by which to filter input
                        data, evaluated with each row's keys as local
                        variables, e.g. "DayOfWeek == 'Monday'"
  -m MAP_EXPR, --map=MAP_EXPR
                        An expression describing which keys to write to the
                        output and, for each, an optional expression to
                        evaluate. This is like a SQL SELECT clause, except
                        with "=" instead of the "AS" keyword: "foo=Foo"
                        lowercases the "Foo" column and excludes other
                        columns; "*,date=DateTime[0:10]" copies all columns
                        and creates a new "date" column containing the first
                        10 chars of the "DateTime" column.
  -d DIALECT, --dialect=DIALECT
                        The CSV dialect used to read and write data files, per
                        Python's csv module (default: "excel")
```

## csvorganize

```
Usage: 
    csvorganize [options] (--key | -k) <KEY> [<CSV>]
    csvorganize [options] (--key-expr | -K) <KEY EXPRESSION> [<CSV>]

csvorganize takes a single CSV filename (or reads CSV from stdin) and runs a
"key function" on each row to generate a filesystem path to which the row
should be written, grouping rows with the same "key" into smaller collections.
Some examples:

Organize a CSV file with Year, Month and Date columns into nested
subdirectories of CSV data:

    csvorganize --key "{Year}/{Month}/{Date}" path/to/dates.csv

Classify geographic statistics, e.g. in a table that contains rows for
states, cities and zip codes:

    csvorganize --filter "Region == 'State'"  --key "states/{State}"
    csvorganize --filter "Region == 'City'"   --key "states/{State}/cities"
    csvorganize --filter "Region == 'Zip'"    --key "states/{State}/cities/{City}/zips"

Options:
  -h, --help            show this help message and exit
  -k KEY, --key=KEY     The key template string, with interpolated keys
                        wrapped in {}, e.g. "states/{State}"
  -K KEY_EXPR, --key-expr=KEY_EXPR
                        Alternatively, you can provide a key expression, which
                        is evaluated as Python code with the row's keys as
                        local variables, e.g. "State[0:2].upper()"
  -f FILENAME, --filename=FILENAME
                        The format of the output filename for each unique
                        key's values. This should be an Python formatting
                        string in which %s is replaced with the key, e.g.
                        "%s.txt" (default: "%s.csv")
  -d DIALECT, --dialect=DIALECT
                        The CSV dialect used to read and write data files, per
                        Python's csv module (default: "excel")
  -F FILTER_EXPR, --filter=FILTER_EXPR
                        An optional Python expression by which to filter input
                        data, evaluated with each row's keys as local
                        variables, e.g. "DayOfWeek == 'Monday'"
  -m MAP_EXPR, --map=MAP_EXPR
                        An expression describing which keys to write to the
                        output and, for each, an optional expression to
                        evaluate. This is like a SQL SELECT clause, except
                        with "=" instead of the "AS" keyword: "foo=Foo"
                        lowercases the "Foo" column and excludes other
                        columns; "*,date=DateTime[0:10]" copies all columns
                        and creates a new "date" column containing the first
                        10 chars of the "DateTime" column.
  -e, --empty           By default we discard rows for which the key
                        expression evaluates to an empty value. Setting this
                        flag forces the inclusion of empty keys, which will
                        likely produce unusual filenames (".csv").
  -r, --readonly        Don't write any files; just report the filenames and
                        the number of rows that would be written to each.
  -s SORT_ROWS, --sort=SORT_ROWS
                        Sort rows in the output by an expression with optional
                        "-" (descending) or "+" (ascending, the default)
                        order. Like --filter, the rest of the expression is
                        evaluated with the row's keys as local variables.
  -S SORT_KEYS, --sort-keys=SORT_KEYS
                        Sort the output keys, either by key ("+key", "-key")
                        or size ("+length", "-length"). This affects only the
                        order in which data files are written (and reported),
                        not their contents.
```

## `import organ`
The `organ` module provides a bunch of useful functions for working with data:

### `organ.expression(str)`
Converts a Python expression into a function that can be called on a dict
and evaluated with its keys as local variables. For example:

```
>>> test = organ.expression("foo > 1")
>>> test({'foo': 0})
False
>>> test({'foo': 2})
True
```

Organ expressions are really useful with `filter()` and `map()`. Think of them
as a more powerful version of `operator.itemgetter()`.

### `organ.map_expression(str)`
Organ's map expressions are kind of like a SQL SELECT clause in Python. You
provide a string in the format:

`key [ = expression] [, key [ = expression]] +`

That is, one or more `key` and optional `=expression` clauses, separated by
commas. (Whitespace is ignored around keys and expressions.) For example:

```
>>> transform = organ.map_expression("foo = bar + 1")
>>> transform({'bar': 2})
{'foo': 3}
>>> transform = organ.map_expression("state = State[0:2], country = 'US'")
>>> transform({'State': 'California'})
{'state': 'CA', 'country': 'US'}
```

Organ map expressions are, obviously, pretty useful with `map()`.


### `organ.templategetter(str)`
The templategetter function acts kind of like a Mustache template, but
treats single curly braces as placeholders. So:

```
>>> full_name = organ.templategetter("{first} {last}")
>>> full_name({'first': 'Joe', 'last': 'Blow'})
'Joe Blow'
```

### `organ.sorter(str)`
Organ's sorter() generator takes an expression()-compatible string,
optionally prefixed with a `+` (ascending, default) or `-` (descending)
to define the sort order, and returns a sorting function that evaluates
the expression for two values. So:

```
>>> sorter = organ.sorter("+last")
>>> sorted([{'last': 'Zeldman'}, {'last': 'Allen'}], sorter)
[
  {'last': 'Allen'},
  {'last': 'Zeldman'}
]
```

### `organ.ascending(a, b)`
Returns `1` if `a > b`, `-1` if `a < b`, otherwise `0`.

### `organ.descending(a, b)`
Returns `-1` if `a > b`, `1` if `a < b`, otherwise `0`.
