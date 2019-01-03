"use strict";
var btoa = require('btoa');
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var listCommonFunctions = require("../../common/listCommonFunctions");
var mSharedDataService = require("./sharedDataService");
var serverEndPoints = require("./serverEndPoints");
var request = require('request');

async function initialize() {
    try {
        return await generateAuthTokenByLoginCredentials(common.settings.ServerConnectionParameters.Username, common.settings.ServerConnectionParameters.Password, common.settings.OrgID);
    } catch (error) {
        logger.logError(error);
    }
};


// this function to Generate Authentication Token By Login Credentials
function generateAuthTokenByLoginCredentials(pUsername, pPassword, pOrgID) {
    const FUNCTION_NAME = 'generateAuthTokenByLoginCredentials';
    try {
        return new Promise(function (resolve, reject) {
            const tUrl = serverEndPoints.GenerateAuthTokenByLoginCredentialsEndPoint.replace(mSharedDataService.AddressToReplace,
                common.settings.ServerConnectionParameters.ServerURL);
            var args = {
                json: { 'RequestJsonString': '[\"' + pUsername + '\",\"' + pPassword + '\",\"' + pOrgID + '\"]' },
                url: tUrl,
                headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
            };

            request.post(args, function (error, response, body) {
                try {
                    if (error) {
                        mSharedDataService.ConnectionToServerStatus = enums.ConnectionStatus.Disconnected;
                        mSharedDataService.AuthData = "";
                        logger.logError(error);
                        resolve(common.error);
                        return;
                    }

                    const tRecData = body;
                    // Save Data To Local Storage
                    if (tRecData.Result === common.success) {
                        const Data = {
                            'UserName': pUsername,
                            'Password': pPassword,
                            'Token': tRecData.ResponseString.replace(/^"(.*)"$/, '$1')
                        };
                        mSharedDataService.AuthData = Data;
                        mSharedDataService.ConnectionToServerStatus = enums.ConnectionStatus.Connected;
                        resolve(common.success);
                    }
                    else {
                        resolve(common.error);
                    }
                }
                catch (error) {
                    logger.logError(error);
                    resolve(common.error);
                }
            });
        });
    } catch (error) {
        logger.logError(error);
    }
};

function callGetEntitiesAPI(OrgID, Entity1, Entity2, filters, Data) {
    const FUNCTION_NAME = 'callSecureGetAPI';
    try {

        //If the server not connected
        if (mSharedDataService.ConnectionToServerStatus != enums.ConnectionStatus.Connected) {
            initialize();
        }

        //Return promise
        return new Promise(function (resolve, reject) {
            let tUrl = serverEndPoints.GetEntitiesEndPoint.replace(mSharedDataService.AddressToReplace, common.settings.ServerConnectionParameters.ServerURL);
            tUrl = tUrl + "?Entity1=" + Entity1 + "&Entity2=" + Entity2 + "&OrgID=" + OrgID;
            let RequestString = JSON.stringify(filters);
            tUrl = tUrl + "&filters=" + RequestString;

            let tokenValue = 'TokenAuthenticated' + ' ' + btoa(mSharedDataService.AuthData.Token);
            var args = {
                url: tUrl,
                headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': tokenValue }
            };

            request.get(args, function (error, response, body) {
                try {
                    if (error) {
                        Data = undefined;
                        logger.logError(error);
                        resolve(common.error);
                        return;
                    }
                    const tRecData = JSON.parse(body);
                    // Save Data To Local Storage
                    if (tRecData.Result !== common.error) {
                        let returnedData = JSON.parse(tRecData.ResponseString);
                        Data.push(returnedData);
                        resolve(common.success);
                    }
                    else {
                        Data = undefined;
                        resolve(common.error);
                    }
                }
                catch (error) {
                    logger.logError(error);
                    resolve(common.error);
                }
            });
        });
    } catch (error) {
        logger.logError(error);
    }
}

function callGetBranchesUsersAPI(OrgID, Branch, Data) {
    const FUNCTION_NAME = 'callGetBranchesUsersAPI';
    try {

        //If the server not connected
        if (mSharedDataService.ConnectionToServerStatus != enums.ConnectionStatus.Connected) {
            initialize();
        }

        //Return promise
        return new Promise(function (resolve, reject) {
            let tUrl = serverEndPoints.GetBranchesUsersEndPoint.replace(mSharedDataService.AddressToReplace, common.settings.ServerConnectionParameters.ServerURL);
            tUrl = tUrl + "?OrgID=" + OrgID;
            if (listCommonFunctions.isArrayValid(Branch)) {
                tUrl = tUrl + "&Branch=" + Branch;
            }
            let tokenValue = 'TokenAuthenticated' + ' ' + btoa(mSharedDataService.AuthData.Token);
            var args = {
                url: tUrl,
                headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': tokenValue }
            };
            request.get(args, function (error, response, body) {
                if (error) {
                    Data = undefined;
                    logger.logError(error);
                    resolve(common.error);
                    return;
                }
                const tRecData = JSON.parse(body);
                // Save Data To Local Storage
                if (tRecData.Result === common.success) {
                    let returnedData = JSON.parse(tRecData.ResponseString);
                    Data.push(returnedData);
                    resolve(common.success);
                }
                else {
                    Data = undefined;
                    resolve(common.error);
                }
            });
        });
    } catch (error) {
        logger.logError(error);
    }
}
module.exports.callGetBranchesUsersAPI = callGetBranchesUsersAPI;
module.exports.callGetEntitiesAPI = callGetEntitiesAPI;
module.exports.initialize = initialize;

