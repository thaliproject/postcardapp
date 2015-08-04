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
1. `curl https://codeload.github.com/thaliproject/postcardapp/zip/story_0_yarong > thali.zip`
2. `unzip thali.zip`
3. Cd into the postcard app directory
3. `cordova platform add android`
 * Right now android is the only platform the postcard app works on
3. Navigate down to www/jxcore and issue `jx npm install --production`
 * Get comfy, this will take a little while
4. From inside of www/jxcore issue `find . -name "*.gz" -delete`
 * This command will go away when jxcore release 0.3.0.5 which supports --autoremove="*.gz"
5. Issue `cordova build`





