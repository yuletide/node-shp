var fs = require('fs');

var BinaryReader = function(file) {
  this.offset = 0;
  this._buffer = fs.readFileSync(file);
  this.lastRecord = null;
  this.length = this._buffer.length;
  this.bigEndian = false;
}

BinaryReader.prototype = {
  constructor: BinaryReader,
  skip: function(offset){
    this.offset += offset;
  },
  getBytesRemaining: function(){
    return this.length - this.offset;
  },
  
  readInt16: function() {
    if (this.bigEndian){
      return this.readInt16BE();
    } else {
      return this.readInt16LE();
    }
  },

  readInt32: function() {
    if (this.bigEndian){
      return this.readInt32BE();
    } else {
      return this.readInt32LE();
    }
  },

  readDouble: function() {
    if (this.bigEndian){
      return this.readDoubleBE();
    } else {
      return this.readDoubleLE();
    }
  },

  readInt16BE: function() {
    var val = this._buffer.readInt16BE(this.offset);
    this.offset += 2;
    return val;
  },

  readInt16LE: function() {
    var val = this._buffer.readInt16LE(this.offset);
    this.offset += 2;
    return val;
  },
  readInt32BE: function() {
    var val = this._buffer.readInt32BE(this.offset);
    this.offset += 4;
    return val;
  },

  readInt32LE: function() {
    var val = this._buffer.readInt32LE(this.offset);
    this.offset += 4;
    return val;
  },

  readDoubleLE: function() {
    var val = this._buffer.readDoubleLE(this.offset);
    this.offset += 8;
    return val;
  },

  readDoubleBE: function() {
    var val = this._buffer.readDoubleBE(this.offset);
    this.offset += 8;
    return val;
  },
  readSByte: function() {
    var val = this._buffer[this.offset];
    if (val > 127){
      val = val - 256;
    }
    this.lastRecord = val;
    this.offset += 1;
    return val;
  },
  readByte: function() {
    var val = this._buffer[this.offset];
    this.lastRecord = val;
    this.offset += 1;
    return val;
  },
  readString: function(length, encoding) {
    var encoding = encoding || 'utf8';
    var val = this._buffer.toString(encoding, this.offset, this.offset + length);
    this.offset += length;
    return val;
  }
}

module.exports = BinaryReader;
