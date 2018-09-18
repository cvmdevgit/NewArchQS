"use strict";
var queueCommandManager = require("./queueCommandManager");
var externalDataRequestService = require("./externalDataRequestService");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


const OrgID = "1";
const SegmentID = "325";
const ServiceID = "364";
const ServiceID2 = "366";
const ServiceID3 = "386";
const BranchID = "106";
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
            EntityName: "branch"
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
            BranchID: BranchID
        };
        var message = {
            topicName: "read",
            payload: apiMessagePayLoad
        };
        let result = await externalDataRequestService.getData(message);
        (result === common.success).should.true();
    });

    it('Get Branch Statistics', async function () {

        var apiMessagePayLoad = {
            EntityName: "segment",
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
});
