var Id3 = require('./id3-reader').Id3Reader;

var id3 = new Id3("media/Music/Spock's Beard/The Kindness Of Strangers/06 Harm's Way.mp3");
console.log(id3);
id3.readData(function(data) {
	console.log(data);
});/*
var id2 = new Id3("media/Anime/Last Exile/Last.Exile.03.Transpose.[AXP].[Dual-Audio].[52D07FDD].ogm");
console.log(id2);
id2.readData(function(data) {
	console.log(data);
});*/
var id1 = new Id3("media/Music/Yellow Matter Custard/02 I'll Be Back.mp3");
console.log(id1);
id1.readData(function(data) {
	console.log(data);
});
