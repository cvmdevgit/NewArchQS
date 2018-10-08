var repositoriesManager = require("../localRepositories/repositoriesManager");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
var events = require("../../common/events");
var transaction = require("../data/transaction");
var branchStatisticsData = require("../data/branchStatisticsData");
var transactionStatisticsData = require("../data/transactionStatisticsData");
var statisticsData = require("../data/statisticsData");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var responsePayload = require('../messagePayload/responsePayload');
var broadcastTopic = "statistics.broadcast";
var ModuleName = "Statistics"
var branches_statisticsData = [];
const UpdateTypes = {
    Add: 0,
    Subtract: 1
};

var generateID = function (transaction) {
    return transaction.branch_ID + "_" + transaction.service_ID + "_" + transaction.segment_ID + "_" + transaction.hall_ID + "_" + transaction.counter_ID + "_" + transaction.user_ID;
};

function UpdateWaitingCustomers(UpdateType, t_Statistics, transaction) {
    //Waiting Customer
    if (transaction.state == enums.StateType.Pending || transaction.state == enums.StateType.PendingRecall || transaction.state == enums.StateType.OnHold) {
        let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
        t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + Changevalue;
    }
}
function UpdateServedCustomersNo(UpdateType, t_Statistics, transaction) {
    //served customers
    if (transaction.serviceSeconds > 0 && (transaction.servingType == enums.CustomerServingType.Served || transaction.servingType == enums.CustomerServingType.SetAsServed || transaction.servingType == enums.CustomerServingType.ServedWithAdded)) {
        let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
        t_Statistics.ServedCustomersNo = t_Statistics.ServedCustomersNo + Changevalue;
    }
}

function UpdateNoShowCustomersNo(UpdateType, t_Statistics, transaction) {
    //number of no show
    if (transaction.servingType == enums.CustomerServingType.NoShow) {
        let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
        t_Statistics.NoShowCustomersNo = t_Statistics.NoShowCustomersNo + Changevalue;
    }
}

function UpdateNonServedCustomersNo(UpdateType, t_Statistics, transaction) {
    if (transaction.servingType == enums.CustomerServingType.NoCalled || transaction.servingType == enums.CustomerServingType.NoShow) {
        let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
        t_Statistics.NonServedCustomersNo = t_Statistics.NonServedCustomersNo + Changevalue;
    }
}

function UpdateServiceStatistics(UpdateType, t_Statistics, transaction, ServiceConfig) {
    if (transaction.serviceSeconds > 0 && (transaction.servingType == enums.CustomerServingType.Served || transaction.servingType == enums.CustomerServingType.ServedWithAdded)) {
        if (transaction.serviceSeconds <= ServiceConfig.MaxServiceTime) {
            let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
            t_Statistics.ASTWeight = t_Statistics.ASTWeight + Changevalue;
            t_Statistics.TotalServiceTime = t_Statistics.TotalServiceTime + (transaction.serviceSeconds * Changevalue);
            t_Statistics.AvgServiceTime = t_Statistics.TotalServiceTime / t_Statistics.ASTWeight;
        }
    }
}

function UpdateWaitingStatistics(UpdateType, t_Statistics, transaction, ServiceConfig) {
    if (transaction.waitingSeconds > 0 && transaction.origin != enums.OriginType.AddVirtualService && transaction.servingType != enums.CustomerServingType.CancelledDueTransfer) {
        let Changevalue = (UpdateType == UpdateTypes.Add) ? 1 : -1;
        t_Statistics.WaitedCustomersNo = t_Statistics.WaitedCustomersNo + Changevalue;
        if (transaction.waitingSeconds <= ServiceConfig.MaxServiceTime) {
            t_Statistics.TotalWaitingTime = t_Statistics.TotalWaitingTime + (transaction.waitingSeconds * Changevalue);
        }
        t_Statistics.AvgWaitingTime = t_Statistics.TotalWaitingTime / t_Statistics.WaitedCustomersNo;
    }
}


function prepareNewStatistics(transaction) {
    let Statistics = new statisticsData();
    Statistics.StatisticsDate = Date.now();
    if (transaction) {
        Statistics.id = generateID(transaction);
        Statistics.branch_ID = transaction.branch_ID;
        Statistics.segment_ID = transaction.segment_ID;
        Statistics.hall_ID = transaction.hall_ID;
        Statistics.counter_ID = transaction.counter_ID;
        Statistics.user_ID = transaction.user_ID;
        Statistics.service_ID = transaction.service_ID;
    }
    return Statistics;
}
var CreateNewstatistics = function (transaction) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transaction.service_ID);

        //
        let Statistics = prepareNewStatistics(transaction);

        //Waiting Customer
        UpdateWaitingCustomers(UpdateTypes.Add, Statistics, transaction);

        //served customers
        UpdateServedCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //number of no show
        UpdateNoShowCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //number of non served customers
        UpdateNonServedCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //avrage serving customers
        UpdateServiceStatistics(UpdateTypes.Add, Statistics, transaction, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(UpdateTypes.Add, Statistics, transaction, ServiceConfig);

        repositoriesManager.entitiesRepo.AddSynch(Statistics);

        return Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};
function ValidateStatisticForCounter(Statistics,BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService) {
    try {
        let valid = true;
        //Filter By user or Counter
        let AllocationType = configurationService.getCommonSettings(BranchID, constants.SERVICE_ALLOCATION_TYPE);
        if (AllocationType == enums.AllocationTypes.Counter) {
            if (Statistics.counter_ID > 0 && Statistics.counter_ID != CounterID) {
                valid = false;
            }
        }
        else {
            if (Statistics.user_ID > 0 && Statistics.user_ID != UserID) {
                valid = false;
            }
        }

        //Filter using Halls
        if (Statistics.hall_ID > 0 && Statistics.hall_ID != CounterHallID) {
            valid = false;
        }
        //Filter by allocated segments and services
        if (AllocatedSegment.indexOf(parseInt(Statistics.segment_ID)) < 0 || AllocatedService.indexOf(parseInt(Statistics.service_ID)) < 0) {
            valid = false;
        }
        return valid;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }

}
function GetCountersStatistics(BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService) {
    try {
        let t_Statistics = [];
        if (!BranchID || !CounterID || !UserID || !CounterHallID || !AllocatedSegment || !AllocatedService) {
            return undefined;
        }

        let branch_statistics = getBranchStatisticsData(BranchID);
        if (branch_statistics) {
            //if the branch exists
            t_Statistics = branch_statistics.statistics.filter(function (Statistic) {
                return ValidateStatisticForCounter(Statistic,BranchID, CounterID, UserID, CounterHallID, AllocatedSegment, AllocatedService)
            });
        }
        return t_Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}
var GetHallsStatistics = function (BranchID, Hall_IDs) {
    try {
        let hall_statistics = [];
        if (Hall_IDs && Hall_IDs.length > 0) {
            let Branchstatistics = getBranchStatisticsData(BranchID);
            for (let i = 0; i < Hall_IDs.length; i++) {
                //Create initial hall
                let hall_id = Hall_IDs[i];
                let hall = {
                    Hall_ID: hall_id,
                    WaitingCustomers: 0
                }
                //If there is statistics
                if (Branchstatistics) {
                    let statistics = Branchstatistics.statistics;
                    if (statistics && statistics.length > 0) {
                        statistics.forEach(statistics => {
                            if (statistics.hall_ID == hall_id) {
                                hall.WaitingCustomers += statistics.WaitingCustomers;
                            }
                        });
                    }
                }
                hall_statistics.push(hall);
            }
        }
        return hall_statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var UpdateStatistics = function (UpdateType, Statistics, transaction) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transaction.service_ID);
        Statistics.StatisticsDate = Date.now();
        Statistics.id = generateID(transaction);


        //Waiting Customer
        UpdateWaitingCustomers(UpdateType, Statistics, transaction);

        //served customers
        UpdateServedCustomersNo(UpdateType, Statistics, transaction);

        //number of no show
        UpdateNoShowCustomersNo(UpdateType, Statistics, transaction);

        //number of non served customers
        UpdateNonServedCustomersNo(UpdateType, Statistics, transaction);

        //avrage serving customers
        UpdateServiceStatistics(UpdateType, Statistics, transaction, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(UpdateType, Statistics, transaction, ServiceConfig);

        repositoriesManager.entitiesRepo.UpdateSynch(Statistics);

        return Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};
var AddOrUpdateTransaction = function (transaction) {
    try {
        let BranchID = transaction.branch_ID;
        //search from branch
        let t_branches_statisticsData = getBranchStatisticsData(BranchID);

        //Check if the branch exists
        if (t_branches_statisticsData) {
            //New transaction so add it and set the _StatisticsData
            let Statistics_ID = generateID(transaction);
            let t_Statistics = t_branches_statisticsData.statistics.find(function (value) {
                return value.id == Statistics_ID;
            });

            if (transaction._StatisticsData) {
                //Remove old statistics from the same transaction
                let oldStatistics_ID = generateID(transaction._StatisticsData);
                let oldStatistics = t_branches_statisticsData.statistics.find(function (value) {
                    return value.id == oldStatistics_ID;
                });
                UpdateStatistics(UpdateTypes.Subtract, oldStatistics, transaction._StatisticsData);
            }

            //Add Current Statistics
            if (t_Statistics) {
                UpdateStatistics(UpdateTypes.Add, t_Statistics, transaction);
            }
            else {
                t_Statistics = CreateNewstatistics(transaction);
                t_branches_statisticsData.statistics.push(t_Statistics);
            }
            transaction._StatisticsData = new transactionStatisticsData(transaction);
        }
        else {
            //add branch transactions
            t_branches_statisticsData = new branchStatisticsData();
            t_branches_statisticsData.branch_ID = BranchID;
            let t_Statistics = CreateNewstatistics(transaction);
            t_branches_statisticsData.statistics.push(t_Statistics);
            branches_statisticsData.push(t_branches_statisticsData);
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};
async function initializeStatisticsFromTransactions(transactionsData) {
    try {
        if (transactionsData) {
            for (let i = 0; i < transactionsData.length; i++) {
                let transaction = transactionsData[i];
                let BranchID = transaction.branch_ID;
                let Statistics_ID = generateID(transaction);

                //Add it to statistics collection
                let branch_statistics = getBranchStatisticsData(BranchID);
                if (branch_statistics) {
                    //if the branch exists
                    t_Statistics = branch_statistics.statistics.find(function (value) {
                        return value.id == Statistics_ID;
                    });
                    if (t_Statistics) {
                        UpdateStatistics(UpdateTypes.Add, t_Statistics, transaction);
                    }
                    else {
                        t_Statistics = CreateNewstatistics(transaction);
                        branch_statistics.statistics.push(t_Statistics);
                    }
                }
                else {
                    //If the branch not exists
                    let t_branchStatistics = new branchStatisticsData();
                    //Create branch statistics
                    t_branchStatistics.branch_ID = BranchID;
                    //Create statistics
                    let t_Statistics = CreateNewstatistics(transaction);
                    //Add to herarichy
                    t_branchStatistics.statistics.push(t_Statistics);
                    branches_statisticsData.push(t_branchStatistics);
                }
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
};


//Load for all branches statistics
var initialize = async function () {
    try {
        branches_statisticsData = [];
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let tomorrow = new Date(Today + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
        let t_Statistics;
        await repositoriesManager.entitiesRepo.clear(new statisticsData());
        //Get all transactions
        let transactionsData = await repositoriesManager.entitiesRepo.getAll(new transaction());
        if (transactionsData && transactionsData.length > 0) {
            //filter for today only 
            transactionsData = transactionsData.filter(function (value) {
                return value.creationTime > Today && value.creationTime < tomorrow;
            }
            );

            await initializeStatisticsFromTransactions(transactionsData);
            await repositoriesManager.commit();
        }
        await repositoriesManager.entitiesRepo.clearEntities();
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Get branch statistics
var ReadBranchStatistics = function (apiMessagePayLoad) {
    try {
        let BranchID = apiMessagePayLoad.BranchID;
        let Branchstatistics = getBranchStatisticsData(BranchID);
        if (Branchstatistics) {
            apiMessagePayLoad.statistics = Branchstatistics.statistics;
        }
        else {
            apiMessagePayLoad.statistics = [];
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

function SumStatistics(TotalStatistics, ToBeAddedStatistics) {
    try {
        TotalStatistics.WaitingCustomers = ToBeAddedStatistics.WaitingCustomers + TotalStatistics.WaitingCustomers;
        TotalStatistics.ServedCustomersNo = ToBeAddedStatistics.ServedCustomersNo + TotalStatistics.ServedCustomersNo;
        TotalStatistics.NoShowCustomersNo = ToBeAddedStatistics.NoShowCustomersNo + TotalStatistics.NoShowCustomersNo;
        TotalStatistics.NonServedCustomersNo = ToBeAddedStatistics.NonServedCustomersNo + TotalStatistics.NonServedCustomersNo;
        TotalStatistics.TotalServiceTime = ToBeAddedStatistics.TotalServiceTime + TotalStatistics.TotalServiceTime;
        TotalStatistics.ASTWeight = ToBeAddedStatistics.ASTWeight + TotalStatistics.ASTWeight;
        TotalStatistics.WaitedCustomersNo = ToBeAddedStatistics.WaitedCustomersNo + TotalStatistics.WaitedCustomersNo;
        TotalStatistics.TotalWaitingTime = ToBeAddedStatistics.TotalWaitingTime + TotalStatistics.TotalWaitingTime;
        TotalStatistics.AvgServiceTime = TotalStatistics.TotalServiceTime / TotalStatistics.ASTWeight;
        TotalStatistics.AvgWaitingTime = TotalStatistics.TotalWaitingTime / TotalStatistics.WaitedCustomersNo;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
function getBranchStatisticsData(BranchID) {
    try {
        let t_branches_statisticsData = branches_statisticsData.find(function (value) {
            return value.branch_ID == BranchID;
        });
        return t_branches_statisticsData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function shouldStatisticAdded(tStatistics, FilterStatistics) {
    let Addit = true;
    //Check the filters
    Addit = (FilterStatistics.segment_ID > 0 && (FilterStatistics.segment_ID != tStatistics.segment_ID)) ? false : Addit;
    Addit = (FilterStatistics.service_ID > 0 && (FilterStatistics.service_ID != tStatistics.service_ID)) ? false : Addit;
    Addit = (FilterStatistics.counter_ID > 0 && (FilterStatistics.counter_ID != tStatistics.counter_ID)) ? false : Addit;
    Addit = (FilterStatistics.hall_ID > 0 && (FilterStatistics.hall_ID != tStatistics.hall_ID)) ? false : Addit;
    Addit = (FilterStatistics.user_ID > 0 && (FilterStatistics.user_ID != tStatistics.user_ID)) ? false : Addit;
    return Addit;
}

//calculate the Statistics
function calculateBranchStatistics(statistics, FilterStatistics) {
    try {
        let TotalStatistics = new statisticsData();
        if (statistics) {
            for (let i = 0; i < statistics.length; i++) {
                let tStatistics = statistics[i];
                if (shouldStatisticAdded(tStatistics, FilterStatistics)) {
                    SumStatistics(TotalStatistics, tStatistics);
                }
            }
        }
        return TotalStatistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

//Get single statistics
var GetSpecificStatistics = function (FilterStatistics) {
    try {
        if (!FilterStatistics || FilterStatistics.branch_ID <= 0) {
            return undefined;
        }
        //search from branch
        let t_branches_statisticsData = getBranchStatisticsData(FilterStatistics.branch_ID);
        if (t_branches_statisticsData) {
            let TotalStatistics = calculateBranchStatistics(t_branches_statisticsData.statistics, FilterStatistics);
            return TotalStatistics;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};

/*
TO BE REMOVED
function broadcastStatistics(BranchID)
{
    try{
        var message = new responsePayload() ;
        message.topicName = ModuleName + "/branchStatistics";
        let Branchstatistics = getBranchStatisticsData(BranchID);
        message.result = common.success;
        message.payload = new responsePayload();
        if (Branchstatistics) {
            message.payload.statisticsInfo = Branchstatistics.statistics;
        }
        else {
            message.payload.statisticsInfo = [];
        }
        events.broadcastMessage.emit('event',broadcastTopic, message);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
*/

module.exports.ModuleName = "Statistics";
module.exports.GetCountersStatistics = GetCountersStatistics;
module.exports.GetHallsStatistics = GetHallsStatistics;
module.exports.GetSpecificStatistics = GetSpecificStatistics;
module.exports.AddOrUpdateTransaction = AddOrUpdateTransaction;
module.exports.ReadBranchStatistics = ReadBranchStatistics;
module.exports.initialize = initialize;
