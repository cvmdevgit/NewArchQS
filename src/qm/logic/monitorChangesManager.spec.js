"use strict";
delete require.cache[require.resolve("./queuingPreperations")];
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var monitorChangesManager = require("./monitorChangesManager");
var common = require("../../common/common");
var events = require("../../common/events");
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");
var statisticsData = require("../data/statisticsData");
var monitorChangesManagerInject = require("./monitorChangesManager.specInject");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const OrgID = "1";
const BranchID = "106";
const CounterID = "120";
const CounterID2 = "121";
const Invalid_BranchID = "106123";
const Invalid_CounterID = "120123";

should.toString();
var sinon = require('sinon');
var stub = sinon.stub();
var entities = [];
var Output = undefined;
//Add handler to the broadcast message
function Handler(broadcastTopic, request) {
    Output = request;
}
events.broadcastMessage.on('event', Handler);

sinon.stub(monitorChangesManager.repositoriesManager, 'getModifiedEntities').callsFake(function () {
    try {
        return entities
    }
    catch (error) {
        console.log(error);
    }
});



beforeEach(async function () {
    monitorChangesManagerInject.initialize();
});

describe('Monitor changes Tests', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Monitor changes: Invalid Branch ID Test', function (done) {
        entities = [];
        //Broadcast changes
        let result = monitorChangesManager.broadcastChanges(OrgID, Invalid_BranchID);
        (result == common.error).should.true();
        Output = undefined;
        done();
    });
    it('Monitor changes: When there is not changes', function (done) {
        entities = [];
        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);
        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 1 transaction available', function (done) {
        entities = [];
        entities.push(new transaction());
        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 1
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 3 transaction available', function (done) {
        entities = [];
        entities.push(new transaction());
        entities.push(new transaction());
        entities.push(new transaction());

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 3
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 1 statisticsData available', function (done) {
        entities = [];
        entities.push(new statisticsData());

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 1).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 3 statisticsData available', function (done) {
        entities = [];
        entities.push(new statisticsData());
        entities.push(new statisticsData());
        entities.push(new statisticsData());

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 3).should.true();
            Output = undefined;
            done();
        }, 300);
    });

    it('Monitor changes: When there 1 userActivity available whith invalid counter ID', function (done) {
        entities = [];
        entities.push(new userActivity());

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 0
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 1 userActivity available valid counter', function (done) {
        entities = [];
        let tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 1
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 3 userActivity available with same counter ID it should return sinlge counter', function (done) {
        entities = [];
        let tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 1
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });
    it('Monitor changes: When there 3 userActivity available with 2 counter IDs it should return 2 counters', function (done) {
        entities = [];
        let tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID2;
        entities.push(tuserActivity);
        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 2
                && Output.payload.transactionsInfo.length == 0
                && Output.payload.statisticsInfo.length == 0).should.true();
            Output = undefined;
            done();
        }, 300);
    });

    it('Monitor changes: When there are 3 transactions, 5 statistics and 3 userActivity available with 2 counter IDs', function (done) {
        entities = [];
        let tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID;
        entities.push(tuserActivity);
        tuserActivity = new userActivity();
        tuserActivity.branch_ID = BranchID;
        tuserActivity.counter_ID = CounterID2;
        entities.push(tuserActivity);
        entities.push(new transaction());
        entities.push(new transaction());
        entities.push(new transaction());
        entities.push(new statisticsData());
        entities.push(new statisticsData());
        entities.push(new statisticsData());
        entities.push(new statisticsData());
        entities.push(new statisticsData());

        //Broadcast changes
        monitorChangesManager.broadcastChanges(OrgID, BranchID);

        //Wait for results
        setTimeout(function () {
            (Output != undefined
                && Output.payload.countersInfo.length == 2
                && Output.payload.transactionsInfo.length == 3
                && Output.payload.statisticsInfo.length == 5).should.true();
            Output = undefined;
            done();
        }, 300);
    });
});