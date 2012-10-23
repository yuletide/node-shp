node-shp
========

Node.js shapefile parser in pure JS

Thanks to:
https://github.com/RandomEtc/shapefile-js
and 
http://code.google.com/p/vanrijkom-flashlibs/


What about shp2json?
====================
Unlike substack's great [shp2json](https://github.com/substack/shp2json), this library does not require [gdal](http://www.gdal.org/)


Usage
===================
   still in testing stages, working out what the final api will be. To run the test case:
        node index.js > test.geojson

   eventually...
   var shp = require('shp');
   var shpJson = shp.read('path/to/shpfile.* or .zip');

Sample Data
====
http://thematicmapping.org/downloads/world_borders.php CC-BY-SA 3.0
