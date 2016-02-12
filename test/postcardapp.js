"use strict";

require("./helpers/setup");

var wd = require("wd"),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    argv = require('minimist')(process.argv.slice(2)),
    serverConfigs = require('./helpers/appium-servers'),
    caps = require("./helpers/caps"),
    defaults = require("./helpers/defaults"),
    webview = require("./helpers/webview");

describe("PostcardApp", function () {
  this.timeout(300000);
  var driver;
  var allPassed = true;
  var asserters = wd.asserters;

  function addCapabilities(cap) {
    console.log("cap:", cap, "platform:", process.platform);
    if (typeof cap !== 'undefined' && typeof caps[cap] !== 'undefined') {
      return _.clone(caps[cap]);
    }
    // if on Mac use iOS Simulator cap
    if (process.platform === 'darwin') {
      return _.clone(caps.iosSimulator);
    }
    return _.clone(caps.androidEmulator);
  }

  before(function () {
    var serverConfig = serverConfigs.local;

    // setup with appium server
    driver = wd.promiseChainRemote(serverConfig);

    // setup logging
    require("./helpers/logging").configure(driver);

    // add caps to target iOS or Android platform and switch to webview context
    var cap = addCapabilities(argv.cap);
    if (typeof argv.udid !== 'undefined') {
      cap.udid = argv.udid;
    }
    if (typeof argv.deviceName !== 'undefined') {
      cap.deviceName = argv.deviceName;
    }
    if (typeof argv.platformVersion !== 'undefined') {
      cap.platformVersion = argv.platformVersion;
    }

    // init driver with capabilities
    driver = driver.init(cap);

    return driver;
  });

  after(function () {
    return driver
      .sleep(defaults.wait.long)
      .quit();
  });

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed';
  });

  // Tests
  it("should contain html title", function() {
    return driver
      .title().should.eventually.equal('App');
  });

  it("should redirect to jxcore express app 'http://localhost'", function () {
    return driver
      .waitForElementByCss("div", asserters.isDisplayed, defaults.wait.long)
      .safeEval('window.location.href').should.eventually.contain('http://localhost:');
  });

  it("should contain a header element", function() {
    return driver
      .waitForElementByCss("#appName", asserters.isDisplayed, defaults.wait.short)
      .text().should.eventually.contain('Postcard');
  });

  it("should not login with empty username and display error", function() {
    return webview.shouldNotLoginWithUsername(driver, ' ');
  });

  it("should not login with invalid characters in username and display error", function() {
    return webview.shouldNotLoginWithUsername(driver, ';');
  });

  it("should login with username", function() {
    return driver
      .waitForElementByCss("input[name='username']", asserters.isDisplayed, defaults.wait.short)
      .sendKeys(defaults.username)
      .sleep(defaults.wait.short)
      .waitForElementByCss('#submit', asserters.isDisplayed, defaults.wait.short)
      .click()
      .sleep(defaults.wait.short)
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('Postcards');
  });

  it("should show prompt to create first postcard", function() {
    return driver
      .waitForElementByCss("#createPostcard", asserters.isDisplayed, defaults.wait.short)
      .text().should.eventually.match(/Create postcard/i);
  });

  it("should create first postcard", function() {
    return driver
      .waitForElementByCss("#createPostcard", asserters.isDisplayed, defaults.wait.short)
      .click()
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('New Postcard');
  });

  it("should save first postcard", function() {
    return webview.shouldSavePostcardWithMessage(driver, defaults.message1);
  });

  it("should display first postcard", function() {
    return webview.shouldDisplayPostcardWithMessage(driver, defaults.message1);
  });

  it("should list one postcard", function() {
    return webview.shouldCountPostcardsWithNumber(driver, 1);
  });

  it("should be able to edit one postcard", function() {
    return webview.shouldCountMyPostcardsWithNumber(driver, 1);
  });

  it("should select first postcard to edit", function() {
    return webview.shouldSelectTopPostcard(driver);
  });

  it("should load first postcard message in textarea to edit", function() {
    return webview.shouldLoadPostcardWithMessage(driver, defaults.message1);
  });

  it("should save first postcard with updated message", function() {
    return webview.shouldSavePostcardWithUpdate(driver, defaults.update);
  });

  it("should display first updated postcard", function() {
    return webview.shouldDisplayPostcardWithMessageUpdate(driver, defaults.message1, defaults.update);
  });

  it("should add another postcard", function() {
    return driver
      .waitForElementByCss('#addButton', asserters.isDisplayed, defaults.wait.long)
      .click()
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('New Postcard');
  });

  it("should save second postcard", function() {
    return webview.shouldSavePostcardWithMessage(driver, defaults.message2);
  });

  it("should display second postcard", function() {
    return webview.shouldDisplayPostcardWithMessage(driver, defaults.message2);
  });

  it("should list two postcards", function() {
    return webview.shouldCountPostcardsWithNumber(driver, 2);
  });

  it("should be able to edit two postcards", function() {
    return webview.shouldCountMyPostcardsWithNumber(driver, 2);
  });

  it("should select second postcard to edit", function() {
    return webview.shouldSelectTopPostcard(driver);
  });

  it("should load second postcard message in textarea to edit", function() {
    return webview.shouldLoadPostcardWithMessage(driver, defaults.message2);
  });

  it("should save second postcard with updated message", function() {
    return webview.shouldSavePostcardWithUpdate(driver, defaults.update);
  });

  it("should display second updated postcard", function() {
    return webview.shouldDisplayPostcardWithMessageUpdate(driver, defaults.message2, defaults.update);
  });

  it("should delete a postcard", function() {
    return driver
      .waitForElementByCss('#editButton', asserters.isDisplayed, defaults.wait.short)
      .click()
      .safeEval('document.querySelector(\'#myPostcards .row paper-fab[icon="delete"]\').click()')
      .sleep(defaults.wait.long)
      .waitForElementByCss('#myPostcards', asserters.isDisplayed, defaults.wait.short)
      .text().should.eventually.not.contain(defaults.message2);
  });

  it("should be one postcard remaining after delete", function() {
    return driver
      .waitForElementByCss('#myPostcards', asserters.isDisplayed, defaults.wait.short)
      .safeEval('document.querySelectorAll("#myPostcards .row:not([hidden])").length')
      .should.eventually.equal(1);
  });

  it("should refresh list after delete", function() {
    return driver
      .waitForElementByCss('#editButton', asserters.isDisplayed, defaults.wait.short)
      .click()
      .sleep(defaults.wait.short)
      .waitForElementByCss('#allPostcards', asserters.isDisplayed, defaults.wait.short)
      .text().should.eventually.not.contain(defaults.message2);
  });

  it("should list one postcard after delete", function() {
    return webview.shouldCountPostcardsWithNumber(driver, 1);
  });

});
