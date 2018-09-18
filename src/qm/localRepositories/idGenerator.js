"use strict";
var common = require("../../common/common");
var logger = require("../../common/logger");
var CurrentSeqNumber = 0;




//get new ID from memory
var getNewID = function () {
    CurrentSeqNumber = CurrentSeqNumber + 1;
    return CurrentSeqNumber;
};

//Update the current number
var UpdateSeqOnDB = async function (db) {
    let that = db;
    try{
        var sql = "update seq SET seqNumber = \'" + CurrentSeqNumber + "\'";
        var isSuccessfull = await that.run(sql);
        if (isSuccessfull) {
            return isSuccessfull;
        }
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};


//get the current Sequence number
var getCurrentSeqNumberFromDB = async function (db) {
    let that = db;
    try {
        let sql = "SELECT * FROM seq";
        var sqlRecord = await that.all(sql);
        if (sqlRecord != undefined && sqlRecord[0].seqNumber > 0) {
            return parseInt(sqlRecord[0].seqNumber);
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//get the current Sequence number
var initialize = async function (db) {
    CurrentSeqNumber = await getCurrentSeqNumberFromDB(db);
    if (CurrentSeqNumber > 0) {
        return common.success;
    }
};



module.exports.initialize = initialize;
module.exports.getNewID = getNewID;
module.exports.CurrentSeqNumber = CurrentSeqNumber;
module.exports.UpdateSeqOnDB = UpdateSeqOnDB;