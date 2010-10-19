var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;


//connect to mongo
FilesProvider = function() {
	this.db = new Db('files-index', new Server('localhost', Connection.DEFAULT_PORT, {auto_reconnect: true}), {native_parser:true});
	this.db.open(function(){});
};

//Set up the collection
FilesProvider.prototype.getCollection = function(callback) {
	this.db.collection('files', function(error, files_collection) {
		if (error) callback(error);
		else callback(null, files_collection);
	});
};

//Return all records about files
FilesProvider.prototype.findAll = function(callback) {
	this.getCollection(function(error, files_collection) {
		if (error) callback(error)
		else {
			files_collection.find(function(error, cursor) {
				if (error) callback(error)
				else {
					cursor.toArray(function(error, results) {
						if (error) callback(error)
						else callback(null, results)
					});
				}
			});
		}
	});
};


//Find records containing a tag
//TODO update to allow for searching for multiple tags
FilesProvider.prototype.findByTag = function(tag, callback) {
	this.getCollection(function(error, files_collection) {
		if (error) callback(error)
		else {
			files_collection.find({tags: tag}, function(error, cursor) {
				if (error) callback(error)
				else {
					cursor.toArray(function(error, results) {
						if(error) callback(error)
						else callback(null, results)
					});
				}
			});
		}
	});
};

//Find record by object ID
FilesProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, files_collection) {
		if (error) callback(error)
		else {
			files_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
				if (error) callback(error)
				else callback(null, result)
			});
		}
	});	
};

//export so we can import it like a module
exports.FilesProvider = FilesProvider;
