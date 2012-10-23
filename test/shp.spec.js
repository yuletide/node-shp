var expect = require('chai').expect;
var sinon = require('sinon');

var fs = require('fs');
var shpFile = require(__dirname + '/../index');

describe('Shapefile Reader', function() {
  it('Can correctly convert multiPolygon shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/multipolygon.json', "utf8"));
    console.log(JSON.stringify(good_json));
    shpFile.readFile(__dirname + '/data/multipolygon', function(error, data){
      console.log(JSON.stringify(data));
    });
    done();
  });

  it('Can correctly convert polygon shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/polygon.json', "utf8"));
    console.log(JSON.stringify(good_json));
    shpFile.readFile(__dirname + '/data/polygon', function(error, data){
      console.log(JSON.stringify(data));
    });
    done();
  });

  it('Can correctly convert point shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/point.json', "utf8"));
    console.log(JSON.stringify(good_json));
    shpFile.readFile(__dirname + '/data/point', function(error, data){
      console.log(JSON.stringify(data));
    });
    done();
  });
});
