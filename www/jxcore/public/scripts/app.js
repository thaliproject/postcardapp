'use strict';

// Polymer app
var myApp = document.querySelector('#my-app');

// myApp defaults
myApp.title = "Postcards";
myApp.route = "home"; // default route but will redirect to 'login' if no app.username set
myApp.host = "http://localhost:5000/";
// postcard api routes
myApp.api = myApp.host + "api/";
// private api routes
myApp._api = myApp.host + "_api/";
// identity exchange api
myApp.webview = myApp.host + "webview/";

// myApp user session vars
myApp.username = "";
myApp.deviceIdentity = "";

// default logging function to call
var log = function(message) {
	console.log(message);
};

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
	if (socket) {
		socket.on("cardChanged", function (data) {
	    	console.log("client received card changes");
	    	console.log(data);
	    	var event = new CustomEvent('card-changed', { 'detail': data });
	    	document.querySelector('page-home').dispatchEvent(event);
		});
	}
});

function openModalDialog(e) {
	if(myApp.modalDialog){
		console.log("openModalDialog");
		myApp.modalDialog.open();
	}
}

// myApp client-side route handler
function getURL(route, paramArray){
	if(route == myApp.route) {
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
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
