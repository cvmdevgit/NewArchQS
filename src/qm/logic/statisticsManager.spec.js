"use strict";
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];

var statisticsManager = require("./statisticsManager");
var statisticsData = require("../data/statisticsData");
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const BranchID = "106";
const Invalid_BranchID = "123123123";
const SegmentID = "325";
const ServiceID = "364";
const CounterID = "120";
const CounterHallID = "838";
const Invalid_CounterHallID = "123123123123";
const UserID = "2";
should.toString();


describe('StatisticsManager initialize successfully', async function () {
    it('StatisticsManager', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Read Branch(' + BranchID + ') statistics successfully', async function () {
        let branchID = BranchID;
        let result = await statisticsManager.ReadBranchStatistics(branchID);
        (result === common.success).should.true();
    });
    it('Read Branch(106) Statistic for service ' + ServiceID + ' successfully', async function () {
        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.service_ID = ServiceID;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.WaitingCustomers > 0).should.true();
    });
    it('Read Branch(106) Statistic for Counter =  ' + CounterID + ' successfully (No waiting Customer Specific to the counter)', async function () {
        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.counter_ID = CounterID;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.NoShowCustomersNo == 0).should.true();
    });
    it('Read specific statistics for a valid branch but invalid service and segment will succeed with zero values', async function () {
        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.segment_ID = 22222222222222222;
        FilterStatistics.service_ID = 222222222222222222;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.NoShowCustomersNo == 0 && result.WaitedCustomersNo == 0).should.true();
    });
    it('Read specific statistics failed because filter is undefined', async function () {
        let FilterStatistics;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (!result).should.true();
    });
    it('Read specific statistics failed because the branch filter is 0', async function () {
        let FilterStatistics = new statisticsData();
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (!result).should.true();
    });
    it('Read Counter statistics successfully (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (statistics && statistics.length > 0).should.true();
    });

    it('Read Counter statistics empty invalid branch (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(Invalid_BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (statistics && statistics.length == 0).should.true();
    });
    it('Read Counter statistics empty invalid hall (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, Invalid_CounterHallID, AllocatedSegment, AllocatedService);
        (statistics && statistics.length == 0).should.true();
    });

    it('Read Counter statistics empty no allocated segments (Counter Allocation)', async function () {
        let AllocatedSegment = [];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (statistics && statistics.length == 0).should.true();
    });
    it('Read Counter statistics empty no allocated services (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (statistics && statistics.length == 0).should.true();
    });
    it('Read Counter statistics failed undefined branch (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(undefined, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (!statistics).should.true();
    });
    it('Read Counter statistics failed undefined counter (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, undefined, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (!statistics).should.true();
    });
    it('Read Counter statistics failed undefined user (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, undefined, CounterHallID, AllocatedSegment, AllocatedService);
        (!statistics).should.true();
    });
    it('Read Counter statistics failed undefined segments (Counter Allocation)', async function () {
        let AllocatedSegment = undefined;
        let AllocatedService = [113, 159, 114, 364, 366, 368, 370, 372, 374, 376];
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, undefined, CounterHallID, AllocatedSegment, AllocatedService);
        (!statistics).should.true();
    });
    it('Read Counter statistics failed undefined services (Counter Allocation)', async function () {
        let AllocatedSegment = [327, 326, 325, 111, 325, 326];
        let AllocatedService = undefined;
        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService);
        (!statistics).should.true();
    });

});

