// This JavaScript file runs on JXcore

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var userName;

logMe('starting app.js');

// Remove powered by
app.disable('x-powered-by');

//TODO: Should we move the 'self' support to JxCore?
global.self = global;


var path= require('path');
var os = require('os');
var dbPath = path.join(os.tmpdir(), "dbPath");
global.thalifolder = os.tmpdir(); //Used by express-pouchdb as well

var LevelDownPouchDB = PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
logMe('Added express pouchdb support to app');
var db = new LevelDownPouchDB('thali');

//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
logMe('Added bodyparser..');


app.get('/', function(req,res){
    db.get('me').then(function (doc) {
        logMe(doc); //current user details
        if(doc.hasOwnProperty('user'))
            userName = doc['user'];
        res.render('ejs/index',  {user: userName});
    }).catch(function (err) {
        logMe(err);
        res.render('ejs/login');
    });
 });


app.post('/login', function(req,res){
    userName = req.body.username.trim();
    logMe('userName=' + userName);
    if(userName !== "") {
        db.put({
            _id: 'me',
            user: userName
        }, function (err, doc) {
           logMe('error=' + doc);
        });
        // already logged in
        res.render('ejs/index', {user: userName});
    }
    else {
        // empty login name
        res.render('ejs/login');
    }
});

//Sync handler to sync the remote pouchDB
app.post('/sync', function(req,res){
    var remoteIP = req.body.endpoint.trim();
    var remoteDB = 'http://' + remoteIP+ ':5000/db/thali';
    if(remoteDB !== "") {
        db.sync(remoteDB, {
            live: false
        }).on('change', function (change) {
            logMe(change);
        }).on('error', function (err) {
            logMe(err);
        });
    }
    //Redirect to index page to show the updated entries
    res.render('ejs/index',  {user: userName});
});

app.get('/sync', function(req,res){
    res.render('ejs/sync');
});


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

var cardRouter = require('./cardroutes')(db);
app.use('/api', cardRouter);

var server = app.listen(5000, function () {
    logMe("Express server started. (port: 5000)");
});

//Custom log method.
//TODO: update the log to file if Logcat messages are not reachable for debug
function logMe(txt){
    console.log(txt);
}


