// This JavaScript file runs on JXcore

var fs = require('fs');
var clog = require('./utilities').log;
//var http = require('http');
var express = require('express');
var app = express();
var ejsEngine = require('ejs-locals');

clog("JXcore is up and running!");

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

app.engine('ejs',ejsEngine);
app.set('view engine','ejs');

app.get('/',function(req,res){
  res.render('ejs/index',{title: 'Postcards'});
});

var server = app.listen(3456, function () {
  clog("Express server is started. (port: 3456)");
});

/*
app.get('/', function (req, res) {
  res.send('Hello World! (' + Date.now() + ")");
  clog("Request", req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress, new Date());
});

var server = app.listen(3000, function () {
  clog("Express server is started. (port: 3000)");
});

var os = require('os');
var net = os.networkInterfaces();

for (var ifc in net) {
  var addrs = net[ifc];
  for (var a in addrs) {
    if (addrs[a].family == "IPv4") {
      cordova('addIp').call(addrs[a].address);
    }
  }
}

*/