"use strict";

var asserters = require("wd").asserters,
    defaults = require("./defaults");

module.exports = {

  shouldNotLoginWithUsername: function(driver, username){
    return driver
      .waitForElementByCss("input[name='username']", asserters.isDisplayed, defaults.wait.short)
      .sendKeys(username)
      .sleep(defaults.wait.short)
      .waitForElementByCss('#submit', asserters.isDisplayed, defaults.wait.short)
      .click()
      .waitForElementByCss('#loginForm', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('Please enter a username');
  },

  shouldSavePostcardWithMessage: function(driver, message){
    return driver
      .waitForElementByCss("#textbox", asserters.isDisplayed, defaults.wait.short)
      .sendKeys(message)
      .sleep(defaults.wait.short)
      .waitForElementByCss('#saveButton', asserters.isDisplayed, defaults.wait.short)
      .click()
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('Postcards');
  },

  shouldDisplayPostcardWithMessage: function(driver, message){
    return driver
      .waitForElementByCss('#allPostcards', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain(message);
  },

  shouldSelectTopPostcard: function(driver){
    return driver
      .waitForElementsByCss('#myPostcards .row', asserters.isDisplayed, defaults.wait.short)
      .first()
      .sleep(defaults.wait.short)
      .click()
      .sleep(defaults.wait.short)
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('Edit Postcard');
  },

  shouldLoadPostcardWithMessage: function(driver, message){
    return driver
      .waitForElementByCss("#textbox", asserters.isDisplayed, defaults.wait.short)
      .waitForConditionInBrowser('document.querySelector("#textbox").value.length > 0', defaults.wait.long)
      .safeEval('document.querySelector("#textbox").value')
      .should.eventually.contain(message);
  },

  shouldCountPostcardsWithNumber: function(driver, total){
    return driver
      .waitForElementByCss('#allPostcards', asserters.isDisplayed, defaults.wait.short)
      .safeEval('document.querySelectorAll("#allPostcards .row:not([hidden])").length')
      .should.eventually.equal(total);
  },

  shouldCountMyPostcardsWithNumber: function(driver, total){
    return driver
      .waitForElementByCss('#editButton', asserters.isDisplayed, defaults.wait.short)
      .click()
      .waitForElementByCss('#myPostcards', asserters.isDisplayed, defaults.wait.short)
      .safeEval('document.querySelectorAll("#myPostcards .row:not([hidden])").length')
      .should.eventually.equal(total);
  },

  shouldSavePostcardWithUpdate: function(driver, update){
    return driver
      .waitForElementByCss("#textbox", asserters.isDisplayed, defaults.wait.short)
      .sendKeys('\n'+update)
      .sleep(defaults.wait.short)
      .waitForElementByCss('#saveButton', asserters.isDisplayed, defaults.wait.short)
      .click()
      .waitForElementByCss('#appName', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain('Postcards');
  },

  shouldDisplayPostcardWithMessageUpdate: function(driver, message, update){
    return driver
      .waitForElementByCss('#allPostcards', asserters.isDisplayed, defaults.wait.long)
      .text().should.eventually.contain(message)
      .and.contain(update);
  },

};
