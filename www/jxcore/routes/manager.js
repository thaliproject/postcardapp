'use strict';
var express = require('express');

function managerRoutes (manager) {
    var router = express.Router();

    router.route('/start').get(function(req, res) {
      console.log("*** START TRM ***");
      manager.on('started', function () {
        console.log('*** Thali replication manager started');
        res.status(200).end();
      });
      manager.on('startError', function (err) {
        console.log('*** Thali replication failed to start: %s', err);
        res.status(500).end();
      });
      manager.start(5000, 'thali');
    });

    router.route('/stop').get(function(req, res) {
      console.log("*** STOP TRM ***");
      manager.on('stopped', function () {
        console.log('*** Thali replication manager has stopped');
        res.status(200).end();
      });
      manager.on('stopError', function (err) {
        console.log('*** Thali replication manager failed to stop: %s', err);
        res.status(500).end();
      });
      manager.stop();
    });

    return router;
}

module.exports = managerRoutes;
