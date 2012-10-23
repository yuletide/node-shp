var Dbf = require(__dirname + '/lib/dbf'),
    Shp = require(__dirname + '/lib/shp');
/** getOpenLayersFeatures
 * @param {String} url - the base url for the shapefile, without extensions
 * @param {Function} callback Called with an array of OpenLayers.Feature.Vector for the given URL
 */


getFeatures("/Users/ayule/code/node-shp/demo/TM_WORLD_BORDERS_SIMPL/TM_WORLD_BORDERS_SIMPL-0.3", function(err, data){
  console.log(JSON.stringify(data));
});

// loads and parses shapefile, returns geojson
function getFeatures(url, callback) {
  this.shpURL = url+'.shp';
  this.dbfURL = url+'.dbf';
  this.callback = callback;

  var instance = this;
  this.json = {
    type: "FeatureCollection",
    features: []
  };

  try {
    this.shpFile = new Shp(url);
    this.dbfFile = new Dbf(url);
  } catch(error) {
    console.error("Error parsing shapefile");
    return callback(error, null);
  }

  var recordsLength = instance.shpFile.records.length;
  for (var i = 0; i < recordsLength; i++) {
    var record = instance.shpFile.records[i];
    var attrs = instance.dbfFile.records[i];
    var feature = {
      type: "Feature",
      geometry: {},
      properties: {}
    };
//    console.log(record);
    feature.properties = attrs.values;

    switch(record.shapeType) {
      case Shp.ShpType.SHAPE_POINT:
        feature.geometry.type = Shp.GeoJsonType[record.shapeType];
        feature.geometry.coordinates = [record.shape.x, record.shape.y];
        break;
      case Shp.ShpType.SHAPE_POLYLINE:
        feature.geometry.type = Shp.GeoJsonType[record.shapeType];
        feature.geometry.coordinates = [];
        var pointsLen = record.shape.rings[0].length;
        for (var j = 0; j < pointsLen; j++) {
          feature.geometry.coordinates.push([record.shape.rings[0][j].x, record.shape.rings[0][j].y]);
        }
        break;
      case Shp.ShpType.SHAPE_POLYGON:
        feature.geometry.type = Shp.GeoJsonType[record.shapeType];
        feature.geometry.coordinates = [];
        var ringsLen = record.shape.rings.length;
        for (var j = 0; j < ringsLen; j++) {
          var ring = record.shape.rings[j];
          if (ring.length < 1) continue;
          var featureRing = feature.geometry.coordinates[j] = [];
          var ringLen = ring.length;
          for (var k = 0; k < ringLen; k++) {
            featureRing.push([ring[k].x, ring[k].y]);
          }
        }
        break;
      default:
        throw(new Error("Error converting SHP to geojson"))
    }

    this.json.features.push(feature);
  }
  callback(null, this.json);
}
/*
   function getOpenLayersFeatures(url, callback) {
   this.shpURL = url+'.shp';
   this.dbfURL = url+'.dbf';
   this.callback = callback;

   var instance = this;

// Parse into OL features
var parseShapefile = function () {
// we can assume that shapefile and dbf have loaded at this point, but check anyhow
if (!(instance.dbfFile && instance.shpFile)) return;

var features = [];

var recsLen = instance.shpFile.records.length;
for (var i = 0; i < recsLen; i++) {
var record = instance.shpFile.records[i];
var attrs = instance.dbfFile.records[i];

// turn shapefile geometry into WKT
// points are easy!
if (instance.shpFile.header.shapeType == ShpType.SHAPE_POINT) {
var wkt = 'POINT(' + record.shape.x + ' ' + record.shape.y + ')';
}

// lines: not too hard--
else if (instance.shpFile.header.shapeType == ShpType.SHAPE_POLYLINE) {
// prepopulate the first point
var points = [];//record.shape.rings[0].x + ' ' + record.shape.rings[0].y];
var pointsLen = record.shape.rings[0].length;
for (var j = 0; j < pointsLen; j++) {
points.push(record.shape.rings[0][j].x + ' ' + record.shape.rings[0][j].y);
}

var wkt = 'LINESTRING(' + points.join(', ') + ')';
}

// polygons: donuts
else if (instance.shpFile.header.shapeType == ShpType.SHAPE_POLYGON) {
var ringsLen = record.shape.rings.length;
var wktOuter = [];
for (var j = 0; j < ringsLen; j++) {
var ring = record.shape.rings[j];
if (ring.length < 1) continue;
var wktInner = [];//ring.x + ' ' + ring.y];
var ringLen = ring.length;
for (var k = 0; k < ringLen; k++) {
wktInner.push(ring[k].x + ' ' + ring[k].y);
}
wktOuter.push('(' + wktInner.join(', ') + ')');
}
var wkt = 'POLYGON(' + wktOuter.join(', ') + ')';
}

var the_geom = OpenLayers.Geometry.fromWKT(wkt);
features.push(new OpenLayers.Feature.Vector(the_geom, attrs));
}
callback(features);
};	

var onShpFail = function() { 
alert('failed to load ' + instance.shpURL);
};
var onDbfFail = function() { 
alert('failed to load ' + instance.dbfURL);
}

var onShpComplete = function(oHTTP) {
var binFile = oHTTP.binaryResponse;
console.log('got data for ' + instance.shpURL + ', parsing shapefile');
instance.shpFile = new ShpFile(binFile);
if (instance.dbfFile) parseShapefile();
}

var onDbfComplete = function(oHTTP) {
  var binFile = oHTTP.binaryResponse;
  console.log('got data for ' + instance.dbfURL + ', parsing dbf file');
  instance.dbfFile = new DbfFile(binFile);
  if (instance.shpFile) parseShapefile();
}  

this.shpLoader = new BinaryAjax(shpURL, onShpComplete, onShpFail);
this.dbfLoader = new BinaryAjax(dbfURL, onDbfComplete, onDbfFail);
}*/

module.exports = {



}

// ported from https://github.com/RandomEtc/shapefile-js/blob/master/src/ol_shapefile.js

