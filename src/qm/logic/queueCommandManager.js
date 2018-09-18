/*eslint no-unused-vars: "off"*/
"use strict";
var common = require("../../common/common");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var transactionManager = require("../logic/transactionManager");
var userActivityManager = require("../logic/userActivityManager");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var statisticsManager = require("./statisticsManager");
var dataPayloadManager = require("../messagePayload/dataPayloadManager");
var localMessagingService = require('../../localMessagingService');
var initialized = false;


var FinishingCommand = async function (BranchID) {
    try {
        //Broadcast statistics
        statisticsManager.broadcastStatistics(BranchID);
        //Commit DB Actions
        await repositoriesManager.commit();
        
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//only functions and reference of branch data and configuration service.
//Issue Ticket 
var issueTicket = async function (message) {
    try {
        let result;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let transactioninst = new transaction();
        transactioninst.org_ID = requestPayload.orgid;
        transactioninst.branch_ID = requestPayload.branchid;
        transactioninst.service_ID = requestPayload.serviceid;
        transactioninst.segment_ID = requestPayload.segmentid;

        result = transactionManager.issueSingleTicket(errors, transactioninst);
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, [transactioninst], [], []);
        await FinishingCommand(requestPayload.branchid);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Issue Ticket with multiple services
var issueTicketMulti = function (ticketInfo) {
    return true;
};



var addService = function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let ServiceID = requestPayload.serviceid;
        let CounterID = requestPayload.counterid;
        let ModifiedTransactions = [];
        let CountersInfo = [];
        //Check Current State if allow next
        result = userActivityManager.CounterValidationForNext(errors, OrgID, BranchID, CounterID);

        //Add service
        result = (result == common.success) ? transactionManager.addService(errors, OrgID, BranchID, CounterID, ServiceID, ModifiedTransactions) : result;

        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, OrgID, BranchID, CounterID, CountersInfo) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, ModifiedTransactions, CountersInfo, []);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//break customer from counter
var counterBreak = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let FinishedTransaction = [];
        let CountersInfo = [];
        //Check Current State if allow break
        result = userActivityManager.CounterValidationForBreak(errors, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, OrgID, BranchID, CounterID, FinishedTransaction) : result;
        //set the state to break
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForBreak(errors, OrgID, BranchID, CounterID, CountersInfo) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, FinishedTransaction, CountersInfo, []);
        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var counterServeCustomer = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let TransactionID = requestPayload.transactionid;
        let Transactions = [];
        let CountersInfo = [];
        //Check Current State if allow next
        result = userActivityManager.CounterValidationForServe(errors, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, OrgID, BranchID, CounterID, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.serveCustomer(errors, OrgID, BranchID, CounterID, TransactionID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, OrgID, BranchID, CounterID, CountersInfo) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var counterHoldCustomer = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let holdreasonid = requestPayload.holdreasonid;
        let Transactions = [];
        let CountersInfo = [];
        //Check Current State if allow hold
        result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        //Hold Current Customer
        result = (result == common.success) ? transactionManager.holdCurrentCustomer(errors, OrgID, BranchID, CounterID, holdreasonid, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.getNextCustomer(errors, OrgID, BranchID, CounterID, Transactions) : result;
        //Change the status (Ready or Serving depending on next customer)
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, OrgID, BranchID, CounterID, CountersInfo) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Take break on counter
var counterNext = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let Transactions = [];
        let CountersInfo = [];
        //Check Current State if allow next
        result = userActivityManager.CounterValidationForNext(errors, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, OrgID, BranchID, CounterID, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.getNextCustomer(errors, OrgID, BranchID, CounterID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, OrgID, BranchID, CounterID, CountersInfo) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Open counter without calling customer
var counterOpen = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let CountersInfo = [];
        //Check Current State if allow break
        result = userActivityManager.CounterValidationForOpen(errors, OrgID, BranchID, CounterID);
        if (result == common.success) {
            //set the state to Open
            result = userActivityManager.ChangeCurrentCounterStateForOpen(errors, OrgID, BranchID, CounterID, CountersInfo);
        }

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, [], CountersInfo, []);

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Transfer ticket to counter
var counterTransferToCounter = function (TransferInfo) {
    return true;
};

//Transfer ticket to another service
var counterTransferToService = function (TransferInfo) {
    return true;
};


//User Login
var userLogin = function (loginInfo) {
    return true;
};

//User logoff
var userLogoff = function (counterInfo) {
    return true;
};

//Issue a Appointment ticket
var issueAppointmentTicket = function (reservationInfo) {
    return true;
};

//Recall Current Customer
var counterRecallCurrentCustomer = function (counterInfo) {
    return true;
};

//Transfer ticket to another service
var counterTransferWaitingCustomer = function (TransferInfo) {
    return true;
};



//Update Customer Note
var saveCustomerNote = function (customerInfo) {
    return true;
};

//Counter is not ready
var counterNotReady = function (counterInfo) {
    return true;
};

//transfer customer back to service/counter
var counterTransferBack = function (counterInfo) {
    return true;
};

//Update locking state for ticketing counter
var counterLockstateUpdate = function (counterInfo, lockState) {
    return true;
};


//change to customer state (office time)
var counterCustomState = function (counterInfo) {
    return true;
};
//Finish customer without call other customers
var counterFinsihServing = function (counterInfo) {
    return true;
};

//issue ticket for customer with appointment on walk in
var checkInAppointment = function (appointmentInfo) {
    return true;
};

//Deassign Counter from BMS
var counterDeassignFromBMS = function (appointmentInfo) {
    return true;
};

//Deassign Counter from BMS
var processCommand = async function (message) {
    try {
        let result = common.error;
        if (message) {
            //Remove Module Name
            var command = message.topicName.replace(this.ModuleName + "/", "");
            switch (command) {
                case enums.commands.IssueTicket:
                    result = await this.issueTicket(message); break;
                case enums.commands.Next:
                    result = await this.counterNext(message);break;
                case enums.commands.Hold:
                    result = await this.counterHoldCustomer(message);break;
                case enums.commands.ServeCustomer:
                    result = await this.counterServeCustomer(message);break;
                case enums.commands.Break:
                    result = await this.counterBreak(message);break;
                case enums.commands.Open:
                    result = await this.counterOpen(message);break;
                case enums.commands.AddService:
                    result = await this.addService(message);break;
            }
        }
        localMessagingService.sendReply(message);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Initialize everything
var initialize = async function () {
    try {
        if (this.initialized) {
            return common.success;
        }
        let result = await configurationService.initialize();
        if (result == common.success) {
            result = await dataService.initialize();
            if (result == common.success) {
                result = await statisticsManager.initialize();
                this.initialized = true;
                console.log("Initialized");
                return result;
            }
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
//Initialize everything
var stop = async function () {
    try {
        let result = await dataService.stop();
        this.initialized = false;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.ModuleName = "Queuing";
module.exports.stop = stop;
module.exports.initialize = initialize;
module.exports.initialized = initialized;
module.exports.issueTicket = issueTicket;
module.exports.counterNext = counterNext;
module.exports.counterOpen = counterOpen;
module.exports.counterBreak = counterBreak;
module.exports.counterServeCustomer = counterServeCustomer;
module.exports.counterHoldCustomer = counterHoldCustomer;
module.exports.addService = addService;
module.exports.issueTicketMulti = issueTicketMulti;
module.exports.counterTransferToCounter = counterTransferToCounter;
module.exports.counterTransferToService = counterTransferToService;
module.exports.userLogin = userLogin;
module.exports.userLogoff = userLogoff;
module.exports.issueAppointmentTicket = issueAppointmentTicket;
module.exports.counterRecallCurrentCustomer = counterRecallCurrentCustomer;
module.exports.counterTransferWaitingCustomer = counterTransferWaitingCustomer;
module.exports.saveCustomerNote = saveCustomerNote;
module.exports.counterNotReady = counterNotReady;
module.exports.counterTransferBack = counterTransferBack;
module.exports.counterLockstateUpdate = counterLockstateUpdate;
module.exports.counterCustomState = counterCustomState;
module.exports.counterFinsihServing = counterFinsihServing;
module.exports.checkInAppointment = checkInAppointment;
module.exports.counterDeassignFromBMS = counterDeassignFromBMS;
module.exports.processCommand = processCommand;
