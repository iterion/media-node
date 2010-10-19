var fs = require('fs');
var sys = require('sys');

Id3Reader = function(filename) {
	this.filename = filename;
	this.flags = 'r';
	this.offset = 0;
};

//Set up the collection
Id3Reader.prototype.getFile = function(callback) {
	fs.open(this.filename, this.flags, function(error, data) {
		if (error) callback(error);
		else callback(null, data);
	});
};

Id3Reader.prototype.isId3v2 = function(callback) {
	this.getFile(function(error, data) {
		if (error) throw error;
		else {
			var buffer = new Buffer(3);
			fs.read(data, buffer, 0, 3, 0, function(err, bytesRead) {
				if(buffer.toString() == "ID3") {
					callback(null, true, data);
				}
			});
		}
	});
};

Id3Reader.prototype.readData = function(callback) {
	this.isId3v2(function(error, isId3, data) {
		if (isId3) {
			var read = new Buffer(10);
			fs.read(data, read, 0, 10, 0, function(err, bytesRead) {
				var size = read.slice(6,10);
				this.offset = 10;
				sys.log(size[0]);
				sys.log(size[1]);
				sys.log(size[2]);
				sys.log(size[3]);
				sys.log(read[0]);
				sys.log(read[1]);
				sys.log(read[2]);
			});
		}
	});
};

//export so we can import it like a module
exports.Id3Reader = Id3Reader;
