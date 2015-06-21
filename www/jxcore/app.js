// This JavaScript file runs on JXcore

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');

console.log('starting app.js');

// Remove powered by
app.disable('x-powered-by');

//TODO: Should we move the 'self' support to JxCore?
global.self = global;


var path= require('path');
var os = require('os');
var dbPath = path.join(os.tmpdir(), "dbPath");
global.thalifolder = os.tmpdir(); //Used by express-pouchdb as well

var LevelDownPouchDB = PouchDB.defaults({db: require('leveldown')});

app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
console.log('Added express pouchdb support to app');


var db = new LevelDownPouchDB(dbPath);

//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
console.log('Added bodyparser..');


app.get('/', function(req,res){
    db.get('me').then(function (doc) {
        console.log(doc); //current user details
        res.render('ejs/index', {title: 'Postcards'});
    }).catch(function (err) {
        console.log(err);
        res.render('ejs/login');
    });
 });


app.post('/login', function(req,res){
    var userName = req.body.username.trim();
    if(userName !== "") {
        db.put({
            _id: 'me',
            user: userName
        }, function (err, doc) {
            console.log(doc);
        });
        // already logged in
        res.render('ejs/index', {title: 'Postcards'});
    }
    else {
        // empty login name
        res.render('ejs/login');
    }
});

app.post('/sync', function(req,res){
    var endpoint = req.body.endpoint.trim();
    if(endpoint !== "") {
       //TODO: Replicate the db to the endpoint given
    }
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
  console.log("Express server started. (port: 5000)");
});


