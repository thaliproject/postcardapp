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

// Cordova ready
var isCordovaReady = false;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  isCordovaReady = true;
	console.log("~~~ Cordova deviceready ~~~");
}

// window.onload = function() {
//   iframe = document.getElementById('appFrame').contentWindow;
//   console.log("~~~ iframe ready ~~~");
//   console.log(iframe);
// }

// Listen for messages from iframe
window.addEventListener('message', receiveMessage, false);

// Handle cross orgin message
var contentWindow;
function receiveMessage(event) {
  console.log(event);
  console.log('webview: ' + event.data + ' from ' + event.origin + ' source:' + event.source);

  if (event.origin !== HOST) {
    alert("Access denied :(");
    return;
  }

  // retain reference to the (iframe) window object that sent the message
  contentWindow = event.source;

  if (!isCordovaReady) {
    console.log("Error, cordova not ready");
    return;
  }

  if (event.data === 'navigator.camera.getPicture') {
    getPicture();
  }
}

function getPicture() {
  console.log("getPicture");
  navigator.camera.getPicture( cameraSuccess, cameraFail, {
    quality: 80,
    targetWidth: 320,
    targetHeight: 320,
    correctOrientation: true,
    saveToPhotoAlbum: false,
    allowEdit: false,
    destinationType: Camera.DestinationType.DATA_URL // returns image as base64 encoded string
  });
}

function cameraSuccess(imageData) {
  console.log("cameraSuccess");
  // post message back to iframe
  contentWindow.postMessage( {image:imageData}, HOST);
}

function cameraFail(message) {
  console.log("cameraFail");
  // post message back to iframe
  contentWindow.postMessage( {error:message}, HOST);
}
