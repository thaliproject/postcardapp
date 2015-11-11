var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var ThaliReplicationManager = require('thali/thalireplicationmanager');
var IdentityExchange = require('thali/identityExchange/identityexchange');
var webview = require('thali/identityExchange/identityexchangeendpoint');

// const
const PORT = 5000;
const DB_NAME = 'thali';
const DB_CARDS = 'cards';
const DB_ADDRESS_BOOK = 'addressbook';

console.log('starting app.js');
var app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('ejs',ejsEngine);
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:'+PORT);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function (req, res) {
    //res.sendFile(path.join(__dirname + '/index.html'));
    res.render('ejs/index', { isDebug:true, isMockMobile:process.env.MOCK_MOBILE });
});

// Mock native calls on mobile for desktop testing
if (process.env.MOCK_MOBILE) {
  global.Mobile = require('thali/mockmobile.js');
  app.use('/webview', require('./routes/mockwebview')()); // Mock Identity Exchange api for UX testing
}

// Temp path to save app data
var dbPath = path.join(os.tmpdir(), DB_CARDS);
var dbAddressBookPath = path.join(os.tmpdir(), DB_ADDRESS_BOOK);

// Get documents path to save app data
Mobile.GetDocumentsPath(function(err, location) {
  if (err) {
    console.error("Error getting Documents path.", err);
  } else {
    dbPath = path.join(location, DB_CARDS);
    dbAddressBookPath = path.join(location, DB_ADDRESS_BOOK);
    console.log("cards db location: ", dbPath);
    console.log("addressbook db location: ", dbAddressBookPath);
  }
});

// addressbook db
var LevelDownAddressBook = process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbAddressBookPath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbAddressBookPath});

app.use('/_db', require('express-pouchdb')(LevelDownAddressBook, { mode: 'minimumForPouchDB'}));
var dbPrivate = new LevelDownAddressBook('private');
app.use('/_api', require('./routes/_api')(dbPrivate));

// cards db
var LevelDownPouchDB = process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
var db = new LevelDownPouchDB(DB_NAME);
app.use('/api', require('./routes/api')(db));

var manager = new ThaliReplicationManager(db);
var identityExchange = new IdentityExchange(app, PORT, manager, DB_NAME);
app.use('/manager', require('./routes/manager')(manager));
webview(app, manager, identityExchange); // webview Identity Exchange API

manager.on('started', function () {
  console.log('*** Thali replication manager started ***');
});

var server = app.listen(PORT, function (){
    console.log('Express server started on port:', PORT);
    manager.start(PORT, DB_NAME);
});

// sync changes
db.changes({
    since: 'now',
    live: true
}).on('change', cardChanged);
var io = require('socket.io')(server);
function cardChanged(e) {
  console.log('card #' + e.id + ' changed');
  io.emit('cardChanged', e );
}
