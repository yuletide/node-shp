node-shp
========

Node.js shapefile parser in pure JS

Thanks to:
[vanrijkom](http://code.google.com/p/vanrijkom-flashlibs/)
via [RandomEtc](https://github.com/RandomEtc/shapefile-js)


##What about shp2json?

Unlike substack's [shp2json](https://github.com/substack/shp2json), this library does not require [gdal](http://www.gdal.org/). Or anything other than `fs`.



Usage
===================
still in testing stages, working out what the final api will be. To run the rough demo:

	node index.js > test.geojson

   eventually...
   
   	var Shp = require('shp');
   	var shpJson = Shp.readSync('path/to/shpfile.* or .zip');
   	// or
   	var shpJson = Shp.read('path', function(error, data){
   	
   	})


###Sample Data
http://thematicmapping.org/downloads/world_borders.php CC-BY-SA 3.0
