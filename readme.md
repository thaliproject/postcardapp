Postcard App Demo with the following features

1. Create / update / delete post cards

2. Sync the cards from other devices over http

![alt text](demo.gif "Postcard app demo") 

This is intended as a sample project illustrating how to use the [Thali Project](http://www.thaliproject.org) APIs.

This project is based on Cordova. It does not however ship with any Cordova platforms nor with the JXCORE-CORDOVA
plugin it depends on.

Therefore after cloning this project please:

1. Install JXcore from [here](http://jxcore.com/downloads) and install Node.JS from [here](http://nodejs.org) (for desktop testing)
2. If you havent installed Cordova (jx install cordova -g) on Windows / (sudo jx install cordova -g) on Unix
3. Create a cordova project : Follow the instructions [here](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) to install node.js, Cordova and whatever platforms you require (e.g. cordova plafrom add android and cordova platform add ios).

4. Go into your cordova application folder(postcard) 

5. Then run 'cordova platform add android' (or what ever platform you are using) to add the platform support  

7. From command line goto postcardapp/www/jxcore folder, and run 'jx install thali'

8. Go to file explorer and goto postcardapp/www/jxcore/node_modules and search for *.gz" and delete all *.gz files

9. Now you can run 'cordova run android' from postcardapp folder (or whatever platform you are using) and it should just run.










