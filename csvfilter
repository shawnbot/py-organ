#!/usr/bin/env python
import sys, os
import itertools, operator
import csv
import organ

if __name__ == '__main__':
    import optparse
    
    usage = """
    %prog [options] [--filter <FILTER>] [--map <MAP>] [<CSV>]
    """.strip()

    parser = optparse.OptionParser(usage=usage)

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

    parser.add_option('--dialect', '-d', dest='dialect', default='excel', help="""
The CSV dialect used to read and write data files, per Python's csv module
(default: "excel")
    """.strip())

    options, args = parser.parse_args()

    input_handle = sys.stdin
    output_handle = sys.stdout

    if len(args) > 0:
        input_handle = open(args[0], 'rU')
        if len(args) > 1:
            output_handle = open(args[1], 'w')

    reader = csv.DictReader(input_handle, dialect=options.dialect)
    fieldnames = reader.fieldnames

    rows = reader

    if options.filter_expr:
        filter_expr = organ.expression(options.filter_expr)
        rows = itertools.ifilter(filter_expr, rows)

    if options.map_expr:
        map_expr = organ.map_expression(options.map_expr)
        fieldnames = map_expr.keys
        rows = itertools.imap(map_expr, rows)

    writer = csv.DictWriter(output_handle, fieldnames, dialect=options.dialect)
    writer.writeheader()
    writer.writerows(rows)
