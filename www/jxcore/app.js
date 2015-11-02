var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var ThaliReplicationManager = require('thali/thalireplicationmanager');

console.log('starting app.js');
var app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dbPath = path.join(os.tmpdir(), 'dbPath');
var dbPrivatePath = path.join(os.tmpdir(), 'dbPrivatePath');

var env = process.env.NODE_ENV || 'production'; // default to production

if (process.env.MOCK_MOBILE) {
  global.Mobile = require('thali/mockmobile.js');
}

if (process.platform === 'ios' || process.platform === 'android') {
  Mobile.getDocumentsPath(function(err, location) {
    if (err) {
      console.error("Error", err);
    } else {
      dbPath = path.join(location, 'dbPath');
      dbPrivatePath = path.join(location, 'dbPrivatePath');
      console.log("Mobile Documents dbPath location: ", dbPath);
      console.log("Mobile Documents dbPrivatePath location: ", dbPrivatePath);
    }
  });
}

// private db
var PrivatePouchDB = process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPrivatePath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbPrivatePath});

app.use('/db', require('express-pouchdb')(PrivatePouchDB, { mode: 'minimumForPouchDB'}));
var dbPrivate = new PrivatePouchDB('private');
app.use('/_api', require('./privateroutes')(dbPrivate)); // private api


// shared db
var LevelDownPouchDB = process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
var db = new LevelDownPouchDB('thali');

app.use('/api', require('./cardroutes')(db));

app.engine('ejs',ejsEngine);
app.set('view engine','ejs');

app.use( express.static(path.join(__dirname, 'public') ) );
app.use( '/bower_components', express.static( path.join(__dirname, 'bower_components') ) );

app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function (req, res) {
    //res.sendFile(path.join(__dirname + '/index.html'));
    res.render('ejs/index', { isDebug:false, isDevelopment:('development'===env) });
});

var server = app.listen(5000, function () {
    console.log('Express server started. (port: 5000)');

    var manager = new ThaliReplicationManager(db);
    manager.start(5000, 'thali');
});

// Mock webview
app.use('/webview', require('./routes/webview')());

// Sync changes
db.changes({
    since: 'now',
    live: true
}).on('change', cardChanged);
var io = require('socket.io')(server);
function cardChanged(e) {
  console.log('card #' + e.id + ' changed');
  io.emit('cardChanged', e );
}
