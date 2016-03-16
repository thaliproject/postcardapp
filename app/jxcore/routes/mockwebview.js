'use strict';
var express = require('express');
var faker = require('faker');

// this is a mock API for localhost development to test Identity Exchange UI

function mockWebviewRoutes () {
    var api = express.Router();

    // fake user's personal public key
    var publicKeyHash = faker.internet.password(22)+'==';

    var pollingData = {
                peerFriendlyName: "Me",
                peers: []
            };

    // faker functions
    function fakePeers() {
        // remove
        if (Math.random()*1 > 0.9) {
          var x = Math.round( Math.random()*pollingData.peers.length );
          if (x>0) {
            console.log("lost "+x+" peers");
            while (x--) {
              pollingData.peers.splice( Math.floor(
                Math.random()*pollingData.peers.length), 1);
            }
          }
        }

        // add
        var i = Math.round( Math.random()*1 );
        console.log("found "+i+" new peers");
        while (i--) {
            var peerPublicKeyHash = faker.random.uuid();
            var peerDeviceId = faker.random.uuid();
            var peerFriendlyName = faker.internet.userName();
            pollingData.peers.push({
                "peerPublicKeyHash" : peerPublicKeyHash,
                "peerDeviceId" : peerDeviceId,
                "peerFriendlyName" : peerFriendlyName });
        }
        return pollingData;
    }

    // returns random 6 digit string
    function generateCode() {
        return (""+Math.random()).substring(2,8);
    }

    // rest api
    api.route('/DeviceIdentity')
    	.get(function(req, res) {
        	res.status(200).json({deviceIdentity:publicKeyHash}); // publicKeyHash
    	});

    api.route('/IdentityExchange')
    	.put(function(req, res) {
            setTimeout(function() {
                var peerFriendlyName = req.body.peerFriendlyName.trim();
                console.log(peerFriendlyName);
        	   res.sendStatus(201);
            },1000);
    	})
    	.delete(function(req, res) {
    		res.sendStatus(204);
    	})
    	.get(function(req, res) {
            var response = fakePeers(); // random list of contacts
    		res.status(200).json(response);
    	});

    api.route('/IdentityExchange/ExecuteExchange')
    	.put(function(req, res) {
    		res.sendStatus(202);
    	})
    	.get(function(req, res) {
            var peerDeviceId = faker.random.uuid();
            var publicKeyHash = faker.random.uuid();
            var verificationCode = generateCode();
    		var response = {
   				peerDeviceId: peerDeviceId,
   				status: "complete",
   				verificationCode: verificationCode,
   				publicKeyHash: publicKeyHash
			};
			res.status(200).json(response);
    	})
    	.delete(function(req, res) {
    		res.sendStatus(204);
    	});

    return api;
}



module.exports = mockWebviewRoutes;
