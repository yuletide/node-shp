// ported from http://code.google.com/p/vanrijkom-flashlibs/ under LGPL v2.1
// ported from https://github.com/RandomEtc/shapefile-js/blob/master/src/dbf.js

var fs = require('fs');
var BinaryReader = require('./BinaryReader');

function DbfFile(path) {
  this.header = {}
  this.reader = new BinaryReader(path + ".dbf");

  var t1 = Date.now();

  this.header = new DbfHeader(this.reader);

  var t2 = Date.now();
  console.log('parsed dbf header in ' + (t2-t1) + ' ms');
//  console.log(this.header);

  t1 = Date.now();

  // TODO: could maybe be smarter about this and only parse these on demand
  this.records = [];
  for (var i = 0; i < this.header.recordCount; i++) {
    var record = this.getRecord(i);
    this.records.push(record);
  }

  t2 = Date.now();
  console.log('parsed dbf records in ' + (t2-t1) + ' ms');
}

DbfFile.prototype.getRecord = function(index) {

  if (index > this.header.recordCount) {
    throw(new DbfError("",DbfError.ERROR_OUTOFBOUNDS));
  }

  this.reader.offset = this.header.recordsOffset + index * this.header.recordSize;
  this.reader.bigEndian = false;

  return new DbfRecord(this.reader, this.header);
}


function DbfHeader(reader) {

  // endian:
  reader.bigEndian = false;

  this.version = reader.readSByte();
  this.updateYear = 1900+reader.readByte();
  this.updateMonth = reader.readByte();
  this.updateDay = reader.readByte();
  this.recordCount = reader.readInt32();
  this.headerSize = reader.readInt16();
  this.recordSize = reader.readInt16();

  //skip 2:
  reader.skip(2);

  this.incompleteTransaction = reader.readByte();
  this.encrypted = reader.readByte();

  // skip 12:
  reader.skip(12);

  this.mdx = reader.readByte();
  this.language = reader.readByte();

  // skip 2;
  reader.skip(2);

  // iterate field descriptors:
  this.fields = [];

  while (reader.readByte() != 0x0D){
    reader.offset -= 1;
    this.fields.push(new DbfField(reader));
  }

  this.recordsOffset = this.headerSize+1;

}

function DbfField(reader) {

  this.name = this.readZeroTermANSIString(reader);

  // fixed length: 10, so:
  reader.skip(10-this.name.length);

  this.type = reader.readByte();
  this.address = reader.readInt32();
  this.length = reader.readByte();
  this.decimals = reader.readByte();

  // skip 2:
  reader.skip(2);

  this.id = reader.readByte();

  // skip 2:
  reader.skip(2);

  this.setFlag = reader.readByte();

  // skip 7:
  reader.skip(7);

  this.indexFlag = reader.readByte();
}

DbfField.prototype.readZeroTermANSIString = function(reader) {
  var r = [];
  var b;
  while (b = reader.readByte()) {
    r[r.length] = String.fromCharCode(b);
  }
  return r.join('');
}

function DbfRecord(reader, header) {
  this.values = {}
  for (var i = 0; i < header.fields.length; i++) {
    var field = header.fields[i];
    this.values[field.name] = reader.readString(field.length);
  }
}
module.exports = DbfFile;
