"use strict";
var rewire = require("rewire");
delete require.cache[require.resolve("./workFlowManager")];
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];
var workFlowManagerInject = require("./workFlowManager.SpecInject");
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var WorkFlowManager = rewire("./workFlowManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const OrgID = "1";
const BranchID = "106";
const SegmentID = "325";
const ServiceID = "364";
const ServiceID2 = "113";
const Invalid_BranchID = "106123";
const Invalid_ServiceID = "36422";
const CounterID = "120";
const CounterID2 = "121";
const Invalid_CounterID = "120123";
const ServiceID_DisableAdd = "113";
should.toString();

beforeEach(async function () {
    workFlowManagerInject.initialize();
    WorkFlowManager.__set__('dataService', workFlowManagerInject.dataService);
    WorkFlowManager.__set__('configurationService', workFlowManagerInject.configurationService);
});

describe('WorkFlow Manager Test', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result != undefined).should.true();
    });
    ///////////////////////////////getWorkFlow/////////////////////////////////
    it('Get Service WorkFlow successfully', async function () {
        let result = await WorkFlowManager.getWorkFlow(BranchID, ServiceID);
        (result != undefined).should.true();
    });
    it('Get Service WorkFlow Failed invalid Branch', async function () {
        let result = await WorkFlowManager.getWorkFlow(Invalid_BranchID, ServiceID);
        (result == undefined).should.true();
    });
    it('Get Service WorkFlow Failed invalid Service', async function () {
        let result = await WorkFlowManager.getWorkFlow(BranchID, Invalid_ServiceID);
        (result == undefined).should.true();
    });
    it('Get Service WorkFlow Failed invalid WorkFlow XML', async function () {
        //Set XML to invalid workflow
        workFlowManagerInject.setInvalidWorkFlow(BranchID, ServiceID);
        let result = await WorkFlowManager.getWorkFlow(BranchID, ServiceID);
        (result == undefined).should.true();
    });

    ///////////////////////////////getServiceAvailableActions/////////////////////////////////
    it('Get Service Available Actions successfully', async function () {
        let result = await WorkFlowManager.getServiceAvailableActions(BranchID, ServiceID);
        (result != undefined).should.true();
    });
    it('Get Service Available Actions Failed invalid Branch', async function () {
        let result = await WorkFlowManager.getServiceAvailableActions(Invalid_BranchID, ServiceID);
        (result == undefined).should.true();
    });
    it('Get Service Available Actions Failed invalid Service', async function () {
        let result = await WorkFlowManager.getServiceAvailableActions(BranchID, Invalid_ServiceID);
        (result == undefined).should.true();
    });

    ////////////////IsTransferBackAllowed//////////////
    it('Is Transfer Back Allowed successfully', async function () {
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, BranchID, CounterID);
        (result != undefined).should.true();
    });

    it('Is Transfer Back Allowed Failed invalid Branch', async function () {
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, Invalid_BranchID, CounterID);
        (result == undefined).should.true();
    });
    it('Is Transfer Back Allowed Failed invalid Counter', async function () {
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, BranchID, Invalid_CounterID);
        (result == undefined).should.true();
    });

    it('Is Transfer Back Allowed is not allowed because counter on break', async function () {
        workFlowManagerInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, BranchID, CounterID);
        (result == false).should.true();
    });

    it('Is Transfer Back Allowed is not allowed because of no transaction on the counter', async function () {
        workFlowManagerInject.removeTransaction(OrgID, BranchID, CounterID);
        let result = await WorkFlowManager.IsTransferBackAllowed(OrgID, BranchID, CounterID);
        (result == false).should.true();
    });

    //TODO: To be added to check the result after create transfer to counter or service

    //////////////////////
    it('Prepare Transfer Counters List successfully', async function () {
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined).should.true();
    });

    it('Prepare Transfer Counters List Failed invalid Branch', async function () {
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, Invalid_BranchID, CounterID);
        (counterList == undefined).should.true();
    });

    it('Prepare Transfer Counters List Failed invalid Counter', async function () {
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, Invalid_CounterID);
        (counterList == undefined).should.true();
    });

    it('Prepare Transfer Counters List Empty because of no transaction on the counter', async function () {
        workFlowManagerInject.removeTransaction(OrgID, BranchID, CounterID);
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length == 0).should.true();
    });

    it('Prepare Transfer Counters List with same hall option is enabled', async function () {
        workFlowManagerInject.setSameHallParameters(BranchID, "1");
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length > 0).should.true();
    });
    it('Prepare Transfer Counters List with same hall option is disabled', async function () {
        workFlowManagerInject.setSameHallParameters(BranchID, "1");
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length > 0).should.true();
    });
    it('Prepare Transfer Counters List with same hall option is disable and all counters on other halls', async function () {
        workFlowManagerInject.setSameHallParameters(BranchID, "0");
        workFlowManagerInject.setOtherCounterTohalls(OrgID, BranchID, CounterID)
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length > 0).should.true();
    });
    it('Prepare Transfer Counters List with same hall option is enabled and all counters on other halls', async function () {
        workFlowManagerInject.setSameHallParameters(BranchID, "1");
        workFlowManagerInject.setOtherCounterTohalls(OrgID, BranchID, CounterID);
        workFlowManagerInject.removeSegmentAllocationFromOtherCounters(OrgID, BranchID, CounterID);
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length == 0).should.true();
    });

    it('Prepare Transfer Counters List Empty with No Transaction', async function () {
        workFlowManagerInject.removeAllCountersTransaction(OrgID, BranchID, CounterID);
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length == 0).should.true();
    });

    it('Prepare Transfer Counters List Disable RestrictToOpenCountersOnly it should return more than one counter', async function () {
        workFlowManagerInject.setRestrictToOpenCountersOnly(BranchID, "0");
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length > 1).should.true();
    });

    it('Prepare Transfer Counters List Enable RestrictToOpenCountersOnly it should return one counter (Working Counter)', async function () {
        workFlowManagerInject.setRestrictToOpenCountersOnly(BranchID, "1");
        let counterList = await WorkFlowManager.PrepareTransferCountersList(OrgID, BranchID, CounterID);
        (counterList != undefined && counterList.length == 1).should.true();
    });

    /////////////////////////////////////////////////////PrepareAddList/////////////////////////////////
    it('Prepare Add List successfully', async function () {
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, CounterID);
        (ServiceList != undefined).should.true();
    });
    it('Prepare Add List Failed Invalid branch', async function () {
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, Invalid_BranchID, CounterID);
        (ServiceList == undefined).should.true();
    });
    it('Prepare Add List Failed Invalid counter', async function () {
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, Invalid_CounterID);
        (ServiceList == undefined).should.true();
    });

    it('Prepare Add List Empty - No services allocated on counter', async function () {
        workFlowManagerInject.removeAllAllocatedServices(OrgID, BranchID, CounterID);
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length == 0).should.true();
    });

    it('Prepare Add List Empty - No Segments allocated on counter', async function () {
        workFlowManagerInject.removeSegmentAllocationFromCounter(OrgID, BranchID, CounterID);
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length == 0).should.true();
    });
    it('Prepare Add List service will not appear due to workflow disable Add This To Another Service', async function () {
        workFlowManagerInject.SetAddThisToAnotherService(OrgID, BranchID, ServiceID_DisableAdd, false)
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.find(function (Service) { return Service == ServiceID_DisableAdd }) == undefined).should.true();
    });

    it('Prepare Add List service will not appear due to workflow disable Allow Adding On Service', async function () {
        workFlowManagerInject.SetAddAnotherToThisService(OrgID, BranchID, ServiceID_DisableAdd, false)
        let ServiceList = await WorkFlowManager.PrepareAddList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && (ServiceList.length == 0)).should.true();
    });

    //TODO: Users Allocation tests

    ////////////////////////////////////////////////////Transfer to Service//////////////////////////
    it('Prepare Transfer Services List successfully', async function () {
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, CounterID);
        (ServiceList != undefined).should.true();
    });
    it('Prepare Transfer Services List Failed invalid branch', async function () {
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, Invalid_BranchID, CounterID);
        (ServiceList == undefined).should.true();
    });
    it('Prepare Transfer Services List Failed invalid counter', async function () {
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, Invalid_CounterID);
        (ServiceList == undefined).should.true();
    });
    it('Prepare Transfer Services List Empty because of no transaction on the counter', async function () {
        workFlowManagerInject.removeTransaction(OrgID, BranchID, CounterID);
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length == 0).should.true();
    });


    it('Prepare Transfer Services List Empty because of removed service from other counters', async function () {
        workFlowManagerInject.removeServicesAllocationFromOtherCounter(OrgID, BranchID, CounterID);
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length == 0).should.true();
    });

    it('Prepare Transfer Services List Enable Inter Segment Transfer', async function () {
        workFlowManagerInject.setEnableInterSegmentTransfer(BranchID, "1");
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length > 0).should.true();
    });
    it('Prepare Transfer Services List Disable Inter Segment Transfer', async function () {
        workFlowManagerInject.setEnableInterSegmentTransfer(BranchID, "0");
        let ServiceList = await WorkFlowManager.PrepareTransferServicesList(OrgID, BranchID, CounterID);
        (ServiceList != undefined && ServiceList.length > 0).should.true();
    });

    //Get Allocated Segments
    it('Get Allocated Segments on counter ' + CounterID + ' Sucessfully', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID, "", output);
        (result == common.success && output && output.length > 0).should.true();
    });

    //Get Allocated Segments
    it('Get Allocated Segments on counter ' + CounterID + ' Sucessfully with all segment allocated', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID, "", output);
        (result == common.success && output && output.length > 0).should.true();
    });
    it('Get Allocated Segments on counter ' + CounterID2 + ' Sucessfully (With customize segments allocated)', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID2, "", output);
        (result == common.success && output && output.length > 0).should.true();
    });
    it('Get Allocated Segments on counter ' + CounterID + ' failed with invalid branch', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedSegments(OrgID, Invalid_BranchID, CounterID, "", output);
        (result == common.error).should.true();
    });
    it('Get Allocated Segments on counter ' + CounterID + ' failed with empty counter and empty user', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedSegments(OrgID, Invalid_BranchID, undefined, undefined, output);
        (result == common.error).should.true();
    });
    //Get Allocated Services
    it('Get Allocated Services on counter ' + CounterID + ' Sucessfully', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedServices(OrgID, BranchID, CounterID, "", output);
        (result == common.success && output && output.length > 0).should.true();
    });
    it('Get Allocated Services on counter ' + CounterID2 + ' Sucessfully', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedServices(OrgID, BranchID, CounterID2, "", output);
        (result == common.success && output && output.length > 0).should.true();
    });
    it('Get Allocated Services on counter ' + CounterID + ' failed with invalid branch', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedServices(OrgID, Invalid_BranchID, CounterID, "", output);
        (result == common.error).should.true();
    });
    it('Get Allocated Services on counter ' + CounterID + ' failed with empty counter and empty user', async function () {
        let output = [];
        let result = WorkFlowManager.getAllocatedServices(OrgID, Invalid_BranchID, undefined, undefined, output);
        (result == common.error).should.true();
    });


    it('Get Disabled Services due to max limit on serving counters without any service limitation', async function () {
        let BranchData = workFlowManagerInject.dataService.getBranchData(OrgID, BranchID);
        let DisabledService = WorkFlowManager.getDisabledServiceDueToMaxServingLimit(BranchData);
        (DisabledService && DisabledService.length == 0).should.true();
    });

    it('Get Disabled Services due to max limit on serving counters with a service limited to 3 counters serving', async function () {
        workFlowManagerInject.setAllTransactionsToserving(OrgID, BranchID)
        workFlowManagerInject.setServiceMaxNumberOfcounter(WorkFlowManager, BranchID, ServiceID2, 3)
        let BranchData = workFlowManagerInject.dataService.getBranchData(OrgID, BranchID);
        let DisabledService = WorkFlowManager.getDisabledServiceDueToMaxServingLimit(BranchData);
        (DisabledService && DisabledService.length > 0).should.true();
    });
});



