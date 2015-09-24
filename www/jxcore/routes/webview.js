var express = require('express');
var faker = require('faker');

// this is a mock API to start testing ajax calls from UI

function webview (manager) {
    var api = express.Router();

    // fake user's personal public key
    var publicKeyHash = faker.random.uuid();

    // faker functions
    function fakePeers() {
        var data = {
                    peerFriendlyName: "Me",
                    peers: []
                };
        var i = Math.floor( Math.random()*10 );
        console.log("found "+i+" peers");
        while(i--) {
            var peerPublicKeyHash = faker.random.uuid();
            var peerDeviceId = faker.random.uuid();
            var peerFriendlyName = faker.internet.userName();
            data.peers.push({ 
                "peerPublicKeyHash" : peerPublicKeyHash, 
                "peerDeviceId" : peerDeviceId, 
                "peerFriendlyName" : peerFriendlyName });
        }
        return data;
    }

    // returns random 6 digit string
    function generateCode() {
        return (""+Math.random()).substring(2,8); 
    }

    // rest api
    api.route('/DeviceIdentity')
    	.get(function(req, res) {
        	res.status(200).json({publicKeyHash:publicKeyHash});
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



module.exports = webview;