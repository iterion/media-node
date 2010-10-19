var express = require('express'),
    app = express.createServer();
var FilesProvider = require('./files-provider').FilesProvider;

var filesProvider = new FilesProvider();

app.set('views', 'views');
app.set('view engine', 'jade');

//list all files
app.get('/', function(req, res) {
	console.log('requested index');	
	filesProvider.findAll(function(err, docs) {
		res.render('files', {
			locals: {
				files: docs
			}
		});
	});
});

//list files found by certain attributes
//currently used as a search - but I think i'd like to
//change it to be like the following:
//   /find/[field]/[search]
//where [field] is a field like artist or album
//and [search] is the actual string for which the user 
//has searched
app.get('/find/*', function(req, res) {
	var tag = req.params[0];
	console.log('search for tag: ' + tag);
	filesProvider.findByTag(tag, function(err, docs) {
		res.render('files', {
			locals: {
				files: docs
			}
		});
	});
});

/*TODO update the following to retrieve paths based on 
       objectID's rather than passing in paths through
       the url
*/

//download link - not used for streaming
app.get('/download/*', function(req, res) {
	console.log("download:");
	console.log(req.params);
	var file = req.params[0];
	res.download(file);
});

//like download - but used for streaming
app.get('/stream/*', function(req, res) {
	console.log("stream: " + req.params[0]);
	var file = req.params[0];
	res.sendfile(file);
});


//view and listen are different for audio + video
//I think this functionality fits in the view better
//These may be reduced to one function soon
app.get('/view/*', function(req, res) {
	console.log("view:");
	console.log(req.params);
	var file = req.params[0];
	res.render('stream', {
		locals: {
			file: file
		}
	});
});


app.get('/listen/*', function(req, res) {
	console.log("listen:");
	console.log(req.params);
	var file = req.params[0];
	res.render('stream-audio', {
		locals: {
			file: file
		}
	});
});


//start the server
app.listen(3000);
console.log('Express server started on port %s', app.address().port);
