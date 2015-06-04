// This JavaScript file runs on JXcore

var fs = require('fs');
var clog = require('./utilities').log;
//var http = require('http');
var express = require('express');
var app = express();
var ejsEngine = require('ejs-locals');

clog("JXcore is up and running!");
/*
cordova('getBuffer').registerSync(function() {
  clog("getBuffer is called!!!");
  var buffer = new Buffer(25000);
  buffer.fill(45);

  // send back a buffer
  return buffer;
});

cordova('asyncPing').registerAsync(function(message, callback){
  setTimeout(function() {
    callback("Pong:" + message);
  }, 500);
});

*/

app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.get('/',function(req,res){
  res.render('ejs/index',{title: 'Postcards'});
});

var server = app.listen(5000, function () {
  clog("Express server started. (port: 5000)");
});
