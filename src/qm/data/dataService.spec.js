"use strict";
delete require.cache[require.resolve("./dataService")];  
var constants = require("../../common/constants");
var dataService = require("./dataService");
var dataServicespecInject = require("./dataService.specInject");
var should = require("should");
var mocha = require("mocha");
var fs = require("fs");
var describe = mocha.describe;
var it = mocha.it;
var common = require("../../common/common");

const OrgID = "1";
const UserID ="2";
const Invalid_OrgID = "1231231";
const BranchID = "106";
const SegmentID = "325";
const ServiceID = "364";
const Invalid_BranchID = "106123";
const Invalid_ServiceID = "36422";
const Invalid_SegmentID = "325234234";
const CounterID = "120";
const CounterID2 = "121";
const Invalid_CounterID = "120123";
const ServiceID_DisableAdd = "113";

should.toString();

beforeEach(async function () {
    await dataServicespecInject.initialize();
    dataService = dataServicespecInject.dataService;
});

describe('Data Service Testing', function () {
    //getService
    it('initialize successfully', async function () {
        this.timeout(15000);
        let result = await dataService.initialize(ServiceID);
        (result == common.success).should.true();
    });
    it('organizationsData exists successfully', async function () {
        (dataService.organizationsData && dataService.organizationsData.length > 0).should.true();
    });
    //getCurrentData
    it('get Current Data successfully', async function () {
        let output =[];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        (result == common.success && output[0] != undefined &&  output[1] != undefined).should.true();
    });
    it('get Current Branch Data failed because of invalid Branch ID', async function () {
        let output =[];
        let result = await dataService.getCurrentData(OrgID, Invalid_BranchID, CounterID, output);
        (result == common.success && output[0] == undefined).should.true();
    });
    it('get Current counter Data failed because of invalid counter ID', async function () {
        let output =[];
        let result = await dataService.getCurrentData(OrgID, BranchID, Invalid_CounterID, output);
        (result == common.success && output[0] != undefined && output[1] == undefined).should.true();
    });


    //getBranchCountersData
    it('get Branch Counters Data successfully', async function () {
        let output =[];
        let result = await dataService.getBranchCountersData(OrgID, BranchID, output);
        (result == common.success && output &&  output.length > 0).should.true();
    });
    it('get Branch Counters Data failed invalid org', async function () {
        let output =[];
        let result = await dataService.getBranchCountersData(Invalid_OrgID, BranchID, output);
        (result == common.error).should.true();
    });
    it('get Branch Counters Data failed invalid branch', async function () {
        let output =[];
        let result = await dataService.getBranchCountersData(OrgID, Invalid_BranchID, output);
        (result == common.error).should.true();
    });

    
    //getCurrentActivity
    it('get Current Activity successfully', async function () {
        let output =[];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentActivity(output[0], output[1]);
        (CurrentActivity != undefined).should.true();
    });
    it('get Current Activity failed branch data invalid', async function () {
        let output =[];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentActivity(undefined, output[1]);
        (CurrentActivity == undefined).should.true();
    });
    it('get Current Activity failed counter data invalid', async function () {
        let output = [];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentActivity(output[0], undefined);
        (CurrentActivity == undefined).should.true();
    });


    //getCurrentTransaction
    it('get Current Transaction successfully', async function () {
        let output = [];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentTransaction(output[0], output[1]);
        (CurrentActivity != undefined).should.true();
    });
    it('get Current Transaction failed branch data invalid', async function () {
        let output = [];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentTransaction(undefined, output[1]);
        (CurrentActivity == undefined).should.true();
    });
    it('get Current Transaction failed counter data invalid', async function () {
        let output = [];
        let result = await dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        let CurrentActivity = await dataService.getCurrentTransaction(output[0], undefined);
        (CurrentActivity == undefined).should.true();
    });


    //getBranchData
    it('get BranchData successfully', async function () {
        let BranchData = await dataService.getBranchData(OrgID, BranchID);
        (BranchData != undefined).should.true();
    });
    it('get BranchData failed org ID invalid', async function () {
        let BranchData = await dataService.getBranchData(Invalid_OrgID, BranchID);
        (BranchData == undefined).should.true();
    });
    it('get BranchData failed branch ID invalid', async function () {
        let BranchData = await dataService.getBranchData(OrgID, Invalid_BranchID);
        (BranchData == undefined).should.true();
    });

    //getCounterData
    it('get CounterData successfully', async function () {
        let BranchData = await dataService.getBranchData(OrgID, BranchID);
        let CounterData = await dataService.getCounterData(BranchData, CounterID);
        (CounterData != undefined).should.true();
    });
    it('get CounterData failed branch data invalid', async function () {
        let CounterData = await dataService.getCounterData(undefined, CounterID);
        (CounterData == undefined).should.true();
    });
    it('get CounterData failed counter ID invalid', async function () {
        let BranchData = await dataService.getBranchData(OrgID, BranchID);
        let CounterData = await dataService.getCounterData(BranchData, Invalid_CounterID);
        (CounterData == undefined).should.true();
    });
    
    //getHeldCustomers
    it('get Held Customers successfully', async function () {
        let output =[];
        let result = await dataService.getHeldCustomers(OrgID, BranchID, CounterID, output);
        (result == common.success && output && output.length > 0 ).should.true();
    });
    it('get Held Customers failed Invalid Org', async function () {
        let output =[];
        let result = await dataService.getHeldCustomers(Invalid_OrgID, BranchID, CounterID, output);
        (result == common.error).should.true();
    });
    it('get Held Customers failed Invalid Branch', async function () {
        let output =[];
        let result = await dataService.getHeldCustomers(OrgID, Invalid_BranchID, CounterID, output);
        (result == common.error).should.true();
    });
    it('get Held Customers failed Invalid Counter', async function () {
        let output =[];
        let result = await dataService.getHeldCustomers(OrgID, BranchID, Invalid_CounterID, output);
        (result == common.success && output && output.length == 0).should.true();
    });

    //getWaitingCustomers
    it('get Waiting Customers successfully', async function () {
        let output =[];
        let result = await dataService.getWaitingCustomers(OrgID, BranchID, CounterID, UserID, output);
        (result == common.success && output && output.length > 0 ).should.true();
    });
    it('get Waiting Customers failed invalid org', async function () {
        let output =[];
        let result = await dataService.getWaitingCustomers(Invalid_OrgID, BranchID, CounterID, UserID, output);
        (result == common.error).should.true();
    });
    it('get Waiting Customers failed invalid branch', async function () {
        let output =[];
        let result = await dataService.getWaitingCustomers(OrgID, Invalid_BranchID, CounterID, UserID, output);
        (result == common.error).should.true();
    });
    it('get Waiting Customers failed invalid branch', async function () {
        let output =[];
        let result = await dataService.getWaitingCustomers(OrgID, BranchID, Invalid_CounterID, UserID, output);
        (result == common.error).should.true();
    });

    //AddorUpdateVisitData
    it('Add or Update VisitData Successfull', async function () {
        let output =[];
        let transaction = dataServicespecInject.getValidTransaction(OrgID, BranchID, CounterID);
        let BranchData = await dataService.getBranchData(OrgID, BranchID);
        let result = await dataService.AddorUpdateVisitData(BranchData, transaction);
        (result == common.success).should.true();
    });

      /*
    it('stop successfully', async function () {
        let result = await dataService.stop();
        (result == common.success).should.true();
    });

    */

});