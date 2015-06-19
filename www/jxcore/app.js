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


/*
app.use('/db', require('express-pouchdb')(PouchDB, {
    overrideMode: {
        exclude: [
            'routes/log',
            'routes/http-log'
        ]
    }
}));

*/

var path= require('path');
var os = require('os');
var dbPath = path.join(os.tmpdir(), "dbPath");
console.log(dbPath);
var db = new PouchDB(dbPath);


//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/', function(req,res){
    res.render('ejs/index',{title: 'Postcards'});
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


