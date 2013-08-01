#!/usr/bin/env python
import sys, os
import itertools, operator
import csv
import organ

def main(reader, **kwargs):
    key = kwargs.get('key')
    key_expr = kwargs.get('key_expr')

    if key_expr:
        key = organ.expression(key_expr)

    dialect = kwargs.get('dialect', 'excel')
    filter_expr = kwargs.get('filter_expr')
    map_expr = kwargs.get('map_expr')
    allow_empty = kwargs.get('allow_empty', False)
    filename_template = kwargs.get('filename', '%.csv')
    input_format = kwargs.get('input_format', 'csv')
    fieldnames = kwargs.get('fieldnames')
    readonly = kwargs.get('readonly', False)
    sort_keys = kwargs.get('sort_keys')
    sort_rows = kwargs.get('sort_rows')

    if filter_expr:
        expr = organ.expression(filter_expr)
        rows = itertools.ifilter(expr, reader)
    else:
        rows = reader

    if map_expr:
        map_expr = organ.map_expression(map_expr)
        fieldnames = map_expr.keys

    grouped = organ.organize(rows, key)
    keys = grouped.keys()
    items = map(lambda k: {'key': k, 'length': len(grouped[k])}, keys)

    if sort_keys:
        items.sort(organ.sorter(sort_keys))
        keys = map(operator.itemgetter('key'), items)

    for key in keys:
        values = grouped[key]
        if (not key or key == 'None') and not allow_empty:
            print >> sys.stderr, '(skipping empty key with %d rows)' % len(values)
            continue
        # print >> sys.stderr, "key '%s': %d rows" % (key, len(values))

        filename = filename_template % key
        print >> sys.stderr, '%d rows -> %s' % (len(values), filename)

        if readonly == True:
            continue

        dirname = os.path.dirname(filename)
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname)

        if map_expr:
            values = itertools.imap(map_expr, values)

        if sort_rows:
            values = sorted(values, organ.sorter(sort_rows))

        if not fieldnames:
            fieldnames = reader.fieldnames

        fp = open(filename, 'w')
        writer = csv.DictWriter(fp, fieldnames, dialect=dialect)
        writer.writeheader()
        writer.writerows(values)
        fp.close()

if __name__ == '__main__':
    import optparse

    usage = """
    %prog [options] (--key | -k) <KEY> [<CSV>]
    %prog [options] (--key-expr | -K) <KEY EXPRESSION> [<CSV>]

%prog takes a single CSV filename (or reads CSV from stdin) and runs a
"key function" on each row to generate a filesystem path to which the row
should be written. Some examples:

Organize a CSV file with Year, Month and Date columns into nested
subdirectories of CSV data:

    %prog --key "{Year}/{Month}/{Date}" path/to/dates.csv

Classify geographic statistics, e.g. in a table that contains rows for
states, cities and zip codes:

    %prog --filter "Region == 'State'"  --key "states/{State}"
    %prog --filter "Region == 'City'"   --key "states/{State}/cities"
    %prog --filter "Region == 'Zip'"    --key "states/{State}/cities/{City}/zips"

    """.rstrip()

    parser = optparse.OptionParser(usage=usage)

    parser.add_option('--key', '-k', dest='key', help="""
The key template string, with interpolated keys wrapped in {}, e.g. "states/{State}"
    """.strip())

    parser.add_option('--key-expr', '-K', dest='key_expr', help="""
Alternatively, you can provide a key expression, which is evaluated as Python
code with the row's keys as local variables, e.g. "State[0:2].upper()"
    """.strip())

    parser.add_option('--filename', '-f', dest='filename', default='%s.csv', help="""
The format of the output filename for each unique key's values. This should be
an Python formatting string in which %s is replaced with the key, e.g. "%s.txt"
(default: "%s.csv")
    """.strip())

    parser.add_option('--dialect', '-d', dest='dialect', default='excel', help="""
The CSV dialect used to read and write data files, per Python's csv module
(default: "excel")
    """.strip())

    parser.add_option('--filter', '-F',dest='filter_expr', help="""
An optional Python expression by which to filter input data, evaluated with
each row's keys as local variables, e.g. "DayOfWeek == 'Monday'"
    """.strip())

    parser.add_option('--map', '-m', dest='map_expr', help="""
An expression describing which keys to write to the output and, for each, an
optional expression to evaluate. This is like a SQL SELECT clause, except with
"=" instead of the "AS" keyword: "foo=Foo" lowercases the "Foo" column and
excludes other columns; "*,date=DateTime[0:10]" copies all columns and creates
a new "date" column containing the first 10 chars of the "DateTime" column.
    """.strip())

    parser.add_option('--empty', '-e', dest='allow_empty', action='store_true', help="""
By default we discard rows for which the key expression evaluates to an empty value.
Setting this flag forces the inclusion of empty keys, which will likely produce
unusual filenames (".csv").
    """.strip())

    parser.add_option('--readonly', '-r', dest='readonly', action='store_true', help="""
Don't write any files; just report the filenames and the number of rows that
would be written to each.
    """.strip())

    parser.add_option('--sort', '-s', dest='sort_rows', help="""
Sort rows in the output by an expression with optional "-" (descending) or "+"
(ascending, the default) order. Like --filter, the rest of the expression is
evaluated with the row's keys as local variables.
    """.strip())

    parser.add_option('--sort-keys', '-S', dest='sort_keys', default=None, help="""
Sort the output keys, either by key ("+key", "-key") or size ("+length",
"-length"). This affects only the order in which data files are written (and
reported), not their contents.
    """.strip())

    options, args = parser.parse_args()

    if not options.key and not options.key_expr:
        parser.print_help()
        sys.exit(1)

    input_handle = sys.stdin
    output_handle = sys.stdout

    if len(args) > 0:
        input_handle = open(args[0], 'rU')
        if len(args) > 1:
            output_handle = open(args[1], 'w')

    reader = csv.DictReader(input_handle, dialect=options.dialect)
    main(reader, **{
        'key':          options.key,
        'key_expr':     options.key_expr,
        'dialect':      options.dialect,
        'filename':     options.filename,
        'filter_expr':  options.filter_expr,
        'map_expr':     options.map_expr,
        'allow_empty':  options.allow_empty,
        'readonly':     options.readonly,
        'sort_rows':    options.sort_rows,
        'sort_keys':    options.sort_keys,
    })
