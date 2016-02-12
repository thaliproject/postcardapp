var path = require("path");

exports.iosSimulator = {
  app: path.resolve(__dirname, '../../platforms/ios/build/emulator/PostCardApp.app'),
  fullReset: true,
  autoWebview: true,
  platformName: 'iOS',
  platformVersion: '9.2',
  deviceName: 'iPhone 5s',
  autoAcceptAlerts: true,
};

exports.iosDevice = {
  app: path.resolve(__dirname, '../../platforms/ios/build/device/PostCardApp.app'),
  bundleId: 'org.thaliproject.postcardapp',
  fullReset: true,
  autoWebview: true,
  platformName: 'iOS',
  platformVersion: '9.2.1',
  deviceName: 'iPhone 6',
  autoAcceptAlerts: true,
};

exports.androidEmulator = {
  app: path.resolve(__dirname, '../../platforms/android/build/outputs/apk/android-debug.apk'),
  fullReset: true,
  autoWebview: true,
  platformName: 'Android',
  platformVersion: '5.1.1',
  deviceName: 'emulator-5554',
  avd: 'Nexus',
  avdArgs: '-no-boot-anim -noskin',
  noSign: false,
};

exports.androidDevice = {
  app: path.resolve(__dirname, '../../platforms/android/build/outputs/apk/android-debug.apk'),
  fullReset: true,
  autoWebview: true,
  platformName: 'Android',
  platformVersion: '5.0.2',
  deviceName: 'XT1072',
};
