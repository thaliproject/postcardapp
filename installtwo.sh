#!/usr/bin/env bash
cd ..
git clone https://github.com/thaliproject/Thali_CordovaPlugin_BtLibrary.git
cd Thali_CordovaPlugin_BtLibrary/BtConnectorLib
chmod u+x gradlew
./gradlew build install
cd ../postcardapp
cordova plugins add ../Thali_CordovaPlugin
cp -f plugins/org.thaliproject.p2p/src/android/java/io/jxcore/node/JXcoreExtension.java platforms/android/src/io/jxcore/node/
cp -r plugins/org.thaliproject.p2p/thali/ www/jxcore/
cd www/jxcore/thali
jx install
cd ../..
