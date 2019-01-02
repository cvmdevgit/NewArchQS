"use strict";
var rewire = require("rewire");
delete require.cache[require.resolve("./queueCommandManager")];
delete require.cache[require.resolve("./externalDataRequestService")];
let queueCommandManager = require("./queueCommandManager");
let externalDataRequestService = rewire("./externalDataRequestService");
let externalDataRequestServicespecInject = require("./externalDataRequestService.specInject");
let common = require("../../common/common");
let should = require("should");
let mocha = require("mocha");
let describe = mocha.describe;
let it = mocha.it;


const OrgID = "1";
const Invalid_OrgID = "1123";
const SegmentID = "325";
const ServiceID = "364";
const ServiceID2 = "366";
const ServiceID3 = "386";
const BranchID = "106";
const INVALID_BranchID = "106123123";
const LanguageIndex = "0";
const Origin = "0";
const CounterID = "120";




console.log("externalDataRequestService.spec.js");
should.toString();

beforeEach(async function () {
    externalDataRequestService.__set__("dataService",externalDataRequestServicespecInject.dataService);
    externalDataRequestService.__set__("configurationService",externalDataRequestServicespecInject.configurationService);
    await externalDataRequestServicespecInject.initialize();
    externalDataRequestService.__set__("statisticsManager",externalDataRequestServicespecInject.statisticsManager);
});

describe('External Data Service Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });

    it('Get All Branches', async function () {

        let apiMessagePayLoad = {
            EntityName: "branch",
            orgid: OrgID,
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Counters on Branch ID = 106', async function () {

        let apiMessagePayLoad = {
            EntityName: "counter",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Services on Branch ID = 106', async function () {

        let apiMessagePayLoad = {
            EntityName: "service",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };

        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Segments', async function () {

        let apiMessagePayLoad = {
            EntityName: "segment",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });


    it('Get All Users', async function () {

        let apiMessagePayLoad = {
            EntityName: "user",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.users.length > 0).should.true();
    });

    it('Get All Users return empty with invalid org', async function () {

        let apiMessagePayLoad = {
            EntityName: "user",
            orgid: Invalid_OrgID,
            BranchID: INVALID_BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.users.length == 0).should.true();
    });

    it('Get All Halls', async function () {

        let apiMessagePayLoad = {
            EntityName: "hall",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.halls.length > 0).should.true();
    });

    it('Get All Halls FAIL with invalid branch ID', async function () {

        let apiMessagePayLoad = {
            EntityName: "hall",
            orgid: OrgID,
            BranchID: INVALID_BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.halls.length == 0).should.true();
    });

    it('Get All Service Segment Priority Ranges Succeed', async function () {

        let apiMessagePayLoad = {
            EntityName: "servicesegmentpriorityrange",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.serviceSegmentPriorityRanges.length > 0).should.true();
    });

    it('Get All Service Segment Priority Ranges FAIL with invalid org ID', async function () {

        let apiMessagePayLoad = {
            EntityName: "serviceSegmentPriorityRange",
            orgid: Invalid_OrgID,
            BranchID: INVALID_BranchID
        };
        let message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.serviceSegmentPriorityRanges.length == 0).should.true();
    });


    it('Get Branch Statistics', async function () {

        let apiMessagePayLoad = {
            EntityName: "segment",
            orgid: OrgID,
            BranchID: BranchID
        };
        let message = {
            topicName: "readBranchStatistics",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get counter state', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID
        };
        let message = {
            topicName: "getCounterStatus",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });
    it('Get branch all counters states', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID
        };
        let message = {
            topicName: "getAllCountersStatus",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get counter held customers', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
        };
        let message = {
            topicName: "getHeldCustomers",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });
    it('Get counter waiting customers for CES counter ' + CounterID , async function () {
        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid: "2"
        };
        let message = {
            topicName: "getWaitingCustomers",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get counter Allocated Segments', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid: ""
        };
        let message = {
            topicName: "getAllocatedSegments",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message.payload.segments.length > 0).should.true();
    });


    it('Get counter Allocated Services', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid: ""
        };
        let message = {
            topicName: "getAllocatedServices",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message.payload.services.length > 0).should.true();
    });

    it('Get counter statistics successfully', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid: "2"
        };
        let message = {
            topicName: "getCounterStatistics",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.success && message.payload.statistics.length > 0).should.true();
    });
    it('Get counter statistics failed without sending counter', async function () {

        let apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            userid: "2"
        };
        let message = {
            topicName: "getCounterStatistics",
            payload: apiMessagePayLoad
        };
        let result = externalDataRequestService.getData(message);
        (result === common.error && !message.payload.statistics).should.true();
    });
});
