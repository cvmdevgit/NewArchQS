var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");
var constants = require("../../common/constants");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var dataService = require("../data/dataService");
var configurationService = require("../configurations/configurationService");
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json")
async function initialize() {
    await configurationService.initialize();
    let OrgData = JSON.parse(str);
    while (dataService.organizationsData.length > 0) {
        dataService.organizationsData.pop();
    }
    OrgData.forEach(function (Branchs) {
        if (Branchs.branchesData)
        {
            Branchs.branchesData.forEach(function (Branch){
                if (Branch.transactionsData)
                {
                    let Transactions = [];
                    Branch.transactionsData.forEach(function (Transaction){
                        Transactions.push(new transaction(Transaction));
                    });
                    Branch.transactionsData = Transactions;
                }
                if (Branch.userActivitiesData)
                {
                    let Activities = [];
                    Branch.userActivitiesData.forEach(function (tuserActivity){
                        let tmp = new userActivity()
                        tmp.id =  tuserActivity.id;
                        tmp.orgID = tuserActivity.orgID;
                        tmp.queueBranch_ID = tuserActivity.queueBranch_ID;
                        tmp.activityType =  tuserActivity.activityType;
                        tmp.user_ID = tuserActivity.user_ID;
                        tmp.counter_ID = tuserActivity.counter_ID;
                        tmp.startTime = tuserActivity.startTime;
                        tmp.endTime = tuserActivity.endTime;
                        tmp.lastChangedTime = tuserActivity.lastChangedTime ;
                        tmp.duration = tuserActivity.duration;
                        tmp.calendarDuration =  tuserActivity.calendarDuration;
                        tmp.closed = tuserActivity.closed;
                        Activities.push(tmp);
                    });
                    Branch.userActivitiesData = Activities;
                }               
            });
        }
        dataService.organizationsData.push(Branchs);
    });
}

function getHeldTransactions(orgID, branchID, counterID) {
    try {
        let output = [];
        let BranchData;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        let trans = BranchData.transactionsData.find(function (transaction_Data) {
            if (transaction_Data.state == enums.StateType.Pending) {
                transaction_Data.state = enums.StateType.OnHold
                transaction_Data.heldByCounter_ID = counterID;
                return true;
            }
        }
        );
        return trans;
    }
    catch (error) {
        logger.logError(error);
    }
}

function setCounterToNoCallType(counterID) {
    try {
        let Counter = configurationService.getCounterConfig(counterID);
        Counter.Type_LV = enums.counterTypes.NoCallServing;
    }
    catch (error) {
        logger.logError(error);
    }

}
function setCounterToBreak(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Break;
        CounterData.currentState.type = enums.UserActiontypes.Break;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToReady(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Ready;
        CounterData.currentState.type = enums.UserActiontypes.Ready;
    }
    catch (error) {
        logger.logError(error);
    }

}
function setCounterToServing(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Serving;
        CounterData.currentState.type = enums.UserActiontypes.Serving;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToNotReadyToServe(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.NotReady;
        CounterData.currentState.type = enums.UserActiontypes.NotReady;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToTicketingType(counterID) {
    try {
        let Counter = configurationService.getCounterConfig(counterID);
        Counter.Type_LV = enums.counterTypes.TicketDispenser;
    }
    catch (error) {
        logger.logError(error);
    }
}
function setCounterToOfficeWork(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        CurrentActivity.activityType = enums.UserActiontypes.Custom;
        CounterData.currentState.type = enums.UserActiontypes.Custom;
    }
    catch (error) {
        logger.logError(error);
    }
}

module.exports.setCounterToOfficeWork = setCounterToOfficeWork;
module.exports.setCounterToTicketingType = setCounterToTicketingType;
module.exports.setCounterToNoCallType = setCounterToNoCallType;
module.exports.setCounterToBreak = setCounterToBreak;
module.exports.setCounterToReady = setCounterToReady;
module.exports.setCounterToServing = setCounterToServing;
module.exports.setCounterToNotReadyToServe = setCounterToNotReadyToServe;
module.exports.getHeldTransactions = getHeldTransactions;
module.exports.initialize = initialize;
module.exports.dataService = dataService;
module.exports.configurationService = configurationService;