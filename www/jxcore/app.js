var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var ThaliReplicationManager = require('thali/thalireplicationmanager');

console.log('starting app.js');

var dbPath = path.join(os.tmpdir(), 'dbPath');
var LevelDownPouchDB = process.platform === 'android' || process.platform === 'ios' ?
    PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
    PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

var app = express();
app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
var db = new LevelDownPouchDB('thali');

var cardRouter = require('./cardroutes')(db);
app.use('/api', cardRouter);

app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( 'public' ) );

app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function (req, res) {
    res.render('ejs/index',  { user: 'user' + Math.floor(Math.random() * 100) });
});

var server = app.listen(5000, function () {
    console.log('Express server started. (port: 5000)');

    var manager = new ThaliReplicationManager(db);
    manager.start(String(Math.floor(Math.random() * 100)), 5000, 'thali');
});
