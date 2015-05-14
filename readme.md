This is intended as a sample project illustrating how to use the [Thali Project](http://www.thaliproject.org) APIs.

This project is based on Cordova. It does not however ship with any Cordova platforms nor with the JXCORE-CORDOVA
plugin it depends on.

Therefore after cloning this project please:

1. Follow the instructions [here](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) to install
node.js, Cordova and whatever platforms you require (e.g. cordova plafrom add android and cordova platform add ios).

2. Clone https://github.com/jxcore/jxcore-cordova.git

3. Then run 'cordova plugin add path-to-jxcore-cordova-depot/jxcore-cordova/io.jxcore.node/' inside of this project to
install the JXCore-Cordova plugin.

4. Now you can run 'cordova build' and 'cordova run android' (or whatever platform you are using) and it should just run.