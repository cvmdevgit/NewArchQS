"use strict";
var common = require("../../common/common");
var logger = require("../../common/logger");
var entitiesRepoForSQL = require("./entityRepoForSQL");
var entitiesRepo;
var initialized = false;
entitiesRepo = new entitiesRepoForSQL();

//Initialize DB connection
//Initialize Repositories with the DB connection
//Exports (Collection of Repositories or the Repositories themselves) to be used by other classes
var initialize = async function () {
    try {
        let result = common.error;
        if (initialized) {
            return common.success;
        }
        result = await entitiesRepo.initialize();
        if (result == common.success)
        {
            initialized = true; 
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var commit = async function (RequestID) {
    try {
        let result = await entitiesRepo.commit(RequestID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var stop = async function () {
    try {
        if (entitiesRepo) {
            await entitiesRepo.stop();
        }
        initialized = false;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var getModifiedEntities = function () {
    try {

        return entitiesRepo.getModifiedEntities();
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};
module.exports.getModifiedEntities = getModifiedEntities;
module.exports.commit = commit;
module.exports.entitiesRepo = entitiesRepo;
module.exports.initialize = initialize;
module.exports.stop = stop;

