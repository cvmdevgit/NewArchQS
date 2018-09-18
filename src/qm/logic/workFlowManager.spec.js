"use strict";
var queuingPreperations = require("./queuingPreperations");
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var WorkFlowManager = require("./workFlowManager");
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


describe('WorkFlow Manager Test', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Get Service WorkFlow successfully', async function () {
        let result = await WorkFlowManager.getWorkFlow(BranchID, ServiceID);
        (result != undefined).should.true();
    });
    it('Get Service Available Actions successfully', async function () {
        let result = await WorkFlowManager.getServiceAvailableActions(CounterID, ServiceID);
        (result != undefined).should.true();
    });
    it('Is Transfer Back Allowed successfully', async function () {
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, CounterID, CounterID);
        (result != undefined).should.true();
    });
    it('Prepare Transfer Counters List successfully', async function () {
        let result = await WorkFlowManager.PrepareTransferCountersList(OrgID, CounterID, CounterID);
        (result != undefined).should.true();
    });
    it('Prepare Add List successfully', async function () {
        let result = await WorkFlowManager.PrepareAddList(OrgID, CounterID, CounterID);
        (result != undefined).should.true();
    });

    it('Prepare Transfer Services List successfully', async function () {
        let result = await WorkFlowManager.PrepareTransferServicesList(OrgID, CounterID, CounterID);
        (result != undefined).should.true();
    });
});



