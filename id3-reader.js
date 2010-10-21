var fs = require('fs');
var sys = require('sys');

Id3Reader = function(filename) {
	this.filename = filename;
	this.flags = 'r';
	this.offset = 0;
	this.data = {};
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
				} else {
					callback(null, false);
				}
			});
		}
	});
};

Id3Reader.prototype.readData = function(callback) {
	//We're referencing this in the callbacks - make sure it stays correct
	var cur = this;
	cur.isId3v2(function(error, isId3, data) {
		if (isId3) {
			var read = new Buffer(10);
			fs.read(data, read, 0, 10, 0, function(err, bytesRead) {
				var size = read.slice(6,10);
				cur.offset = 10;
				cur.length = cur.intFromBytes(size, 7);
				cur.readFrame(data, callback);
			});
		} else {
			callback(false);
		}
	});
};

Id3Reader.prototype.readFrame = function(data, callback) {
	if(this.offset < this.length) {
		var buff = new Buffer(10);
		var cur = this;
		fs.read(data, buff, 0, 10, cur.offset, function(err, bytesRead) {
			var frame = buff.slice(0,4);
			var size = cur.intFromBytes(buff.slice(4,8));
			cur.offset += 10;
			if (cur.intFromBytes(frame) > 0) {
				if (size > 0) {
					var contents = new Buffer(size);
					fs.read(data, contents, 0, size, cur.offset, function(err, bytesRead) {
						cur.offset += size;
						if (frame.toString()[0] == "T") {
							//We do not want the encoding byte for 'T' frames
							contents = contents.slice(1, contents.length);
							if(contents[contents.length-1] == 0) {
								//Get rid of shitty tags with random extra blank bytes
								contents = contents.slice(0, contents.length-1);
							}
						} 
						cur.data[frame.toString()] = contents.toString();
						cur.readFrame(data, callback);
					});
				} else {
					cur.readFrame(data, callback);
				}
			} else {
				callback(cur.data);
			}
		});
	} else {
		callback(this.data);
	}
};

Id3Reader.prototype.intFromBytes = function(buffer, sigBits) {
	sigBits = sigBits || 8;
	var total = 0;
	for(var i = 0; i < buffer.length; i++) {
		total += buffer[i] << (sigBits * (buffer.length - (i+1)));
	}
	return total;
};

//export so we can import it like a module
exports.Id3Reader = Id3Reader;
