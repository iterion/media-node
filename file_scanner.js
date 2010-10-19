var fs = require('fs');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var db = new Db('files-index', new Server('localhost', Connection.DEFAULT_PORT, {}), {native_parser:true});

function read_directory(path, parse) {
		fs.readdir(path, function(err, files) {
			console.log("path was: " + path);
			var results = [];
			var count = files.length;
			var countFolders = 0;
			files.forEach(function (filename) {
				console.log(filename);
				console.log("count: " + count);
				fs.stat(path + "/" + filename, function(err, stat) {
					if (!stat.isDirectory()) {
						var tempResults = {};
						tempResults.path = path;
						tempResults.size = stat.size;
						tempResults.name = filename;
						var tempName = filename.split(".");
						tempResults.ext = tempName[tempName.length - 1];
						var lowercaseName = filename.toLowerCase();
						var nameNoExt = lowercaseName.replace(tempResults.ext, "");
						var checkChars = ["(", ")", "&", "^", "."];
						checkChars.forEach(function(remove) {
							console.log(nameNoExt.indexOf(remove));
							while(nameNoExt.indexOf(remove) >= 0) {
								nameNoExt = nameNoExt.replace(remove, "");
							}
						});
						tempResults.tags = nameNoExt.split(" ");
						

						results.push(tempResults);
					} else {
						countFolders++;
						read_directory(path + "/" + filename, function (results2) { 
							results2.forEach(function(item) {
								results.push(item);
							});
							countFolders--;
							if (countFolders <= 0) {
								parse(results);
							}
						});
					}
					count--;
					if (count <= 0) {
						if (countFolders <= 0) {
							parse(results);
						}
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
