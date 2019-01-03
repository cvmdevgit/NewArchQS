//Contains and maintain configrations
"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var commonMethods = require("../../common/commonMethods");
var listCommonFunctions = require("../../common/listCommonFunctions");

var branchData = require("./branchData");
var organizationData = require("./organizationData");
var visitData = require("./visitData");
var counterData = require("./counterData");
var transaction = require("./transaction");
var userActivity = require("./userActivity");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var workFlowManager = require("../logic/workFlowManager");
var organizationsData = [];
var initialize = false;
var fs = require("fs");

function getCounterData(BracnhData, CounterID) {
    try {
        let CounterData;
        if (BracnhData && BracnhData.countersData) {
            CounterData = BracnhData.countersData.find(function (Data) { return Data.id == CounterID; });
            if (!CounterData) {
                let counterExist = configurationService.getCounterConfig(CounterID);
                if (counterExist) {
                    let tcounterData = new counterData();
                    tcounterData.id = CounterID;
                    BracnhData.countersData.push(tcounterData);
                    CounterData = BracnhData.countersData[BracnhData.countersData.length - 1];
                }
            }
        }
        return CounterData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function getCurrentActivity(BracnhData, CounterData) {
    try {
        let CurrentActivity;
        if (BracnhData && CounterData && CounterData.currentState) {
            CurrentActivity = BracnhData.userActivitiesData.find(function (value) {
                return CounterData.currentState.id == value.id;
            });
        }
        return CurrentActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function getCurrentTransaction(BracnhData, CounterData) {
    try {
        let CurrentTransaction;
        if (BracnhData && CounterData && CounterData.currentTransaction) {
            CurrentTransaction = BracnhData.transactionsData.find(function (value) {
                return CounterData.currentTransaction.id == value.id;
            });
        }
        return CurrentTransaction;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


async function getALLUserActivitiesFromDB(userActivities) {
    try {

        let DB_userActivities = [];
        let result = await repositoriesManager.entitiesRepo.getAll(new userActivity(), DB_userActivities);
        if (result == common.success) {
            //Make sure to convert to entity
            DB_userActivities.forEach(function (DBUserActivity) {
                userActivities.push(new userActivity(DBUserActivity));
            });

        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


function isValidUserActivity(activity, branch) {
    try {
        let Today = commonMethods.Today();
        return activity.queueBranch_ID == branch.id && activity.startTime > Today && activity.closed == 0;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

async function cacheBranchUserActivities(AllUserActivities, branch) {
    try {

        //Get user activities
        branch.userActivitiesData = AllUserActivities.filter(function (activity) {
            return isValidUserActivity(activity, branch);
        });

        if (branch.userActivitiesData) {
            //Set the user activities on the counter data
            for (let i = 0; i < branch.userActivitiesData.length; i++) {
                let UserActivity = branch.userActivitiesData[i];
                //Set current counter
                let CurrentCounterData = getCounterData(branch, UserActivity.counter_ID)
                if (CurrentCounterData) {
                    CurrentCounterData.currentState = UserActivity;
                }
                else {
                    CurrentCounterData = new counterData();
                    CurrentCounterData.id = UserActivity.counter_ID;
                    CurrentCounterData.currentState = UserActivity;
                    branch.countersData.push(CurrentCounterData);
                }

            }
        }
        else {
            branch.userActivitiesData = [];
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


function AddorUpdateVisitData(branchData, transaction) {
    try {
        let VisitData;
        if (branchData.visitData) {
            VisitData = branchData.visitData.find(function (value) {
                return transaction.queueBranchVisitID == value.queueBranchVisitID;
            });
        }
        if (!VisitData) {
            VisitData = new visitData();
            VisitData.queueBranchVisitID = transaction.queueBranchVisitID;
            VisitData.customer_ID = transaction.customer_ID;
            VisitData.transactions_IDs.push(transaction.id);
            branchData.visitData.push(VisitData);

        } else {
            VisitData.transactions_IDs.push(transaction.id);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


function SetCounterDataUsingTransaction(branch, transaction) {
    try {
        if (transaction.counter_ID > 0) {
            let CurrentCounterData = getCounterData(branch, transaction.counter_ID)
            if (CurrentCounterData) {
                CurrentCounterData.currentTransaction = transaction;
            }
            else {
                CurrentCounterData = new counterData();
                CurrentCounterData.id = transaction.counter_ID;
                CurrentCounterData.currentTransaction = transaction;
                branch.countersData.push(CurrentCounterData);
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
}

async function getAllTransactionFromDB(transactionsData) {
    try {

        //Get only the transactions for the day
        let transactionsDBData = [];
        let result = await repositoriesManager.entitiesRepo.getAll(new transaction(), transactionsDBData);
        if (result == common.success) {
            if (listCommonFunctions.isArrayValid(transactionsDBData)) {
                for (let i = 0; i < transactionsDBData.length; i++) {
                    let t_transaction = new transaction(transactionsDBData[i]);
                    workFlowManager.setServingProperitiesOnTransaction(t_transaction);
                    transactionsData.push(t_transaction);
                }
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function isValidBranchTransactions(transaction, branch) {
    try {
        let Today = commonMethods.Today();
        return transaction.queueBranch_ID == branch.id && transaction.creationTime > Today && transaction.state != enums.StateType.closed;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}


async function cacheBranchTransactions(AllTransactions, branch) {
    try {
        branch.transactionsData = AllTransactions.filter(function (transaction) {
            return isValidBranchTransactions(transaction, branch);
        });
        if (branch.transactionsData) {
            for (let i = 0; i < branch.transactionsData.length; i++) {
                let transaction = branch.transactionsData[i];

                //Set the counter data
                SetCounterDataUsingTransaction(branch, transaction);

                //To Visit Data
                AddorUpdateVisitData(branch, transaction);
            }
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

function CreateOrUpdateOrgCache(OrgID, pOrganizationData) {
    if (!pOrganizationData) {
        pOrganizationData = new organizationData();
        pOrganizationData.id = OrgID;
        pOrganizationData.branchesData = []
        organizationsData.push(pOrganizationData);
    }
    return pOrganizationData;
}

function getOrgData(OrgID) {
    if (!initialize) {
        return;
    }
    var organizationData = organizationsData.find(function (value) {
        return parseInt(value.id) == parseInt(OrgID);
    });
    return organizationData;
}

//Cache Server Configs from DB
var cacheData = async function () {
    try {
        while (organizationsData.length > 0) {
            organizationsData.pop();
        }
        let result = common.error;
        let AllUserActivities = [];
        let AllTransactions = [];
        let BranchesConfigs = configurationService.configsCache.branches;
        if (listCommonFunctions.isArrayValid(BranchesConfigs)) {
            result = await getALLUserActivitiesFromDB(AllUserActivities);
            result = (result == common.success) ? await getAllTransactionFromDB(AllTransactions) : result;
            if (result == common.success) {
                for (let i = 0; i < BranchesConfigs.length; i++) {
                    let BranchConf = BranchesConfigs[i];
                    let OrgData = getOrgData(BranchConf.OrgID);
                    OrgData = CreateOrUpdateOrgCache(BranchConf.OrgID, OrgData);
                    let branch = new branchData();
                    branch.id = BranchConf.ID;
                    await cacheBranchUserActivities(AllUserActivities, branch);
                    await cacheBranchTransactions(AllTransactions, branch);
                    OrgData.branchesData.push(branch);
                }
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
function getBranchData(OrgID, BranchID) {
    let OrgData = getOrgData(OrgID);
    let branchData;
    if (OrgData && OrgData.branchesData) {
        branchData = OrgData.branchesData.find(function (value) {
            return value.id == BranchID;
        });
    }
    return branchData;
}
function getHeldCustomers(OrgID, BranchID, CounterID, output) {
    try {
        let result = common.success;
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;

        //Get Branch Data
        BracnhData = getBranchData(OrgID, BranchID);
        if (!BracnhData) {
            return common.error;
        }

        let heldTransactions = BracnhData.transactionsData.filter(function (transaction) {
            return transaction.state == enums.StateType.OnHold && transaction.heldByCounter_ID == CounterID;
        });

        if (heldTransactions && heldTransactions.length) {
            heldTransactions.forEach(function (transaction) {
                output.push(transaction);
            });
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

function isValidWaitingTransaction(AllocatedSegment, AllocatedService, transaction) {
    try {
        let waitingStates = [enums.StateType.Pending, enums.StateType.PendingRecall];
        if (waitingStates.indexOf(parseInt(transaction.state)) > -1 && AllocatedService.indexOf(parseInt(transaction.service_ID)) > -1 && AllocatedSegment.indexOf(parseInt(transaction.segment_ID)) > -1) {
            return true;
        }
        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

function isCustomerWaitingOnCounter(CounterID, AllocatedSegment, AllocatedService, transaction) {
    try {
        //If the transaction on hold
        if (transaction.state == enums.StateType.OnHold && transaction.heldByCounter_ID == CounterID) {
            return true;
        }

        //if the transaction is not on the same hall
        let counter = configurationService.getCounterConfig(CounterID);
        if (!counter || counter.Hall_ID.toString() != transaction.hall_ID.toString()) {
            return false;
        }

        //If it is serable and allocated on counter
        if (isValidWaitingTransaction(AllocatedSegment, AllocatedService, transaction)) {
            if (transaction.counter_ID == null || transaction.counter_ID == CounterID) {
                return true;
            }
        }
        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }

}

//check if the custom is waiting 
function isCustomerWaiting(CounterID, AllocatedSegment, AllocatedService, transaction) {
    try {
        if (CounterID && CounterID != "") {
            //FOR CES
            return isCustomerWaitingOnCounter(CounterID, AllocatedSegment, AllocatedService, transaction);
        }
        else {
            //For BMS
            let waitingStates = [enums.StateType.OnHold, enums.StateType.Pending, enums.StateType.PendingRecall];
            if (waitingStates.indexOf(parseInt(transaction.state)) > -1) {
                return true;
            }
        }

        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

//Get waiting and hold customers
function getWaitingCustomers(OrgID, BranchID, CounterID, UserID, output) {
    try {
        let result = common.success;
        let BracnhData;

        //Get Branch Data
        BracnhData = getBranchData(OrgID, BranchID);
        if (!BracnhData) {
            return common.error;
        }
        let AllocatedSegment = [];
        let AllocatedService = [];
        let CounterData = getCounterData(BracnhData, CounterID);
        //getAllocated entities
        if (CounterData) {
            workFlowManager.getAllocatedSegments(OrgID, BranchID, CounterID, UserID, AllocatedSegment)
            workFlowManager.getAllocatedServices(OrgID, BranchID, CounterID, UserID, AllocatedService)
        }
        else {
            return common.error;
        }

        let WaitingTransactions = BracnhData.transactionsData.filter(function (transaction) {
            return isCustomerWaiting(CounterID, AllocatedSegment, AllocatedService, transaction);
        });

        if (WaitingTransactions && WaitingTransactions.length) {
            WaitingTransactions.forEach(function (transaction) {
                output.push(transaction);
            });
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


//Get Branches Data
function getBranchCountersData(OrgID, BranchID, output) {
    try {
        //Get Branch Data
        let BracnhData = getBranchData(OrgID, BranchID);
        if (BracnhData && BracnhData.countersData) {
            BracnhData.countersData.forEach(function (counterData) {
                output.push(counterData);
            });
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Get the Branch Data and counter data then the current Activity
function getCurrentData(OrgID, BranchID, CounterID, output) {
    try {

        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;

        //Get Branch Data
        BracnhData = getBranchData(OrgID, BranchID);

        //Get current State
        CounterData = getCounterData(BracnhData, CounterID);

        //Get Counter Status
        CurrentActivity = getCurrentActivity(BracnhData, CounterData);
        CurrentTransaction = getCurrentTransaction(BracnhData, CounterData);

        output.push(BracnhData);
        output.push(CounterData);
        output.push(CurrentActivity);
        output.push(CurrentTransaction);

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var initialize = async function () {
    try {
        let result = await repositoriesManager.initialize();
        if (result == common.success) {
            result = await cacheData();
            fs.writeFileSync("Data.json", JSON.stringify(this.organizationsData));
            initialize = true;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

var stop = async function () {
    try {
        let result = await repositoriesManager.stop();
        return result;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

//Check the previous data with the new one
function isCounterChanged(CounterData) {
    if (CounterData.availableActions) {
        let CheckSumData = {
            availableActions: CounterData.availableActions,
        }
        let _CurrentCheckSum = JSON.stringify(CheckSumData);
        if (CounterData._CheckSum != _CurrentCheckSum) {
            CounterData._CheckSum = _CurrentCheckSum;
            return true;
        }
        return false;
    }
}
//Check for counter checked States
var getChangedCounters = function (BranchData, countersInfo) {
    try {
        let ChangedCounters;
        if (BranchData) {
            ChangedCounters = BranchData.countersData.filter(function (counter) {
                return isCounterChanged(counter);
            });
        }
        if (ChangedCounters) {
            ChangedCounters.forEach(function (item) {
                countersInfo.push(item);
            })
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


module.exports.getChangedCounters = getChangedCounters;
module.exports.getBranchCountersData = getBranchCountersData;
module.exports.getCurrentActivity = getCurrentActivity;
module.exports.getCurrentTransaction = getCurrentTransaction;
module.exports.getBranchData = getBranchData;
module.exports.getHeldCustomers = getHeldCustomers;
module.exports.getWaitingCustomers = getWaitingCustomers;
module.exports.getCounterData = getCounterData;
module.exports.AddorUpdateVisitData = AddorUpdateVisitData;
module.exports.getCurrentData = getCurrentData;
module.exports.stop = stop;
module.exports.initialize = initialize;
module.exports.organizationsData = organizationsData;