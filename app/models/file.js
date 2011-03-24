var Schema = require('mongoose').Schema;

exports.File = new Schema({
	title			: String,
	album			: String,
	track			: String,
	artist		: String,
	path			: String,
	name			: String,
	ext				: String,
	size			: Number
});
