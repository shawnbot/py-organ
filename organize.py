#!/usr/bin/env python
import sys
import itertools
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
    filename_template = kwargs.get('filename_template', '%.csv')
    input_format = kwargs.get('input_format', 'csv')
    fieldnames = kwargs.get('fieldnames')

    if filter_expr:
        expr = organ.expression(filter_expr)
        rows = itertools.ifilter(expr, reader)
    else:
        rows = reader

    if map_expr:
        map_expr = organ.map_expression(map_expr)
        fieldnames = map_expr.keys

    # XXX: this does not produce a generator
    grouped = organ.organize(rows, key)
    for key in grouped.keys():
        values = grouped.get(key)
        if (not key or key == 'None') and not allow_empty:
            print >> sys.stderr, '(skipping empty key with %d rows)' % len(values)
            continue
        # print >> sys.stderr, "key '%s': %d rows" % (key, len(values))

        filename = filename_template % key
        print >> sys.stderr, 'Writing %d rows to %s...' % (len(values), filename)

        dirname = os.path.dirname(filename)
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname)

        if map_expr:
            values = itertools.imap(map_expr, values)

        if not fieldnames:
            fieldnames = reader.fieldnames

        fp = open(filename, 'w')
        writer = csv.DictWriter(fp, fieldnames, dialect=dialect)
        writer.writeheader()
        writer.writerows(values)
        fp.close()

if __name__ == '__main__':
    import os
    import itertools
    import optparse
    import csv

    usage = """
    %prog [options] [--key <KEY> | --key-expr <EXPR>] <CSV>
    """.strip()

    parser = optparse.OptionParser(usage=usage)
    parser.add_option('--key',      '-k',   dest='key')
    parser.add_option('--key-expr', '-K',   dest='key_expr')
    parser.add_option('--filename', '-f',   dest='filename_template', default='%s.csv')
    parser.add_option('--dialect',  '-d',   dest='dialect', default='excel')
    parser.add_option('--filter',   '-F',   dest='filter_expr')
    parser.add_option('--map',      '-m',   dest='map_expr')
    parser.add_option('--empty',    '-e',   dest='allow_empty', action='store_true')
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
        'key':                  options.key,
        'key_expr':             options.key_expr,
        'dialect':              options.dialect,
        'filename_template':    options.filename_template,
        'filter_expr':          options.filter_expr,
        'map_expr':             options.map_expr,
        'out_dialect':          options.dialect,
        'allow_empty':          options.allow_empty
    })
