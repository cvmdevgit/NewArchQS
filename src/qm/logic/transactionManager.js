"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var constants = require("../../common/constants");
var commonMethods = require("../../common/commonMethods");
var enums = require("../../common/enums");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var TicketSeqData = require("../data/ticketSeqData");
var counterData = require("../data/counterData");
var statisticsData = require("../data/statisticsData");
var statisticsManager = require("./statisticsManager");
var workFlowManager = require("./workFlowManager");
const Separators = ["", " ", "-", "/", "."];


function UpdateTransactionInBranchData(BracnhData, transaction) {
    if (BracnhData) {
        for (let i = 0; i < BracnhData.transactionsData.length; i++) {
            if (BracnhData.transactionsData[i].id == transaction.id) {
                BracnhData.transactionsData[i] = transaction;
                break;
            }
        }
    }
}

//Update Transaction
var UpdateTransaction = function (RequestID, transaction) {
    try {
        if (!RequestID) {
            logger.logError("empty request ID");
        }
        let result = common.error;
        transaction._RequestID = RequestID;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.orgID, transaction.queueBranch_ID);

        if (BracnhData != null && BracnhData.transactionsData != null) {

            //Update branch data
            UpdateTransactionInBranchData(BracnhData, transaction);

            //Update the Statistics
            statisticsManager.AddOrUpdateTransaction(transaction);

            //Update To data base
            repositoriesManager.entitiesRepo.UpdateSynch(transaction);
            result = common.success;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Add or Update Transaction
var AddTransaction = function (RequestID, transaction) {
    try {
        if (!RequestID) {
            logger.logError("empty request ID");
        }
        let result = common.error;
        transaction._RequestID = RequestID;
        //If visit ID was not set then take the same as ID
        if (transaction.queueBranchVisitID <= 0) {
            transaction.queueBranchVisitID = transaction.id;
        }
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.orgID, transaction.queueBranch_ID);
        if (BracnhData != null && BracnhData.transactionsData != null) {
            //To Branch Transactions
            BracnhData.transactionsData.push(transaction);
            //To Visit Data
            dataService.AddorUpdateVisitData(BracnhData, transaction);
            //Update the Statistics
            statisticsManager.AddOrUpdateTransaction(transaction);
            //Update To data base
            repositoriesManager.entitiesRepo.AddSynch(transaction);
            result = common.success;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

function getBestHallFromStatistics(branch_ID, HallsToVerfify) {
    try {
        let Hall_ID;
        //If multiple halls get the best one
        let HallStatistics = statisticsManager.GetHallsStatistics(branch_ID, HallsToVerfify.map(hall => hall.Hall_ID));
        let ratio = 100000000000;
        for (let i = 0; i < HallsToVerfify.length; i++) {
            let tmp_ratio = 0;
            if (HallsToVerfify[i].WorkingNumber > 0) {
                tmp_ratio = HallStatistics[i].WaitingCustomers / HallsToVerfify[i].WorkingNumber;
            }
            else {
                tmp_ratio = HallStatistics[i].WaitingCustomers / HallsToVerfify[i].TotalNumber;
            }
            if (tmp_ratio < ratio) {
                ratio = tmp_ratio;
                Hall_ID = HallsToVerfify[i].Hall_ID;
            }
        }
        return Hall_ID;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}



//Get Hall Number
var getHallID = function (transaction, pAllHalls, pAllocatedHalls) {
    try {
        let Hall_ID;
        //Branch Config
        var branch = configurationService.getBranchConfig(transaction.queueBranch_ID);
        var branchesData = dataService.getBranchData(transaction.orgID, transaction.queueBranch_ID);
        //Copy IDs
        branch.halls.forEach(function (hall) { pAllHalls.push(hall.ID); });
        //If there was only one Hall Return in
        if (branch.halls.length == 1) {
            Hall_ID = branch.halls[0].ID;
            pAllocatedHalls.push(branch.halls[0]);
            return Hall_ID;
        }
        //Get Allocated Halls and thier allocated Resources
        let allocatedHalls = getHallsAllocatedonServiceSegment(branch, branchesData, transaction.service_ID, transaction.segment_ID);

        if (allocatedHalls && allocatedHalls.length > 0) {
            //Copy ID
            allocatedHalls.forEach(function (hall) { pAllocatedHalls.push(hall.Hall_ID); });
            //Filter the working halls
            let HallsToVerfify = allocatedHalls.filter(function (HallData) { return HallData.WorkingNumber > 0 })
            if (!HallsToVerfify || HallsToVerfify.length == 0) {
                //If there is no hall with working state then get them all
                HallsToVerfify = allocatedHalls;
            }
            //If only one the return it
            if (HallsToVerfify.length == 1) {
                Hall_ID = HallsToVerfify[0].Hall_ID;
            }
            else {
                Hall_ID = getBestHallFromStatistics(transaction.queueBranch_ID, HallsToVerfify);
            }
        }
        return Hall_ID;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Formate the ticket number with range properities
var prepareDisplayTicketNumber = function (transaction, PriorityRangeMaxNo, Separator) {
    try {
        let FormattedTicketNumber = "";
        let displayTicketNumber = "";
        let displayticketSymbol = "";
        let pad = "";

        if (PriorityRangeMaxNo > 999) {
            pad = "0000";
        }
        else {
            pad = "000";
        }

        //Remove null in the range
        if (transaction.ticketSymbol && transaction.ticketSymbol != null && transaction.ticketSymbol.length < 4) {
            displayticketSymbol = transaction.ticketSymbol;
        }

        FormattedTicketNumber = pad.substring(0, pad.length - transaction.ticketSequence.toString().length) + transaction.ticketSequence.toString();

        if (Separator != null && Separator != "") {
            displayTicketNumber = displayticketSymbol + Separator + FormattedTicketNumber;
        }
        else {
            displayTicketNumber = displayticketSymbol + FormattedTicketNumber;
        }
        return displayTicketNumber;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var timeProirityValue = function (transaction) {
    //Return the priority of this transaction; using priority time and priority
    return ((commonMethods.Now() - transaction.priorityTime) * transaction.priority * 1000);
};

var holdCurrentCustomer = function (errors, RequestID, OrgID, BranchID, CounterID, HoldReason_ID, HeldTransactions) {
    try {
        let result = common.error;
        let output = [];
        //Get Max Seq
        let Now = commonMethods.Now();
        //Get Branch Data
        dataService.getCurrentData(OrgID, BranchID, CounterID, output) ;
        let BracnhData = output[0];
        let Current_Counter_Data = output[1];
        let CurrentCustomerTransaction = output[3];

        if (!BracnhData || !Current_Counter_Data) {
            return result;
        }
       
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Finish Serving the previous Ticket if exists
            if (Current_Counter_Data && Current_Counter_Data.currentTransaction) {
                Current_Counter_Data.currentTransaction = undefined;
                //Update the tranasaction to hold
                if (CurrentCustomerTransaction) {
                    CurrentCustomerTransaction.state = enums.StateType.OnHold;
                    CurrentCustomerTransaction.holdingCount += 1;
                    CurrentCustomerTransaction.servingSeconds = CurrentCustomerTransaction.servingSeconds + ((Now - CurrentCustomerTransaction.servingStartTime) / 1000);
                    CurrentCustomerTransaction.waitingStartTime = Now;
                    CurrentCustomerTransaction.heldByCounter_ID = CounterID;
                    CurrentCustomerTransaction.holdingReason_ID = HoldReason_ID;
                }
            }

            //Update the old
            if (CurrentCustomerTransaction) {
                UpdateTransaction(RequestID, CurrentCustomerTransaction);
                HeldTransactions.push(CurrentCustomerTransaction);
            }
        }

        result = common.success;
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
}
function closeTransaction(BracnhData, CurrentCustomerTransaction) {
    try {
        let Now = commonMethods.Now();
        CurrentCustomerTransaction.state = enums.StateType.closed;
        CurrentCustomerTransaction.servingEndTime = Now;
        CurrentCustomerTransaction.closedTime = Now;
        CurrentCustomerTransaction.servingSeconds = CurrentCustomerTransaction.servingSeconds + ((Now - CurrentCustomerTransaction.servingStartTime) / 1000);

        //Get min service time to determine the serving type
        let serviceConfig = configurationService.getServiceConfigFromService(CurrentCustomerTransaction.service_ID);
        if (CurrentCustomerTransaction.servingSeconds < serviceConfig.MinServiceTime) {
            CurrentCustomerTransaction.servingType = enums.CustomerServingType.NoShow;
        }
        else {
            CurrentCustomerTransaction.servingType = enums.CustomerServingType.Served;
        }

        //Remove the transaction from memory
        let CurrentCustomerTransactionID = CurrentCustomerTransaction.id;
        BracnhData.transactionsData = BracnhData.transactionsData.filter(function (transaction_Data) {
            return transaction_Data.id != CurrentCustomerTransactionID;
        }
        );
        BracnhData.visitData = BracnhData.visitData.filter(function (visitData) {
            return visitData.queueBranchVisitID != CurrentCustomerTransactionID;
        }
        );
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
}
var finishCurrentCustomer = function (errors, RequestID, OrgID, BranchID, CounterID, FinishedTransaction) {
    try {
        let output = [];
        //Get Branch Data
        dataService.getCurrentData(OrgID, BranchID, CounterID, output) ;
        let BracnhData =  output[0];
        let Current_Counter_Data = output[1];
        let CurrentActivity = output[2];
        let CurrentCustomerTransaction = output[3];

        if (!BracnhData || !Current_Counter_Data) {
            return common.error;
        }
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Finish Serving the previous Ticket if exists
            if (Current_Counter_Data && Current_Counter_Data.currentTransaction) {
                Current_Counter_Data.currentTransaction = undefined;
                if (CurrentCustomerTransaction) {
                    closeTransaction(BracnhData, CurrentCustomerTransaction)
                    //Update the old
                    UpdateTransaction(RequestID, CurrentCustomerTransaction);
                    FinishedTransaction.push(CurrentCustomerTransaction);
                }
            }
        }
        return common.success;

    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function PrepareTransctionFromOriginal(OriginalTransaction, NewTransaction) {
    try {
        let Now = commonMethods.Now();
        NewTransaction.queueBranchVisitID = OriginalTransaction.queueBranchVisitID;
        NewTransaction.orgID = OriginalTransaction.orgID;
        NewTransaction.queueBranch_ID = OriginalTransaction.queueBranch_ID;
        NewTransaction.ticketSequence = OriginalTransaction.ticketSequence;
        NewTransaction.ticketSymbol = OriginalTransaction.ticketSymbol;
        NewTransaction.hall_ID = OriginalTransaction.hall_ID;
        NewTransaction.servingSession = OriginalTransaction.servingSession;
        NewTransaction.orderOfServing = OriginalTransaction.orderOfServing;
        NewTransaction.servingStep = OriginalTransaction.servingStep + 1;
        NewTransaction.displayTicketNumber = OriginalTransaction.displayTicketNumber;
        NewTransaction.state = enums.StateType.Pending;
        NewTransaction.segment_ID = OriginalTransaction.segment_ID;
        //Times
        NewTransaction.creationTime = Now;
        NewTransaction.waitingStartTime = Now;
        NewTransaction.arrivalTime = OriginalTransaction.arrivalTime;
        NewTransaction.appointmentTime = OriginalTransaction.appointmentTime;
        NewTransaction.priorityTime = OriginalTransaction.priorityTime;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

}


function GetProiorityRange(segment_ID, service_ID) {
    try {
        let PriorityRange;
        let serviceSegmentPriorityRange = configurationService.configsCache.serviceSegmentPriorityRanges.find(function (value) {
            return value.Segment_ID == segment_ID && value.Service_ID == service_ID;
        }
        );

        if (serviceSegmentPriorityRange) {
            //Get Range properities
            PriorityRange = configurationService.configsCache.priorityRanges.find(function (value) {
                return value.ID == serviceSegmentPriorityRange.PriorityRange_ID;
            }
            );
        }
        return PriorityRange;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}
function CreateAddServiceTransaction(ServiceID, OriginalTransaction, AddedServiceTransaction) {
    try {
        let Now = commonMethods.Now();
        PrepareTransctionFromOriginal(OriginalTransaction, AddedServiceTransaction);
        AddedServiceTransaction.servingStartTime = Now;
        AddedServiceTransaction.origin = enums.OriginType.AddService;
        AddedServiceTransaction.service_ID = ServiceID;
        //Set the Order of serving
        let Service = configurationService.configsCache.services.find(function (service) { return service.ID == ServiceID });
        if (!Service) {
            return common.error;
        }
        AddedServiceTransaction.orderOfServing = Service.OrderOfServing;
        let PriorityRange = GetProiorityRange(AddedServiceTransaction.segment_ID, AddedServiceTransaction.service_ID);

        //if the service is on the same segment
        if (PriorityRange) {
            AddedServiceTransaction.priority = PriorityRange.Priority;
        }
        else {
            //if not in the same segment then get the average priority
            let AllServiceRanges = configurationService.configsCache.serviceSegmentPriorityRanges.filter(function (value) {
                return value.Service_ID == AddedServiceTransaction.service_ID;
            }
            );
            if (AllServiceRanges) {
                let TotalPriority = 0;
                AllServiceRanges.forEach(function (serviceSegmentPriorityRange) {
                    let PriorityRange = configurationService.configsCache.priorityRanges.find(function (value) {
                        return value.ID == serviceSegmentPriorityRange.PriorityRange_ID;
                    }
                    );
                    TotalPriority += PriorityRange.Priority;
                });
                AddedServiceTransaction.segment_ID = AllServiceRanges[0].Segment_ID;
                AddedServiceTransaction.priority = TotalPriority / AllServiceRanges.length;
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


var addService = function (errors, RequestID, OrgID, BranchID, CounterID, ServiceID, resultArgs) {
    try {
        let result = common.error;
        let FinishedTransaction = [];
        result = finishCurrentCustomer(errors, RequestID, OrgID, BranchID, CounterID, FinishedTransaction)
        if (result == common.success) {
            resultArgs.push(FinishedTransaction[0]);
            //Create the new transaction
            let OriginalTransaction = FinishedTransaction[0];
            let AddedServiceTransaction = new transaction();
            result = CreateAddServiceTransaction(ServiceID, OriginalTransaction, AddedServiceTransaction);
            if (result == common.success) {
                //Set serving counters and Users 
                result = workFlowManager.setServingProperitiesOnTransaction(AddedServiceTransaction);
                //Create on Database
                result = AddTransaction(RequestID, AddedServiceTransaction);
                if (result == common.success) {
                    //Start serving the new transaction
                    result = serveCustomer(errors, RequestID, OrgID, BranchID, CounterID, AddedServiceTransaction.id, resultArgs)
                }
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function UpdateTransactionToStartServing(NextCustomerTransaction, CounterID) {
    try {
        //Get Max Seq
        let Now = commonMethods.Now();
        if (NextCustomerTransaction.state == enums.StateType.Pending) {
            NextCustomerTransaction.state = enums.StateType.Serving;
        }
        if (NextCustomerTransaction.state == enums.StateType.PendingRecall) {
            NextCustomerTransaction.state = enums.StateType.PendingRecall;
        }
        if (NextCustomerTransaction.state == enums.StateType.OnHold) {
            NextCustomerTransaction.state = enums.StateType.Serving;
            NextCustomerTransaction.holdingSeconds = NextCustomerTransaction.holdingSeconds + ((Now - NextCustomerTransaction.waitingStartTime) / 1000);
        }
        NextCustomerTransaction.waitingSeconds = NextCustomerTransaction.waitingSeconds + ((Now - NextCustomerTransaction.waitingStartTime) / 1000);
        NextCustomerTransaction.counter_ID = CounterID;
        NextCustomerTransaction.servingStartTime = Now;
        NextCustomerTransaction.lastCallTime = Now;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

var serveCustomer = function (errors, RequestID, OrgID, BranchID, CounterID, TransactionID, resultArgs) {
    try {

        let NextCustomerTransaction = new transaction();
        //Get Branch Data
        let BracnhData = dataService.getBranchData(OrgID, BranchID);

        //Branch Config
        let branch = configurationService.getBranchConfig(BranchID);

        //counter Config
        let counter = configurationService.getCounterConfig(CounterID);

        if (!BracnhData || !counter) {
            //Invalid counter or branch
            return common.error;
        }

        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0 && TransactionID) {
            NextCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                return transaction_Data.id.toString() == TransactionID.toString();
            });
            if (NextCustomerTransaction) {
                //Validate the serve customer state
                let InvalidStates = [enums.StateType.closed, enums.StateType.Serving, enums.StateType.servingRecall];
                if (InvalidStates.indexOf(NextCustomerTransaction.state) > -1) {
                    return common.error;
                }

                //Change the state depending on the previous
                UpdateTransactionToStartServing(NextCustomerTransaction, CounterID);

                //Set the transaction on the current counter
                setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction)

                //update the new
                UpdateTransaction(RequestID, NextCustomerTransaction);
                resultArgs.push(NextCustomerTransaction);
            }
        }

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


function getAllocatedSegments(branch, counter) {
    try {
        var allocated_segments = [];
        var isAllSegments_Allocated = (counter.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);

        //Get Allocated Segments
        if (!isAllSegments_Allocated && branch.segmentsAllocations && branch.segmentsAllocations.length > 0) {
            allocated_segments = branch.segmentsAllocations.filter(function (value) {
                return value.Counter_ID == counter.ID;
            }
            );
        }
        return allocated_segments;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getAllocatedServices(branch, counter) {
    try {
        //Get Allocated Service
        let allocated_services = branch.servicesAllocations.filter(function (value) {
            return value.Counter_ID == counter.ID;
        }
        );
        return allocated_services;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function isTransactionAllocated(segment_ID, service_ID, isAllSegments_Allocated, allocated_segments, allocated_services) {
    try {
        let tSegment;
        let tService;
        let servable = false;
        if (isAllSegments_Allocated) {
            tSegment = segment_ID;
        }
        if (!isAllSegments_Allocated && allocated_segments && allocated_segments.length > 0) {
            tSegment = allocated_segments.find(function (segment) {
                return segment.Segment_ID == segment_ID;
            }
            );
        }
        if (allocated_services && allocated_services.length > 0) {
            tService = allocated_services.find(function (service) {
                return service.Service_ID == service_ID;
            }
            );
        }
        if (tSegment && tService) {
            servable = true;
        }
        return servable;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

function isTransactionServable(transaction_Data, counter) {
    try {
        let servable = false;
        if (transaction_Data.state == enums.StateType.Pending || transaction_Data.state == enums.StateType.PendingRecall) {
            if (transaction_Data._servingCounters && transaction_Data._servingCounters.indexOf(counter.ID) > -1 && transaction_Data._isCalledByNextAllowed) {
                servable = true;
            }
        }
        return servable;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

function getServableTransaction(BranchData, counter) {
    try {
        let DisabledServiceDueToMaxServingLimit = workFlowManager.getDisabledServiceDueToMaxServingLimit(BranchData);
        let transactions = BranchData.transactionsData.filter(function (transaction_Data) {
            //If the Service is disabled because it reached the max serving counters
            if (DisabledServiceDueToMaxServingLimit && DisabledServiceDueToMaxServingLimit.indexOf(transaction_Data.service_ID) > -1) {
                return false;
            }
            return isTransactionServable(transaction_Data, counter);
        }
        );
        return transactions;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return [];
    }
}

//Set the current counter transaction ID
function setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction) {
    try {
        let found = false;
        for (let i = 0; i < BracnhData.countersData.length; i++) {
            if (BracnhData.countersData[i].id == CounterID) {
                found = true;
                BracnhData.countersData[i].currentTransaction = NextCustomerTransaction;
                break;
            }
        }
        if (!found) {
            let tcounterData = new counterData();
            tcounterData.id = NextCustomerTransaction.counter_ID;
            tcounterData.currentTransaction = NextCustomerTransaction;
            BracnhData.countersData.push(tcounterData);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
    }
}

//Check all servable transactions
function GetHighestPriorityTransaction(errors, transactions) {
    try {
        if (!transactions || transactions.length == 0) {
            return undefined;
        }
        let NextCustomerTransaction = transactions[0];
        for (let i = 0; i < transactions.length; i++) {
            if (timeProirityValue(NextCustomerTransaction) < timeProirityValue(transactions[i])) {
                NextCustomerTransaction = transactions[i];
            }
        }
        return NextCustomerTransaction;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return undefined;
    }
}

function calculateTransactionSegmentAndPriority(BranchConfig, ToCounterConfig, transaction) {
    try {
        let UserConfig;
        let UserID;
        let Segments = [];
        let service_ID = parseFloat(transaction.service_ID);
        let segment_ID = parseFloat(transaction.segment_ID);
        let BranchData = dataService.getBranchData(BranchConfig.OrgID, BranchConfig.ID);
        let ToCounterData = dataService.getCounterData(BranchData, ToCounterConfig.ID);
        let CurrentActivity = ToCounterData.currentState;
        if (CurrentActivity) {
            UserID = CurrentActivity.user_ID;
            UserConfig = configurationService.getUserConfig(UserID);
        }
        let AllocationType = configurationService.getCommonSettings(BranchConfig.ID, constants.ServiceAllocationTypeKey);
        let isSegmentAllocatedOnServingEntity = workFlowManager.isSegmentAllocated(BranchConfig, ToCounterConfig, UserConfig, transaction.segment_ID, AllocationType);

        //Get Range properities
        let PriorityRange = GetProiorityRange(segment_ID, service_ID);

        //if the service- segment okay and segment is allocated
        if (PriorityRange && isSegmentAllocatedOnServingEntity == true) {
            if (transaction.priority != constants.RESERVATION_SERVICES_PROIRITY) {
                transaction.priority = PriorityRange.Priority;
            }
            return common.success;
        }

        //Otherwise we have to get average and other segment
        workFlowManager.getAllocatedSegments(BranchConfig.orgID, BranchConfig.ID, ToCounterConfig.ID, UserID, Segments)
        let serviceSegmentPriorityRange = configurationService.configsCache.serviceSegmentPriorityRanges.filter(function (PriorityRange) {
            return PriorityRange.Service_ID == service_ID;
        });

        if (serviceSegmentPriorityRange && Segments) {
            let validRanges = serviceSegmentPriorityRange.filter(function (PriorityRange) {
                return Segments.indexOf(PriorityRange.Segment_ID) > -1;
            });
            if (validRanges) {
                let sum = 0;
                validRanges.forEach(function (PriorityRange) {
                    sum = sum + PriorityRange.Priority;
                });
                //set the average and the first valid segment
                transaction.priority = (sum / validRanges.length);
                transaction.segment_ID = validRanges[0].Segment_ID;
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
}


function validateServiceTransfferedTransaction(BranchConfig, transaction) {
    try {

        let service_ID = parseFloat(transaction.service_ID);
        let segment_ID = parseFloat(transaction.segment_ID);
        let AllocationType = configurationService.getCommonSettings(BranchConfig.ID, constants.ServiceAllocationTypeKey);
        let isValid = false;
        let isSegmentAllocatedOnServingEntity = false;
        let AllocatedEntitiesOnService = workFlowManager.getAllocatedEntitiesOnService(BranchConfig.ID, service_ID, AllocationType)
        let AllocatedEntitiesOnSegment = workFlowManager.getAllocatedEntitiesOnSegment(BranchConfig, segment_ID, AllocationType)
        if (!AllocatedEntitiesOnService || !AllocatedEntitiesOnSegment) {
            return isValid;
        }
        let validEntities;
        if (AllocationType == enums.AllocationTypes.Counter) {
            let counterOnSameHall = AllocatedEntitiesOnService.filter(function (counter) {
                return counter.Hall_ID == transaction.hall_ID;
            });

            if (counterOnSameHall) {
                validEntities = counterOnSameHall.filter(function (counter) { return AllocatedEntitiesOnSegment.indexOf(counter.ID) > -1 })
            }
        }

        if (validEntities && validEntities.length > 0) {
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
function validateCounterTransfferedTransaction(BranchConfig, ToCounterConfig, transaction) {
    try {

        let UserConfig;
        let UserID;
        let service_ID = parseFloat(transaction.service_ID);
        let segment_ID = parseFloat(transaction.segment_ID);
        let CounterID = parseFloat(ToCounterConfig.ID);
        let BranchData = dataService.getBranchData(BranchConfig.OrgID, BranchConfig.ID);
        let ToCounterData = dataService.getCounterData(BranchData, CounterID);
        let CurrentActivity = ToCounterData.currentState;
        if (CurrentActivity) {
            UserID = CurrentActivity.user_ID;
            UserConfig = configurationService.getUserConfig(UserID);
        }
        let AllocationType = configurationService.getCommonSettings(BranchConfig.ID, constants.ServiceAllocationTypeKey);
        let isSegmentAllocatedOnServingEntity = workFlowManager.isSegmentAllocated(BranchConfig, ToCounterConfig, UserConfig, segment_ID, AllocationType);
        let AllocatedServices = workFlowManager.getAllocatedServicesOnEntity(BranchConfig, CounterID, UserID, AllocationType);
        let isServiceAllocatedOnServingEntity = false;
        if (AllocatedServices) {
            isServiceAllocatedOnServingEntity = (AllocatedServices.indexOf(service_ID) > -1);
        }
        if (isSegmentAllocatedOnServingEntity && isServiceAllocatedOnServingEntity) {
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
}

var transferToCounter = function (errors, RequestID, OrgID, BranchID, CounterID, ToCounterID, Transactions) {
    try {
        let CurrentCustomerTransaction;
        let result = common.error;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(OrgID, BranchID);

        //Branch Config
        let branchConfig = configurationService.getBranchConfig(BranchID);

        let CounterConfig = configurationService.getCounterConfig(CounterID);
        let ToCounterConfig = configurationService.getCounterConfig(ToCounterID);


        if (!branchConfig || !BracnhData) {
            errors.push("Invalid Branch ID");
            return common.error;
        }

        if (!CounterConfig || !ToCounterConfig) {
            errors.push("Invalid counter(s) ID From or TO");
            return common.error;
        }

        let NewTransaction = new transaction();
        //get counter data
        let Current_Counter_Data;
        Current_Counter_Data = dataService.getCounterData(BracnhData, CounterID)


        if (Current_Counter_Data && Current_Counter_Data.currentTransaction) {
            CurrentCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                return transaction_Data.id == Current_Counter_Data.currentTransaction.id;
            }
            );
            PrepareTransctionFromOriginal(CurrentCustomerTransaction, NewTransaction);
            let ServiceID = CurrentCustomerTransaction.service_ID;
            let ServiceConfig = configurationService.getService(ServiceID);
            NewTransaction.service_ID = ServiceID;
            NewTransaction.orderOfServing = ServiceConfig.OrderOfServing;
            NewTransaction.transferByCounter_ID = CounterID;
            NewTransaction.transferByUser_ID = Current_Counter_Data.currentState.user_ID;
            NewTransaction.transferredFromService_ID = CurrentCustomerTransaction.service_ID;
            NewTransaction.priority = CurrentCustomerTransaction.priority;

            result = calculateTransactionSegmentAndPriority(branchConfig, ToCounterConfig, NewTransaction);
            if (result == common.success) {
                NewTransaction.hall_ID = ToCounterConfig.Hall_ID;
                NewTransaction.counter_ID = ToCounterID;
                NewTransaction.origin = enums.OriginType.TransferToCounter;
                result = validateCounterTransfferedTransaction(branchConfig, ToCounterConfig, NewTransaction);
                //TODO Add pre-service to the transfer
                if (result == common.success) {
                    //Set serving counters and Users 
                    result = workFlowManager.setServingProperitiesOnTransaction(NewTransaction);
                    Transactions.push(NewTransaction);
                    //Create on Database
                    result = AddTransaction(RequestID, NewTransaction);
                }
            }

            return result;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function checkIfServiceEnabled(OrgID, BranchID, ServiceConfig) {
    try {
        let result = true;
        let Service = ServiceConfig;
        let ServiceID = Service.ID;
        if (Service.MaxCustomersPerDay > 0) {
            //calculate the customers number 
            let FilterStatistics = new statisticsData();
            FilterStatistics.queueBranch_ID = BranchID;
            FilterStatistics.service_ID = ServiceID;
            let statistics = statisticsManager.GetSpecificStatistics(FilterStatistics);
            if (statistics) {
                let CurrentCustomerNO = (statistics.ServedCustomersNo + statistics.WaitingCustomers + statistics.NoShowCustomersNo + 1);
                result = (Service.MaxCustomersPerDay > CurrentCustomerNO);
            }
            else {
                result = false;
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function checkIfFormNeeded(OrgID, BranchID, ServiceID) {
    let argSuppressDisplayNoActiveEmployeesMsg = true;
    let pSuppressDisplayCIForm = true;
    //Check if there are logged-in employees to serve this service
    if (!argSuppressDisplayNoActiveEmployeesMsg) {
        return mdlData.cDISPLAY_NOT_LOGIN_MSG;
    }

    //Display customer information form if the destination service needs that
    if (!pSuppressDisplayCIForm) {
        return mdlData.cDISPLAY_CUSTOMER_INFO_FORM;
    }
    return common.success;
}
var transferToService = function (errors, RequestID, OrgID, BranchID, CounterID, ServiceID, Parameters, Transactions) {
    try {
        let result = common.error;
        let ServiceConfig = configurationService.getService(ServiceID);
        if (!ServiceConfig) {
            errors.push("Invalid service ID");
            return common.error;
        }
        //TODO: these check if the feature is needed later
        let isServiceEnabled = checkIfServiceEnabled(OrgID, BranchID, ServiceConfig);
        if (!isServiceEnabled) {
            return result;
        }

        result = checkIfFormNeeded(OrgID, BranchID, ServiceID);
        //TODO
        if (result != common.success) {
            return result;
        }

        let CurrentCustomerTransaction;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(OrgID, BranchID);

        //Branch Config
        let branchConfig = configurationService.getBranchConfig(BranchID);

        let CounterConfig = configurationService.getCounterConfig(CounterID);

        if (!CounterConfig) {
            errors.push("Invalid counter(s) ID From or TO");
            return common.error;
        }
        let NewTransaction = new transaction();
        //get counter data
        let Current_Counter_Data;
        Current_Counter_Data = dataService.getCounterData(BracnhData, CounterID)


        if (Current_Counter_Data && Current_Counter_Data.currentTransaction) {
            CurrentCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                return transaction_Data.id == Current_Counter_Data.currentTransaction.id;
            }
            );
            PrepareTransctionFromOriginal(CurrentCustomerTransaction, NewTransaction);

            NewTransaction.service_ID = ServiceID;
            NewTransaction.orderOfServing = ServiceConfig.OrderOfServing;
            NewTransaction.transferByCounter_ID = CounterID;
            NewTransaction.transferByUser_ID = Current_Counter_Data.currentState.user_ID;
            NewTransaction.transferredFromService_ID = CurrentCustomerTransaction.service_ID;
            NewTransaction.priority = CurrentCustomerTransaction.priority;

            result = calculateTransactionSegmentAndPriority(branchConfig, CounterConfig, NewTransaction);
            if (result == common.success) {
                //Get hall ID 
                let All_Halls = [];
                let Allocated_Halls = [];
                //Finally Hall ID
                NewTransaction.hall_ID = CounterConfig.Hall_ID;
                let BestHall_ID = getHallID(NewTransaction, All_Halls, Allocated_Halls);
                if (Allocated_Halls.indexOf(CounterConfig.Hall_ID) == -1) {
                    NewTransaction.hall_ID = BestHall_ID;
                }
                NewTransaction.origin = enums.OriginType.TransferToService;
                result = validateServiceTransfferedTransaction(branchConfig, NewTransaction);
                //TODO Add pre-service to the transfer
                if (result == common.success) {
                    //Set serving counters and Users 
                    result = workFlowManager.setServingProperitiesOnTransaction(NewTransaction);

                    Transactions.push(NewTransaction);
                    //Create on Database
                    result = AddTransaction(RequestID, NewTransaction);
                }
            }
            return result;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


//Get Next Customer
var getNextCustomer = function (errors, RequestID, OrgID, BranchID, CounterID, resultArgs) {
    try {

        let NextCustomerTransaction = new transaction();
        //Get Branch Data
        let BracnhData = dataService.getBranchData(OrgID, BranchID);
        //Branch Config
        var branch = configurationService.getBranchConfig(BranchID);
        //Check invalid branch
        if (!branch) {
            return common.error;
        }
        //Branch Counters to get the specific counter
        var counter = branch.counters.find(function (value) {
            return value.ID == CounterID;
        });
        //Check invalid counter
        if (!counter) {
            return common.error;
        }
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Get Servable Tickets
            let transactions = getServableTransaction(BracnhData, counter);

            //Get Ticket With max Priority
            NextCustomerTransaction = GetHighestPriorityTransaction(errors, transactions);
            if (NextCustomerTransaction) {
                //Start Serving the ticket
                let Now = commonMethods.Now();
                NextCustomerTransaction.lastCallTime = Now;
                NextCustomerTransaction.servingStartTime = Now;
                NextCustomerTransaction.state = enums.StateType.Serving;
                NextCustomerTransaction.counter_ID = CounterID;
                NextCustomerTransaction.servingStep = 1;
                NextCustomerTransaction.lastOfVisit = 1;
                NextCustomerTransaction.waitingSeconds = NextCustomerTransaction.waitingSeconds + ((NextCustomerTransaction.servingStartTime - NextCustomerTransaction.waitingStartTime) / 1000);

                setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction);
                //update the new
                UpdateTransaction(RequestID, NextCustomerTransaction);
                resultArgs.push(NextCustomerTransaction);
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function isCounterWorking(counter) {
    try {

        if (counter.currentState && (counter.currentState.type == enums.UserActiontypes.Ready || counter.currentState.type == enums.UserActiontypes.Serving || counter.currentState.type == enums.UserActiontypes.Processing || counter.currentState.type == enums.UserActiontypes.NoCallServing)) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}


function getWorkingCounters(branchesData, counteronHallIDs) {
    try {
        let OpenedCounters;
        if (branchesData.countersData) {
            OpenedCounters = branchesData.countersData.filter(function (counter) {
                return counteronHallIDs.indexOf(counter.id.toString()) > -1 && isCounterWorking(counter);
            }
            );
        }
        return OpenedCounters;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function addHallData(hallsData, hallID, counteronHall, OpenedCounters) {
    let hallData = {
        Hall_ID: hallID,
        TotalNumber: counteronHall ? counteronHall.length : 0,
        WorkingNumber: OpenedCounters ? OpenedCounters.length : 0,
    }
    hallsData.push(hallData);
}
function getHallsforUsers(branch, branchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];

        //Get users with this segment allocated
        let allocated_usersOnSegments = workFlowManager.getAllocatedUsersOnSegment(branch, Segment_ID);

        //Get users with this service allocated
        let allocated_usersOnServices = workFlowManager.getAllocatedUserssOnService(branch, Service_ID);

        //Get the halls that can serve ticket
        if (allocated_usersOnServices && allocated_usersOnServices.length > 0 && allocated_usersOnSegments && allocated_usersOnSegments.length > 0) {
            //Get intersection between segment allocation and service allocation
            let UserThatCanServe = allocated_usersOnServices.filter(function (UserID) {
                return allocated_usersOnSegments.indexOf(UserID) !== -1;
            });

            if (UserThatCanServe && UserThatCanServe.length > 0) {
                branch.halls.forEach(function (hall) {
                    //counter halls with users logged in these users
                    let counteronHall = branch.counters.filter(function (counter) {
                        return counter.Hall_ID == hall.ID
                            && (counter.Type_LV == enums.counterTypes.CustomerServing || counter.Type_LV == enums.counterTypes.NoCallServing)
                            && (counter.currentState && UserThatCanServe.indexOf(counter.currentState.user_ID) > -1);
                    }
                    );

                    if (counteronHall && counteronHall.length > 0) {
                        let counteronHallIDs = counteronHall.map(counter => counter.ID);
                        let OpenedCounters = getWorkingCounters(branchesData, counteronHallIDs);
                        addHallData(hallData, hall.ID, counteronHall, OpenedCounters)
                    }
                });
            }
        }
        return hallsData;

    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getHallsforCounters(branch, branchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];

        //Get Counters can serve this segment
        let allocated_countersOnSegments = workFlowManager.getAllocatedCountersOnSegment(branch, Segment_ID);

        //Get Counters with this service allocated
        let allocated_countersOnServices = workFlowManager.getAllocatedCountersOnService(branch, Service_ID);

        //Get the halls that can serve ticket
        if (allocated_countersOnServices && allocated_countersOnServices.length > 0 && allocated_countersOnSegments && allocated_countersOnSegments.length > 0) {
            //Get intersection between segment allocation and service allocation
            let CounterThatCanServe = allocated_countersOnServices.filter(function (CounterID) {
                return allocated_countersOnSegments.indexOf(CounterID) !== -1;
            });

            if (CounterThatCanServe && CounterThatCanServe.length > 0) {
                branch.halls.forEach(function (hall) {
                    //Get hall counters
                    let counteronHall = branch.counters.filter(function (counter) {
                        return counter.Hall_ID == hall.ID && (counter.Type_LV == enums.counterTypes.CustomerServing || counter.Type_LV == enums.counterTypes.NoCallServing) && CounterThatCanServe.indexOf(counter.ID) > -1;
                    }
                    );

                    if (counteronHall && counteronHall.length > 0) {
                        let counteronHallIDs = counteronHall.map(counter => counter.ID);
                        //Get the working counter counts
                        let OpenedCounters = getWorkingCounters(branchesData, counteronHallIDs);
                        addHallData(hallsData, hall.ID, counteronHall, OpenedCounters)
                    }
                });
            }
        }
        return hallsData;

    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getHallsAllocatedonServiceSegment(Branch, BranchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];
        let AllocationType = configurationService.getCommonSettings(Branch.ID, constants.ServiceAllocationTypeKey);
        if (AllocationType == enums.AllocationTypes.Counter) {
            hallsData = getHallsforCounters(Branch, BranchesData, Service_ID, Segment_ID);
        }
        else {
            hallsData = getHallsforUsers(Branch, BranchesData, Service_ID, Segment_ID);
        }

        return hallsData;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

//Get the sequence from transactions
function GetMaxTransactionSequence(transactions, Max_TicketNumber, Min_TicketNumber) {
    try {
        let ticketSequence = parseInt(Min_TicketNumber);
        if (transactions && transactions.length > 0) {
            let maxTransaction = transactions[0];
            for (let i = 0; i < transactions.length; i++) {
                //Check for maximum transaction number today
                if (parseInt(transactions[i].ticketSequence) > parseInt(maxTransaction.ticketSequence)) {
                    maxTransaction = transactions[i];
                }
            }
            ticketSequence = parseInt(maxTransaction.ticketSequence) + 1;
        }
        if (ticketSequence > Max_TicketNumber) {
            ticketSequence = Min_TicketNumber;
        }
        return ticketSequence;
    } catch (error) {
        logger.logError(error);
        return 0;
    }
}

function isTransactionFromSameSequence(transactionData, NewTransaction) {
    try {
        let Today = commonMethods.Today();
        let Tomorrow = commonMethods.Tomorrow();
        return transactionData.queueBranch_ID == NewTransaction.queueBranch_ID && transactionData.ticketSymbol == NewTransaction.ticketSymbol && (transactionData.creationTime > Today) && (transactionData.creationTime < Tomorrow);
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

//Get SequenceRange and get sequence
function GetSequenceForFirstTime(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange) {
    try {
        let Today = commonMethods.Today();
        let ticketSequence = 0;
        let transactions;
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            transactions = BracnhData.transactionsData.filter(function (value) {
                return isTransactionFromSameSequence(value, transaction) && (value.hall_ID == transaction.hall_ID || EnableHallSlipRange == "0");
            }
            );
        }

        ticketSequence = GetMaxTransactionSequence(transactions, Max_TicketNumber, Min_TicketNumber);

        //Add sequence to the branch data
        let ticketSeqData = new TicketSeqData();
        ticketSeqData.hall_ID = transaction.hall_ID;
        ticketSeqData.ticketSymbol = transaction.ticketSymbol;
        ticketSeqData.sequence = ticketSequence;
        ticketSeqData.time = Today;
        BracnhData.ticketSeqData.push(ticketSeqData);

        return ticketSequence;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Get the next number in the sequence
function getNextSequenceNumber(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange) {
    try {

        let Today = commonMethods.Today();
        let ticketSequence = 0;
        //Get the sequence if exists in the memory
        let ticketSeqData = BracnhData.ticketSeqData.find(function (value) {
            return value.ticketSymbol == transaction.ticketSymbol && (value.hall_ID == transaction.hall_ID || EnableHallSlipRange == "0");
        }
        );

        if (ticketSeqData != null && ticketSeqData.time.toString() == Today.toString()) {
            //Update the existing Seq
            ticketSequence = ticketSeqData.sequence + 1;
            if (ticketSequence > Max_TicketNumber) {
                ticketSequence = Min_TicketNumber;
            }
            ticketSeqData.sequence = ticketSequence;
        }
        else {
            ticketSequence = GetSequenceForFirstTime(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange);
        }
        return ticketSequence;

    }
    catch (error) {
        logger.logError(error);
        return -1;
    }
}

//Split the range over halls if it was enabled
function SpiltSequenceRangeOverHall(BracnhData, Allocated_Halls, All_Halls, Min_TicketNumber, Max_TicketNumber) {
    try {
        let RangeLength = 0;
        let HallIndex = 0;
        let t_Min_TicketNumber = Min_TicketNumber;
        let EnableSplitRangeOverAllocatedHalls = configurationService.getCommonSettings(BracnhData.id, constants.EnableSplitRangeOverAllocatedHalls);
        if (EnableSplitRangeOverAllocatedHalls == "1") {
            //Split them accross allocated halls 
            RangeLength = (Max_TicketNumber - t_Min_TicketNumber) / Allocated_Halls.length;
            HallIndex = Allocated_Halls.indexOf(transaction.hall_ID);
        }
        else {
            //Split the range across all halls
            RangeLength = (Max_TicketNumber - t_Min_TicketNumber) / All_Halls.length;
            HallIndex = All_Halls.indexOf(transaction.hall_ID);
        }
        Min_TicketNumber = Math.floor((RangeLength * HallIndex) + t_Min_TicketNumber);
        Max_TicketNumber = Math.floor((RangeLength * (HallIndex + 1)) + t_Min_TicketNumber - 1);
    }
    catch (error) {
        logger.logError(error);
    }
}

function getTransactionSequence(PriorityRange, transaction) {
    try {
        let ticketSequence = 0;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.orgID, transaction.queueBranch_ID);
        if (BracnhData != null) {
            let Max_TicketNumber = PriorityRange.MaxSlipNo;
            let Min_TicketNumber = PriorityRange.MinSlipNo;

            let All_Halls = [];
            let Allocated_Halls = [];
            //Finally Hall ID
            transaction.hall_ID = getHallID(transaction, All_Halls, Allocated_Halls);
            if (!transaction.hall_ID) {
                let error = "Error in getting hall ID for the customer check service and segment allocations";
                logger.logError(error);
                return common.error;
            }

            //Check the split to get the min max depending on hall ID
            let EnableHallSlipRange = configurationService.getCommonSettings(BracnhData.id, constants.EnableHallSlipRange);
            if (EnableHallSlipRange == "1") {
                SpiltSequenceRangeOverHall(BracnhData, Allocated_Halls, All_Halls, Min_TicketNumber, Max_TicketNumber);
            }
            ticketSequence = getNextSequenceNumber(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange);
        }
        return ticketSequence;
    }
    catch (error) {
        logger.logError(error);
        return -1;
    }
}


//Issue ticket
var issueSingleTicket = function (errors, RequestID, transaction) {
    try {
        let result = common.error;
        let now = commonMethods.Now();
        transaction.creationTime = now;
        transaction.waitingStartTime = now;
        transaction.priorityTime = transaction.creationTime;
        transaction.arrivalTime = transaction.creationTime;
        transaction.state = enums.StateType.Pending;

        //Get Range properities
        let PriorityRange = GetProiorityRange(transaction.segment_ID, transaction.service_ID);
        if (!PriorityRange) {
            errors.push("error: the Service is not allocated on Segment");
            return common.error;
        }

        transaction.ticketSymbol = PriorityRange.Symbol;
        transaction.priority = PriorityRange.Priority;
        //Get Max Seq
        transaction.ticketSequence = getTransactionSequence(PriorityRange, transaction);
        transaction.displayTicketNumber = prepareDisplayTicketNumber(transaction, PriorityRange.MaxSlipNo, Separators[PriorityRange.Separator_LV]);

        //Set serving counters and Users 
        result = workFlowManager.setServingProperitiesOnTransaction(transaction);
        if (result == common.success) {
            //Create on Database
            result = AddTransaction(RequestID, transaction);
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


module.exports.addService = addService;
module.exports.holdCurrentCustomer = holdCurrentCustomer;
module.exports.finishCurrentCustomer = finishCurrentCustomer;
module.exports.serveCustomer = serveCustomer;
module.exports.getNextCustomer = getNextCustomer;
module.exports.issueSingleTicket = issueSingleTicket;
module.exports.transferToCounter = transferToCounter;
module.exports.transferToService = transferToService;

