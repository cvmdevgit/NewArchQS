var logger = require("../../../common/logger");
var common = require("../../../common/common");
var generalSQLRepoMethods = require("./generalSQLRepoMethods");
const update_Procedure = "dbo.P_QS_UpdateStatisticsData";
var procedureParameter = require("../procedureParameter");
var RepoEntity = new (require("../../data/statisticsData"));
var tableName = "T_StatisticsData";
var sql = require("mssql");

function getEntityAttributes(entity) {
    let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
    let attributesStr = attributes.join(",");
    return attributesStr;
}

var AddorUpdate = async function (db,entity) {
    try {
        let params = [];
                //Inputs
                let minimumDate = new Date(0);
        //Inputs
        params.push(new procedureParameter('id', entity.id, sql.VarChar(255), false));
        params.push(new procedureParameter('queueBranch_ID', Number(entity.queueBranch_ID), sql.BigInt, false));
        params.push(new procedureParameter('segment_ID', Number(entity.segment_ID), sql.BigInt, false));
        params.push(new procedureParameter('hall_ID', Number(entity.hall_ID), sql.BigInt, false));
        params.push(new procedureParameter('counter_ID', Number(entity.counter_ID), sql.BigInt, false));
        params.push(new procedureParameter('user_ID', Number(entity.user_ID), sql.BigInt, false));
        params.push(new procedureParameter('service_ID', Number(entity.service_ID), sql.BigInt, false));
        params.push(new procedureParameter('WaitingCustomers', Number(entity.WaitingCustomers), sql.BigInt, false));
        params.push(new procedureParameter('ASTWeight', Number(entity.ASTWeight), sql.BigInt, false));
        params.push(new procedureParameter('TotalServiceTime', Number(entity.TotalServiceTime), sql.BigInt, false));
        params.push(new procedureParameter('TotalWaitingTime', Number(entity.TotalWaitingTime), sql.BigInt, false));
        params.push(new procedureParameter('ServedCustomersNo', Number(entity.ServedCustomersNo), sql.BigInt, false));
        params.push(new procedureParameter('WaitedCustomersNo', Number(entity.WaitedCustomersNo), sql.BigInt, false));
        params.push(new procedureParameter('NoShowCustomersNo', Number(entity.NoShowCustomersNo), sql.BigInt, false));
        params.push(new procedureParameter('NonServedCustomersNo', Number(entity.NonServedCustomersNo), sql.BigInt, false));
        params.push(new procedureParameter('AvgServiceTime', parseFloat(entity.AvgServiceTime), sql.Decimal, false));
        params.push(new procedureParameter('AvgWaitingTime', parseFloat(entity.AvgWaitingTime), sql.Decimal, false));
        params.push(new procedureParameter('StatisticsDate', entity.StatisticsDate > minimumDate ? new Date(entity.StatisticsDate) : undefined, sql.DateTime, false));
        //Outputs
        params.push(new procedureParameter('Errors', '', sql.NVarChar(sql.MAX), true));


        let sqlResult = await db.callprocedure(update_Procedure,params);
        if (sqlResult.result == common.success) {
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
        let sql = " delete from " + tableName + " where id = \'" + ID + "\'";
        let sqlResult = await db.run(sql);
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
        let sqlResult = await db.run(sql);
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