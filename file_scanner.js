var sys = require('sys');
var fs = require('fs');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var db = new Db('files-index', new Server('localhost', Connection.DEFAULT_PORT, {}), {native_parser:true});
var Id3 = require('./id3-reader').Id3Reader;


function read_directory(path, parse) {
		fs.readdir(path, function(err, files) {
			console.log("path was: " + path);
			var results = [];
			var count = files.length;
			console.log("count: " + count);
			var countFolders = 0;
			files.forEach(function (filename) {
				console.log(filename);
				fs.stat(path + "/" + filename, function(err, stat) {
					if (!stat.isDirectory()) {
						var tempResults = {};
						tempResults.path = path;
						tempResults.size = stat.size;
						tempResults.name = filename;
						var tempName = filename.split(".");
						tempResults.ext = tempName[tempName.length - 1];
						var lowercaseName = filename.toLowerCase();
						var nameNoExt = lowercaseName.replace("." + tempResults.ext, "");
						var checkChars = ["(", ")", "&", "^"];
						checkChars.forEach(function(remove) {
							while(nameNoExt.indexOf(remove) >= 0) {
								nameNoExt = nameNoExt.replace(remove, "");
							}
						});
						tempResults.tags = nameNoExt.split(" ");
						//Add file reading here
						//move results push to file read callback
						id3 = new Id3(path + "/" + filename);
						id3.readData(function(data) {
							if (data) {
								tempResults.title = data['TIT2'];
								tempResults.album = data['TALB'];
								tempResults.track = data['TRCK'];
								tempResults.artist = data['TPE1'];
							}
							results.push(tempResults);
							count--;
							sys.log("count in read callback: " + count);
							sys.log("count of folders: " + countFolders);
							if(count <= 0) {
								if (countFolders <= 0) {
									sys.log("made it");									
									parse(results);
								}
							}	
						});
					} else {
						countFolders++;
						read_directory(path + "/" + filename, function (results2) { 
							//where are we?
							sys.log("in folder callback");
							sys.log(countFolders);
							results2.forEach(function(item) {
								results.push(item);
							});
							countFolders--;
							sys.log(results);
							if (countFolders <= 0) {
								parse(results);
							}
						});
					}
				});
			});
		});
}

read_directory("media", function(results) {
	console.log("final callback");
	console.log(results);
	db.open(function(err, db) {
		if (err) { throw err; }
		db.collection('files', function(err, collection) {
			collection.remove(function(err, collection) {
				results.forEach(function(item) {
					collection.insert(item);
				});
				db.close();
			});
		});
	});
});
