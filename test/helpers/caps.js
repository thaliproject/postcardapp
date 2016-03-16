'use strict';

var path = require("path");

exports.iosSimulator = {
  app: path.resolve(__dirname, '../../platforms/ios/build/emulator/PostCardApp.app'),
  fullReset: true,
  autoWebview: false,
  platformName: 'iOS',
  platformVersion: '9.2',
  deviceName: 'iPhone 5s',
  autoAcceptAlerts: true,
  nativeInstrumentsLib: true,
};

exports.iosDevice = {
  app: path.resolve(__dirname, '../../platforms/ios/build/device/PostCardApp.app'),
  fullReset: true,
  autoWebview: false,
  platformName: 'iOS',
  platformVersion: '9.2.1',
  deviceName: 'iPhone 6',
  autoAcceptAlerts: true,
  nativeInstrumentsLib: true,
};

exports.androidDevice = {
  app: path.resolve(__dirname, '../../platforms/android/build/outputs/apk/android-debug.apk'),
  fullReset: true,
  autoWebview: false,
  autoWebviewTimeout: 6000,
  platformName: 'Android',
  platformVersion: '5.0.2',
  deviceName: 'XT1072',
  noSign: false,
};
