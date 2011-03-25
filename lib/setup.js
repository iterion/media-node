module.exports.setup = function(o) {
	global.db = o.mongoose.connect('mongodb://localhost/files-index');
	
	o.mongoose.model("File", require("../app/models/file.js").File);
	global.File = db.model("File");

};
