var express = require('express');

// this is a mock API to start testing ajax calls from UI

function webview () {
    var api = express.Router();

    api.route('/DeviceIdentity')
    	.get(function(req, res) {
        	res.status(200).json({publicKeyHash:"ABC123"});
    	});

    api.route('/IdentityExchange')
    	.put(function(req, res) {
        	res.status(201);
    	})
    	.delete(function(req, res) {
    		res.status(404);
    	})
    	.get(function(req, res) {
    		var response = {
				peerFriendlyName: "Matt",
				peers:
				[
					{
						peerPublicKeyHash: "D01234",
						peerDeviceId: "D56789",
						peerFriendlyName: "David"
					},
					{
						peerPublicKeyHash: "T1000",
						peerDeviceId: "T1000000",
						peerFriendlyName: "Toby"
					}
				]
			};
    		res.status(200).json(response);
    	});

    api.route('/IdentityExchange/ExecuteExchange')
    	.put(function(req, res) {
    		res.status(202);
    	})
    	.get(function(req, res) {
    		var response = {
   				peerDeviceID: "some ugly string",
   				status: "complete",
   				verificationCode: 123456,
   				publicKeyHash: "some ugly string"
			};
			res.status(200).json(response);
    	})
    	.delete(function(req, res) {
    		res.status(404);
    	});

    return api;
}

module.exports = webview;