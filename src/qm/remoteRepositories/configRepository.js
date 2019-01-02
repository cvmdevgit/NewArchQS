"use strict";
//for now when working on DB, we will use Getall to retrieve everything
//later when the repository returns data from server, the server will implement getbyFilter API.
var logger = require("../../common/logger");
var sqlDB = require("../localRepositories/sqlConnector");
var common = require("../../common/common");

//Add 
var FilterTheReservedColumnNames = function (columns) {
    let Filtered = [];
    if (columns) {
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].toLowerCase() == "identity" || columns[i].toLowerCase() == "key" || columns[i].toLowerCase() == "value") {
                Filtered.push("[" + columns[i] + "]");
            }
            else {
                Filtered.push(columns[i]);
            }
        }
    }
    return Filtered;
};

async function CheckDBConn() {
    let tries = 3;
    while (tries > 0) {
        try {
            let result = await sqlDB.open(common.settings.sqldbConnection);
            return result;
        }
        catch (error) {
            logger.logError(error);
        }
        finally {
            tries -= 1;
        }
    }
}

var getColumnsAsString  = function (columns)
{
    let columnsstr = "*";
    if (columns && columns.length > 0) {
        columns =  FilterTheReservedColumnNames(columns);
        columnsstr = columns.join(",");
    }
    return columnsstr;
};

//Get entities
var GetAll = async function (columns, table_name) {
    try {
        await CheckDBConn();
        let columnsstr = getColumnsAsString(columns);
        let command = "select " + columnsstr + " from " + table_name;
        let Results = await sqlDB.get(command);
        if (Results && Results.length > 0) {
            return Results;
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Get By Filter
var GetByFilter = async function (columns, table_name, FilterName, FilterValue) {

    try {
        await CheckDBConn();
        let columnsstr = getColumnsAsString(columns);
        let command = "select " + columnsstr + " from " + table_name + " where " + FilterName + " = " + FilterValue;
        let Results = await sqlDB.get(command);
        if (Results && Results.length > 0) {
            return Results;
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

module.exports.GetAll = GetAll;
module.exports.GetByFilter = GetByFilter;
