require.paths.unshift('support/mongoose/lib');

var express = require('express'),
    app = express.createServer(),
		mongoose = require('mongoose');

var setup = require('./lib/setup.js').setup({
	app: app,
	mongoose: mongoose
});
//var FilesProvider = require('./files-provider').FilesProvider;

//var filesProvider = new FilesProvider();

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	app.use(app.router);
	app.set('views', 'views');
	app.set('view engine', 'jade');
});

//list all files
app.get('/', function(req, res) {
	console.log('requested index');	
	//filesProvider.findAll(function(err, docs) {
	File.find({}, function (err, docs) {
		res.render('index', {
			locals: {
				files: docs
			}
		});
	});
});

app.get('/list/all.:format?', function(req, res) {
	console.log('requested list all');	
	var format = req.params.format || 'html';
	filesProvider.findAll(function(err, docs) {
		if(format == 'json') {
			res.send(docs);
		} else {
			res.render('files', {
				locals: {
					files: docs
				}
			});	
		}
	});	
});


app.get('/list/:field.:format?', function(req, res) {
	var field = req.params.field;
	var format = req.params.format;
	console.log('list ' + field + 's');
	File.distinct(field, {}, function(err, docs) {
		if (format == 'json') {
			res.send(docs);
		} else {
			if (err) res.redirect('home');
			else {
				res.render('list', {
					locals: {
						field: field,
						values: docs
					}
				});	
			}
		}
	});
});


app.get('/list/:field/for/:field2/:value.:format?', function(req, res) {
	var field = req.params.field;
	var field2 = req.params.field2;
	var value = req.params.value;
	var format = req.params.format;
	console.log('list ' + field + 's for ' + field2 + ': ' + value);
	filesProvider.getPossibleForCriteria(field, field2, value, function(err, docs) {
		if (format == 'json') {
			res.send(docs);
		} else {
			res.redirect('home');
		}
	});
});


app.get('/show/:field/:query.:format?', function(req, res) {
	var field = req.params.field;
	var query = req.params.query;
	var format = req.params.format;
	console.log('show tracks for the ' + query + ' ' + field);
	filesProvider.queryField(field, query, function(err, docs) {
		if (format == 'json') {
			res.send(docs);
		} else {
			if (err) res.redirect('home');
			else {
				res.render('show', {
					locals: {
						field: field,
						docs: docs
					}
				});	
			}
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
		if(file) {
			console.log("download:" + file.name);
			res.download(file.path + "/" + file.name);
		} else {
			//send error message that client can handle
			console.log("no file");
			console.log(error);
		}
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
