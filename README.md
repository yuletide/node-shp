node-shp
========

Node.js shapefile parser

Thanks to:
https://github.com/RandomEtc/shapefile-js
and 
http://code.google.com/p/vanrijkom-flashlibs/


What about shp2json?
====================
Unlike substack's awesome [shp2json](https://github.com/substack/shp2json), this library does not require [gdal](http://www.gdal.org/)


Usage
===================

   var shp = require('shp');
   var shpJson = shp.read('path/to/shpfile.zip');

Sample Data
====
http://thematicmapping.org/downloads/world_borders.php CC-BY-SA 3.0
