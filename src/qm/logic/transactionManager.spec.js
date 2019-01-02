"use strict";
var rewire = require("rewire");
delete require.cache[require.resolve("./workFlowManager")];
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];
var transactionManagerInject = require("./transactionManager.SpecInject");
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var transactionManager = rewire("../logic/transactionManager");
var common = require("../../common/common");
var enums = require("../../common/enums");
var commonMethods = require("../../common/commonMethods");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const OrgID = "1";
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
var transaction = require("../data/transaction");
should.toString();
let RequestID = commonMethods.GenerateRequestID();

beforeEach(async function () {
    transactionManagerInject.initialize();
    //Set the cache to the same object
    transactionManager.__set__('dataService', transactionManagerInject.dataService);
    transactionManager.__set__('configurationService', transactionManagerInject.configurationService);
    RequestID = commonMethods.GenerateRequestID();
});

describe('Transaction Manager Test', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result != undefined).should.true();
    });
    //Add Service
    it('addService successfully', async function () {

        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.addService(errors, RequestID, OrgID, BranchID, CounterID, ServiceID, resultArgs);
        (result === common.success).should.true();
    });
    it('addService error invalid branch ID', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.addService(errors, RequestID, OrgID, Invalid_BranchID, CounterID, ServiceID, resultArgs);
        (result === common.error).should.true();
    });
    it('addService error invalid counter ID', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.addService(errors, RequestID, OrgID, BranchID, Invalid_CounterID, ServiceID, resultArgs);
        (result === common.error).should.true();
    });
    it('addService error invalid service ID', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.addService(errors, RequestID, OrgID, BranchID, CounterID, Invalid_ServiceID, resultArgs);
        (result === common.error).should.true();
    });

    //Hold Customer
    it('Hold Current Customer successfully', async function () {
        let errors = [];
        let HeldTransactions = [];
        let HoldReason_ID;
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.holdCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, HoldReason_ID, HeldTransactions);
        (result === common.success).should.true();
    });
    it('Hold Current Customer error invalid branch ID', async function () {
        let errors = [];
        let HeldTransactions = [];
        let HoldReason_ID;
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.holdCurrentCustomer(errors, RequestID, OrgID, Invalid_BranchID, CounterID, HoldReason_ID, HeldTransactions);
        (result === common.error).should.true();
    });

    it('Hold Current Customer error invalid counter ID', async function () {
        let errors = [];
        let HeldTransactions = [];
        let HoldReason_ID;
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.holdCurrentCustomer(errors, RequestID, OrgID, BranchID, Invalid_CounterID, HoldReason_ID, HeldTransactions);
        (result === common.error).should.true();
    });


    //finish Current Customer
    it('Finish Current Customer successfully', async function () {
        let errors = [];
        let FinishedTransaction = [];
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, FinishedTransaction);
        (result === common.success && FinishedTransaction && FinishedTransaction.length > 0 && FinishedTransaction[0].state == enums.StateType.closed).should.true();
    });
    it('Finish Current Customer successfully without current customer', async function () {
        let errors = [];
        let FinishedTransaction = [];
        transactionManagerInject.clearCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, FinishedTransaction);
        (result === common.success && FinishedTransaction && FinishedTransaction.length == 0).should.true();
    });
    it('Finish Current Customer failed invalid branch ID', async function () {
        let errors = [];
        let FinishedTransaction = [];
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, Invalid_BranchID, CounterID, FinishedTransaction);
        (result === common.error).should.true();
    });
    it('Finish Current Customer failed invalid counter ID', async function () {
        let errors = [];
        let FinishedTransaction = [];
        transactionManagerInject.setCurrentTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, Invalid_CounterID, FinishedTransaction);
        (result === common.error).should.true();
    });

    //serveCustomer
    it('Serve Customer successfully', async function () {
        let errors = [];
        let resultArgs = [];
        let transaction = transactionManagerInject.getValidTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.serveCustomer(errors, RequestID, OrgID, BranchID, CounterID, transaction.id, resultArgs);
        (result === common.success && resultArgs && resultArgs.length > 0 && resultArgs[0].state == enums.StateType.Serving).should.true();
    });
    it('Serve Customer  failed invalid branch ID', async function () {
        let errors = [];
        let resultArgs = [];
        let transaction = transactionManagerInject.getValidTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.serveCustomer(errors, RequestID, OrgID, Invalid_BranchID, CounterID, transaction.id, resultArgs);
        (result === common.error).should.true();
    });

    it('Serve Customer  failed invalid counter ID', async function () {
        let errors = [];
        let resultArgs = [];
        let transaction = transactionManagerInject.getValidTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.serveCustomer(errors, RequestID, OrgID, BranchID, Invalid_CounterID, transaction.id, resultArgs);
        (result === common.error).should.true();
    });
    it('Serve Customer successfully with no transaction', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.serveCustomer(errors, RequestID, OrgID, BranchID, CounterID, undefined, resultArgs);
        (result === common.success).should.true();
    });

    //getNextCustomer
    it('get Next Customer successfully', async function () {
        let errors = [];
        let resultArgs = [];
        transactionManagerInject.setServingCounterTransaction(OrgID, BranchID, CounterID);
        let result = await transactionManager.getNextCustomer(errors, RequestID, OrgID, BranchID, CounterID, resultArgs);
        (result === common.success && resultArgs && resultArgs.length > 0).should.true();
    });
    it('get Next Customer  failed invalid branch ID', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.getNextCustomer(errors, RequestID, OrgID, Invalid_BranchID, CounterID, resultArgs);
        (result === common.error).should.true();
    });
    it('get Next Customer  failed invalid counter ID', async function () {
        let errors = [];
        let resultArgs = [];
        let result = await transactionManager.getNextCustomer(errors, RequestID, OrgID, BranchID, Invalid_CounterID, resultArgs);
        (result === common.error).should.true();
    });


    //issueSingleTicket
    it('issue Single Ticket successfully', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = BranchID;
        transactionInst.service_ID = ServiceID;
        transactionInst.segment_ID = SegmentID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.success).should.true();
    });
    it('issue Single Ticket failed no segment', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = BranchID;
        transactionInst.service_ID = ServiceID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.error).should.true();
    });
    it('issue Single Ticket failed no service', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = BranchID;
        transactionInst.segment_ID = SegmentID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.error).should.true();
    });
    it('issue Single Ticket failed invalid segment', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = BranchID;
        transactionInst.service_ID = ServiceID;
        transactionInst.segment_ID = Invalid_SegmentID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.error).should.true();
    });
    it('issue Single Ticket failed invalid service', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = BranchID;
        transactionInst.service_ID = Invalid_ServiceID;
        transactionInst.segment_ID = SegmentID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.error).should.true();
    });
    it('issue Single Ticket failed invalid branch', async function () {
        let errors = [];
        let transactionInst = new transaction();
        transactionInst.orgID = OrgID;
        transactionInst.queueBranch_ID = Invalid_BranchID;
        transactionInst.service_ID = ServiceID;
        transactionInst.segment_ID = SegmentID;
        let result = await transactionManager.issueSingleTicket(errors, RequestID, transactionInst);
        (result === common.error).should.true();
    });

    //Transfer to Counter
    it('transfer To Counter Ticket successfully', async function () {
        let errors = [];
        let Transactions = [];
        let ToCounterID = CounterID2;
        let result = await transactionManager.transferToCounter(errors, RequestID, OrgID, BranchID, CounterID, ToCounterID, Transactions);
        (result === common.success).should.true();
    });

    it('transfer To Counter Ticket failed invalid branch', async function () {
        let errors = [];
        let Transactions = [];
        let ToCounterID = CounterID2;
        let result = await transactionManager.transferToCounter(errors, RequestID, OrgID, Invalid_BranchID, CounterID, ToCounterID, Transactions);
        (result === common.error).should.true();
    });
    it('transfer To Counter Ticket failed invalid from counter', async function () {
        let errors = [];
        let Transactions = [];
        let ToCounterID = CounterID2;
        let result = await transactionManager.transferToCounter(errors, RequestID, OrgID, BranchID, Invalid_CounterID, ToCounterID, Transactions);
        (result === common.error).should.true();
    });
    it('transfer To Counter Ticket failed invalid to counter', async function () {
        let errors = [];
        let Transactions = [];
        let ToCounterID = Invalid_CounterID;
        let result = await transactionManager.transferToCounter(errors, RequestID, OrgID, BranchID, CounterID, ToCounterID, Transactions);
        (result === common.error).should.true();
    });


    //transferToService
    it('transfer To Counter Ticket successfully', async function () {
        let errors = [];
        let Transactions = [];
        let Parameters;
        let result = await transactionManager.transferToService(errors, RequestID, OrgID, BranchID, CounterID, ServiceID, Parameters, Transactions);
        (result === common.success).should.true();
    });
    it('transfer To Counter Ticket failed invalid Branch', async function () {
        let errors = [];
        let Transactions = [];
        let Parameters;
        let result = await transactionManager.transferToService(errors, RequestID, OrgID, Invalid_BranchID, CounterID, ServiceID, Parameters, Transactions);
        (result === common.error).should.true();
    });
    it('transfer To Counter Ticket failed invalid counter', async function () {
        let errors = [];
        let Transactions = [];
        let Parameters;
        let result = await transactionManager.transferToService(errors, RequestID, OrgID, BranchID, Invalid_CounterID, ServiceID, Parameters, Transactions);
        (result === common.error).should.true();
    });
    it('transfer To Counter Ticket failed invalid service', async function () {
        let errors = [];
        let Transactions = [];
        let Parameters;
        let result = await transactionManager.transferToService(errors, RequestID, OrgID, BranchID, CounterID, Invalid_ServiceID, Parameters, Transactions);
        (result === common.error).should.true();
    });




});