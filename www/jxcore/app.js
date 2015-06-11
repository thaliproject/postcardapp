// This JavaScript file runs on JXcore

var fs = require('fs');
//var clog = require('./utilities').log;
var express = require('express');
var app = express();
var cardRouter = express.Router();
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');
var bodyParser = require('body-parser')
var shortid = require('shortid');

// Remove powered by
app.disable('x-powered-by');

// Create in memory version
//TODO: uncomment later while testing in device
//var InMemPouchDB = PouchDB.defaults({db: require('memdown')});
var InMemPouchDB = PouchDB.defaults();
app.use('/db', require('express-pouchdb')(InMemPouchDB));
var db = new InMemPouchDB('postcarddb');
//clog("JXcore is up and running!");

//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( "public" ) );

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cardRouter);


cardRouter.route('/cards')
    .post(function(req,res){
        console.log(req.body);
        var newCard = {
            id:shortid.generate(),
            author: req.body.author,
            content: req.body.content
        };
        db.put({
            _id: newCard.id,
            author: newCard.author,
            content: newCard.content
        }, function (err, doc) {
            console.log(doc);
        });
        db.get(newCard.id).then(function (doc) {
            res.status(201).send(doc);
        }).catch(function (err) {
            console.log(err);
        });
    })
    .get(function(req,res){
        res.render('ejs/index',{title: 'Postcards'});
    });
cardRouter.route('/:cardId')
    .get(function(req,res){
        db.get(req.params.cardId).then(function (err,doc) {
            if(err)
                res.status(500).send(err);
            else
                res.json(doc);
        }).catch(function (err) {
            console.log(err);
        });
    })
    .put(function(req,res){
        //TODO: update the item
    });


var server = app.listen(5000, function () {
  //clog("Express server started. (port: 5000)");
});
