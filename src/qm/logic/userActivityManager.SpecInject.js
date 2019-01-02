
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
var userActivity = require("../data/userActivity");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var dataService = require("../data/dataService");
var configurationService = require("../configurations/configurationService");
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json")

async function initialize() {
    await configurationService.initialize();
    let OrgData = JSON.parse(str);
    while (dataService.organizationsData.length > 0) {
        dataService.organizationsData.pop();
    }
    OrgData.forEach(function (Branch) {
        dataService.organizationsData.push(Branch);
    });
}
function setCounterToTicketingType(counterID) {
    try {
        let Counter = configurationService.getCounterConfig(counterID);
        Counter.Type_LV = enums.counterTypes.TicketDispenser;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToNoCallType(counterID) {
    try {
        let Counter = configurationService.getCounterConfig(counterID);
        Counter.Type_LV = enums.counterTypes.NoCallServing;
    }
    catch (error) {
        logger.logError(error);
    }

}
function setCounterToBreak(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Break;
        CounterData.currentState.type = enums.UserActiontypes.Break;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToReady(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Ready;
        CounterData.currentState.type = enums.UserActiontypes.Ready;
    }
    catch (error) {
        logger.logError(error);
    }

}
function setCounterToServing(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Serving;
        CounterData.currentState.type = enums.UserActiontypes.Serving;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToNotReadyToServe(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.NotReady;
        CounterData.currentState.type = enums.UserActiontypes.NotReady;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToOfficeWork(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Custom;
        CounterData.currentState.type = enums.UserActiontypes.Custom;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToNoCallServing(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.NoCallServing;
        CounterData.currentState.type = enums.UserActiontypes.NoCallServing;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToCustomerServingType(counterID) {
    try {
        let Counter = configurationService.getCounterConfig(counterID);
        Counter.Type_LV = enums.counterTypes.CustomerServing;
    }
    catch (error) {
        logger.logError(error);
    }

}

function getValidCurrentActivity() {
    try {
        let activity = new userActivity();
        activity.activityType = enums.UserActiontypes.Ready;
        return activity;
    }
    catch (error) {
        logger.logError(error);
    }

}
function getInvalidCurrentActivity() {
    try {
        let activity = new userActivity();
        activity.activityType = enums.UserActiontypes.Serving;
        return activity;
    }
    catch (error) {
        logger.logError(error);
    }
}
function removeCurrentActivities(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CounterData.currentState = undefined;
    }
    catch (error) {
        logger.logError(error);
    }
}


module.exports.removeCurrentActivities = removeCurrentActivities;
module.exports.getValidCurrentActivity = getValidCurrentActivity;
module.exports.getInvalidCurrentActivity = getInvalidCurrentActivity;
module.exports.setCounterToNotReadyToServe = setCounterToNotReadyToServe;
module.exports.setCounterToNoCallServing = setCounterToNoCallServing;
module.exports.setCounterToOfficeWork = setCounterToOfficeWork;
module.exports.setCounterToServing = setCounterToServing;
module.exports.setCounterToBreak = setCounterToBreak;
module.exports.setCounterToReady = setCounterToReady;
module.exports.setCounterToNoCallType = setCounterToNoCallType;
module.exports.setCounterToCustomerServingType = setCounterToCustomerServingType;
module.exports.setCounterToTicketingType = setCounterToTicketingType;
module.exports.initialize = initialize;

module.exports.dataService = dataService;
module.exports.configurationService = configurationService;

