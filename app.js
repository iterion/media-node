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


app.get('/list/:field', function(req, res) {
	var field = req.params.field;
	console.log('list ' + field + 's');
	filesProvider.getPossible(field, function(err, docs) {
		if (err) res.redirect('home');
		else {
			res.render('list', {
				locals: {
					field: field,
					values: docs
				}
			});	
		}
	});
});

app.get('/show/:field/:query', function(req, res) {
	var field = req.params.field;
	var query = req.params.query;
	console.log('show tracks for the ' + query + ' ' + field);
	filesProvider.queryField(field, query, function(err, docs) {
		if (err) res.redirect('home');
		else {
			res.render('show', {
				locals: {
					field: field,
					docs: docs
				}
			});	
		}
	});
});



//list files found by certain attributes
//currently used as a search - but I think i'd like to
//change it to be like the following:
//   /find/[field]/[search]
//where [field] is a field like artist or album
//and [search] is the actual string for which the user 
//has searched
app.get('/find/:tag', function(req, res) {
	var tag = req.params.tag;
	console.log('search for tag: ' + tag);
	filesProvider.findByTag(tag, function(err, docs) {
		if (err) res.send(err)
		else {
			res.render('files', {
				locals: {
					files: docs
				}
			});
		}
	});
});

//download link - not used for streaming
app.get('/download/:id', function(req, res) {
	filesProvider.findById(req.params.id, function(error, file) {
		console.log("download:" + file.name);
		res.download(file.path + "/" + file.name);
	});
});

//like download - but used for streaming
app.get('/stream/:id', function(req, res) {
	filesProvider.findById(req.params.id, function(error, file) {
		console.log("stream:" + file.name);
		res.sendfile(file.path + "/" + file.name);
	});
});


//view the file - view automaticall determines type and
//sets up viewer
app.get('/view/:id', function(req, res) {
	filesProvider.findById(req.params.id, function(error, file) {
		console.log("view:" + file.name);
		res.render('stream', {
			locals: {
				file: file
			}
		});
	});
});

//start the server
app.listen(3000);
console.log('Express server started on port %s', app.address().port);
