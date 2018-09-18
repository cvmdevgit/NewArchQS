"use strict";
var logger = require("./logger");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;

console.log("logger.spec");
should.toString();

describe('Test Logger', function () {
    it('Log Error sample', async function () {
        let result =logger.logError("Error Test");
        result.should.be.true();
    });
});