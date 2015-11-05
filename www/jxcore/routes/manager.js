var express = require('express');

function managerRoutes (manager) {
    var router = express.Router();

    router.route('/start').get(function(req, res) {
      console.log("*** START TRM ***");
      manager.start(5000, 'thali');
      res.status(200).end();
    });

    router.route('/stop').get(function(req, res) {
      console.log("*** STOP TRM ***");
      manager.stop();
      res.status(200).end();
    });

    return router;
}

module.exports = managerRoutes;
