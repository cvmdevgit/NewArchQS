"use strict";
delete require.cache[require.resolve("./queueCommandManager")]; 
delete require.cache[require.resolve("./externalDataRequestService")]; 
var queueCommandManager = require("./queueCommandManager");
var externalDataRequestService = require("./externalDataRequestService");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


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

describe('Queuing Command Manager Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });

    it('Get All Branches', async function () {

        var apiMessagePayLoad = {
            EntityName: "branch",
            orgid: OrgID,
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Counters on Branch ID = 106', async function () {

        var apiMessagePayLoad = {
            EntityName: "counter",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Services on Branch ID = 106', async function () {

        var apiMessagePayLoad = {
            EntityName: "service",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };

        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get All Segments', async function () {

        var apiMessagePayLoad = {
            EntityName: "segment",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    
    it('Get All Users', async function () {

        var apiMessagePayLoad = {
            EntityName: "user",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.users.length > 0).should.true();
    });

    it('Get All Users return empty with invalid org', async function () {

        var apiMessagePayLoad = {
            EntityName: "user",
            orgid: Invalid_OrgID,
            BranchID: INVALID_BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.users.length == 0).should.true();
    });

    it('Get All Halls', async function () {

        var apiMessagePayLoad = {
            EntityName: "hall",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.halls.length > 0).should.true();
    });

    it('Get All Halls FAIL with invalid branch ID', async function () {

        var apiMessagePayLoad = {
            EntityName: "hall",
            orgid: OrgID,
            BranchID: INVALID_BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.halls.length == 0).should.true();
    });

    it('Get All Service Segment Priority Ranges Succeed', async function () {

        var apiMessagePayLoad = {
            EntityName: "servicesegmentpriorityrange",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.serviceSegmentPriorityRanges.length > 0).should.true();
    });

    it('Get All Service Segment Priority Ranges FAIL with invalid org ID', async function () {

        var apiMessagePayLoad = {
            EntityName: "serviceSegmentPriorityRange",
            orgid: Invalid_OrgID,
            BranchID: INVALID_BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message != undefined && message.payload.serviceSegmentPriorityRanges.length == 0).should.true();
    });


    it('Get Branch Statistics', async function () {

        var apiMessagePayLoad = {
            EntityName: "segment",
            orgid: OrgID,
            BranchID: BranchID
        };
        var message = {
            topicName: "readBranchStatistics",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get counter state', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID
        };
        var message = {
            topicName: "getCounterStatus",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });
    it('Get branch all counters states', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID
        };
        var message = {
            topicName: "getAllCountersStatus",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get counter held customers', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            languageindex: "0",
            origin: "0"
        };
        var message = {
            topicName: "getHeldCustomers",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });



    it('Get counter Allocated Segments', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid:""
        };
        var message = {
            topicName: "getAllocatedSegments",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message.payload.segments.length >0).should.true();
    });


    it('Get counter Allocated Services', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid:""
        };
        var message = {
            topicName: "getAllocatedServices",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message.payload.services.length >0).should.true();
    });

    it('Get counter statistics successfully', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            counterid: CounterID,
            userid:"2"
        };
        var message = {
            topicName: "getCounterStatistics",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success && message.payload.statistics.length >0).should.true();
    });
    it('Get counter statistics failed without sending counter', async function () {

        var apiMessagePayLoad = {
            orgid: OrgID,
            branchid: BranchID,
            userid:"2"
        };
        var message = {
            topicName: "getCounterStatistics",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.error && !message.payload.statistics).should.true();
    });
});
