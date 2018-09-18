var common = require("../../common/common");
var logger = require("../../common/logger");
var entitiesRepoForSQLlite = require("./entitiesRepoForSQLlite");
var entitiesRepoForSQL = require("./entityRepoForSQL");
var entitiesRepo;
var idGenerator = require("./idGenerator");
var initialized = false;
"use strict";

//Initialize DB connection
//Initialize Repositories with the DB connection
//Exports (Collection of Repositories or the Repositories themselves) to be used by other classes
var initialize = async function () {
    try {
        let result = common.error;
        if (initialized) {
            return common.success;
        }

        if (common.settings.dbType == "sql") {
            //Initialize Repos
            this.entitiesRepo = new entitiesRepoForSQL();
        }
        else {
            //Initialize Repos
            this.entitiesRepo = new entitiesRepoForSQLlite();
        }

        result =await this.entitiesRepo.initialize();
        await idGenerator.initialize(this.entitiesRepo.db);
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
        await this.entitiesRepo.commit();
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var stop = async function () {
    try {
        if (this.entitiesRepo) {
            await this.entitiesRepo.close();
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

