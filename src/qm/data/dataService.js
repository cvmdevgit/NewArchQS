//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var branchData = require("./branchData");
var organizationData = require("./organizationData");
var visitData = require("./visitData");
var counterData = require("./counterData");
var transaction = require("./transaction");
var userActivity = require("./userActivity");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var organizationsData = [];
var initialize = false;

function getCounterData(BracnhData, CounterID) {
    try {
        let CounterData;
        if (BracnhData && BracnhData.countersData) {
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    CounterData = BracnhData.countersData[i];
                    break;
                }
            }
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
        if (CounterData && CounterData.currentState) {
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
        if (CounterData && CounterData.currentTransaction_ID) {
            CurrentTransaction = BracnhData.transactionsData.find(function (value) {
                return CounterData.currentTransaction_ID == value.id;
            });
        }
        return CurrentTransaction;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


async function getTodaysUserActivitiesFromDB(branchID) {
    try {
        let Now = new Date;
        let Today = Now.setHours(0, 0, 0, 0);
        let userActivities = await repositoriesManager.entitiesRepo.getFilterBy(new userActivity(), ["branch_ID", "closed"], [branchID, "0"]);
        userActivities = userActivities.filter(function (value) {
            return value.startTime > Today && value.closed == 0;
        });
        return userActivities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

async function cacheBranchUserActivities(branch) {
    try {
        //Get user activities
        let DBuserActivities = await getTodaysUserActivitiesFromDB(branch.id);

        if (DBuserActivities) {
            //Convert it to javascript entity
            for (let i = 0; i < DBuserActivities.length; i++) {
                let t_userActivity = new userActivity(DBuserActivities[i]);
                branch.userActivitiesData.push(t_userActivity);
            }
            //Set the user activities on the counter data
            for (let i = 0; i < branch.userActivitiesData.length; i++) {
                let UserActivity = branch.userActivitiesData[i];
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
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

async function getTodaysTransactionFromDB(branchID) {
    try {
        let Now = new Date;
        let Today = Now.setHours(0, 0, 0, 0);
        let transactionsData = [];
        //Get only the transactions for the day
        let States = [enums.StateType.Pending, enums.StateType.PendingRecall, enums.StateType.Serving, enums.StateType.OnHold];
        let transactionsDBData = await repositoriesManager.entitiesRepo.getFilterBy(new transaction(), ["branch_ID", "state"], [branchID, States]);
        transactionsDBData = transactionsDBData.filter(function (value) {
            return value.creationTime > Today;
        });
        if (transactionsDBData && transactionsDBData.length > 0) {
            for (let i = 0; i < transactionsDBData.length; i++) {
                let t_transaction = new transaction(transactionsDBData[i]);
                transactionsData.push(t_transaction);
            }
        }
        return transactionsData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function AddorUpdateVisitData(branchData, transaction) {
    try {
        let VisitData;
        if (branchData.visitData) {
            VisitData = branchData.visitData.find(function (value) {
                return transaction.visit_ID == value.visit_ID;
            });
        }
        if (!VisitData) {
            VisitData = new visitData();
            VisitData.visit_ID = transaction.visit_ID;
            VisitData.customer_ID = transaction.customer_ID;
            VisitData.transactions_IDs.push(transaction.id);
            branchData.visitData.push(VisitData);

        } else {
            VisitData.transactions_IDs.push(transaction.id);
        }
    }
    catch (error) {
        logger.logError(error);
    }
}


function SetCounterDataUsingTransaction(branch, transaction) {
    try {
        if (transaction.counter_ID > 0) {
            let CurrentCounterData = getCounterData(branch, transaction.counter_ID)
            if (CurrentCounterData) {
                CurrentCounterData.currentTransaction_ID = transaction.id;
                CurrentCounterData.currentTransaction = transaction;
            }
            else {
                CurrentCounterData = new counterData();
                CurrentCounterData.id = transaction.counter_ID;
                CurrentCounterData.currentTransaction_ID = transaction.id;
                CurrentCounterData.currentTransaction = transaction;
                branch.countersData.push(CurrentCounterData);
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
}

async function cacheBranchTransactions(branch) {
    try {
        branch.transactionsData = await getTodaysTransactionFromDB(branch.id);
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
        let result = common.success;
        let BranchesConfig = configurationService.configsCache.branches;
        if (BranchesConfig != null && BranchesConfig.length > 0) {
            for (let i = 0; i < BranchesConfig.length; i++) {
                let BranchConf = BranchesConfig[i];
                let OrgData = getOrgData(BranchConf.OrgID);
                OrgData = CreateOrUpdateOrgCache(BranchConf.OrgID, OrgData);
                let branch = new branchData();
                branch.id = BranchConf.ID;
                await cacheBranchUserActivities(branch);
                await cacheBranchTransactions(branch);
                OrgData.branchesData.push(branch);
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
    let branchData ;
    if (OrgData && OrgData.branchesData)
    {
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
        let heldTransactions = BracnhData.transactionsData.filter(function (transaction) {
            return transaction.state == enums.StateType.OnHold && transaction.heldByCounter_ID == CounterID;;
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



//Get Branches Data
function getBranchCountersData(OrgID, BranchID, output) {
    try {
        //Get Branch Data
        BracnhData = getBranchData(OrgID, BranchID);
        if (BracnhData.countersData) {
            BracnhData.countersData.forEach(function (counterData) {
                output.push(counterData);
            })
        }
        return common.success;
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
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

var initialize = async function () {
    try {
        let result = await repositoriesManager.initialize();
        if (result == common.success) {
            result = await cacheData();
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
module.exports.getCounterData = getCounterData;
module.exports.AddorUpdateVisitData = AddorUpdateVisitData;
module.exports.getCurrentData = getCurrentData;
module.exports.stop = stop;
module.exports.initialize = initialize;
module.exports.organizationsData = organizationsData;