var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');

var addressPrefix = 'addressbook-';
var currentDeviceAddress;

console.log('starting app.js');

// Check if mobile or desktop
var dbPath = path.join(os.tmpdir(), 'dbPath');
var LevelDownPouchDB = process.platform === 'android'
  || process.platform === 'ios' ?
  PouchDB.defaults({db: require('leveldown-mobile'), prefix: dbPath}) :
  PouchDB.defaults({db: require('leveldown'), prefix: dbPath});

var app = express();
app.disable('x-powered-by');

// Adding body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add Express PouchDB
app.use('/db', require('express-pouchdb')(LevelDownPouchDB,
  { mode: 'minimumForPouchDB'}));
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

/**
* This is the callback function that is passed to the getDeviceIdentity() API
* of the replcationmanager. If the current device id is already available in
* the replication manager, this function is called immediately. If not, this
* function is called whenever the device identity becomes available.
* @param {String} deviceIdentity the current device identity.
*/
function gotDeviceIdentity(deviceIdentity) {
  if(deviceIdentity) {
    currentDeviceAddress = addressPrefix + deviceIdentity;
    // check if the db already has an addressbook entry for the current device
    db.get(currentDeviceAddress).then(function (doc) {
      // found current device address in db - nothing to do
    }).catch(function (err) {
      //did not find current device address - adding it now
      db.put({_id: currentDeviceAddress , author: '', destination: '',
        content: ''})
        .then(function (response) {
          // successfully saved the entry
        })
      .catch(function (err) {
          // failed to saved the entry
        console.log('failed to save the device address in db - err: ', err);
      });
    });
  }
  else {
    console.log('deviceIdentity not obtained from the replicationmanager');
  }
}

/**
* If available, the current device address is returned.
*/
app.get('/getDeviceAddress', function (req, res) {
  if(currentDeviceAddress) {
    // return the current device address
    res.status(200).json(currentDeviceAddress);
  } else {
    res.status(404); // return a failure
  }
});

app.get('/', function (req, res) {
  if(currentDeviceAddress) {
    res.render('ejs/index',  { user: currentDeviceAddress });
  } else {
    res.render('ejs/index',  { user: '' }); // send an empty string
  }

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

  var ThaliReplicationManager = require('./thali/thalireplicationmanager');
  var manager = new ThaliReplicationManager(db);
  
  manager.getDeviceIdentity(gotDeviceIdentity);
  manager.start(5000, 'thali');
});
