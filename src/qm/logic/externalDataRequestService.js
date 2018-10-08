"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var workFlowManager = require("./workFlowManager");
var statisticsManager = require("./statisticsManager");
var responsePayload = require("../messagePayload/responsePayload");
var ModuleName = "ExternalData";

function getCounterStatistics(message) {
    try {
        var counterInfo = message.payload;
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let UserID = counterInfo["userid"];
        let counter = configurationService.getCounterConfig(CounterID);
        if (!counter) {
            return common.error;
        }
        let AllocatedSegment = [];
        workFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID, UserID, AllocatedSegment)

        let AllocatedService = [];
        workFlowManager.getAllocatedServices(OrgID, BranchID, CounterID, UserID, AllocatedService)

        let statistics = statisticsManager.GetCountersStatistics(BranchID, CounterID, UserID, counter.Hall_ID, AllocatedSegment, AllocatedService);

        let payload = new responsePayload();
        payload.result = result;
        payload.statistics = statistics;
        message.payload = payload;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


function getAllocatedSegments(message) {
    try {

        var counterInfo = message.payload;
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let UserID = counterInfo["userid"];

        let output = [];
        result = workFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID, UserID, output);

        let payload = new responsePayload();
        payload.result = result;
        if (output) {
            payload.segments = [];
            output.forEach(function (counterData) {
                payload.segments.push(counterData);
            })
        }

        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload = payload;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
function getAllocatedServices(message) {
    try {

        var counterInfo = message.payload;
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let UserID = counterInfo["userID"];

        let output = [];
        result = workFlowManager.getAllocatedServices(OrgID, BranchID, CounterID, UserID, output)

        let payload = new responsePayload();
        payload.result = result;
        if (output) {
            payload.services = [];
            output.forEach(function (counterData) {
                payload.services.push(counterData);
            })
        };

        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload = payload;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



function getAllCountersStatus(message) {
    try {

        var counterInfo = message.payload;
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];

        let output = [];
        result = dataService.getBranchCountersData(OrgID, BranchID, output)

        let payload = new responsePayload();
        payload.result = result;
        if (output) {
            output.forEach(function (counterData) {
                payload.countersInfo.push(counterData);
            })
        }

        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload = payload;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Get counter status (current ticket and state)
function getCounterStatus(message) {
    try {

        var counterInfo = message.payload;
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];


        let payload = new responsePayload();
        payload.result = result;
        payload.transactionsInfo.push(CurrentTransaction);
        payload.countersInfo.push(CounterData);
        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload = payload;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

function Read(apiMessagePayload) {
    return configurationService.Read(apiMessagePayload);
};

function getHeldCustomers(counterInfo) {
    let result = common.success;
    let errors = [];
    let output = [];
    let OrgID = counterInfo["orgid"];
    let BranchID = counterInfo["branchid"];
    let CounterID = counterInfo["counterid"];
    result = dataService.getHeldCustomers(OrgID, BranchID, CounterID, output);
    counterInfo.HeldCustomers = output;
    counterInfo.result = result;
    return result;
};

function ReadBranchStatistics(apiMessagePayload) {
    return statisticsManager.ReadBranchStatistics(apiMessagePayload);
};

var getData = function (message) {
    try {
        let result = common.error;
        if (message) {
            var command = message.topicName.replace(ModuleName + "/", "");
            switch (command) {
                case enums.commands.Read:
                    result = Read(message.payload);
                    break;
                case enums.commands.GetHeldCustomers:
                    result = getHeldCustomers(message.payload);
                    break;
                case enums.commands.ReadBranchStatistics:
                    result = ReadBranchStatistics(message.payload);
                    break;
                case enums.commands.GetCounterStatus:
                    result = getCounterStatus(message);
                    break;
                case enums.commands.GetAllCountersStatus:
                    result = getAllCountersStatus(message);
                    break;
                case enums.commands.GetAllocatedSegments:
                    result = getAllocatedSegments(message);
                    break;
                case enums.commands.GetAllocatedServices:
                    result = getAllocatedServices(message);
                    break;
                case enums.commands.getCounterStatistics:
                    result = getCounterStatistics(message);
                    break;
                default:
                    result = common.error;
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.ModuleName = ModuleName;
module.exports.getData = getData;