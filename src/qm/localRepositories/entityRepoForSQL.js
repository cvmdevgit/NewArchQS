//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");
var common = require("../../common/common");
var idGenerator = require("./idGenerator");
var sqlDB = require("./aa-sql");
var fs = require("fs");
const table_Prefex = "t_";
//collections for update
var updateEntities = [];
var addEntities = [];


var PrepareUpdate = function (entity, attributes) {
    try {
        //Prepare the values array
        let UpdateAttributes = "";
        for (let i = 0; i < attributes.length; i++) {
            UpdateAttributes = UpdateAttributes + attributes[i].toString() + "= \'" + entity[attributes[i].toString()] + "\'";
            if (i != (attributes.length - 1)) {
                UpdateAttributes = UpdateAttributes + ",";
            }
        }
        return UpdateAttributes;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};

//Prepare Values for insert or update
var GetValuesFromObject = function (entity, attributes) {
    try {
        //Prepare the values array
        let values = "";
        for (let i = 0; i < attributes.length; i++) {
            let Startsep = "";
            let Endsep = "";
            /*if (typeof entity[attributes[i].toString()] == 'string')
            {
                Startsep="\'";
                Endsep="\'";
            } */
            Startsep = "\'";
            Endsep = "\'";
            values = values + Startsep + entity[attributes[i].toString()] + Endsep;
            if (i != (attributes.length - 1)) {
                values = values + ",";
            }
        }
        return values;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};


//Create columns for sql lite query
var GetFilterColumnsFromObject = function (filterKeys, filterValues) {
    try {
        let filter = " ";
        for (let i = 0; i < filterKeys.length; i++) {
            if (Array.isArray(filterValues[i])) {
                let values = filterValues[i].join(",");
                filter = filter + filterKeys[i] + " in (" + values + ") ";
            }
            else {
                filter = filter + filterKeys[i] + " = " + filterValues[i];
            }
            if (i != (filterKeys.length - 1)) {
                filter = filter + " and ";
            }
        }
        return filter;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};



var getAll = async function (entity) {
    let that = this.db;
    try {
        let tableName = table_Prefex + entity.constructor.name;
        let sql = "SELECT * FROM " + tableName;
        let entities = await that.all(sql);
        return entities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};



var getFilterBy = async function (entity, filterKeys, filterValues) {
    let that = this.db;
    try {
        if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
            let filter = GetFilterColumnsFromObject(filterKeys, filterValues);
            let tableName = table_Prefex + entity.constructor.name;
            let sql = "SELECT * FROM " + tableName + " where " + filter;
            let entities = await that.all(sql);
            return entities;
        }
        else {
            return await this.getAll();
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var remove = async function (entity) {
    try {
        let that = this.db;
        if (entity) {
            //Do the Query

            let tableName = table_Prefex + entity.constructor.name;
            let sql = " delete from " + tableName + " where id = \'" + entity.id + "\'";
            let isSuccess = await that.run(sql);
            if (isSuccess) {
                return common.success;
            }

        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var clear = async function (entity) {
    try {
        let that = this.db;
        if (entity) {
            //Do the Query

            let tableName = table_Prefex + entity.constructor.name;
            let sql = " delete from " + tableName;
            let isSuccess = await that.run(sql);
            if (isSuccess) {
                return common.success;
            }
            else {
                return common.error;
            }
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var Update = async function (entity) {
    try {
        let that = this.db;
        if (entity) {
            let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
            let tableName = table_Prefex + entity.constructor.name;

            //Prepare the values array
            let UpdateAttributes = PrepareUpdate(entity, attributes);

            //Do the Query
            let sql = "update  " + tableName + "  set " + UpdateAttributes + " where id = \'" + entity.id + "\'";
            let isSuccess = await that.run(sql);
            if (isSuccess) {
                //await idGenerator.UpdateSeqOnDB(that);
                return common.success;
            }
            else {
                return common.error;
            }
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var Add = async function (entity) {
    try {
        let that = this.db;
        if (entity) {
            let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
            let attributesStr = attributes.join(",");
            let tableName = table_Prefex + entity.constructor.name;
            //Prepare the values array
            let values = GetValuesFromObject(entity, attributes);

            //Do the Query
            let sql = " insert into " + tableName + " (" + attributesStr + ") values (" + values + ")";
            let isSuccess = await that.run(sql);
            if (isSuccess) {
                await idGenerator.UpdateSeqOnDB(that);
                return common.success;
            }
            else {
                return common.error;
            }
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



var UpdateSynch = function (Entity) {
    try {
        updateEntities.push(Entity);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var AddSynch = function (Entity) {
    try {
        addEntities.push(Entity);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var clearEntities = async function () {
    try {
        addEntities = [];
        updateEntities = [];
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var commit = async function () {
    try {
        let count = addEntities.length;
        while (count > 0) {
            let Entity = addEntities.shift();
            await this.Add(Entity);
            count = count - 1;
        }
        count = updateEntities.length;
        while (count > 0) {
            let Entity = updateEntities.shift();
            await this.Update(Entity);
            count = count - 1;
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var initialize = async function () {
    try {
        // open the database
        this.db = sqlDB;
        let result = await this.db.open(common.settings.sqldbConnection);

        //Run the initialize script
        let sql = fs.readFileSync("sql_database.sql").toString();
        let scriptArray = sql.replace("\r\n", "").split(";");
        scriptArray = scriptArray.slice(0, scriptArray.length - 1);
        for (let i = 0; i < scriptArray.length; i++) {
            let result2 = await this.db.run(scriptArray[i]);
            if (result2 == false) {
                return common.error;
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
    }
};

var stop = async function () {
    try {
        if (this.db) {
            this.db.stop();
        }
    }
    catch (error) {
        logger.logError(error);
    }
};

var getModifiedEntities = function () {
    try {
        //Get the updated with out the new updates
        let Updated = updateEntities;
        let Updated_IDs = updateEntities.map(entity => entity.id);
        let NewAdded = addEntities;
        let newWithoutUpdate = NewAdded.filter(function (entity) { return Updated_IDs.indexOf(entity.id) < 0 })
        let Entities = Updated.concat(newWithoutUpdate);
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
        this.getFilterBy = getFilterBy;
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


module.exports.updateEntities = updateEntities;
module.exports.addEntities = addEntities;
module.exports = entitiesRepo;
