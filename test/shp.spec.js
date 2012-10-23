var expect = require('chai').expect;
var sinon = require('sinon');

var fs = require('fs');
var shpFile = require(__dirname + '/../index');

describe('Shapefile Reader', function() {
  it('Can correctly convert multiPolygon shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/multipolygon.json', "utf8"));
    shpFile.readFile(__dirname + '/data/multipolygon', function(error, data){
      expect(data.features[0].geometry.coordinates[0][0][0]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][0][0], 0.00001);
      expect(data.features[0].geometry.coordinates[0][0][1]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][0][1], 0.00001);
      expect(data.features[0].geometry.coordinates[0][1][0]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][1][0], 0.00001);
      expect(data.features[0].geometry.coordinates[0][1][1]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][1][1], 0.00001);
    });
    done();
  });

  it('Can correctly convert polygon shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/polygon.json', "utf8"));
    shpFile.readFile(__dirname + '/data/polygon', function(error, data){
      expect(data.features[0].geometry.coordinates[0][0][0]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][0][0], 0.00001);
      expect(data.features[0].geometry.coordinates[0][0][1]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][0][1], 0.00001);
      expect(data.features[0].geometry.coordinates[0][1][0]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][1][0], 0.00001);
      expect(data.features[0].geometry.coordinates[0][1][1]).to.be.closeTo(good_json.features[0].geometry.coordinates[0][1][1], 0.00001);
    });
    done();
  });

  it('Can correctly convert point shapefile to GeoJSON', function(done){
    var good_json = JSON.parse(fs.readFileSync(__dirname + '/data/point.json', "utf8"));
    console.log(JSON.stringify(good_json));
    shpFile.readFile(__dirname + '/data/point', function(error, data){
      console.log(JSON.stringify(data));
      expect(data.features[0].geometry.coordinates[0][0]).to.equal(good_json.features[0].geometry.coordinates[0][0]);
      expect(data.features[0].geometry.coordinates[0][1]).to.equal(good_json.features[0].geometry.coordinates[0][1]);
    });
    done();
  });
});
