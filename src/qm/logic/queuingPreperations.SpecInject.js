var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var dataService = require("../data/dataService");
var configurationService = require("../configurations/configurationService");
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json")


var setCommonSettings = function (BranchID, Key, value) {
    try {
        //Get Branch Data
        let BracnhConfig = configurationService.getBranchConfig(BranchID);

        if (BracnhConfig) {
            let commonConfig = BracnhConfig.settings.find(function (value) {
                return value.Key == Key;
            });

            if (commonConfig) {
                commonConfig.Value = value;
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
};
function setCurrentCounterState(orgID, branchID, counterID, UserActiontype) {
    let output = [];
    let CounterData;
    let CurrentActivity;
    dataService.getCurrentData(orgID, branchID, counterID, output);
    CounterData = output[1];
    CurrentActivity = output[2];
    CurrentActivity.activityType = UserActiontype;
}

function changeCounterType(orgID, branchID, counterID, counterType) {
    let CounterConfig = configurationService.getCounterConfig(counterID);
    CounterConfig.Type_LV = parseInt(counterType);
}

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

function removeTransaction(orgID, branchID, counterID) {
    let output = [];
    let CounterData;
    let CurrentActivity;
    let CurrentTransaction;
    dataService.getCurrentData(orgID, branchID, counterID, output);
    CounterData = output[1];
    CurrentActivity = output[2];
    CurrentTransaction = output[3];
    CounterData.currentTransaction = undefined;
}

function setCustomStateSetting(branchID, value) {
    setCommonSettings(branchID, constants.CUSTOM_STATE_SETTINGS, value);
}
function setDebounceSeconds(branchID, value) {
    setCommonSettings(branchID, constants.NEXT_DEBOUNCE_SECONDS, value);
}

function setCustomerNotificationInterval(branchID, value) {
    setCommonSettings(branchID, constants.SHOW_CUSTOMER_NOTIFICATION_INTERVAL, value);
}
function setFinishServingSettings(branchID, value) {
    setCommonSettings(branchID, constants.ENABLE_FINISH_SERVING, value);
}

function setMaxNumberOfRecalls(branchID, value) {
    setCommonSettings(branchID, constants.MAX_RECALL_TIMES, value);
}

function setTakingPhotoCustomerEnable(branchID, value) {
    setCommonSettings(branchID, constants.ENABLE_TACKING_CUSTOMER_PHOTO, value);
}
function setServeWithEnable(branchID, value) {
    setCommonSettings(branchID, constants.SHOW_SERVE_WITH_BUTTON, value);
}
function setHoldEnable(branchID, value) {
    setCommonSettings(branchID, constants.ENABLE_CUSTOMER_HOLD, value);
}

module.exports.removeTransaction = removeTransaction;
module.exports.setHoldEnable = setHoldEnable;
module.exports.setTakingPhotoCustomerEnable = setTakingPhotoCustomerEnable;
module.exports.setServeWithEnable = setServeWithEnable;
module.exports.setMaxNumberOfRecalls = setMaxNumberOfRecalls;
module.exports.setFinishServingSettings = setFinishServingSettings;
module.exports.setCustomerNotificationInterval = setCustomerNotificationInterval;
module.exports.setDebounceSeconds = setDebounceSeconds;
module.exports.setCustomStateSetting = setCustomStateSetting;
module.exports.setCurrentCounterState = setCurrentCounterState;
module.exports.changeCounterType = changeCounterType;
module.exports.initialize = initialize;