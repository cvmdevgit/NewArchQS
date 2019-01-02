"use strict";
delete require.cache[require.resolve("./configurationService")];  
var constants = require("../../common/constants");
var configurationService = require("./configurationService");
var configurationServicespecInject = require("./configurationService.specInject");
var should = require("should");
var mocha = require("mocha");
var fs = require("fs");
var describe = mocha.describe;
var it = mocha.it;
var common = require("../../common/common");
const ServiceID = "364";
const Invalid_ServiceID = "364123123";
const ServiceConfig_ID= "363";
const Invalid_ServiceConfig_ID= "33333";
const branchid = "106";
const OrgID = "1";
const Invalid_OrgID = "1123";
const Invalid_branchid = "101231236";
should.toString();

beforeEach(async function () {
    await configurationServicespecInject.initialize();
    configurationService = configurationServicespecInject.configurationService;
});

describe('Configration Service', function () {
    //getService
    it('Get Service successfully', async function () {
        this.timeout(15000);
        let Service = await configurationService.getService(ServiceID);
        (Service != undefined).should.true();
    });
    it('Get Service failed invalid ID', async function () {
        let Service = await configurationService.getService(Invalid_ServiceID);
        (Service == undefined).should.true();
    });
    it('Get Service failed invalid undefined ID', async function () {
        let Service = await configurationService.getService(undefined);
        (Service == undefined).should.true();
    });
    //getServiceConfig
    it('Get Service Config successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(ServiceConfig_ID);
        (ServiceConfig != undefined).should.true();
    });
    it('Get Service Config failed Invalid Config ID', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(Invalid_ServiceConfig_ID);
        (ServiceConfig == undefined).should.true();
    });
    it('Get Service Config failed undefined ID', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(undefined);
        (ServiceConfig == undefined).should.true();
    });

    //getServiceConfigFromService
    it('Get Service Config from ServiceID successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfigFromService(ServiceID);
        (ServiceConfig != undefined).should.true();
    });
    it('Get Service Config from ServiceID failed Invalid ID', async function () {
        let ServiceConfig = await configurationService.getServiceConfigFromService(Invalid_ServiceID);
        (ServiceConfig == undefined).should.true();
    });

    //getCommonSettings
    it('Get common Config successfully', async function () {
        let commonConfig = await configurationService.getCommonSettings(branchid,constants.EnableAutoNext);
        (commonConfig != undefined).should.true();
    });    
    it('Get common Config Bool successfully', async function () {
        let commonConfig = await configurationService.getCommonSettingsBool(branchid,constants.EnableAutoNext);
        (commonConfig == true || commonConfig == false ).should.true();
    });    
    it('Get common Config Integer successfully', async function () {
        let commonConfig = await configurationService.getCommonSettingsInt(branchid,constants.MAX_RECALL_TIMES);
        (commonConfig >= 0).should.true();
    });    
    it('Get common Config Failed', async function () {
        let commonConfig = await configurationService.getCommonSettings(branchid,"12312312");
        (commonConfig == undefined).should.true();
    });
    //Read
    it('Read Invalid entity failed', async function () {
        var payload = {
            EntityName: "branchInvalid",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.error).should.true();
    });
    //Read (Branch) 
    it('Read Branches successfully', async function () {
        var payload = {
            EntityName: "branch",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.branches.length > 0).should.true();
    });  
    it('Read Branches are empty because invalid Org', async function () {
        var payload = {
            EntityName: "branch",
            orgid: Invalid_OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.branches.length == 0).should.true();
    });  

   //Read (user) 
    it('Read Users successfully', async function () {
        var payload = {
            EntityName: "user",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.users.length > 0).should.true();
    });  
    it('Read Users are empty because invalid Org', async function () {
        var payload = {
            EntityName: "user",
            orgid: Invalid_OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.users.length == 0).should.true();
    });  

    //Read (hall) 
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


    //Read (service segment priority range)
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


    //Read (Services on Branch)
    it('Read Service on Branch 106 successfully', async function () {
        var payload ={
            EntityName: "service",
            BranchID: branchid,
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.services.length > 0).should.true();
    });  
    it('Read Service on Invalid Branch 106 failed', async function () {
        var payload ={
            EntityName: "service",
            BranchID: Invalid_branchid,
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.error).should.true();
    });  


    //Read (Segments)
    it('Read Segments on Branch 106 successfully', async function () {
        var payload ={
            EntityName: "segment",
            orgid: OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.segments.length > 0).should.true();
    });  
    it('Read Segments on Branch 106 Empty with invalid org', async function () {
        var payload ={
            EntityName: "segment",
            orgid: Invalid_OrgID
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.segments.length == 0).should.true();
    });  


    //Read (Counters)
    it('Read Serving && No call Serving Counters on Branch 106 successfully', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: branchid,
            types: ["0", "3"]
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.counters.length > 0).should.true();
    });  
    it('Read Counters on Invalid Branch counter empty ', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: Invalid_branchid,
            types: ["0", "3"]
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.counters.length == 0).should.true();
    });  
    it('Read Serving Counters on on Branch 106 successfully', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: branchid,
            types: ["0"]
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.counters.length > 0).should.true();
    });  
    it('Read Ticketing Counters on on Branch 106 successfully', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: branchid,
            types: ["1","2"]
        }
        let result = await configurationService.Read(payload);
        (result == common.success && payload && payload.counters.length > 0).should.true();
    });  
    it('Read no call serving Counters on on Branch 106 successfully', async function () {
        var payload = {
            EntityName: "counter",
            BranchID: branchid,
            types: ["3"]
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