// This JavaScript files runs on Cordova UI

function log(x) {
  console.log(x);
}

var inter = setInterval(function() {
  if (typeof jxcore == 'undefined')
    return;

  clearInterval(inter);

  jxcore.isReady(function() {
    log('READY');
    // register log method from UI to jxcore instance
    jxcore('log').register(log);

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
  document.getElementById('appFrame').src = 'http://localhost:5000';
}