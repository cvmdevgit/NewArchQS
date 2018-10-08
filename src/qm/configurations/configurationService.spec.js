"use strict";
delete require.cache[require.resolve("./configurationService")];  
var constants = require("../../common/constants");
var configurationService = require("./configurationService");
var should = require("should");
var mocha = require("mocha");
var fs = require("fs");
var describe = mocha.describe;
var it = mocha.it;
var common = require("../../common/common");
const ServiceID = "364";
const ServiceConfig_ID= "363";
const Invalid_ServiceConfig_ID= "33333";
const branchid = "106";

const OrgID = "1";
const Invalid_OrgID = "1123";
const Invalid_branchid = "101231236";
should.toString();

/*
var sinon = require('sinon');
var stub = sinon.stub();
sinon.stub(configurationService,'initialize').callsFake (async function(){
    try{
        common.settings.mock = true;
        await configurationService.initialize();
        console.log("########################Mock Data###########################################");
        return common.success;
    }
    catch (error)
    {
        console.log(error);
    }
});
*/

describe('Configration Service', function () {
    it('Initialize Configration Service successfully', async function () {
        let result = await configurationService.initialize();
        (result === common.success).should.true();
    });
    it('Get Service successfully', async function () {
        let Service = await configurationService.getService(ServiceID);
        (Service != undefined).should.true();
    });
    it('Get Service Config successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(ServiceConfig_ID);
        (ServiceConfig != undefined).should.true();
    });
    it('Get Service Config failed', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(Invalid_ServiceConfig_ID);
        (ServiceConfig == undefined).should.true();
    });

    it('Get Service Config from ServiceID successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfigFromService(ServiceID);
        (ServiceConfig != undefined).should.true();
    });
    it('Get common Config successfully', async function () {
        let commonConfig = await configurationService.getCommonSettings(branchid,constants.EnableAutoNext);
        (commonConfig != undefined).should.true();
    });    
    it('Read Branches successfully', async function () {
        var payload = {
            EntityName: "branch",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.branches.length > 0).should.true();
    });  
    it('Read Users successfully', async function () {
        var payload = {
            EntityName: "user",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.users.length > 0).should.true();
    });  
    it('Read halls successfully', async function () {
        var payload = {
            EntityName: "hall",
            BranchID: branchid,
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.halls.length > 0).should.true();
    });  
    it('Read halls empty due to invalid org id', async function () {
        var payload = {
            EntityName: "hall",
            BranchID: branchid,
            orgid: Invalid_OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.halls.length == 0).should.true();
    });  
    it('Read service segment priority range successfully', async function () {
        var payload = {
            EntityName: "servicesegmentpriorityrange",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.serviceSegmentPriorityRanges.length > 0).should.true();
    });  
    it('Read service segment priority range empty due to invalid org id', async function () {
        var payload = {
            EntityName: "servicesegmentpriorityrange",
            BranchID: branchid,
            orgid: Invalid_OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.serviceSegmentPriorityRanges.length == 0).should.true();
    });  
    it('Read Service on Branch 106 successfully', async function () {
        var payload ={
            EntityName: "service",
            BranchID: branchid,
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.services.length > 0).should.true();
    });  
    it('Read Segments on Branch 106 successfully', async function () {
        var payload ={
            EntityName: "segment",
            BranchID: branchid,
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.segments.length > 0).should.true();
    });  
    it('Read Counters on Branch 106 successfully', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: branchid,
            types: ["0", "3"]
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.counters.length > 0).should.true();
    });  
    it('Read invalid entity on Branch throws error', async function () {
        var payload = {
            EntityName: "invalidEntity"
        }
        let result = await configurationService.Read(payload);
        (result == common.error).should.true();
    });  
});