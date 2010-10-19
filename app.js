var express = require('express'),
    app = express.createServer();
var FilesProvider = require('./files-provider').FilesProvider;

var filesProvider = new FilesProvider();

app.set('views', 'views');
app.set('view engine', 'jade');


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

app.get('/download/*', function(req, res) {
	console.log("download:");
	console.log(req.params);
	var file = req.params[0];
	res.download(file);
});

app.get('/stream/*', function(req, res) {
	console.log("stream: " + req.params[0]);
	var file = req.params[0];
	res.sendfile(file);
});

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

app.listen(3000);
console.log('Express server started on port %s', app.address().port);
