/*eslint no-unused-vars: "off"*/
"use strict";
var commonMethods = require("../../common/commonMethods");
var common = require("../../common/common");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var events = require("../../common/events");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var monitorChangesManager = require("./monitorChangesManager");
var transactionManager = require("../logic/transactionManager");
var userActivityManager = require("../logic/userActivityManager");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var statisticsManager = require("./statisticsManager");
var dataPayloadManager = require("../messagePayload/dataPayloadManager");
var queuingPreperations = require("./queuingPreperations");
var responsePayload = require('../messagePayload/responsePayload');
var serviceStatus = require("../serviceStatus");
var broadcastTopic = "queuing.broadcast";
var ModuleName = "Queuing";
var ServiceStatus = new serviceStatus();

var FinishingCommand = async function (RequestID, OrgID, BranchID) {
    try {
        let result = common.error;
        //Commit DB Actions
        result = await repositoriesManager.commit(RequestID);
        if (result == common.success) {
            //Broadcast changes
            result = monitorChangesManager.broadcastChanges(OrgID, BranchID);
        }
        return result;
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
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let ServiceID = requestPayload.serviceid;
        let SegmentID = requestPayload.segmentid;

        let RequestID = commonMethods.GenerateRequestID();

        let transactioninst = new transaction();
        transactioninst.orgID = OrgID;
        transactioninst.queueBranch_ID = BranchID;
        transactioninst.service_ID = ServiceID;
        transactioninst.segment_ID = SegmentID;

        result = transactionManager.issueSingleTicket(errors,RequestID, transactioninst);
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, [transactioninst], [], []);
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



var addService = async function (message) {
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
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow next
        result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, CounterID);

        //Add service
        result = (result == common.success) ? transactionManager.addService(errors, RequestID, OrgID, BranchID, CounterID, ServiceID, ModifiedTransactions) : result;

        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;

        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;

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
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow break
        result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, FinishedTransaction) : result;
        //set the state to break
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForBreak(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, FinishedTransaction, CountersInfo, []);
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
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow next
        result = userActivityManager.CounterValidationForServe(errors, RequestID, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.serveCustomer(errors, RequestID, OrgID, BranchID, CounterID, TransactionID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);

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
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow hold
        result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        //Hold Current Customer
        result = (result == common.success) ? transactionManager.holdCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, holdreasonid, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.getNextCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //Change the status (Ready or Serving depending on next customer)
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);

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
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow next
        result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, CounterID);
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //Get next customer
        result = (result == common.success) ? transactionManager.getNextCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);
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
        let RequestID = commonMethods.GenerateRequestID();
        //Check Current State if allow break
        result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        //set the state to Open
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForOpen(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, [], CountersInfo, []);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//User Login
var userLogin = function (message) {
    try {
        let result = common.error;
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let loginName = requestPayload.loginName;
        let password = requestPayload.password;
        let CountersInfo = [];
        let errors = [];
        let RequestID = commonMethods.GenerateRequestID();
        result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, CounterID, loginName, password, undefined, CountersInfo)
        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, [], CountersInfo, []);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Transfer ticket to counter
var counterTransferToCounter = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let ToCounterID = requestPayload.tocounterid;
        let Transactions = [];
        let CountersInfo = [];
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow transfer
        result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        //Get transfer To Counter customer
        result = (result == common.success) ? transactionManager.transferToCounter(errors, RequestID, OrgID, BranchID, CounterID, ToCounterID, Transactions) : result;
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Transfer ticket to another service
var counterTransferToService = async function (message) {
    try {
        let result = common.error;
        let errors = [];
        let requestPayload = dataPayloadManager.getQSRequestObject(message.payload);
        let OrgID = requestPayload.orgid;
        let BranchID = requestPayload.branchid;
        let CounterID = requestPayload.counterid;
        let ServiceID = requestPayload.serviceid;
        let Parameters = requestPayload.additionalparameters;
        let Transactions = [];
        let CountersInfo = [];
        let RequestID = commonMethods.GenerateRequestID();

        //Check Current State if allow transfer
        result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        //Get next customer
        result = (result == common.success) ? transactionManager.transferToService(errors, RequestID, OrgID, BranchID, CounterID, ServiceID, Parameters, Transactions) : result;
        //Finish serving the current customer
        result = (result == common.success) ? transactionManager.finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, Transactions) : result;
        //set the state to ready or serving
        result = (result == common.success) ? userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) : result;
        //commit DB and Broadcast changes
        result = (result == common.success) ? await FinishingCommand(RequestID, OrgID, BranchID) : result;

        //Perpare the response
        dataPayloadManager.setResponsePayload(message, result, errors, Transactions, CountersInfo, []);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
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

//Get Queuing Status
var getServiceStatus = async function (message) {
    message.payload = ServiceStatus;
    message.result = common.success;
    return common.success;
};

//Deassign Counter from BMS
var processCommand = async function (message) {
    try {
        let result = common.error;
        if (message) {
            //Remove Module Name to get the command name
            var command = message.topicName.replace(ModuleName + "/", "");
            //If the command was status request the return it
            if (command == enums.commands.getServiceStatus) {
                result = await getServiceStatus(message);
                return result;
            }
            //If the service was down return error directly
            if (ServiceStatus.status != enums.ServiceStatuses.Working) {
                return result
            }
            //the Rest of the commands
            switch (command) {
                case enums.commands.IssueTicket:
                    result = await issueTicket(message); break;
                case enums.commands.Next:
                    result = await counterNext(message); break;
                case enums.commands.Hold:
                    result = await counterHoldCustomer(message); break;
                case enums.commands.ServeCustomer:
                    result = await counterServeCustomer(message); break;
                case enums.commands.Break:
                    result = await counterBreak(message); break;
                case enums.commands.Open:
                    result = await counterOpen(message); break;
                case enums.commands.AddService:
                    result = await addService(message); break;
                case enums.commands.Login:
                    result = await userLogin(message); break;
                case enums.commands.TransferToCounter:
                    result = await counterTransferToCounter(message); break;
                case enums.commands.TransferToService:
                    result = await counterTransferToService(message); break;
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

async function RefreshAvailableActionsForBranch(OrgID, BranchData) {
    try {
        if (BranchData && BranchData.countersData) {
            BranchData.countersData.forEach(function (counter) {
                {
                    counter.availableActions = queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchData.id, counter.id);
                }
            });
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

async function PrepareQueuingData() {
    try {
        if (dataService.organizationsData) {
            dataService.organizationsData.forEach(function (OrgData) {
                OrgData.branchesData.forEach(function (BranchData) {
                    RefreshAvailableActionsForBranch(OrgData.id, BranchData)
                    //Broadcast changes
                    monitorChangesManager.broadcastChanges(OrgData.id, BranchData.id);
                });
            });
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var reInitializeQueuingService = async function () {
    try {
        ServiceStatus.status = enums.ServiceStatuses.Error;
        //Failed to intialize queue command manager
        logger.logError("Failed to intialize queue command manager retry after 30 seconds");
        setTimeout(initialize, 30000);
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var initializeServices = async function ()
{
    try{
        let result = await configurationService.initialize();
        if (result == common.success) {
            result = await dataService.initialize();
            if (result == common.success) {
                result = await statisticsManager.initialize();
                if (result == common.success) {
                    result = await PrepareQueuingData();
                    //let fs = require("fs");
                    //fs.writeFileSync("DataNew.json", JSON.stringify(dataService.organizationsData));
                    ServiceStatus.status = enums.ServiceStatuses.Working;
                    console.log("Intialize queue command manager successfully");
                }
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Initialize everything
var initialize = async function () {
    try {
        if (ServiceStatus.status == enums.ServiceStatuses.Working) {
            return common.success;
        }
        let result = await initializeServices();
        if (result != common.success) {
            await reInitializeQueuingService();
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//If a component Report error start to re-initialize and broadcast the status
var handleServiceStatusChanged = async function (DetailedStatus) {
    try {
        //Remove the existed status if this is an update
        ServiceStatus.details = ServiceStatus.details.filter(function (t_ServiceStatus) {
            return t_ServiceStatus.id != DetailedStatus.id;
        });
        //Add the detail if it was an issue
        if (DetailedStatus.status != enums.ServiceStatuses.Working) {
            ServiceStatus.details.push(DetailedStatus);
        }

        //Try to initialize if error arrive and qm is working
        if (ServiceStatus.status == enums.ServiceStatuses.Working && DetailedStatus.status != enums.ServiceStatuses.Working) {
            reInitializeQueuingService();
        }

        //Broadcast status
        var message = new responsePayload();
        message.topicName = ModuleName + "/serviceStatusUpdate";
        message.result = common.success;
        message.payload = ServiceStatus;
        events.broadcastMessage.emit('broadcast', broadcastTopic, message);
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Add event to call for re-initialize
events.serviceStatusChange.on('serviceStatusChange', handleServiceStatusChanged);

//Initialize everything
var stop = async function () {
    try {
        let result = await dataService.stop();
        ServiceStatus.status = enums.ServiceStatuses.Unknown;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//rabbitMQClient.receive(processCommand);

module.exports.ModuleName = ModuleName;
module.exports.stop = stop;
module.exports.initialize = initialize;
module.exports.ServiceStatus = ServiceStatus;
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
module.exports.getServiceStatus = getServiceStatus;
module.exports.processCommand = processCommand;
