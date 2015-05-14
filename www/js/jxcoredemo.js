function log(x) {
    var txt = document.getElementById('txt');
    if (txt)
        txt.innerHTML += "<BR/>" + x;
}

// silly but reliable on multiple environments.
// it tries until the jxcore reference is ready.
var inter = setInterval(function() {
    if (typeof jxcore == 'undefined') return;

    clearInterval(inter);

    // sign-up for jxcore.isReady event
    jxcore.isReady(function(){
        // register log method from UI to jxcore instance
        // so you can call it (app.js) cordova('log').cal(...)
        jxcore('log').register(log);

        // set the main file and load.
        jxcore('app.js').loadMainFile(function (ret, err) {
            if(err) {
                alert(err);
            } else {
                jxcore_ready();
            }
        });
    });
}, 5);

function jxcore_ready() {
    // calling a method from JXcore (app.js)
    jxcore('asyncPing').call('Hello', function(ret, err){
        // register getTime method from jxcore (app.js)
        var getBuffer = jxcore("getBuffer");

        getBuffer.call(function(bf, err){
            var arr = new Uint8Array(bf);
            log("Buffer size:" + arr.length + " - first item: " + arr[0]);
        });
    });
}