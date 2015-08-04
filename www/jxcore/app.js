var fs = require('fs');
var express = require('express');
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var ejsEngine = require('ejs-locals');
var PouchDB = require('pouchdb');

var thaliReplicationManager;
var addressPrefix = 'addressbook-';
var currentDeviceAddress;
var currentUserName;
var dbName = 'thali';
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
var db = new LevelDownPouchDB(dbName);

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
* @param {String} err the error while generating the current device identity.
* @param {String} deviceIdentity the current device identity.
*/
function gotDeviceIdentity(err, deviceIdentity) {
  if(err != null) {
    console.log('failed to get current device identity - err: ', err);
    return;
  }
  
  if(deviceIdentity) {
    currentDeviceAddress = addressPrefix + deviceIdentity;
    // check if the db already has an addressbook entry for the current device
    db.get(currentDeviceAddress).then(function (doc) {
      // found the current device info in the db
      currentUserName = doc.author;
    }).catch(function (err) {
      // did not find current device address in the db - nothing to do for now
    });
  }
  else {
    console.log('deviceIdentity not obtained from the replicationmanager');
  }
}

function saveCurrentUserDataInDB() {
  if(!currentUserName || !currentDeviceAddress) {
    // not ready to add current user record to db
    return;
  }
  
  db.put({_id: currentDeviceAddress , author: currentUserName, destination: '',
    content: ''})
    .then(function (response) {
      // successfully saved the entry
      thaliReplicationManager.start(5000, dbName);
    })
  .catch(function (err) {
    // failed to saved the entry
    console.log('failed to save the curerrent device info in db - err: ', err);
  });
}

/**
* If available, the current device address is returned.
*/
app.get('/getDeviceAddress', function (req, res) {
  // current user name should be available by now
  if(currentUserName) {
    // start the replication manager
    thaliReplicationManager.start(5000, dbName);
    // return the user-name
    res.status(200).json(currentUserName);
  } else {
    // current user name is not available - need to show login controls
    res.sendStatus(404);
  }
});

app.get('/', function (req, res) {
  console.log('app.get START...');
  
  // see if current user name is available
  if(currentUserName) {
    thaliReplicationManager.start(5000, dbName);
    res.render('ejs/index', { user: currentUserName });
  } else if(currentDeviceAddress) { // see if current device address is set
    // check if the db already has an addressbook entry for the current device
    db.get(currentDeviceAddress).then(function (doc) {
      // found current device info in the db
      currentUserName = doc.author;
      // start the replication manager
      thaliReplicationManager.start(5000, dbName);
      res.render('ejs/index', { user: currentUserName });
    }).catch(function (err) {
      // did not find current device address - need to show login controls
      res.render('ejs/index', { user: '' });
    });
  } else {
    // wait until either the current user name or device address is available
    res.render('ejs/index', { user: '' });
  }
});

app.post('/login', function(req, res) {
  var userName = req.body.username.trim();
  if (userName.length > 0) {
    currentUserName = userName;
    saveCurrentUserDataInDB();
    res.render('ejs/index', { user: currentUserName });
  } else {
    res.render('ejs/login', { error: 'User name is required' });
  }
});

var server = app.listen(5000, function () {
  console.log('Express server started. (port: 5000)');

  var ThaliReplicationManager = require('./thali/thalireplicationmanager');
  thaliReplicationManager = new ThaliReplicationManager(db);
  // get the device id before starting the broadcast
  thaliReplicationManager.getDeviceIdentity(gotDeviceIdentity);
});
