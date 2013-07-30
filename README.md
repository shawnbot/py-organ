# organ
The Data Organizer.

Take some data in CSV form:

```
RegionType,State,Region,Population
City,CA,Oakland,395000
City,CA,San Francisco,812000
County,CA,Alameda,1530000
County,CA,San Francisco,812000
...
```

and organize it by different columns into separate files:

```
$ organize.js --key "{State}/{RegionType}.csv" regions.csv
```

Et voilà! Your data is organized into directories:

```
$ cat ??/*.csv
CA/City.csv
RegionType,State,Region,Population
City,CA,Oakland,395000
City,CA,San Francisco,812000

CA/County.csv
RegionType,State,Region,Population
County,CA,Alameda,1530000
County,CA,San Francisco,812000
```

## Usage

```
$ organize.js --key "{date}.csv" dates.csv
```

or:

```
$ organize.js --key "date" --filename "%.csv" dates.csv
```

You can filter with [iffy](http://github.com/shawnbot/iffy) expressions:


```
$ organize.js --filter 'f(d) d.State === "CA"' ...
```