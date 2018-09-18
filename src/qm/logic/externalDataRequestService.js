"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var statisticsManager = require("./statisticsManager");
var responsePayload = require("../messagePayload/responsePayload");
var ModuleName = "ExternalData";
//Get counter status (current ticket and state)
function getCounterStatus(message) {
    try {

        var counterInfo =  message.payload;
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
        payload.countersInfo.push(CurrentActivity);
        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload=payload;
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
    return result;
};

function ReadBranchStatistics(apiMessagePayload) {
    return statisticsManager.ReadBranchStatistics(apiMessagePayload);
};

var getData = async function (message) {
    try {
        let result = common.error;
        if (message) {
            var command = message.topicName.replace(ModuleName + "/", "");
            switch (command) {
                case enums.commands.Read:
                    result = await Read(message.payload);
                    break;
                case enums.commands.GetHeldCustomers:
                    result = await getHeldCustomers(message.payload);
                    break;
                case enums.commands.ReadBranchStatistics:
                    result = await ReadBranchStatistics(message.payload);
                    break;
                case enums.commands.GetCounterStatus:
                    result = await getCounterStatus(message);
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