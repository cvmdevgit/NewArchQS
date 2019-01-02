var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var dataService = require("../data/dataService");
var configurationService = require("../configurations/configurationService");
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json")
async function initialize() {
    common.settings.mock = true;
    await configurationService.initialize();
    let OrgData = JSON.parse(str);
    while (dataService.organizationsData.length > 0) {
        dataService.organizationsData.pop();
    }
    OrgData.forEach(function (Branch) {
        dataService.organizationsData.push(Branch);
    });
}

function setServingCounterTransaction(orgID, branchID, counterID) {
    try {
        let output = [];
        let BranchData;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData  = output[0];
        BranchData.transactionsData.filter(function (transaction_Data) {
            transaction_Data._servingCounters = [parseInt(counterID)];
            return true;
        }
        );
    }
    catch (error) {
        logger.logError(error);
    }
}

function setCurrentTransaction(orgID, branchID, counterID) {
    try {
        let output = [];
        let BranchData;
        let CounterData;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData  = output[0];
        CounterData = output[1];
        CounterData.currentTransaction = BranchData.transactionsData.find(function (transaction_Data) {
            return transaction_Data.state != enums.StateType.closed;
        }
        );
    }
    catch (error) {
        logger.logError(error);
    }
}
function clearCurrentTransaction(orgID, branchID, counterID) {
    try {
        let output = [];
        let BranchData;
        let CounterData;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData  = output[0];
        CounterData = output[1];
        CounterData.currentTransaction = undefined;
    }
    catch (error) {
        logger.logError(error);
    }
}
function getValidTransaction(orgID, branchID, counterID)
{
    try {
        let output = [];
        let BranchData;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        let trans = BranchData.transactionsData.find(function(trans){return trans.state == enums.StateType.Pending });
        return trans;
    }
    catch (error) {
        logger.logError(error);
    }
}
module.exports.setServingCounterTransaction = setServingCounterTransaction;
module.exports.getValidTransaction = getValidTransaction;
module.exports.clearCurrentTransaction = clearCurrentTransaction;
module.exports.setCurrentTransaction = setCurrentTransaction;
module.exports.initialize = initialize;
module.exports.dataService = dataService;
module.exports.configurationService = configurationService;