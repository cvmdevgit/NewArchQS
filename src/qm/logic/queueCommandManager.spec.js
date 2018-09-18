"use strict";
var queueCommandManager = require("./queueCommandManager");
var externalDataRequestService = require("./externalDataRequestService");
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


console.log("queueCommandManager.spec");
should.toString();

describe('Queuing Command Manager Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload=ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" Second time successfully', async function () {
        let _message = new message();
        _message.payload=ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" third time successfully', async function () {
        let _message = new message();
        _message.payload=ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" fourth time successfully', async function () {
        let _message = new message();
        _message.payload=ticketInfo;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "366" branchid: "106" successfully', async function () {
        let _message = new message();
        _message.payload=ticketInfo2;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "386" branchid: "106" throws error', async function () {
        let _message = new message();
        _message.payload=ticketInfoFail;
        let result = await queueCommandManager.issueTicket(_message);
        (result === common.error).should.true();
    });


    it('First Next Customer Get for counter ID = 120', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterNext(_message);
        (result === common.success).should.true();
    });

    it('Second Next Customer Get for counter ID = 120', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterNext(_message);
        (result === common.success).should.true();
    });

    it('Add Service to Customer with the same segment allocated (use direct priority) for counter ID = 120', async function () {
        CounterInfoAddService.serviceid= ServiceID2;
        let _message = new message();
        _message.payload=CounterInfoAddService;
        let result = await queueCommandManager.addService(_message);
        (result === common.success).should.true();
    });

    it('Add Service to Customer without the same segment allocated (use average priority) for counter ID = 120', async function () {
        CounterInfoAddService.serviceid= ServiceID3;

        let _message = new message();
        _message.payload=CounterInfoAddService;

        let result = await queueCommandManager.addService(_message);
        (result === common.success).should.true();
    });


    it('Hold Current Customer Get for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
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
        let result = await externalDataRequestService.getData(Readmessage);
        if (result === common.success)
        {
            let heldCustomer = Readmessage.payload.HeldCustomers[0];
            let CustomerInfo = {
                orgid: OrgID,
                counterid: CounterID,
                branchid: BranchID,
                transactionid: heldCustomer.id,
                languageindex: "0",
                origin: "0"
            }

            let _message = new message();
            _message.payload=CustomerInfo;
            result =  await queueCommandManager.counterServeCustomer(_message);
        }
        (result === common.success).should.true();
    });
    
    it('Counter Take Break for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 will failed because the counter is already in break', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.not_valid).should.true();
    });

    it('Counter open from break for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 successfully', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterBreak(_message);
        (result === common.success).should.true();
    });

    it('Open Counter Successfully', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.success).should.true();
    });

    it('Counter open for counter ID = 120 will failed because the counter is already opened', async function () {
        let _message = new message();
        _message.payload=CounterInfo;
        let result = await queueCommandManager.counterOpen(_message);
        (result === common.not_valid).should.true();
    });

});
