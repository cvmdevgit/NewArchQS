"use strict";
var mssql = require("mssql");
var fs = require("fs");
var logger = require("../../common/logger");
var connection = null;
var db;

exports.db = db;

exports.open = async function (config) {
    let tries = 3;
    while (tries > 0) {
        try {
            if (connection == null) {
                connection = await mssql.connect(config);
            }
            return;
        }
        catch (error) {
            mssql.close();
            connection = undefined;
            logger.logError(error);
        }
        finally {
            tries -= 1;
        }
    }
};

//Any query: insert/delete/update
exports.run = function (command) {
    return new Promise(function (resolve, reject) {
        let request = new mssql.Request();
        request.query(command,
            function (err) {
                if(err) {
                    logger.logError("run error: "+ err.message);
                    reject(err.message);
                }
                else    
                {
                    resolve(true);
                }
            });
    });
};

//First row read
exports.get = function (command, params) {
    return new Promise(function (resolve, reject) {
        let request = new mssql.Request();
        request.query(command,
            function (err, Results) {
                if (!err && Results) {
                    resolve(Results.recordset);
                }
                else {
                    reject(err.message);
                }
            });
    });
};

//Set of rows read
exports.all = function (command, params) {
    return new Promise(function (resolve, reject) {
        let request = new mssql.Request();
        request.query(command,
            function (err, Results) {
                if (!err && Results) {
                    resolve(Results.recordset);
                }
                else {
                    reject(err.message);
                }
            });
    });
};

exports.close = function () {
    return new Promise(function (resolve) {
        if (connection != null) {
            connection.close();
            resolve(true);
        }
    });
};


