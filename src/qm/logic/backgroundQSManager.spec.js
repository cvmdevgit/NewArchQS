"use strict";
var queueCommandManager = require("./queueCommandManager");
var backgroundQSManager = require("./backgroundQSManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;

console.log("backgroundQSManager.spec");
should.toString();


describe('Background QS Manager', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Start Background Actions Successfully', function () {
        let result = backgroundQSManager.startBackgroundActions().then(function (result) {
            (result === common.success).should.true();
        });
    });
    it('Stop Background Actions Successfully', function () {
        let result = backgroundQSManager.stopBackgroundActions().then(function (result) {
            (result === common.success).should.true();
        });
    });
});
