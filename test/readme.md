# How to run Postcard app's end to end UX tests

## Install Appium and Mocha using npm
```
npm install -g appium
npm install -g mocha
```  
### Install test packages
```
cd ./test
npm install
```  
### Check Appium is setup correctly
```
appium-doctor
```  
This checks that you have JDK and Android SDK installed with the *JAVA_HOME* and *ANDROID_HOME* environment vars setup.  

# Android testing

## Android requirements
- AVDs are not supported and only Android devices with Bluetooth 4.0 or higher are supported.

## Setup for Android device
```
cordova build android
```  
*This should build the Postcard app in 'platforms/android/build/outputs/apk' directory.*  

## Running tests on Android devices
1. The Android device will need to be setup as a developer device and USB debugging enabled in *Settings > Developer options*.  
2. Find Android device's model name:  

    ```
    adb devices -l
    ```  

3. Find Android device's version no:  

    ```
    adb shell getprop ro.build.version.release
    ```  

4. Start Appium server (if not already running):  

    ```  
    appium
    ```


5. Run tests for Android device using AVD's model name and version no:  

    ```
    mocha postcardapp.js --cap=androidDevice --deviceName="XT1072" --platformVersion="5.0.2"
    ```  

# iOS testing
## Setup for iOS simulator
Use Cordova to build Postcard app:  
```
cordova build ios
```  
*This should build the Postcard app in 'platforms/ios/build/emulator' directory.*

### Setup Appium to use the iOS simulator
```
sudo authorize_ios
```

## Running tests on iOS simulator
1. Find your iOS simulator's name and iOS version:  

    ```
    xcrun instruments -s
    ```

2. Start Appium server (if not already running):  

    ```
    appium
    ```

3. Run tests for iOS simulator using iOS simulator's name and iOS version:  

    ```
    mocha postcardapp.js --cap=iosSimulator --deviceName="iPhone 5s" --platformVersion="9.2"
    ```

## Setup for iOS device
Use Cordova to build Postcard app for iOS device:  
```
cordova build ios --device
```  
*This should build the Postcard app in 'platforms/ios/build/device' directory.*  

### Install Webkit Debug Proxy
Use [homebrew](http://brew.sh/) to install [Webkit Debug Proxy](https://github.com/google/ios-webkit-debug-proxy) on Mac:
```
brew install ios-webkit-debug-proxy
```

## Running tests on iOS device
1. The iOS device will need to be setup as a developer device as well as **UIAutomation** enabled in *Settings > Developer*.  
2. Find iOS device's name, UDID and iOS version:  

    ```
    xcrun instruments -s
    ```

3. Start webkit proxy using iOS device's UDID:  

    ```
    ios_webkit_debug_proxy -c YOUR_IOS_DEVICE_UDID:27753-27754 -d
    ```

4. Start Appium server (if not already running):  

    ```
    appium
    ```

5. Run tests for iOS device using iOS device's UDID, name and iOS version:  

    ```
    cd ./test
    mocha postcardapp.js --cap=iosDevice --udid="YOUR_IOS_DEVICE_UDID" --deviceName="iPhone 6" --platformVersion="9.2.1"
    ```

# Appium server troubleshooting

### Android device
- Appium error `unknown error: Chrome version must be >= 43.0.2357.0`  
Solution: The [Android WebView]( https://play.google.com/store/apps/details?id=com.google.android.webview) needs updated. Open *Settings > Apps > All > Android System WebView* to check the version.
- Tests can't run if the screen locks.  
Workaround: Temporarily turn off screen lock when testing - open *Settings > Security > Screen Lock* and select *None*.

### iOS device
- Appium error `Command failed: /bin/sh -c ideviceinstaller`  
Solution: If you get an ApplicationVerificationFailed error with 'ideviceinstaller' then make sure the app builds in Xcode and deploys to your device. Then rebuild for iOS device using `cordova build ios --device`
- Tests can't run if the screen locks.  
Workaround: Temporarily turn off or increase Auto-Lock time when testing - open *Settings > General > Auto-Lock* and set to *5 Minutes* or *Never*.

If you experience any other issues the official [Appium troubleshooting ](http://appium.io/slate/en/1.4/?javascript#troubleshooting-appium) docs may come in handy.
