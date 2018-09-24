"use strict";
delete require.cache[require.resolve("./queuingPreperations")]; 
delete require.cache[require.resolve("./statisticsManager")]; 
delete require.cache[require.resolve("./queueCommandManager")]; 

var queuingPreperations = require("./queuingPreperations");
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const OrgID = "1";
const BranchID = "106";
const SegmentID = "325";
const ServiceID = "364";
const CounterID = "120";
should.toString();


describe('Queuing Preperations Test', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Prepare Available Actions', async function () {
        let result = await queuingPreperations.prepareAvailableActions(OrgID, BranchID, CounterID);
        (result != undefined).should.true();
    });
});

