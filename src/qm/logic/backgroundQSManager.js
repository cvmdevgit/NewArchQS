"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var transactionManager = require("../logic/transactionManager");
var userActivityManager = require("../logic/userActivityManager");
var queueCommandManager = require("./queueCommandManager");
var message = require("../../dataMessage/message");
var autoNextID;

function getReadyCountersActivities(branchData)
{
    try{
        let readyCountersActivities;
        if (branchData.userActivitiesData && branchData.transactionsData && branchData.transactionsData.length) {
            readyCountersActivities = branchData.userActivitiesData.filter(function (value) {
                return userActivityManager.isCounterValidForAutoNext(value);
            }
            );
        }
        return readyCountersActivities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

var performAutoNextForBranch = async function (branchData) {
    try {
        let readyCountersActivities = getReadyCountersActivities(branchData);
        if (readyCountersActivities) {
            for (let iActivity = 0; iActivity < readyCountersActivities.length; iActivity++) {
                let activity = readyCountersActivities[iActivity];
                var counterInfo = {
                    orgid: activity.org_ID,
                    counterid: activity.counter_ID.toString(),
                    branchid: branchData.id.toString()
                };
                let _message = new message();
                _message.payload=counterInfo;
                queueCommandManager.counterNext(_message);
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Automatic Commands
var automaticNext = async function () {
    try {
        //let date1 = Date.now();
        //console.log("Autonext starts");

        let errors = [];
        //Automatic next
        if (queueCommandManager.initialized) {
            if (dataService.branchesData && dataService.branchesData.length > 0) {
                for (let iBranch = 0; iBranch < dataService.branchesData.length; iBranch++) {
                    let branchData = dataService.branchesData[iBranch];
                    let EnableAutoNext = configurationService.getCommonSettings(branchData.id, "EnableAutoNext");
                    if (EnableAutoNext == "1") {
                        performAutoNextForBranch(branchData);
                    }
                }
            }
        }
        //let duration = (Date.now() - date1) / 1000;
        //console.log("Autonext ends " + duration + " seconds");

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


var startBackgroundActions = async function (ticketInfo) {
    try {
        if (!autoNextID) {
            autoNextID = setInterval(automaticNext, 5000);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var stopBackgroundActions = async function (ticketInfo) {
    try {
        clearInterval(autoNextID);
        autoNextID = undefined;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.startBackgroundActions = startBackgroundActions;
module.exports.stopBackgroundActions = stopBackgroundActions;