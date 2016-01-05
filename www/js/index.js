'use strict'; // This JavaScript files runs on Cordova UI
/*global alert, jxcore */

// constants
var HOST = "http://localhost:5000";

var inter = setInterval(function() {
  if (typeof jxcore === 'undefined') {
    return;
  }

  clearInterval(inter);

  jxcore.isReady(function() {
    log('READY');

    // register methods from UI to jxcore instance
    registerCordovaFunctions();

    jxcore('app.js').loadMainFile(function(ret, err) {
      if (err) {
        alert(JSON.stringify(err));
      } else {
        log('jxcore_ready');
        jxcore_ready();
      }
    });
  });
}, 5);

function jxcore_ready() {
  document.getElementById('appFrame').src = HOST;
}

function registerCordovaFunctions() {
  jxcore('log').register(log);
}

function log(x) {
  console.log(x);
}

// -----------------------------------------------------------------------------
// Handle Cordova iframe events
// -----------------------------------------------------------------------------

// Cordova ready
var isCordovaReady = false;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  isCordovaReady = true;
	console.log("Cordova deviceready");
}

// Listen for messages posted from iframe
window.addEventListener('message', receiveMessage, false);

// Handle cross orgin message
var contentWindow;
function receiveMessage(event) {
  console.log('webview received message');

  if (event.origin !== HOST) {
    console.log("Access denied :(");
    return;
  }

  // retain reference to the (iframe) window object that sent the message
  contentWindow = event.source;

  if (!isCordovaReady) {
    console.log("Error, Cordova not ready!");
    return;
  }

  if (event.data === 'navigator.camera.getPicture') {
    getPicture();
  }
}

function getPicture() {
  console.log("getPicture");
  // returns image as base64 encoded string
  navigator.camera.getPicture( cameraSuccess, cameraFail, {
    quality: 80,
    targetWidth: 1080,
    targetHeight: 720,
    correctOrientation: true,
    saveToPhotoAlbum: false,
    allowEdit: false,
    destinationType: Camera.DestinationType.DATA_URL
  });
}

function cameraSuccess(imageData) {
  console.log("cameraSuccess");
  // post message back to iframe
  contentWindow.postMessage( {image:imageData}, "*"); // HOST
}

function cameraFail(message) {
  console.log("cameraFail");
  // post message back to iframe
  contentWindow.postMessage( {error:message}, "*"); // HOST
}
