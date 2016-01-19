'use strict';

var _ = require('lodash');
var Twit = require('twit');
var sentiment = require('sentiment');
var firebase = require('firebase'); 
// Fake Keys Replace With Your Own!!!!
var twitter = new Twit({
    consumer_key: 'rbQ7q6ZvSLCwp51U2ZWnDhsm7',
    consumer_secret: '7XXa3JHpq6zYUfy4Hrj62V21pmpg8c0VsWr8W9sq8ELgQnwU56',
    access_token: '3100829814-eQ3a1CYvs2c8Bqu886AGkGDj8fU9zfEX9aOHU4i',
    access_token_secret: 'VwZcFYsyoKas9G1b2UgRR88gILwCWe55e8zBBZPfWIqG3'
  });
var stream;
// Get list of tweetstreams
exports.index = function(req, res) {
  res.json([]);
};


exports.startStream = function(req, res) {

stream = twitter.stream('statuses/filter', { track: 'obama', language: 'en'});


stream.on('tweet', function (tweet) {
	if (tweet.geo != null){
	console.log(tweet.text)
	var myFirebaseRef = new firebase("https://aired.firebaseio.com/geotweets/obamaStream/data/" + tweet.id);
	myFirebaseRef.set({main : {lat:tweet.geo.coordinates[0], lng:tweet.geo.coordinates[1], data: sentiment(tweet.text).score}});
	myFirebaseRef = new firebase("https://aired.firebaseio.com/geotweets/obamaStream/timestamp");
	myFirebaseRef.set({stamp: firebase.ServerValue.TIMESTAMP})
 	// stream.stop();
}
})

res.send(200)

};


exports.endStream = function(req, res) {
 stream.stop();
 res.send("Done",200)

};