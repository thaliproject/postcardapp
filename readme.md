Postcard App Demo with the following features

1. Create / update / delete post cards

2. Sync the cards from other devices over http

![alt text](demo.gif "Postcard app demo") 

This is intended as a sample project illustrating how to use the [Thali Project](http://www.thaliproject.org) APIs.

This project is based on Cordova. It does not however ship with any Cordova platforms nor with the JXCORE-CORDOVA
plugin it depends on.

Therefore after cloning this project please:

1. Install JXcore from [here](http://jxcore.com/downloads) 
2. Install Cordova 
 1. Windows - `jx install cordova -g`
 2. Linux - `sudo jx install cordova -g`
3. This depot is a Cordova project but you do need to add to it whatever platforms you are using:
 1. Android - cordova platform add android
 2. iOS - cordova platform add iOS
4. TEMPORARY INSTRUCTIONS BECAUSE WE ARE BROKEN AGAINST THE LATEST JXCORE
 4. Make sure you have installed Maven
 1. Go to postcardapp and run `chmod u+x installone.sh installtwo.sh`
 1. Go to postcardapp/platforms/android/AndroidManifest.xml and changed <users-sdk android:minSdkVersion="10" to be a 19 instead of a 10.
 2. Go to postcardapp and run `./installone.sh`
 3. Go to Thali_CordovaPlugin/plugin.xml and edit the element dependency on line 10 to change the url to "../jxcore-cordova"
 5. Go to postcardapp and run `./installtwo.sh`
5. Goto postcardapp/www/jxcore folder, and run `jx install` 
6. Android Users: Do a search on postcard/www/jxcore/node_modules for any files ending in *.gz and delete them 
 1. For Linux and OS/X you can run `find . -name "*.gz" -delete` from the node_modules directory.
7. Run `cordova build android` or `cordova build ios` to see that the app builds for your platform.
8. Now you can run the app




