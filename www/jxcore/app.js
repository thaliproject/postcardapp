// This JavaScript file runs on JXcore

var fs = require('fs');
var clog = require('./utilities').log;
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');


// Remove powered by
app.disable('x-powered-by');

// Create in memory version
//TODO: uncomment later while testing in device
//var InMemPouchDB = PouchDB.defaults({db: require('memdown')});
var InMemPouchDB = PouchDB.defaults();
app.use('/db', require('express-pouchdb')(InMemPouchDB));
var db = new InMemPouchDB('postcarddb');
clog("JXcore is up and running!");

//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/', function(req,res){
    res.render('ejs/index',{title: 'Postcards'});
});

var cardRouter = require('./cardroutes')(db);
app.use('/api', cardRouter);

var server = app.listen(5000, function () {
  clog("Express server started. (port: 5000)");
});
