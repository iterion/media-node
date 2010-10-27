var sys = require('sys');
var fs = require('fs');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var db = new Db('files-index', new Server('localhost', Connection.DEFAULT_PORT, {}), {native_parser:true});
var Id3 = require('./id3-reader').Id3Reader;

var totalOpenFiles = 0;
var totalFiles = 0;
var totalFilesParsed = 0;
var filesQueue = [];
var results = [];

function check_queue() {
	if(totalOpenFiles < 101) {
		if(filesQueue.length > 0) {
			read_file(filesQueue.pop());
		}
	}//else we may want to pause and check again?
}

function read_file(trackInfo) {
	id3 = new Id3(trackInfo.path + "/" + trackInfo.name);
	totalOpenFiles++;
	id3.readData(function(data) {
		totalOpenFiles--;
		totalFilesParsed++;
		check_queue();
		
		var tempName = trackInfo.name.split(".");
		trackInfo.ext = tempName[tempName.length - 1];
		var lowercaseName = trackInfo.name.toLowerCase();
		var nameNoExt = lowercaseName.replace("." + trackInfo.ext, "");
		var checkChars = ["(", ")", "&", "^"];
		checkChars.forEach(function(remove) {
			while(nameNoExt.indexOf(remove) >= 0) {
				nameNoExt = nameNoExt.replace(remove, "");
			}
		});
		trackInfo.tags = nameNoExt.split(" ");
		
		if (data) {
			trackInfo.title = data['TIT2'];
			trackInfo.album = data['TALB'];
			trackInfo.track = parseInt(data['TRCK']);
			trackInfo.artist = data['TPE1'];
		} else {
			trackInfo.title = nameNoExt;
			trackInfo.artist = "unknown";
			trackInfo.album = "unknown";
		}
		results.push(trackInfo);
		sys.print(totalFilesParsed + '/' + totalFiles + ' parsed ('+totalFilesParsed/totalFiles+'%)\n');
		
		if(totalFilesParsed >= totalFiles) {
			store_data();
		}
	});
}



function read_directory(path) {
	fs.readdir(path, function(err, files) {
		files.forEach(function (filename) {
			fs.stat(path + "/" + filename, function(err, stat) {
			if(stat) {
				if (!stat.isDirectory()) {
					var tempResults = {};
					tempResults.path = path;
					tempResults.size = stat.size;
					tempResults.name = filename;
					
					totalFiles++;
					if(totalOpenFiles < 100) {
						read_file(tempResults);
					} else {
						//log the missed files to a queue, then check the queue every second
						filesQueue.push(tempResults);					
					}			

				} else {
					read_directory(path + "/" + filename); 
				}
			} else {
				console.log("skipping: " + path + "/" + filename);
			}
			});
		});
	});
}


function store_data() {
	console.log("final callback");
	console.log(results);
	db.open(function(err, db) {
		if (err) { throw err; }
		db.collection('files', function(err, collection) {
			collection.remove(function(err, collection) {
				results.forEach(function(item) {
					collection.insert(item);
				});
				//collection.createIndex('track');
				//collection.createIndex('album');
				//collection.createIndex('artist');
				//collection.createIndex('tags');
				db.close();
			});
		});
	});
}


read_directory("media");
