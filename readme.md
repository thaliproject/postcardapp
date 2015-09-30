Postcard App Demo with the following features

1. Create / update / delete post cards

2. Sync the cards from other devices over http

![alt text](demo.gif "Postcard app demo")

This is intended as a sample project illustrating how to use the [Thali Project](http://www.thaliproject.org) APIs.

# Dependencies

## Windows Prerequisites

If you are using Windows to build the Postcard App, you will need to use [node-gyp](https://github.com/TooTallNate/node-gyp) to compile [leveldown](https://github.com/Level/leveldown)

The following software is required:
- Visual Studio 2013 (note: VS 2015 doesn't appear to work yet)
- Python 2.7.x

Follow the [node-gyp installation documentation](https://github.com/TooTallNate/node-gyp#installation) to ensure that Python is properly set.  The easiest way for Python to work is to have it set in your PATH environment variable.

Note that if you have multiple versions of Visual Studio installed then you have to use the '--msvs_version' switch to tell the system to use VS 2013.
```
$ jx npm install --production --autoremove="*.gz" --msvs_version=2013
```

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

## JXcore

Follow the instructions at [http://jxcore.com/downloads/](http://jxcore.com/downloads/). Their download page is a little confusing so please pay attention to the section at the top that says in a tiny little font 'Installation'. When you're done, check that the installation worked:
```
$ jx -jxv
v 0.3.0.5
```

## Install Apache Cordova

Ensure that Apache Cordova is installed globally by using JXcore's `jx install` command.

Mac/Linux:
```
$ sudo jx install -g cordova
```

Windows:
```
$ jx install -g cordova
```
## Hardware

You will need two (it's a peer to peer system) Android devices running at least KitKat. And no, the emulator won't work. We depend on specific radios to work and they aren't in the emulator.

# Building the postcard app

```shell
curl https://codeload.github.com/thaliproject/postcardapp/zip/master > thali.zip
unzip thali.zip
cd postcardapp-master
cordova platform add android
cordova platform add ios
cd www/jxcore
jx npm install --production --autoremove "*.gz"
cordova build android
cordova build ios
```

On Windows one needs to use [Git Bash](https://git-scm.com/download/win) or equivalent to run the above commands.

# Fun issues you are probably going to run into

## Getting Discovery Working
First and foremost, service discovery over Wi-Fi Direct is not terribly reliable. It can take anywhere from seconds to minutes to discover another device. Yes, we are working on this (including looking at moving completely over to BLE). In the meantime something you can do to improve things is reboot your devices. But otherwise the way to know if discovery actually occured is by looking at your logcat output. See below for instructions on using logcat. In the log you are looking for something like:

```
08-07 11:18:47.444    6037-6037/org.thaliproject.postcardapp I/Service searcher﹕ Added service request
08-07 11:18:48.464    6037-6037/org.thaliproject.postcardapp I/Service searcher﹕ Started service discovery
08-07 11:19:47.444    6037-6037/org.thaliproject.postcardapp I/Service searcher﹕ Cleared service requests
```

You will see this repeat a lot because it turns out that service discovery just kinda stops working after a minute or two so we have to constantly turn it on and off to get it to work. This is one of the reasons why service discovery performance is so awful, it takes time to turn the service on and off and while that is happening we can't be discovered or discover others.

When the other device is found you will see something in the log like:

```
08-07 11:37:31.092  13884-13884/org.thaliproject.postcardapp I/Service searcher﹕ Found Service, :{ "pi": "90:E7:C4:EA:B0:22","pn": "62","ra": "90:E7:C4:EA:B0:22"}, typeCordovap2p._tcp.local.:
08
```

And yes, we are going to make this easier. See [here](https://github.com/thaliproject/Thali_CordovaPlugin/issues/63) and [here](https://github.com/thaliproject/postcardapp/issues/19).

### Using logcat

The easiest way in my opinion to use logcat, especially given that there are two devices involved, is to use Android Studio and its logcat viewer. But for masochists out there you can also use logcat via adb. But you have to specify which device you want to get your logcat output from. So first run `adb devices` to get a list of your attached devices. Then issue `adb -s [id] logcat` where [id] is the device ID you got from `adb devices`.

## Using the UX

Even when there is synching the data will only actually show up if you hit the refresh button in the upper right part of the screen. And yes, this will eventually be fixed when we switch to the new UX.
