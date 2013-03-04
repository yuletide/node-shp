// ported from http://code.google.com/p/vanrijkom-flashlibs/ under LGPL v2.1
// ported from https://github.com/RandomEtc/shapefile-js/blob/master/src/shapefile.js

var fs = require('fs');
var BinaryReader = require('./BinaryReader');

function isClockwise(points) {
  return points.reduce(function (sum, c, i, points) {
    var n = points[(i+1)%points.length];
    return sum + (n.x-c.x)*(n.y+c.y);
  }, 0) >= 0;
}

var ShpFile = function(path) {
  this.header = {};
  this._reader = new BinaryReader(path+".shp");

  var t1 = Date.now();    
  this.parseHeader();

  var t2 = Date.now();
  //console.log('parsed header in ' + (t2-t1) + ' ms');

  t1 = Date.now();
  this.records = [];
  while (true) {
    try {
      this.records.push(new ShpRecord(this._reader));
    }
    catch (e) {
      if (e.id !== ShpError.ERROR_NODATA) {
        console.error(e);
      }
      break;
    }
  }

  t2 = Date.now();
  //console.log('parsed records in ' + (t2-t1) + ' ms');
}

ShpFile.prototype = {
  constructor: ShpFile,

  parseHeader: function(callback) {
    // TODO: check size is greater than 100

    if (this._reader.length < 100){
      console.error("Invalid shapefile");
      throw new ShpError("Shapefile length < 100 bytes");
    }

    this._reader.bigEndian = true;
    if (this._reader.readInt32() != 9994){
      console.error("Invalid shapefile header");
      throw new ShpError("Invalid shapefile header");
    }
    this._reader.skip(5*4); // skip 5 ints

    // read file-length
    this.header.fileLength = this._reader.readInt32();

    // no more big endian
    this._reader.bigEndian = false;
    // read version
    this.header.version = this._reader.readInt32();

    // shape type
    this.header.shapetype = this._reader.readInt32();

    // bounds
    this.header.boundsXY = { 
      x: this._reader.readDouble(),
      y: this._reader.readDouble(),
      width: this._reader.readDouble(),
      height: this._reader.readDouble()
    };

    this.header.boundsZ = {
      x: this._reader.readDouble(),
      y: this._reader.readDouble()
    };

    this.header.boundsM = {
      x: this._reader.readDouble(),
      y: this._reader.readDouble()
    };
  }

}

// Shape type lookup in geojson-friendly syntax
// http://www.geojson.org/geojson-spec.html#geometry-objects
// we squash unsupported types into the closest approx.
var GeoJsonType = {
  "-1": "unknown",
  0: "null",
  1: "Point",
  3: "LineString",
  5: "Polygon",
  8: "MultiPoint",
  11: "Point",
  13: "LineString",
  15: "Polygon",
  18: "MultiPoint",
  21: "Point",
  23: "LineString",
  25: "Polygon",
  28: "MultiPoint",
  31: "MultiPatch" // can't do anything here
}

/**
 * The ShpType class is a place holder for the ESRI Shapefile defined
 * shape types.
 * @author Edwin van Rijkom
 * 
 */     
var ShpType = {

  /**
   * Unknow Shape Type (for internal use) 
   */
  SHAPE_UNKNOWN : -1,
  /**
   * ESRI Shapefile Null Shape shape type.
   */     
  SHAPE_NULL : 0,
  /**
   * ESRI Shapefile Point Shape shape type.
   */
  SHAPE_POINT : 1,
  /**
   * ESRI Shapefile PolyLine Shape shape type.
   */
  SHAPE_POLYLINE : 3,
  /**
   * ESRI Shapefile Polygon Shape shape type.
   */
  SHAPE_POLYGON : 5,
  /**
   * ESRI Shapefile Multipoint Shape shape type
   * (currently unsupported).
   */
  SHAPE_MULTIPOINT : 8,
  /**
   * ESRI Shapefile PointZ Shape shape type.
   */
  SHAPE_POINTZ : 11,
  /**
   * ESRI Shapefile PolylineZ Shape shape type
   * (currently unsupported).
   */
  SHAPE_POLYLINEZ : 13,
  /**
   * ESRI Shapefile PolygonZ Shape shape type
   * (currently unsupported).
   */
  SHAPE_POLYGONZ : 15,
  /**
   * ESRI Shapefile MultipointZ Shape shape type
   * (currently unsupported).
   */
  SHAPE_MULTIPOINTZ : 18,
  /**
   * ESRI Shapefile PointM Shape shape type
   */
  SHAPE_POINTM : 21,
  /**
   * ESRI Shapefile PolyLineM Shape shape type
   * (currently unsupported).
   */
  SHAPE_POLYLINEM : 23,
  /**
   * ESRI Shapefile PolygonM Shape shape type
   * (currently unsupported).
   */
  SHAPE_POLYGONM : 25,
  /**
   * ESRI Shapefile MultiPointM Shape shape type
   * (currently unsupported).
   */
  SHAPE_MULTIPOINTM : 28,
  /**
   * ESRI Shapefile MultiPatch Shape shape type
   * (currently unsupported).
   */
  SHAPE_MULTIPATCH : 31

};


function ShpRecord(reader) {
  var availableBytes = reader.getBytesRemaining();

  if (availableBytes == 0) 
    throw(new ShpError("No Data", ShpError.ERROR_NODATA));

  if (availableBytes < 8)
    throw(new ShpError("Not a valid record header (too small)"));

  reader.bigEndian = true;

  this.number = reader.readInt32();
  this.contentLength = reader.readInt32();
  this.contentLengthBytes = this.contentLength*2 - 4;
  reader.bigEndian = false;
  var shapeOffset = reader.offset;
  this.shapeType = reader.readInt32();

  switch(this.shapeType) {
    case ShpType.SHAPE_POINT:
      this.shape = new ShpPoint(reader, this.contentLengthBytes);
      break;
    case ShpType.SHAPE_POINTZ:
      this.shape = new ShpPointZ(reader, this.contentLengthBytes);
      break;
    case ShpType.SHAPE_POLYGON:
      this.shape = new ShpPolygon(reader, this.contentLengthBytes);
      break;
    case ShpType.SHAPE_POLYLINE:
      this.shape = new ShpPolyline(reader, this.contentLengthBytes);
      break;
    case ShpType.SHAPE_MULTIPATCH:
    case ShpType.SHAPE_MULTIPOINT:
    case ShpType.SHAPE_MULTIPOINTM:
    case ShpType.SHAPE_MULTIPOINTZ:
    case ShpType.SHAPE_POINTM:
    case ShpType.SHAPE_POLYGONM:
    case ShpType.SHAPE_POLYGONZ:
    case ShpType.SHAPE_POLYLINEZ:
    case ShpType.SHAPE_POLYLINEM:
      throw(new ShpError(this.shapeType+" Shape type is currently unsupported by this library"));
      break;
    default:
      throw(new ShpError("Encountered unknown shape type ("+this.shapeType+")"));
      break;
  }
}

function ShpPoint(reader, size) {
  this.type = ShpType.SHAPE_POINT;
  if (reader) {
    if (reader.getBytesRemaining() < size)
      throw(new ShpError("Not a Point record (too small)"));
    this.x = (size > 0)  ? reader.readDouble() : NaN;
    this.y = (size > 0)  ? reader.readDouble() : NaN;
  }
}
function ShpPointZ(reader, size) {
  this.type = ShpType.SHAPE_POINTZ;
  if (reader) {
    if (reader.getBytesRemaining() < size)
      throw(new ShpError("Not a Point record (too small)"));
    this.x = (size > 0)  ? reader.readDouble() : NaN;
    this.y = (size > 0)  ? reader.readDouble() : NaN;
    this.z = (size > 16) ? reader.readDouble() : NaN;
    this.m = (size > 24) ? reader.readDouble() : NaN;
  }
}
function ShpPolygon(reader, size) {
  // for want of a super()
  ShpPolyline.apply(this, [reader, size]);
  this.type = ShpType.SHAPE_POLYGON;
}
function ShpPolyline(reader, size) {
  this.type = ShpType.SHAPE_POLYLINE;
  this.rings = [];
  if (reader) {
    if (reader.getBytesRemaining() < size){
      throw(new ShpError("Not a Polygon record (too small)"));
    }

    reader.bigEndian = false;

    this.box = {
      x: reader.readDouble(),
      y: reader.readDouble(),
      width: reader.readDouble(),
      height: reader.readDouble()
    };

    var rc = reader.readInt32();
    var pc = reader.readInt32();

    var ringOffsets = [];
    while(rc--) {
      var ringOffset = reader.readInt32();
      ringOffsets.push(ringOffset);
    }

    var points = [];
    while(pc--) {
      points.push(new ShpPoint(reader,16));
    }

    // convert points, and ringOffsets arrays to an array of rings:
    var removed = 0;
    var split, ring;
    ringOffsets.shift();
    while(ringOffsets.length) {
      split = ringOffsets.shift();
      ring = points.splice(0,split-removed);
      ring.isClockwise = isClockwise(ring);
      this.rings.push(ring);
      removed = split;
    }
    ring = points;
    ring.isClockwise = isClockwise(ring);
    this.rings.push(ring);
  }
}

function ShpError(msg, id) {
  this.msg = msg;
  this.id = id;
  this.toString = function() {
    return this.msg;
  };
}
ShpError.ERROR_UNDEFINED = 0;
// a 'no data' error is thrown when the byte array runs out of data.
ShpError.ERROR_NODATA = 1;

module.exports = ShpFile;
module.exports.GeoJsonType = GeoJsonType;
module.exports.ShpType = ShpType;

