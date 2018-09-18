const sqlite3 = require('sqlite3').verbose();
var logger = require("../../common/logger");
var db;
"use strict";
exports.db = db;

exports.open=function(path) {
    return new Promise(function(resolve, reject) {
    this.db = new sqlite3.Database(path, 
        function(err) {
            if(err)
            {
                logger.logError("Open error: "+ err.message);
                reject("Open error: "+ err.message);
            }
            else   
            {
                resolve(path + " opened");
            } 
        }
    )   ;
    });
};

//Any query: insert/delete/update
exports.run=function(query) {

    return new Promise(function(resolve, reject) {
        this.db.run(query, 
            function(err)  {
                if(err) {
                    logger.logError("run error: "+ err.message);
                    reject(err.message);
                }
                else    
                {
                    resolve(true);
                }
        });
    })    ;
};

//First row read
exports.get=function(query, params) {
    return new Promise(function(resolve, reject) {
        this.db.get(query, params, function(err, row)  {
            if(err)
            {
                logger.logError("get error: "+ err.message);
                reject("Read error: " + err.message);
            } 
            else {
                resolve(row);
            }
        });
    }) ;
};

//Set of rows read
exports.all=function(query, params) {
    return new Promise(function(resolve, reject) {
        if(params == undefined) params=[];

        this.db.all(query, params, function(err, rows)  {
            if(err) 
            {
                logger.logError("all error: "+ err.message);
                reject("Read error: " + err.message);
            }
            else {
                resolve(rows);
            }
        });
    }) ;
};

exports.close=function() {
    return new Promise(function(resolve) {
        this.db.close();
        resolve(true);
    }) ;
};



