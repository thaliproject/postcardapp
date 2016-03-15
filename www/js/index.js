'use strict'; // This JavaScript files runs on Cordova UI
/*global alert, jxcore */

// constants
var HOST = "http://localhost:5000";

var isJXcoreReady = false;
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
        isJXcoreReady = true;
      }
    });
  });
}, 5);

function registerCordovaFunctions() {
  jxcore('log').register(log);
}

function log(x) {
  console.log(x);
}

// -----------------------------------------------------------------------------
// Cordova redirect to localhost
// -----------------------------------------------------------------------------

// Cordova ready
var isCordovaReady = false;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  isCordovaReady = true;
	console.log("Cordova deviceready");
}

var inter2 = setInterval(function(){
  if (!isCordovaReady || !isJXcoreReady) {
    return;
  }

  clearInterval(inter2);

  console.log("Cordova and JXCore are both ready. Redirect to:", HOST);
  window.location.href = HOST;
}, 5);
