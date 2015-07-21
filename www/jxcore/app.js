var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');

var addressPrefix = 'addressbook-';

console.log('starting app.js');

// Check if mobile or desktop
var dbPath = path.join(os.tmpdir(), 'dbPath');
var LevelDownPouchDB = process.platform === 'android' || process.platform === 'ios' ?
  PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
  PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

var app = express();
app.disable('x-powered-by');

// Adding body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add Express PouchDB
app.use('/db', require('express-pouchdb')(LevelDownPouchDB, { mode: 'minimumForPouchDB'}));
var db = new LevelDownPouchDB('thali');

var cardRouter = require('./cardroutes')(db);
app.use('/api', cardRouter);

//Adding the ejs view engine
app.engine('ejs',ejsEngine);
app.set('view engine','ejs');
app.use( express.static( 'public' ) );

// Add Allow x-domain calls
app.use(function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', function (req, res) {
  var cryptomanager = require('./thalicryptomanager');
  cryptomanager.getPublicKeyHash(function (publicKeyHash) {
    console.log('app.get - getPublicKeyHash11111');
    if (publicKeyHash == null) {
      console.log('got null for publicKeyHash');
      res.render('ejs/index',  { user: 'user' + Math.floor(Math.random() * 100) });
    } else {
      console.log('got publicKeyHash length: ', publicKeyHash.length);
      console.log('got publicKeyHash: ', publicKeyHash);
      var currentAddrEntry = addressPrefix + publicKeyHash;
      console.log('currentAddrEntry: ', currentAddrEntry);
      res.render('ejs/index',  { user: currentAddrEntry });
    }
    console.log('app.get - getPublicKeyHash99999');
  });

  /*
  db.get('me').then(function (doc) {
    res.render('ejs/index',  { user: doc.user });
  }).catch(function (err) {
    res.render('ejs/login', { error: err });
  });
  */
});

app.post('/login', function(req, res) {
  /*
  var userName = req.body.username.trim();
  if (userName.length > 0) {
    db.get('me', function (err, doc) {
      if (err && err.status === 404) {
        db.put({ _id: 'me', user: userName })
          .then(function () {
            res.render('ejs/index', { user: userName });
          })
          .catch(function (err) {
            res.render('ejs/login', { error: err });
          });
      } else if (err) {
        res.render('ejs/login', { error: err });
      } else {
        // Change the user name if it doesn't match
        if (doc.user !== userName) {
          doc.user = userName;
          db.put(doc)
            .then(function () {
              res.render('ejs/index', { user: userName });
            })
            .catch(function (err) {
              res.render('ejs/login', { error: err });
            }); 
        } else {
          res.render('ejs/index', { user: userName });
        }
      }
    });
  } else {
    res.render('ejs/login', { error: 'User name is required' });
  }
  */
});

var server = app.listen(5000, function () {
  console.log('Express server started. (port: 5000)');

  var ThaliReplicationManager = require('./thalireplicationmanager');
  var manager = new ThaliReplicationManager(db);
  manager.start(5000, 'thali');
});
