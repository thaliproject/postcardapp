'use strict';
var express = require('express');

function addressBookRoutes (db) {
  var router = express.Router();

  // Save / update user record
  router.route('/login').post(function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    // form validation
    if (typeof req.body.username === 'undefined' ||
    typeof req.body.deviceIdentity === 'undefined') {
      res.status(400).json({ error: 'User identity is undefined' });
      return;
    }
    // user input validation
    var username = req.body.username.trim();
    var deviceIdentity = req.body.deviceIdentity.trim();
    if (username.length <= 0 || deviceIdentity.length <= 0) {
      res.status(400).json({ error: 'User identity is required' });
      return;
    }
    // send form submission reponse
    var contactId = 'addressbook-' + deviceIdentity;
    db.get(contactId)
    .then(function(doc){
      if (doc && doc.username !== username) {
        // Username found, but record needs updated
        console.log(doc.username+" user updated to: "+username);
        doc.username = username;
        db.put(doc)
        .then(function () {
          res.send(JSON.stringify({ username: username }));
        })
        .catch(function (err) {
          res.send(JSON.stringify({ error: err }));
        });
      } else {
        // Respond with the username record
        console.log("Same user: " + doc.username );
        res.send(JSON.stringify({ username: doc.username }));
      }
    })
    .catch(function(err){
      if(err && err.status === 404) {
        // No 'me' record found - add new record
        console.log("User added:" + username + " id:" + contactId);
        db.put({
          _id: contactId,
          username: username,
          dateCreated: Math.floor((new Date()).getTime() / 1000)
        })
        .then(function () {
          res.send(JSON.stringify({ username: username }));
        })
        .catch(function (err) {
          res.send(JSON.stringify({ error: err }));
        });
      } else {
        // Something else went wrong - notify client of error
        res.send(JSON.stringify({ error: err }));
      }
    });
  });

  // check for user entry
  router.route('/me/:contactId').get(function(req, res) {
    db.get(req.params.contactId).then(function(doc){
      res.status(200).json(doc);
    }).catch(function(err){
      res.send(JSON.stringify({ error: err }));
    });
  });

  // save contacts
  router.route('/contacts')
  .get(function (req, res) {
    db.allDocs({
      include_docs: true
    }).then(function (docs) {
      res.status(200).json(docs);
    }).catch(function (err) {
      res.status(err.status || 500).send(err.message || err);
    });
  });

  router.route('/contacts/:contactId')
  .get(function (req,res) {

    db.get(req.params.contactId)
    .then(function (doc) {
      res.status(200).json(doc);
    })
    .catch(function (err) {
      res.status(err.status || 500).send(err.message || err);
    });

  })
  .put(function (req, res) {

    db.get(req.params.contactId, function (err, doc) {
      // Not found so let's add it
      if (err && err.status === 404) {

        db.put({
          _id: req.params.contactId,
          username: req.body.username,
          dateCreated: Math.floor((new Date()).getTime() / 1000)
        })
        .then(function (response) {
          res.status(200).json(response);
        })
        .catch(function (err) {
          res.status(err.status || 500).send(err.message || err);
        });
      } else if (err) {
        res.status(err.status || 500).send(err.message || err);
      } else {
        doc.content = req.body.content;
        db.put(doc)
        .then(function (response) {
          res.status(200).json(response);
        })
        .catch(function (err) {
          res.status(err.status || 500).send(err.message || err);
        });
      }
    });
  })
  .delete(function (req, res) {

    // Race condition, so let's drop 404s if we get them
    db.get(req.params.contactId, function (err, doc) {
      if (err && err.status === 404) {
        res.status(200).end();
      } else if (err) {
        res.status(err.status || 500).send(err.message || err);
      } else {
        db.remove(doc)
        .then(function (response) {
          res.status(200).json(response);
        }).catch(function (err) {
          res.status(err.status || 500).send(err.message || err);
        });
      }
    });
  });

  router.route('/destroy').delete(function (req, res) {
    db.destroy().then(function (response) {
      console.log("destroyed address db");
      res.status(200).json(response); // success
    }).catch(function (err) {
      console.log(err);
      res.status(err.status || 500).send(err.message || err);
    });
  });

  return router;
}

module.exports = addressBookRoutes;
