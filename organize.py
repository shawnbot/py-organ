#!/usr/bin/env python
import sys
import itertools
from organ import templategetter, organize, iffy

def main(args, key=None, filter_expr=None, filename_template=None, dialect="excel", allow_empty=False):
    if len(args) > 0:
        reader = csv.DictReader(open(args[0], 'r'), dialect=dialect)
    else:
        reader = csv.DictReader(sys.stdin, dialect=dialect)

    if filter_expr:
        expr = iffy(filter_expr)
        rows = itertools.ifilter(expr, reader)
    else:
        rows = reader

    grouped = organize(rows, key)
    for key in grouped.keys():
        values = grouped.get(key)
        if (not key or key == 'None') and not allow_empty:
            print >> sys.stderr, "(skipping empty key with %d rows)" % len(values)
            continue
        # print >> sys.stderr, "key '%s': %d rows" % (key, len(values))

        filename = filename_template % key
        print >> sys.stderr, "Writing %d rows to %s..." % (len(values), filename)

        dirname = os.path.dirname(filename)
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname)

        fp = open(filename, 'w')
        writer = csv.DictWriter(fp, reader.fieldnames, dialect=dialect)
        writer.writeheader()
        writer.writerows(values)
        fp.close()

if __name__ == '__main__':
    import os
    import itertools
    import optparse
    import csv

    parser = optparse.OptionParser(usage="%prog [options] --key <KEY> <CSV>")
    parser.add_option('--key',      '-k',   dest="key")
    parser.add_option('--filename', '-f',   dest="filename_template", default="%s.csv")
    parser.add_option('--dialect',  '-d',   dest="dialect", default="excel")
    parser.add_option('--filter',   '-F',   dest="filter_expr")
    parser.add_option('--empty',    '-e',   dest="allow_empty", action="store_true")
    options, args = parser.parse_args()

    if not options.key:
        parser.print_help()
        sys.exit(1)

    options = {
        'key': options.key,
        'filename_template': options.filename_template,
        'filter_expr': options.filter_expr,
        'dialect': options.dialect,
        'allow_empty': options.allow_empty
    }
    main(args, **options)
