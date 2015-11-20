'use strict';
/*global alert, IS_DEBUG, IS_MOCKMOBILE, socket, log, page, uuid, appDev */
/*exported getURL, URLSafeBase64, generatePostcardId, addressBookId */

// Polymer app
var myApp = document.querySelector('#my-app');

// myApp defaults
myApp.title = "Postcards";
// default route
myApp.route = "home"; // NB: redirects to 'login' if no app.username
// origin
myApp.host = "http://localhost:5000";
// postcard api routes
myApp.api = myApp.host + "/api/";
// private api routes
myApp._api = myApp.host + "/_api/";
// identity exchange api
myApp.webview = myApp.host + "/webview/";
// manager api
myApp.manager = myApp.host + "/manager/";

// myApp user session vars
myApp.username = "";
myApp.deviceIdentity = "";

// Setup debug mode once Polymer template is bound
myApp.addEventListener('dom-change', function() {
	// developer mode
	if ( isFunction(appDev()) ) {
		console.log("Config debug: " + IS_DEBUG + " MockMobile: " + IS_MOCKMOBILE);
		appDev(); // defined in 'app_dev.js'
	}

	// app modal dialog
	myApp.discoverButton = document.querySelector("#discoverButton");
	myApp.modalDialog = document.querySelector("modal-identity");
	if(myApp.discoverButton) {
		myApp.discoverButton.addEventListener("click", openModalDialog);
		//myApp.discoverButton.removeAttribute("hidden");
	}

	// auto-refresh content when card changed
	socket.on("cardChanged", function (data) {
		console.log("*** client received card changes ***");
		console.log(data);
		var event = new CustomEvent('card-changed', { 'detail': data });
		document.querySelector('page-home').dispatchEvent(event);
	});

	// log jxcore events
	socket.on("peerAvailabilityChanged", function (peers) {
		var i = peers.length;
		while (i--) {
			var peer = peers[i];
			log("peer available:" + peer.peerAvailable +
        " id:" + peer.peerIdentifier + " peerName:" + peer.peerName);
		}
	});

	socket.on("networkChanged", function (isAvailable) {
		log("networkChanged isAvailable: " + isAvailable);
		if (!isAvailable) {
			alert("Working offline.");
		}
	});

});

function openModalDialog(e) {
	if(myApp.modalDialog){
		console.log("openModalDialog");
		myApp.modalDialog.open();
	}
}

// myApp client-side route handler
function getURL(route, paramArray){
	if(route === myApp.route) {
		console.log("== page already routed '"+ route +"' ==");
		return false;
	}

  // client-side routing handled using page.js
	var path = '/'+route;
	if(paramArray && paramArray.length>0) {
		for(var i=0; i<paramArray.length; i++) {
			path = path + '/' + paramArray[i]; // eg. '/editor/1'
		}
	}

	console.log("=> getURL route: " + route);
	page(path);
}

// Takes a Base64 string and removes the URL unsafe characters
var URLSafeBase64 = {
  encode: function(string) {
    // Replace '/' with '_' and remove ending '='
    return string.replace(/\//g, '_').replace(/=+$/, '');
  },
  decode: function(base64) {
    // Append ending '='
    base64 += new Array(5 - base64.length % 4).join('=');
    // Replace '_' with '/'
    return base64.replace(/\_/g, '/');
  }
};

// generate unique id for postcard
function generateUUID() {
    return uuid.v4(); // using node-uuid
}

// generate cryptnum for postcard
function generateCryptnum() {
	if(window.crypto) {
		var buf = new Uint32Array(1);
		window.crypto.getRandomValues(buf);
		return buf[0];
	}
	return generateUUID().replace('-',''); // fallback
}

function generatePostcardId() {
	return 'postcard-' + generateCryptnum() +'-'+ myApp.deviceIdentity;
}

function addressBookId(deviceIdentity) {
	return 'addressbook-' + deviceIdentity;
}

function isFunction(functionToCheck) {
	return functionToCheck &&
    Object.prototype.toString.call(functionToCheck) === '[object Function]';
}

// -----------------------------------------------------------------------------
// Handle Cordova webview events
// -----------------------------------------------------------------------------

// Listen for messages posted to iframe
window.addEventListener('message', receiveMessage, false);

// Handle cross origin message
function receiveMessage(event) {
	console.log('iframe received message');

  if (event.origin !== "file://") {
    console.log("Access denied :[");
    return;
  }

	if (event.data.error) {
		console.log("Cordova image data error: " + event.data.error);
		var event = new CustomEvent('camera-error', { 'detail': event.data.error });
		document.querySelector('page-editor').dispatchEvent(event);
		return;
	}

	if (event.data.image) {
		console.log("Cordova image data received!");
		var event = new CustomEvent('camera-success', { 'detail': event.data.image });
		document.querySelector('page-editor').dispatchEvent(event);
		return;
	}
}
