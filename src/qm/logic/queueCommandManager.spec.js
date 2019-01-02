"use strict";
var rewire = require("rewire");
delete require.cache[require.resolve("./queueCommandManager")];
delete require.cache[require.resolve("./externalDataRequestService")];
var queueCommandManager = rewire("./queueCommandManager");
var queueCommandManagerspecInject = require("./queueCommandManager.specInject");
var userActivityManager = rewire("./userActivityManager");
var transactionManager = rewire("../logic/transactionManager");
var statisticsManager = rewire("./statisticsManager");
var workFlowManager = rewire("./workFlowManager");
var monitorChangesManager = rewire("./monitorChangesManager");

var common = require("../../common/common");
var message = require("../../dataMessage/message");
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
const CounterID2 = "121";

var ticketInfo = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};

var ticketInfo2 = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID2,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};

var ticketInfoFail = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID3,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};


var CounterInfo = {
    orgid: OrgID,
    counterid: CounterID,
    branchid: BranchID,
    languageindex: Origin,
    holdreasonid: "0"
};

let CounterInfoAddService = {
    orgid: OrgID,
    counterid: CounterID,
    branchid: BranchID,
    serviceid: ServiceID,
    languageindex: "0"
};

should.toString();

beforeEach(async function () {
        this.timeout(15000);
        await queueCommandManagerspecInject.initialize();
        //Set the cache to the same object
        monitorChangesManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        statisticsManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        statisticsManager.__set__('configurationService', queueCommandManagerspecInject.configurationService);
        userActivityManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        userActivityManager.__set__('configurationService', queueCommandManagerspecInject.configurationService);
        workFlowManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        workFlowManager.__set__('configurationService', queueCommandManagerspecInject.configurationService);
        transactionManager.__set__('workFlowManager', workFlowManager);
        transactionManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        transactionManager.__set__('configurationService', queueCommandManagerspecInject.configurationService);
        transactionManager.__set__('statisticsManager', statisticsManager);

        queueCommandManager.__set__('monitorChangesManager', monitorChangesManager);
        queueCommandManager.__set__('statisticsManager', statisticsManager);
        queueCommandManager.__set__('userActivityManager', userActivityManager);
        queueCommandManager.__set__('transactionManager', transactionManager);
        queueCommandManager.__set__('dataService', queueCommandManagerspecInject.dataService);
        queueCommandManager.__set__('configurationService', queueCommandManagerspecInject.configurationService);

});

describe('Queuing Command Manager Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Get Service status successfully', async function () {
        let _message = new message();
        _message.payload = [];
        let result = await queueCommandManager.getServiceStatus(_message);
        (result === common.success && _message.payload.status > 0).should.true();
    });
    it('User Login successfully', async function () {
        let _message = new message();
        _message.payload = {
            orgid: OrgID,
            counterid: CounterID,
            branchid: BranchID,
            loginName: "root",
            password: "123"
        };
        let result = await queueCommandManager.userLogin(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" Second time successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" third time successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" fourth time successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "366" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload = ticketInfo2;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "386" branchid: "106" throws error', async function () {
        let _message = new message();
        _message.payload = ticketInfoFail;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.error).should.true();
    });


    it('First Next Customer Get for counter ID = 120', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        let result = await queueCommandManager.counterNext(_message);
        (result === common.success).should.true();
    });

    it('Second Next Customer Get for counter ID = 120', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        let result = await queueCommandManager.counterNext(_message);
        (result === common.success).should.true();
    });
    it('Next Customer Get for counter ID = 120 fail on no call serving counter', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToNoCallType(CounterID);
        let result = await queueCommandManager.counterNext(_message);
        (result === common.not_valid).should.true();
    });
    it('Next Customer Get for counter ID = 120 fail on ticketing counter', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToTicketingType(CounterID);
        let result = await queueCommandManager.counterNext(_message);
        (result === common.not_valid).should.true();
    });

    it('Add Service to Customer with the same segment allocated (use direct priority) for counter ID = 120', async function () {
        CounterInfoAddService.serviceid = ServiceID2;
        let _message = new message();
        _message.payload = CounterInfoAddService;
        let result = await queueCommandManager.addService(_message);
        (result === common.success).should.true();
    });


    it('Add Service to Customer without the same segment allocated (use average priority) for counter ID = 120', async function () {
        CounterInfoAddService.serviceid = ServiceID3;

        let _message = new message();
        _message.payload = CounterInfoAddService;

        let result = await queueCommandManager.addService(_message);
        (result === common.success).should.true();
    });


    it('Hold Current Customer Get for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        let result = await queueCommandManager.counterHoldCustomer(_message);
        (result === common.success).should.true();
    });


    it('Unhold customer from list successfully', async function () {
        let Readmessage = {
            topicName: "getHeldCustomers",
            payload: {
                orgid: OrgID,
                branchid: BranchID,
                counterid: CounterID,
                languageindex: "0",
                origin: "0"
            }
        };

        let heldCustomer =  queueCommandManagerspecInject.getHeldTransactions(OrgID, BranchID, CounterID);
        let CustomerInfo = {
            orgid: OrgID,
            counterid: CounterID,
            branchid: BranchID,
            transactionid: heldCustomer.id,
            languageindex: "0",
            origin: "0"
        }

        let _message = new message();
        _message.payload = CustomerInfo;
        let result = await queueCommandManager.counterServeCustomer(_message);
        (result === common.success).should.true();
    });


    it('Counter Take Break for counter ID = 120 successfully from serving', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });
    it('Counter Take Break for counter ID = 120 successfully from ready to serve', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToReady(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });
    it('Counter Take Break for counter ID = 120 successfully from not ready to serve', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToNotReadyToServe(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });
    it('Counter Take Break for counter ID = 120 successfully from office work', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToOfficeWork(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 will failed because the counter is already in break', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.not_valid).should.true();
    });

    it('Counter open from break for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });

    it('Open Counter Successfully', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        queueCommandManagerspecInject.setCounterToNotReadyToServe(OrgID, BranchID, CounterID);
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.success).should.true();
    });

    it('Counter open for counter ID = 120 will failed because the counter is already opened', async function () {
        let _message = new message();
        _message.payload = CounterInfo;
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.not_valid).should.true();
    });


    it('Counter ID = 120 service will be transferred to counter ' + CounterID2, async function () {
        //Start serving before transfer
        queueCommandManagerspecInject.setCounterToServing(OrgID, BranchID, CounterID);
        let _message = new message();
        _message.payload = CounterInfo;
        _message.payload.tocounterid = CounterID2;
        let result = await queueCommandManager.counterTransferToCounter(_message);
        (result === common.success).should.true();
    });
    it('Counter ID = 120 service will be transferred to invalid counter  will fail', async function () {
        //Start serving before transfer
        queueCommandManagerspecInject.setCounterToServing(OrgID, BranchID, CounterID);

        let _message = new message();
        _message.payload = CounterInfo;
        _message.payload.tocounterid = "";
        let result = await queueCommandManager.counterTransferToCounter(_message);
        (result === common.error).should.true();
    });
    it('invalid Counter ID service will be transferred to counter ' + CounterID2 + " and failed", async function () {
        //Start serving before transfer
        queueCommandManagerspecInject.setCounterToServing(OrgID, BranchID, CounterID);

        let _message = new message();
        _message.payload = CounterInfo;
        _message.payload.counterid = "";
        _message.payload.tocounterid = CounterID2;
        let result = await queueCommandManager.counterTransferToCounter(_message);
        (result !== common.success).should.true();
    });

    it('Counter ID ' + CounterID + 'ticket to service successfully', async function () {
        //Start serving before transfer
        queueCommandManagerspecInject.setCounterToServing(OrgID, BranchID, CounterID);

        let _message = new message();
        _message.payload = CounterInfo;
        _message.payload.serviceid = ServiceID3;
        _message.payload.counterid = CounterID;
        let result = await queueCommandManager.counterTransferToService(_message);
        (result === common.success).should.true();
    });

});
