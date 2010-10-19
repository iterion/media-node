var Id3 = require('./id3-reader').Id3Reader;

var id3 = new Id3("media/Music/Spock's Beard/The Kindness Of Strangers/04 June.mp3");
console.log(id3);
if(id3.isId3v2(function(){})) {
	console.log("file is ID3");
} else {
	console.log("file is not ID3");
}
id3.readData();
