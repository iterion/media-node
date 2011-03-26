require.paths.unshift('support/node-musicmetadata/lib');
require.paths.unshift('support/mongoose/lib');

var sys = require('sys');
var fs = require('fs');
var id3 = require('musicmetadata');


var totalOpenFiles = 0;
var totalFiles = 0;
var totalFilesParsed = 0;
var filesQueue = [];
var results = [];
var files_used = {};

function check_queue() {
	if(totalOpenFiles < 101) {
		if(filesQueue.length > 0) {
			read_file(filesQueue.pop());
		}
	}//else we may want to pause and check again?
}

function read_file(trackInfo) {
	var parser = new id3(fs.createReadStream(trackInfo.path + "/" + trackInfo.name));
	files_used[trackInfo.name] = 0;
	parser.on('metadata', function(data) {
		parser.stream.destroy();
		delete(files_used[trackInfo.name]);
		console.log(files_used);
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
		
//			trackInfo.title = nameNoExt;
//			trackInfo.artist = "unknown";
//			trackInfo.album = "unknown";
		
		results.push(trackInfo);
		sys.print(totalFilesParsed + '/' + totalFiles + ' parsed ('+totalFilesParsed/totalFiles+'%)\n');
		
		if(totalFilesParsed >= totalFiles) {
			store_data();
		}
	});
	totalOpenFiles++;
	parser.parse();
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
					filesQueue.push(tempResults);					

					check_queue();
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
}


read_directory("media");
