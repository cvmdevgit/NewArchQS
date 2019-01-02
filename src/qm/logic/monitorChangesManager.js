"use strict";
var common = require("../../common/common");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var events = require("../../common/events");
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");
var statisticsData = require("../data/statisticsData");
var dataService = require("../data/dataService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var responsePayload = require('../messagePayload/responsePayload');
var ModuleName = "Queuing";
var broadcastTopic = "queuing.broadcast";


function HandleModifiedUserActivity(BranchData, entity, countersInfo) {
    try {
        let t_UserActivity = entity;
        //Get Changed User activity
        let counterInfo = dataService.getCounterData(BranchData, t_UserActivity.counter_ID);
        let AlreadyAddedCounter = countersInfo.find(function (counter) { return counter.id == t_UserActivity.counter_ID });
        if (!AlreadyAddedCounter && counterInfo) {
            //If the count was already collected before
            countersInfo.push(counterInfo);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Dispatch the entities to the arrays of changed
function HandleModifiedEntity(BranchData, countersInfo, transactionsInfo, statisticsInfo, entity) {
    try {
        let userActivityClassName = (new userActivity()).constructor.name;
        let TransactionsInfoClassName = (new transaction()).constructor.name;
        let StatisticsInfoClassName = (new statisticsData()).constructor.name;
        let className = entity.constructor.name;
        if (className == userActivityClassName) {
            HandleModifiedUserActivity(BranchData, entity, countersInfo)
        }
        if (className == TransactionsInfoClassName) {
            transactionsInfo.push(entity);
        }
        if (className == StatisticsInfoClassName) {
            statisticsInfo.push(entity);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
function getChangedEntites(BranchData, countersInfo, transactionsInfo, statisticsInfo) {
    try {
        //Check the available actions
        dataService.getChangedCounters(BranchData, countersInfo);
        //Get the changed entities from Repo
        let entities = repositoriesManager.getModifiedEntities()
        if (entities && entities.length > 0) {
            entities.forEach(entity => {
                HandleModifiedEntity(BranchData, countersInfo, transactionsInfo, statisticsInfo, entity)
            });
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

function broadcastChangedCountersAndTransactions(OrgID, BranchID) {
    try {
        let countersInfo = [];
        let transactionsInfo = [];
        let statisticsInfo = [];
        let BranchData = dataService.getBranchData(OrgID, BranchID);
        if (!BranchData) {
            return common.error;
        }
        getChangedEntites(BranchData, countersInfo, transactionsInfo, statisticsInfo);
        var message = new responsePayload();
        message.topicName = ModuleName + "/branchUpdates";
        message.result = common.success;
        message.payload = new responsePayload();
        message.payload.countersInfo = countersInfo;
        message.payload.transactionsInfo = transactionsInfo;
        message.payload.statisticsInfo = statisticsInfo;
        events.broadcastMessage.emit('broadcast', broadcastTopic, message);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


function broadcastChanges(OrgID, BranchID) {
    try {
        //Broadcast statistics
        //statisticsManager.broadcastStatistics(BranchID);
        return broadcastChangedCountersAndTransactions(OrgID, BranchID);
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

module.exports.repositoriesManager = repositoriesManager;
module.exports.broadcastChanges = broadcastChanges;