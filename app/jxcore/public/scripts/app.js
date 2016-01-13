'use strict';
/*global alert, IS_DEBUG, IS_MOCKMOBILE, socket, log, page, uuid, appDev */
/*exported getURL, URLSafeBase64, generatePostcardId, addressBookId */

// Polymer app
var myApp = document.querySelector('#my-app');

// myApp defaults
myApp.title = "Postcard";
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

// UI defaults
myApp.editButtonText = "Edit";

// Setup debug mode once Polymer template is bound
myApp.addEventListener('dom-change', function() {
	// developer mode
	if ( typeof appDev !== 'undefined' && isFunction(appDev()) ) {
		console.log("Config debug: " + IS_DEBUG + " MockMobile: " + IS_MOCKMOBILE);
		appDev(); // defined in 'app_dev.js'
	}

	// Create proxy method for Cordova functions
	proxyCordovaCamera();

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
		var target = document.querySelector('page-home');
		if (target) {
			target.dispatchEvent(event);
		}
	});

	// Listen for contact saved event
	socket.on("contactChanged", function (data) {
		console.log("*** client received contact changes ***");
		console.log(data);
		var selectedPage = document.querySelector("#pages > .iron-selected").nodeName;
		console.log("notify selectedPage:", selectedPage);
		if(!selectedPage){
			console.log("Error, could not get selected page");
			return;
		}
		var event = new CustomEvent('contact-changed', { 'detail': data });
		var target = document.querySelector(selectedPage);
		if (target) {
			target.dispatchEvent(event);
		}
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
// NB: Don't replace with '-' character as it is being used as a guid delimiter.
var URLSafeBase64 = {
  encode: function(string) {
    // Replace '/' with '_' , '+' with '.' and remove ending '='
    return string.replace(/\//g, '_').replace(/\+/g, '.').replace(/=+$/, '');
  },
  decode: function(base64) {
    // Append ending '='
    base64 += new Array(5 - base64.length % 4).join('=');
    // Replace '_' with '/' and '.' with '+'
    return base64.replace(/\_/g, '/').replace(/\./g, '+');
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
	console.log('iframe received message from:', event.origin);

	if (event.origin === "null" && event.data) {
		console.log("Allow WKWebView message event data");
	} else if (event.origin !== "file://") {
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

// -----------------------------------------------------------------------------
// Proxy methods for Cordova functions and HTML5 method replacement
// -----------------------------------------------------------------------------

// Use HTML5 capture as replacement for Cordova Camera on desktop
function proxyCordovaCamera() {
	navigator.camera = {
		getPicture : function(onSuccess, onFail, options) {
			if (!IS_MOCKMOBILE) {
				// Trigger Cordova for mobile using cross document messaging
				// NB: using "*" so no origin check is made.
				var msg = {
					action: 'navigator.camera.getPicture',
					options: options
				}
				parent.postMessage(msg, "*");
			} else {
				console.log("*** HTML5 Camera Capture ***");
				localFileInput(onSuccess, onFail, options);
			}
		}
	};
}

// HTML5 capture method
var imageInput, imageCanvas; // hidden DOM elements
function localFileInput(onSuccess, onFail, options) {
	// create file input without appending to DOM
	if (typeof imageInput === "undefined") {
		console.log("Create image file input");
		imageInput = document.createElement('input');
		imageInput.setAttribute("hidden", true);
		imageInput.setAttribute('type', 'file');
		imageInput.setAttribute('accept', 'image/jpeg'); // 'image/*'
		imageInput.setAttribute('capture', 'camera'); // HTML5 capture
		imageInput.setAttribute("id", "imageInput");
		imageInput.onchange = function() {
			if (!imageInput.files || !imageInput.files[0]) {
				return;
			}
			var file = imageInput.files[0];
			var reader = new FileReader();
			reader.readAsDataURL(file); // base64 encoded string
			reader.onloadend = function(e) {
				console.log("reader.result:", reader.result.length, reader.result.substr(0,32)+"...", options);
				if (options && options.targetWidth>0 && options.targetHeight>0) {
					processImageOptions(reader.result, onSuccess, onFail, options);
				} else {
					return onSuccess(reader.result); // return raw image data
				}
			};
			reader.onerror = function(e) {
				return onFail("Error reading image.");
			};
		};
	}
	// open file browser
	console.log("Attach image/jpeg");
	imageInput.click();
}

// create Image to get source image width and height, then resize
function processImageOptions(imageData, onSuccess, onFail, options) {
	var image = new Image();
	image.onload = function() {
		// detect orientation of captured photo on mobile device using EXIF data
		var o = 1;
		EXIF.getData(image, function() {
			console.log("EXIF:", EXIF.pretty(this) );
			o = EXIF.getTag(this,'Orientation');

			// set real image width and height
			var imageWidth = image.width;
			var imageHeight = image.height;
			var isSideways = false;
			if (o===5 || o===6 || o===7 || o===8) {
				isSideways = true;
				imageWidth = image.height;
				imageHeight = image.width;
			}

			console.log("process Image @", imageWidth, imageHeight, " orientation:", o, " sideways:", isSideways);

			var r = imageWidth / imageHeight;
			var width = imageWidth;
	  	var height = imageHeight;
			var quality = (options.quality/100 || 0.8);
			var scale = 1;

			// scale down if source is larger than target dimensions
			if (r > 1 && imageWidth>options.targetWidth) {
				// landscape format - adjust target height
				width = options.targetWidth;
				scale = width/imageWidth;
				height = Math.floor( imageHeight * scale );
				console.log("Landscape *h", height, "scale:", scale);
			} else if (r < 1 && imageHeight>options.targetHeight) {
				// portrait format - adjust target width
				height = options.targetHeight;
				scale = height/imageHeight;
				width = Math.floor( imageWidth * scale );
				console.log("Portrait *w", width, "scale:", scale);
			}
			console.log("resize ->", width, height, " quality:", quality);

			// create canvas without appending to DOM
			if (typeof imageCanvas === "undefined") {
				console.log("image canvas created");
				imageCanvas = document.createElement('canvas');
				imageCanvas.setAttribute("hidden", true);
			}

			var x = width,
					y = height,
					w = width,
					h = height;

			// swap x/y dimensions for sideways orientated photos
			if (isSideways) {
				x = height;
				y = width;
			}

			imageCanvas.width = w;
			imageCanvas.height = h;
			console.log("x",x, "y",y, " w",w, "h",h);

			var ctx = imageCanvas.getContext("2d");

			switch (o) {
				case 1:
					console.log("Orientation correct");
					break;
				case 2: // mirror
					ctx.translate(x,0);
					ctx.scale(-1,1);
					break;
				case 3:
					ctx.translate(x,y);
        	ctx.rotate(Math.PI);
					break;
				case 4:
					ctx.translate(0,y);
					ctx.scale(1,-1);
					break;
				case 5:
					ctx.rotate(0.5*Math.PI);
					ctx.scale(1, -1);
					break;
				case 6:
					ctx.rotate(0.5*Math.PI);
			 		ctx.translate(0,-y);
					break;
				case 7:
					ctx.rotate(0.5*Math.PI);
        	ctx.translate(x,-y);
        	ctx.scale(-1,1);
					break;
				case 8:
					ctx.rotate(-0.5*Math.PI);
        	ctx.translate(-x,0);
					break;
				default:
					console.log("Orientation not defined", o);
			}

			// apply scale
			if (scale < 1) {
				console.log("Apply scale-down", scale);
				ctx.scale(scale, scale);
			}
			// finally, draw image
			ctx.drawImage(image, 0, 0);

			var processedImageData = imageCanvas.toDataURL("image/jpeg", quality);
			console.log("Canvas data", processedImageData.length, processedImageData.substr(0,32)+"...");

			// clear resources
			ctx.restore();
			ctx.clearRect(0, 0, w, h);
			image = null;

		  return onSuccess( processedImageData );
    });
  };
	image.onerror = function() {
		return onFail("Error processing image options.");
	};
	image.src = imageData;
}
