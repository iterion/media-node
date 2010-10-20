var Id3 = require('./id3-reader').Id3Reader;

var id3 = new Id3("media/Music/Spock's Beard/The Kindness Of Strangers/03 Cakewalk On Easy Street.mp3");
console.log(id3);
id3.readData(function(data) {
	console.log(data);
});
