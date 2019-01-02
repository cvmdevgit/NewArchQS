var logger = require("../../../common/logger");
var common = require("../../../common/common");
var generalSQLRepoMethods = require("./generalSQLRepoMethods");
const update_Procedure = "dbo.P_QS_UpdateUserActivity";
var procedureParameter = require("../procedureParameter");
var tableName = "T_UserQActivitiesLive";
var RepoEntity = new (require("../../data/userActivity"));
var sql = require("mssql");

var AddorUpdate = async function (db, p_UserActivity) {
    try {
        let params = [];
        //Inputs
        let minimumDate = new Date(0);

        params.push(new procedureParameter('id', p_UserActivity.id != null ? Number(p_UserActivity.id) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('orgID', p_UserActivity.orgID != null ? Number(p_UserActivity.orgID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('queueBranch_ID', p_UserActivity.queueBranch_ID != null ? Number(p_UserActivity.queueBranch_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('activityType', parseInt(p_UserActivity.activityType), sql.Int, false));
        params.push(new procedureParameter('user_ID', p_UserActivity.user_ID != null ? Number(p_UserActivity.user_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('counter_ID', p_UserActivity.counter_ID != null ? Number(p_UserActivity.counter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('startTime', p_UserActivity.startTime > minimumDate ? new Date(p_UserActivity.startTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('endTime', p_UserActivity.endTime > minimumDate ? new Date(p_UserActivity.endTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('lastChangedTime', p_UserActivity.lastChangedTime > minimumDate ? new Date(p_UserActivity.lastChangedTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('duration', parseInt(p_UserActivity.duration), sql.Int, false));
        params.push(new procedureParameter('calendarDuration', parseInt(p_UserActivity.calendarDuration), sql.Int, false));
        params.push(new procedureParameter('closed', parseInt(p_UserActivity.closed), sql.Int, false));

        //Outputs
        params.push(new procedureParameter('Errors', '', sql.NVarChar(sql.MAX), true));
        params.push(new procedureParameter('NewID', p_UserActivity.id, sql.BigInt, true));


        let sqlResult = await db.callprocedure(update_Procedure, params);
        if (sqlResult.result == common.success) {
            p_UserActivity.id = Number(sqlResult.recordsets.output.NewID);
            return sqlResult;
        }
        logger.logError(JSON.stringify(sqlResult));
        return sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


var getAll = async function (db) {
    try {
        let attributesStr = generalSQLRepoMethods.getEntityAttributes(RepoEntity);
        let sql = "SELECT " + attributesStr + " FROM " + tableName;
        let sqlResult = await db.all(sql);
        return sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var remove = async function (db,ID) {
    try {
        let params = [];
        params.push(new procedureParameter('ID', ID, sql.BigInt, false));
        let sqlCommand = " delete from " + tableName + " where id = @ID";
        let sqlResult =  await db.run(sqlCommand,params);
        return sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var clear = async function (db) {
    try {
        let sql = " delete from " + tableName;
        let sqlResult =  await db.run(sql);
        return sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.remove = remove;
module.exports.clear = clear;
module.exports.getAll = getAll;
module.exports.AddorUpdate = AddorUpdate;