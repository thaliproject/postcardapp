'use strict'; // This JavaScript file runs on JXcore
/*jshint esnext: true */
/*global Mobile */

var fs = require('fs');
if (!fs.existsSync(__dirname+"/node_modules")) {
  console.log("'node_modules' folder not found. Please refer to readme.md");
  return;
}
// if (!fs.existsSync(__dirname+"/public/bower_components")) {
//   console.log("'bower_components' folder not found. Please refer to readme.md");
//   return;
// }

var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
// var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var ThaliReplicationManager = require('thali/thalireplicationmanager');
var IdentityExchange = require('thali/identityExchange/identityexchange');
var webview = require('thali/identityExchange/identityexchangeendpoint');

// const
var PORT = 5000;
var DB_NAME = 'thali';
var DB_CARDS = 'cards';
var DB_ADDRESS_BOOK = 'addressbook';

console.log('starting app.js');
var app = express();
app.disable('x-powered-by');

// parse application/x-www-form-urlencoded (ie. req.body)
app.use( bodyParser.urlencoded({ extended: true, limit: '10mb' }) );
app.use( bodyParser.json({ limit: '1mb' }) );

// serve static files from multiple directories
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:'+PORT);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// app.engine('ejs',ejsEngine);
// app.set('view engine','ejs');

app.get('/', function (req, res) {
    // res.render('ejs/index', {
    //   isDebug : true,
    //   isMockMobile : process.env.MOCK_MOBILE
    // });
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// Mock native calls on mobile for desktop testing
if (process.env.MOCK_MOBILE) {
  global.Mobile = require('thali/mockmobile.js');
  // Mock Identity Exchange api for UX testing
  app.use('/webview', require('./routes/mockwebview')());
}

// Temp path to save app data
var dbPath = path.join(os.tmpdir(), DB_CARDS);
var dbAddrBookPath = path.join(os.tmpdir(), DB_ADDRESS_BOOK);

// Get documents path to save and persist app data
Mobile.GetDocumentsPath(function(err, location) {
  if (err) {
    console.error("Error getting Documents path.", err);
  } else {
    dbPath = path.join(location, DB_CARDS);
    dbAddrBookPath = path.join(location, DB_ADDRESS_BOOK);
    console.log("cards db location: ", dbPath);
    console.log("addressbook db location: ", dbAddrBookPath);
  }
});

// PouchDB addressbook
var LevelDownAddressBook =
  process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db:require('leveldown-mobile'), prefix:dbAddrBookPath}) :
    PouchDB.defaults({db:require('leveldown'), prefix:dbAddrBookPath});

app.use('/_db', require('express-pouchdb')(LevelDownAddressBook, {
  mode: 'minimumForPouchDB'
}));
var dbPrivate = new LevelDownAddressBook('private');
app.use('/_api', require('./routes/_api')(dbPrivate));

// PouchDB postcards
var LevelDownPouchDB =
  process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, {
  mode: 'minimumForPouchDB'
}));
var db = new LevelDownPouchDB(DB_NAME);
app.use('/api', require('./routes/api')(db));

// Thali replication manager
var manager = new ThaliReplicationManager(db);
var identityExchange = new IdentityExchange(app, PORT, manager, DB_NAME);
app.use('/manager', require('./routes/manager')(manager));
webview(app, manager, identityExchange); // webview Identity Exchange API

manager.on('started', function () {
  console.log('*** Thali replication manager started ***');
});

// Express server
var server = app.listen(PORT, function (){
    console.log('Express server started on port:', PORT);
    manager.start(PORT, DB_NAME);
});

// Socket.io sync postcard changes
var io = require('socket.io')(server);
db.changes({
    since: 'now',
    live: true
}).on('change', cardChanged);
function cardChanged(e) {
  console.log('card #' + e.id + ' changed');
  io.emit('cardChanged', e );
}

// notify when contact record is changed
dbPrivate.changes({
    since: 'now',
    live: true
}).on('change', contactChanged);
function contactChanged(e) {
  console.log('contact #' + e.id + ' changed');
  io.emit('contactChanged', e );
}

// Thali logger
manager._emitter.on('peerAvailabilityChanged', function (peers) {
  io.emit('peerAvailabilityChanged', peers);
});

manager._emitter.on('networkChanged', function (isAvailable) {
  io.emit('networkChanged', isAvailable);
});
