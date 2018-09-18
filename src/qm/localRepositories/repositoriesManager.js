"use strict";
var common = require("../../common/common");
var logger = require("../../common/logger");
var entitiesRepoForSQLlite = require("./entitiesRepoForSQLlite");
var entitiesRepoForSQL = require("./entityRepoForSQL");
var entitiesRepo;
var idGenerator = require("./idGenerator");
var initialized = false;
if (common.settings.dbType == "sql") {
    //Initialize Repos
    entitiesRepo = new entitiesRepoForSQL();
}
else {
    //Initialize Repos
    entitiesRepo = new entitiesRepoForSQLlite();
}

//Initialize DB connection
//Initialize Repositories with the DB connection
//Exports (Collection of Repositories or the Repositories themselves) to be used by other classes
var initialize = async function () {
    try {
        let result = common.error;
        if (initialized) {
            return common.success;
        }



        result =await entitiesRepo.initialize();
        await idGenerator.initialize(entitiesRepo.db);
        initialized = true;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var commit = async function () {
    try {
        await entitiesRepo.commit();
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var stop = async function () {
    try {
        if (entitiesRepo) {
            await entitiesRepo.close();
        }
        initialized = false;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
module.exports.commit = commit;
module.exports.entitiesRepo = entitiesRepo;
module.exports.initialize = initialize;
module.exports.stop = stop;

