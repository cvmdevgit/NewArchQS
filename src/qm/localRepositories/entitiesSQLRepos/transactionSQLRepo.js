var logger = require("../../../common/logger");
var common = require("../../../common/common");
var generalSQLRepoMethods = require("./generalSQLRepoMethods");
const update_Procedure = "dbo.P_QS_UpdateTransaction";
var procedureParameter = require("../procedureParameter");
var tableName = "T_CustomerQTransactionsLive";
var RepoEntity = new (require("../../data/transaction"));
var sql = require("mssql");


function fillParameters(params, entity) {
    try {

        //Inputs
        params.push(new procedureParameter('id', entity.id > 0 ? Number(entity.id) : -1, sql.BigInt, false));
        params.push(new procedureParameter('orgID', Number(entity.orgID), sql.BigInt, false));
        params.push(new procedureParameter('queueBranch_ID', Number(entity.queueBranch_ID), sql.BigInt, false));
        params.push(new procedureParameter('user_ID', entity.user_ID > 0 ? Number(entity.user_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('counter_ID', entity.counter_ID > 0 ? Number(entity.counter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('service_ID', entity.service_ID > 0 ? Number(entity.service_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('segment_ID', entity.segment_ID > 0 ? Number(entity.segment_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('hall_ID', entity.hall_ID > 0 ? Number(entity.hall_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('holdingReason_ID', entity.holdingReason_ID > 0 ? Number(entity.holdingReason_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('appointment_ID', entity.appointment_ID > 0 ? Number(entity.appointment_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('dispensedByUser_ID', entity.dispensedByUser_ID > 0 ? Number(entity.dispensedByUser_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('transferByCounter_ID', entity.transferByCounter_ID > 0 ? Number(entity.transferByCounter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('transferredFromService_ID', entity.transferredFromService_ID > 0 ? Number(entity.transferredFromService_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('heldByCounter_ID', entity.heldByCounter_ID > 0 ? Number(entity.heldByCounter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('dispensedByCounter_ID', entity.dispensedByCounter_ID > 0 ? Number(entity.dispensedByCounter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('assignedByCounter_ID', entity.assignedByCounter_ID > 0 ? Number(entity.assignedByCounter_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('transferByUser_ID', entity.transferByUser_ID > 0 ? Number(entity.transferByUser_ID) : undefined > 0 ? Number(entity.transferByUser_ID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('queueBranchVisitID', entity.queueBranchVisitID > 0 ? Number(entity.queueBranchVisitID) : undefined, sql.BigInt, false));
        params.push(new procedureParameter('customerID', entity.customerID > 0 ? Number(entity.customerID) : undefined, sql.BigInt, false));

        params.push(new procedureParameter('origin', parseInt(entity.origin), sql.Int, false));
        params.push(new procedureParameter('state', parseInt(entity.state), sql.Int, false));
        params.push(new procedureParameter('servingType', parseInt(entity.servingType), sql.Int, false));
        params.push(new procedureParameter('servingStep', parseInt(entity.servingStep), sql.Int, false));
        params.push(new procedureParameter('lastOfVisit', parseInt(entity.lastOfVisit), sql.Bit, false));
        params.push(new procedureParameter('reminderState', parseInt(entity.reminderState), sql.Int, false));
        params.push(new procedureParameter('ticketSequence', parseInt(entity.ticketSequence), sql.Int, false));
        params.push(new procedureParameter('priority', parseInt(entity.priority), sql.Int, false));
        params.push(new procedureParameter('orderOfServing', parseInt(entity.orderOfServing), sql.Int, false));
        params.push(new procedureParameter('recallNo', parseInt(entity.recallNo), sql.Int, false));
        params.push(new procedureParameter('holdingCount', parseInt(entity.holdingCount), sql.Int, false));
        params.push(new procedureParameter('customerLanguageIndex', parseInt(entity.customerLanguageIndex), sql.Int, false));
        params.push(new procedureParameter('waitingSeconds', parseInt(entity.waitingSeconds), sql.Int, false));
        params.push(new procedureParameter('servingSeconds', parseInt(entity.servingSeconds), sql.Int, false));
        params.push(new procedureParameter('holdingSeconds', parseInt(entity.holdingSeconds), sql.Int, false));
        params.push(new procedureParameter('smsTicket', parseInt(entity.smsTicket), sql.Bit, false));


        let minimumDate = new Date(0);
        params.push(new procedureParameter('arrivalTime', entity.arrivalTime > minimumDate ? new Date(entity.arrivalTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('appointmentTime', entity.appointmentTime > minimumDate ? new Date(entity.appointmentTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('lastCallTime', entity.lastCallTime > minimumDate ? new Date(entity.lastCallTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('servingEndTime', entity.servingEndTime > minimumDate ? new Date(entity.servingEndTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('waitingStartTime', entity.waitingStartTime > minimumDate ? new Date(entity.waitingStartTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('priorityTime', entity.priorityTime > minimumDate ? new Date(entity.priorityTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('servingStartTime', entity.servingStartTime > minimumDate ? new Date(entity.servingStartTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('creationTime', entity.creationTime > minimumDate ? new Date(entity.creationTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('closedTime', entity.closedTime > minimumDate ? new Date(entity.closedTime) : undefined, sql.DateTime, false));
        params.push(new procedureParameter('ticketSymbol', entity.ticketSymbol, sql.NVarChar(3), false));
        params.push(new procedureParameter('servingNote', entity.servingNote, sql.NVarChar(255), false));
        params.push(new procedureParameter('servingSession', entity.servingSession, sql.NVarChar(100), false));
        params.push(new procedureParameter('integrationID', entity.integrationID, sql.NVarChar(50), false));
        params.push(new procedureParameter('displayTicketNumber', entity.displayTicketNumber, sql.NVarChar(10), false));


        //Outputs
        params.push(new procedureParameter('Errors', '', sql.VarChar(sql.MAX), true));
        params.push(new procedureParameter('NewID', entity.id, sql.BigInt, true));

    }
    catch (error) {
        logger.logError(error);
    }
}

var AddorUpdate = async function (db, entity) {
    try {
        //Fill parameters for Procedure call
        let params = [];
        fillParameters(params, entity);

        let sqlResult = await db.callprocedure(update_Procedure, params);
        if (sqlResult.result == common.success) {
            entity.id = Number(sqlResult.recordsets.output.NewID);
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
        return await generalSQLRepoMethods.getAll(db, tableName, RepoEntity);
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var remove = async function (db, ID) {
    try {
        if (ID) {
            let params = [];
            params.push(new procedureParameter('ID', ID, sql.BigInt, false));
            let sqlCommand = " delete from " + tableName + " where id = @ID";
            let sqlResult = await db.run(sqlCommand, params);
            return sqlResult;

        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var clear = async function (db) {
    try {
        let sql = " delete from " + tableName;
        let isSuccess = await db.run(sql);
        if (isSuccess) {
            return common.success;
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

module.exports.remove = remove;
module.exports.clear = clear;
module.exports.getAll = getAll;
module.exports.AddorUpdate = AddorUpdate;