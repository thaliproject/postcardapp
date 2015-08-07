Postcard App Demo with the following features

1. Create / update / delete post cards

2. Sync the cards from other devices over http

![alt text](demo.gif "Postcard app demo") 

This is intended as a sample project illustrating how to use the [Thali Project](http://www.thaliproject.org) APIs.

# Dependencies

## Installing Android Studio

To get started, first download [Android Studio](http://developer.android.com/sdk/index.html) and follow the instructions below.

Make sure to set your `ANDROID_HOME` environment variable:

Mac OS X (put in your `~/.bash_profile` file):
```
export ANDROID_HOME=~/Library/Android/sdk
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Linux (put in your `~/.bashrc` file):
```
export ANDROID_HOME=/<installation location>/Android/sdk
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Windows:
```
set ANDROID_HOME=C:\<installation location>\Android\sdk
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

### JXcore

Follow the instructions at [http://jxcore.com/downloads/](http://jxcore.com/downloads/). Their download page is a little confusing so please pay attention to the section at the top that says in a tiny little font 'Installation'. When you're done, check that the installation worked:
```
$ jx -jxv
v 0.3.0.5
```

### Install Apache Cordova

Ensure that Apache Cordova is installed globally by using JXcore's `jx install` command.

Mac/Linux:
```
$ sudo jx install -g cordova
```

Windows:
```
$ jx install -g cordova
```

# Building the postcard app on Android

```shell
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
