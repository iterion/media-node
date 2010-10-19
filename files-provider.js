var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

FilesProvider = function() {
	this.db = new Db('files-index', new Server('localhost', Connection.DEFAULT_PORT, {auto_reconnect: true}), {native_parser:true});
	this.db.open(function(){});
};

FilesProvider.prototype.getCollection = function(callback) {
	this.db.collection('files', function(error, files_collection) {
		if (error) callback(error);
		else callback(null, files_collection);
	});
};

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

exports.FilesProvider = FilesProvider;
