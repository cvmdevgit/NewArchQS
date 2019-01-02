//set DB connection
//do counter functions of user table on the DB
const format = require('string-format');
var logger = require("../../common/logger");
var common = require("../../common/common");
var sqlDB = require("./sqlConnector");
var fs = require("fs");
const c_Repo_Format = "./entitiesSQLRepos/{0}SQLRepo";

//collections for update
var uncommittedEntities = [];
var updateModifiedEntities = [];

var getAll = async function (entity, EntityList) {
    try {
        let RepoModule = format(c_Repo_Format,entity.constructor.name);
        let SQLRepo = require(RepoModule);
        let sqlResult = await SQLRepo.getAll(this.db);
        if (sqlResult.result == common.success && sqlResult.recordsets) {
            sqlResult.recordsets.forEach(function(record) {
                EntityList.push(record);
            });
        }
        return sqlResult.result;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Delete from DB
var remove = async function (entity) {
    try {
        if (entity) {
            let RepoModule = format(c_Repo_Format,entity.constructor.name);
            let SQLRepo = require(RepoModule);
            let sqlResult = await SQLRepo.remove(this.db, entity.id);
            return sqlResult.result;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Delete all from DB
var clear = async function (entity) {
    try {

        let RepoModule = format(c_Repo_Format,entity.constructor.name);
        let SQLRepo = require(RepoModule);
        let sqlResult = await SQLRepo.clear(this.db);
        return sqlResult.result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Add or Update
var AddorUpdateEntity = async function (db, entity) {
    try {
        let RepoModule = format(c_Repo_Format,entity.constructor.name);
        let SQLRepo = require(RepoModule);
        let sqlResult = await SQLRepo.AddorUpdate(db, entity);
        return sqlResult.result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var Update = async function (entity) {
    try {
        let that = this.db;
        let result =  await AddorUpdateEntity(that, entity);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var Add = async function (entity) {
    try {
        let that = this.db;
        let result =  await AddorUpdateEntity(that, entity);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


var AddUncommittedSynch = function (Entity) {
    try {
        if (Entity) {
            if (uncommittedEntities) {
                //remove old entity if existed
                //To keep the last update only on the DB 
                for (let i = 0; i < uncommittedEntities.length; i++) {
                    let t_updateEntity = uncommittedEntities[i];
                    if (t_updateEntity.id == Entity.id && t_updateEntity.constructor.name == Entity.constructor.name) {
                        uncommittedEntities.splice(i, 1);
                        break;
                    }
                }
            }
            uncommittedEntities.push(Entity);
            updateModifiedEntities.push(Entity);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
var UpdateSynch = function (Entity) {
    try {
        return AddUncommittedSynch(Entity);
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var AddSynch = function (Entity) {
    try {
        return AddUncommittedSynch(Entity);
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var clearEntities = async function () {
    try {
        uncommittedEntities = [];
        updateModifiedEntities = [];
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var commit = async function (RequestID) {
    try {
        let that = this;
        return new Promise(function (resolve, reject) {
            try{
                let result = common.error;
                if (that.db.DBconnected) {
                    //Create a transaction
                    var DBtransaction = that.db.getTransaction();
                    DBtransaction.begin(async function (err) {
                        //get th
                        let requestEntities = uncommittedEntities.filter(function(entity){return entity._RequestID == RequestID});
                        uncommittedEntities = uncommittedEntities.filter(function(entity){return entity._RequestID != RequestID});
                        let count = requestEntities.length;
                        while (count > 0) {
                            count = count - 1;
                            let Entity = requestEntities.shift();
                            result = await that.Add(Entity);
                            if (result != common.success) {
                                count = 0;
                            }
                        }
                        if (result == common.success) {
                            await DBtransaction.commit(async function (err) {
                                if (err) {
                                    logger.logError("Transaction commited error:" + err);
                                    result = common.error;
                                }
                                resolve(result);
                            });
                        }
                        else {
                            await DBtransaction.rollback(async function (err) {
                                if (err) {
                                    logger.logError("Transaction rollback:" + err);
                                    result = common.error;
                                }
                                resolve(result);
                            });
                        }
                    });
                }
                else {
                    //Error because db is disconnected
                    resolve(result);
                }
            }
            catch (error) {
                logger.logError(error);
                resolve(common.error);
            }
        });
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Run update script 
var runSQLScript = async function (db) {
    try {
        //Run the initialize script
        let t_sqlResult;
        let sql = fs.readFileSync("sql_database.sql").toString();
        let scriptArray = sql.replace("\r\n", "").split("##GO##");
        scriptArray = scriptArray.slice(0, scriptArray.length - 1);
        for (let i = 0; i < scriptArray.length; i++) {
            t_sqlResult = await db.run(scriptArray[i]);
            if (t_sqlResult.result != common.success) {
                return t_sqlResult.result;
            }
        }
        return t_sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Initialize SQL Connection
var initialize = async function () {
    try {
        // open the database
        this.db = sqlDB;
        let t_sqlResult = await this.db.open(common.settings.sqldbConnection);
        if (t_sqlResult.result == common.success) {
            t_sqlResult = await runSQLScript(this.db);
        }
        return t_sqlResult.result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var stop = async function () {
    try {
        if (this.db) {
            this.db.close();
        }
    }
    catch (error) {
        logger.logError(error);
    }
};

var getModifiedEntities = function () {
    try {
        //Get the updated with out the new updates
        let Entities = updateModifiedEntities;
        updateModifiedEntities = [];
        return Entities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var entitiesRepo = function () {
    try {
        //Functions
        this.getAll = getAll;
        this.remove = remove;
        this.clear = clear;
        this.Update = Update;
        this.Add = Add;
        this.UpdateSynch = UpdateSynch;
        this.AddSynch = AddSynch;
        this.clearEntities = clearEntities;
        this.commit = commit;
        this.initialize = initialize;
        this.stop = stop;
        this.getModifiedEntities = getModifiedEntities;
    }
    catch (error) {
        logger.logError(error);
    }
};


module.exports.uncommittedEntities = uncommittedEntities;
module.exports = entitiesRepo;
