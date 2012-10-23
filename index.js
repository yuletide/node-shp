var Dbf = require(__dirname + '/lib/dbf'),
    Shp = require(__dirname + '/lib/shp');
/** getOpenLayersFeatures
 * @param {String} url - the base url for the shapefile, without extensions
 * @param {Function} callback Called with an array of OpenLayers.Feature.Vector for the given URL
 */


//getFeatures("demo/TM_WORLD_BORDERS_SIMPL/TM_WORLD_BORDERS_SIMPL-0.3", function(err, data){
//  console.log(JSON.stringify(data));
//});

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
    if (callback){
      callback(error, null);
    } else {
      throw new Error(error);
    }
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
        throw(new Error("Error converting SHP to geojson: Unsupported feature type"))
    }

    this.json.features.push(feature);
  }
  if (callback){
    callback(null, this.json);
  }
  return this.json;
}

module.exports = {
  readFileSync: getFeatures,
  readFile: getFeatures
}

// ported from https://github.com/RandomEtc/shapefile-js/blob/master/src/ol_shapefile.js

