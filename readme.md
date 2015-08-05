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
 2. Linux & OS/X - `sudo jx install cordova -g` 
 
```
curl https://codeload.github.com/thaliproject/postcardapp/zip/story_0 > thali.zip
unzip thali.zip
cd postcardapp-story_0
cordova platform add android
cd www/jxcore
jx npm install --production
find . -name "*.gz" -delete
cordova build
```

On Windows one needs to use [Git Bash](https://git-scm.com/download/win) or equivalent to run the above commands.

