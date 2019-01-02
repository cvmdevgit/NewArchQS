"use strict";
var mssql = require("mssql");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var events = require("../../common/events");
var sqlResult = require("./sqlResult");

var serviceDetailedStatus = require("../serviceDetailedStatus");
var DBconnected = false;

var ServiceDetailedStatus = new serviceDetailedStatus();
ServiceDetailedStatus.source = "DB";

//var db;
var DBpool;
const SQL_ERRORS = {
    ELOGIN: "ELOGIN", //Login failed.
    ETIMEOUT: "ETIMEOUT", // Connection timeout.
    EALREADYCONNECTED: "EALREADYCONNECTED", //Database is already connected!
    EALREADYCONNECTING: "EALREADYCONNECTING", //Already connecting to database!
    EINSTLOOKUP: "EINSTLOOKUP", //Instance lookup failed.
    ESOCKET: "ESOCKET" //Socket error.
};



//exports.db = db;
function AddParametersToRequest(request, params) {
    try {
        if (params && params.length > 0) {
            params.forEach(function (parameter) {
                request.input(parameter.Name, parameter.DataType, parameter.Value);
            });
        }
    }
    catch (error) {
        logger.logError(error);
    }
}
function AddParametersToProcedure(request, procedureParameters) {
    try {
        if (procedureParameters && procedureParameters.length > 0) {
            procedureParameters.forEach(function (t_procedureParameter) {
                if (t_procedureParameter.DataType) {
                    if (t_procedureParameter.IsOutput == false) {
                        request.input(t_procedureParameter.Name, t_procedureParameter.DataType, t_procedureParameter.Value);
                    }
                    else {
                        request.output(t_procedureParameter.Name, t_procedureParameter.DataType, t_procedureParameter.Value);
                    }
                }
                else {
                    if (t_procedureParameter.IsOutput == false) {
                        request.input(t_procedureParameter.Name, t_procedureParameter.Value);
                    }
                    else {
                        request.output(t_procedureParameter.Name, t_procedureParameter.Value);
                    }
                }

            });
        }
    }
    catch (error) {
        logger.logError(error);
    }
}
var handleWorkingStatus = async function (me) {
    try {
        me.DBconnected = true;
        me.ServiceDetailedStatus.status = enums.ServiceStatuses.Working;
        me.ServiceDetailedStatus.errorCode = enums.ServiceErrorCodes.NoErrors;
        events.serviceStatusChange.emit('serviceStatusChange', me.ServiceDetailedStatus);
    }
    catch (error) {
        logger.logError(error);
    }
}

var handleErrorStatus = async function (me) {
    try {
        //Retry To connect DB
        me.DBconnected = false;

        //Broadcast problem
        me.ServiceDetailedStatus.status = enums.ServiceStatuses.Error;
        me.ServiceDetailedStatus.errorCode = enums.ServiceErrorCodes.DBConnection;
        events.serviceStatusChange.emit('serviceStatusChange', me.ServiceDetailedStatus);
    }
    catch (error) {
        logger.logError(error);
    }
}

//Try to reconnect SQL
var reconnect = async function (me) {
    try {
        let request = DBpool.request();
        request.query("select GETDATE()",
            function (err) {
                if (err) {
                    setTimeout(reconnect, 15000, me);
                }
                else {
                    me.handleWorkingStatus(me);
                }
            });
    }
    catch (error) {
        logger.logError(error);
        setTimeout(reconnect, 15000, me);
    }
}
exports.getTransaction = function () {
    try {
        const transaction = new mssql.Transaction(DBpool);
        return transaction;
    }
    catch (error) {
        logger.logError(error);
    }
}

exports.open = async function (config) {
    let t_sqlResult = new sqlResult();
    t_sqlResult.result = common.success;
    let tries = 3;
    while (tries > 0) {
        try {
            if (DBpool == null) {
                DBpool = await (new mssql.ConnectionPool(config)).connect();
                //connection = await mssql.connect(config);
                var me = this;
                //Handle Errors
                DBpool.on('error', function (err) {
                    //Handle the connection error (DB service is down)
                    if (err && err.code == SQL_ERRORS.ESOCKET) {
                        logger.logError("DB connection closed : " + err);

                        if (me.DBconnected) {
                            me.handleErrorStatus(me);
                            setTimeout(reconnect, 15000, me);
                        }
                    }
                    //When a query take too long
                    if (err && err.code == SQL_ERRORS.ETIMEOUT) {
                        logger.logError("DB Timeout : " + err);
                    }
                    //Other errors
                    if (err) {
                        logger.logError("DB ERROR : " + err);
                    }
                });
            }
            this.handleWorkingStatus(this);
            return t_sqlResult;
        }
        catch (error) {
            t_sqlResult.result = common.error;
            mssql.close();
            connection = undefined;
            logger.logError(error);
        }
        finally {
            tries -= 1;
        }
    }
    return t_sqlResult;
};

//Any query: insert/delete/update
exports.run = function (command, params) {
    return new Promise(function (resolve, reject) {
        try {
            let t_sqlResult = new sqlResult();
            let request = DBpool.request();
            AddParametersToRequest(request, params);
            request.query(command,
                function (err) {
                    if (err) {
                        t_sqlResult.result = common.error;
                        t_sqlResult.errorMessage = "run error: " + err.message;
                        logger.logError(t_sqlResult.errorMessage);
                        resolve(t_sqlResult);
                    }
                    else {
                        t_sqlResult.result = common.success;
                        resolve(t_sqlResult);
                    }
                });
        }
        catch (error) {
            logger.logError(error);
            let t_sqlResult = new sqlResult();
            resolve(t_sqlResult);
        }

    });
};

//call Proceedure
exports.callprocedure = function (procedureName, procedureParameters) {
    return new Promise(function (resolve, reject) {
        try {
            let request = DBpool.request();
            AddParametersToProcedure(request, procedureParameters);
            request.execute(procedureName,
                function (err, p_recordsets, p_returnValue, p_affected) {
                    let t_sqlResult = new sqlResult();
                    if (err) {
                        logger.logError("run error: " + err.message);
                        t_sqlResult.result = common.error;
                        t_sqlResult.errorMessage = "run error: " + err.message;
                        resolve(t_sqlResult);
                    }
                    else {
                        t_sqlResult.result = common.success;
                        t_sqlResult.affected = p_affected;
                        t_sqlResult.recordsets = p_recordsets;
                        t_sqlResult.errorMessage = "";
                        resolve(t_sqlResult);
                    }
                });
        }
        catch (error) {
            logger.logError(error);
            let t_sqlResult = new sqlResult();
            resolve(t_sqlResult);
        }

    });
};

//First row read
exports.get = function (command, params) {
    return new Promise(function (resolve, reject) {
        try {
            let request = DBpool.request();
            AddParametersToRequest(request, params);
            request.query(command,
                function (err, Results) {
                    let t_sqlResult = new sqlResult();
                    if (!err && Results) {
                        t_sqlResult.result = common.success;
                        t_sqlResult.recordsets = Results.recordset;
                        resolve(t_sqlResult);
                    }
                    else {
                        t_sqlResult.result = common.error;
                        t_sqlResult.errorMessage = "run error: " + err.message;
                        resolve(t_sqlResult);
                    }
                });
        }
        catch (error) {
            logger.logError(error);
            let t_sqlResult = new sqlResult();
            resolve(t_sqlResult);
        }
    });
};

//Set of rows read
exports.all = function (command) {
    return new Promise(function (resolve, reject) {
        try {
            let request = DBpool.request();
            request.query(command,
                function (err, Results) {
                    let t_sqlResult = new sqlResult();
                    if (!err && Results) {
                        t_sqlResult.result = common.success;
                        t_sqlResult.recordsets = Results.recordset;
                        resolve(t_sqlResult);
                    }
                    else {
                        t_sqlResult.result = common.error;
                        t_sqlResult.errorMessage = "run error: " + err.message;
                        resolve(t_sqlResult);
                    }
                });
        }
        catch (error) {
            logger.logError(error);
            let t_sqlResult = new sqlResult();
            resolve(t_sqlResult);
        }
    });
};

exports.close = function () {
    return new Promise(function (resolve) {
        try {
            let t_sqlResult = new sqlResult();
            t_sqlResult.result = common.success;
            if (DBpool != null) {
                DBpool.close();
                DBpool = null;
            }
            resolve(t_sqlResult);
        }
        catch (error) {
            logger.logError(error);
            let t_sqlResult = new sqlResult();
            resolve(t_sqlResult);
        }

    });
};


exports.ServiceDetailedStatus = ServiceDetailedStatus;
exports.DBconnected = DBconnected;
exports.handleWorkingStatus = handleWorkingStatus;
exports.handleErrorStatus = handleErrorStatus;