var fs = require('fs');


Id3Reader = function(filename) {
	this.filename = filename;
	this.mode = 0666;
	this.flags = "r";
};

//Set up the collection
Id3Reader.prototype.getFile = function(callback) {
	fs.readFile(this.filename, function(error, data) {
		if (error) callback(error);
		else callback(null, data);
	});
};

Id3Readr.prototype.isId3v2 = function(callback) {
	this.getFile(function(error, data) {
		if (error) throw error;
		else {
			if(data.indexOf("ID3") >= 0) {
				console.log(data.indexOf("ID3");
				return true;
			} else {
				return false;
			}
		}
	});
};

//export so we can import it like a module
exports.Id3Reader = Id3Reader;
