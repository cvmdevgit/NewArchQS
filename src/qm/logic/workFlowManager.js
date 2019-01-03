/*eslint no-unused-vars: "off"*/
"use strict";
var constants = require("../../common/constants");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var common = require("../../common/common");
var listCommonFunctions = require("../../common/listCommonFunctions");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var statisticsData = require("../data/statisticsData");
var statisticsManager = require("./statisticsManager");
var serviceWorkflow = require("../data/serviceWorkflow");
var ServiceAvailableActions = require("../data/serviceAvailableActions");
var parseString = require('xml2js').parseString;


function getWorkFlow(branchID, service_ID) {
    try {
        let tWorkflow;
        //Branch Config
        let workflowRecord = configurationService.configsCache.serviceWorkFlow.find(function (Item) {
            return Item.QueueBranch_ID == branchID && Item.Service_ID == service_ID;
        });
        if (workflowRecord) {
            //If it was parse before return it as it is
            if (workflowRecord.WorkflowObject) {
                return workflowRecord.WorkflowObject;
            }
            //Parse it again
            let workflowXML = workflowRecord.Workflow;
            parseString(workflowXML, function (err, result) {
                if (result && result.ArrayOfClsKeyData && result.ArrayOfClsKeyData.clsKeyData) {
                    tWorkflow = new serviceWorkflow();
                    result.ArrayOfClsKeyData.clsKeyData.forEach(element => {
                        //Replace the old key with new one of services
                        if (element.Keys) {
                            let Key = element.Keys[0].replace("Queues", "Services");
                            if (element.Data) {
                                tWorkflow[Key] = element.Data[0];
                            }
                            else {
                                tWorkflow[Key] = null;
                            }
                        }
                    });
                    workflowRecord.WorkflowObject = tWorkflow;
                }

            });
            return tWorkflow;
        }
        return;
    }
    catch (error) {
        logger.logError(error);
        return new serviceWorkflow();
    }

}
function MergeAllocationsArrays(allocated_all_segment, allocated_segment) {
    try {
        let MergedArray;
        //If the two arrays are filled
        if (allocated_all_segment && allocated_segment) {
            MergedArray = allocated_all_segment.concat(allocated_segment.filter(function (item) {
                return allocated_all_segment.indexOf(item) < 0;
            }));
            return MergedArray
        }
        if (allocated_all_segment) {
            MergedArray = allocated_all_segment;
        }
        else {
            MergedArray = allocated_segment;
        }
        return MergedArray
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedEntitiesOnSegment(branchConfig, Segment_ID, AllocationType) {
    try {
        let AllcatedEntities = [];
        if (AllocationType == enums.AllocationTypes.Counter) {
            AllcatedEntities = getAllocatedCountersOnSegment(branchConfig, Segment_ID);
        }
        else {
            AllcatedEntities = getAllocatedUsersOnSegment(branchConfig, Segment_ID);
        }
        return AllcatedEntities;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedCountersOnSegment(branch, Segment_ID) {
    try {
        //counters with all segments set
        let allocated_all_segment_counters = branch.counters.filter(function (value) {
            return value.SegmentAllocationType == enums.SegmentAllocationType.SelectAll;
        }).map(counter => counter.ID);

        //Get Segment Allocation from allocation table
        let allocated_segment_counters = branch.segmentsAllocations.filter(function (allocation) {
            return allocation.Segment_ID == Segment_ID && allocation.Counter_ID;
        }).map(allocation => allocation.Counter_ID);

        //Merge the 2 arrays to get one counters array with this segment allocated
        let allocated_countersOnSegments = MergeAllocationsArrays(allocated_all_segment_counters, allocated_segment_counters);
        if (allocated_countersOnSegments) {

        }
        return allocated_countersOnSegments;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}


function getAllocatedServicesOnCounter(branch, Counter_ID) {
    try {
        //Get Counters with this service allocated
        let allocated_Services = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Counter_ID == Counter_ID && allocation.Service_ID;
        }).map(allocation => allocation.Service_ID);
        if (allocated_Services) {
            return allocated_Services;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedServicesOnUser(branch, User_ID) {
    try {
        //Get Counters with this service allocated
        let allocated_Services = branch.servicesAllocations.filter(function (allocation) {
            return allocation.User_ID == User_ID && allocation.Service_ID;
        }).map(allocation => allocation.Service_ID);
        if (allocated_Services) {
            return allocated_Services;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getAllocatedCountersOnService(branch, Service_ID) {
    try {
        //Get Counters with this service allocated
        let allocated_countersOnServices = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Service_ID == Service_ID && allocation.Counter_ID;
        }).map(allocation => allocation.Counter_ID);
        if (allocated_countersOnServices) {
            return allocated_countersOnServices;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedUsersOnSegment(branch, Segment_ID) {
    try {
        let ServingUserIDs = branch.usersAllocations.filter(function (user) {
            return user.Serving == "1";
        }).map(user => user.User_ID);

        //Users with all segments set
        let allocated_all_segment_users = configurationService.configsCache.users.filter(function (user) {
            return user.SegmentAllocationType == enums.SegmentAllocationType.SelectAll && ServingUserIDs.indexOf(user.ID) > -1;
        }).map(user => user.ID);

        //Get Segment Allocation from allocation table
        let allocated_segment_users = branch.segmentsAllocations.filter(function (allocation) {
            return allocation.Segment_ID == Segment_ID && allocation.User_ID && ServingUserIDs.indexOf(user.ID) > -1;
        }).map(allocation => allocation.User_ID);

        //Merge the 2 arrays to get one users array with this segment allocated
        let allocated_usersOnSegments = MergeAllocationsArrays(allocated_all_segment_users, allocated_segment_users);
        if (allocated_usersOnSegments) {
            return allocated_usersOnSegments;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedUserssOnService(branch, Service_ID) {
    try {
        if (!branch || !Service_ID) {
            return;
        }
        //Get users with this service allocated
        let allocated_usersOnServices = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Service_ID == Service_ID && allocation.User_ID;
        });
        if (allocated_usersOnServices) {
            allocated_usersOnServices = allocated_usersOnServices.map(allocation => allocation.User_ID);
        }
        return allocated_usersOnServices;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}

function getAllocatedServingCounters(branchID, Service_ID) {
    try {

        let branch = configurationService.getBranchConfig(branchID);
        //Get Counters with this service allocated
        let allocated_countersOnServices = getAllocatedCountersOnService(branch, Service_ID);
        if (!allocated_countersOnServices) {
            return;
        }

        let CounterTypes = [enums.counterTypes.CustomerServing, enums.counterTypes.NoCallServing];
        //Get hall counters
        let counters = branch.counters.filter(function (counter) {
            return (CounterTypes.indexOf(parseInt(counter.Type_LV)) > -1) && allocated_countersOnServices.indexOf(counter.ID) > -1;
        }
        );
        if (counters) {
            return counters;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}
function getAllocatedServingUsers(branchID, Service_ID) {
    try {
        let branch = configurationService.getBranchConfig(branchID);
        //Get Counters with this service allocated
        let allocated_usersOnServices = getAllocatedUserssOnService(branch, Service_ID);
        return allocated_usersOnServices;
    }
    catch (error) {
        logger.logError(error);
        return;
    }

}
function isSegmentAllocatedOnCounter(BranchConfig, CounterConfig, SegmentID) {
    try {
        if (!CounterConfig) {
            return false;
        }
        let isSegmentAllocated = (CounterConfig.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);
        if (isSegmentAllocated == false && BranchConfig.segmentsAllocations) {
            let allocation = BranchConfig.segmentsAllocations.find(function (allocation) {
                return allocation.Segment_ID = SegmentID && allocation.Counter_ID == CounterConfig.ID;
            });
            if (allocation) {
                isSegmentAllocated = true;
            }
        }

        return isSegmentAllocated;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function isSegmentAllocatedOnUser(BranchConfig, UserConfig, SegmentID) {
    try {
        if (!UserConfig) {
            return false;
        }
        let isSegmentAllocated = (UserConfig.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);
        if (isSegmentAllocated == false && BranchConfig.segmentsAllocations) {
            let allocation = BranchConfig.segmentsAllocations.find(function (allocation) {
                return allocation.Segment_ID = SegmentID && allocation.User_ID == UserConfig.ID;
            });
            if (allocation) {
                isSegmentAllocated = true;
            }
        }
        return isSegmentAllocated;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function _getAllocatedEntitiesOnService(branchID, Service_ID) {
    try {
        let AllcatedEntities = [];
        let AllocationType = configurationService.getCommonSettings(branchID, constants.SERVICE_ALLOCATION_TYPE);
        if (AllocationType == enums.AllocationTypes.Counter) {
            AllcatedEntities = getAllocatedServingCounters(branchID, Service_ID);
        }
        else {
            AllcatedEntities = getAllocatedServingUsers(branchID, Service_ID);
        }
        return AllcatedEntities;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}
function setServingCountersForTransaction(branchConfig, service_ID, segment_ID, transaction) {
    try {
        let branchID = branchConfig.ID;
        if (transaction.counter_ID && transaction.counter_ID > 0) {
            //If the transaction is counter specific
            transaction._servingCounters = [transaction.Counter_ID];
        }
        else {
            //Set serving Counters
            let AllocatedCountersOnService = getAllocatedEntitiesOnService(branchID, service_ID, enums.AllocationTypes.Counter);
            let AllocatedCountersOnSegment = getAllocatedEntitiesOnSegment(branchConfig, segment_ID, enums.AllocationTypes.Counter);
            if (listCommonFunctions.isArrayValid(AllocatedCountersOnService) && listCommonFunctions.isArrayValid(AllocatedCountersOnSegment)) {
                let counters = AllocatedCountersOnService.filter(function (counter) {
                    return (counter.Hall_ID == transaction.hall_ID && AllocatedCountersOnSegment.indexOf(parseInt(counter.ID)) > -1);
                });
                transaction._servingCounters = counters ? counters.map(counter => counter.ID) : [];
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
function setServingUserssForTransaction(branchConfig, service_ID, segment_ID, transaction) {
    try {
        let branchID = branchConfig.ID;
        if (transaction.user_ID && transaction.user_ID > 0) {
            //If the transaction is counter specific
            transaction._servingUsers = [transaction.user_ID];
            return common.success;
        }

         //Set Serving Users
         let AllocatedUsersOnService = getAllocatedEntitiesOnService(branchID, service_ID, enums.AllocationTypes.User);
         let AllocatedUsersOnSegment = getAllocatedEntitiesOnSegment(branchConfig, segment_ID, enums.AllocationTypes.User);
         if (listCommonFunctions.isArrayValid(AllocatedUsersOnService) && listCommonFunctions.isArrayValid(AllocatedUsersOnSegment)) {
             let users = AllocatedUsersOnService.filter(function (userID) {
                 return (AllocatedUsersOnSegment.indexOf(parseInt(userID)) > -1);
             });
             transaction._servingUsers = users ? users : [];
         }

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
function setServingProperitiesOnTransaction(transaction) {
    try {
        //Branch Config
        let branchID = transaction.queueBranch_ID;
        let branchConfig = configurationService.getBranchConfig(branchID);
        if (!branchConfig) {
            return common.error;
        }
        let service_ID = parseFloat(transaction.service_ID);
        let segment_ID = parseFloat(transaction.segment_ID);
        //Set list serving attribute
        let CurrentServiceWorkflow = getWorkFlow(branchID, service_ID);
        transaction._isRandomCallAllowed = CurrentServiceWorkflow.IsListServingService;
        transaction._isCalledByNextAllowed = CurrentServiceWorkflow.WaitingCustomersCanBeCalledByNext == "1" ? true : false;

        //Set serving counters property
        setServingCountersForTransaction(branchConfig, service_ID, segment_ID, transaction);

        //Set serving Users property
        setServingUserssForTransaction(branchConfig, service_ID, segment_ID, transaction)

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

function getDisabledServiceDueToMaxServingLimit(BranchData) {
    try {
        let Services_WorkFlows = [];
        //Get the branch service and thier workflows
        configurationService.configsCache.branch_serviceAllocations.forEach(function (serviceAllocation) {
            if (serviceAllocation.QueueBranch_ID == BranchData.id) {
                let serviceWork = getWorkFlow(BranchData.id, serviceAllocation.Service_ID);
                if (serviceWork.EnableLimitMaxCounter == "1") {
                    let Service_WorkFlow = {
                        id: serviceAllocation.Service_ID,
                        workflow: serviceWork,
                        numberOfServingCustomers: 0,
                        exceededMax: false
                    }
                    Services_WorkFlows.push(Service_WorkFlow);
                }
                return serviceWork.EnableLimitMaxCounter;
            }
            return false;
        });

        //Sum the serving transaction of each service
        if (listCommonFunctions.isArrayValid(Services_WorkFlows)) {
            let ServingStates = [enums.StateType.Serving, enums.StateType.servingRecall]
            let servicesIDs = Services_WorkFlows.map(Service_WorkFlow => Service_WorkFlow.id);
            BranchData.transactionsData.forEach(function (transaction_Data) {
                if (ServingStates.indexOf(transaction_Data.state) > -1 && servicesIDs.indexOf(Number(transaction_Data.service_ID)) > -1) {
                    let service_workflow = Services_WorkFlows.find(function (Service) { return Service.id == transaction_Data.service_ID });
                    service_workflow.numberOfServingCustomers += 1;
                    if (service_workflow.numberOfServingCustomers > service_workflow.workflow.MaxCounterNumber) {
                        service_workflow.exceededMax = true;
                    }
                }
            }
            );
        }

        //Filter the Number of customer in serving with exceeding the limit
        let DisabledServiceIDs = [];
        if (listCommonFunctions.isArrayValid(Services_WorkFlows)) {
            let exceededMaxServices = Services_WorkFlows.filter(function (service_workflow) { return service_workflow.exceededMax; })
            if (exceededMaxServices) {
                DisabledServiceIDs = exceededMaxServices.map(service_workflow => service_workflow.id);
            }

        }
        return DisabledServiceIDs;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return [];
    }
}

function getAllocatedEntitiesOnService(branchID, Service_ID, AllocationType) {
    try {
        let AllcatedEntities = [];
        if (AllocationType == enums.AllocationTypes.Counter) {
            AllcatedEntities = getAllocatedServingCounters(branchID, Service_ID);
        }
        else {
            AllcatedEntities = getAllocatedServingUsers(branchID, Service_ID);
        }
        return AllcatedEntities;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}

function getAllocatedServicesOnEntity(BranchConfig, counterID, user_ID, AllocationType) {
    let allocated_Queue = []
    if (AllocationType == enums.AllocationTypes.Counter) {
        allocated_Queue = getAllocatedServicesOnCounter(BranchConfig, counterID);
    }
    else {
        allocated_Queue = getAllocatedServicesOnUser(BranchConfig, user_ID);
    }
    return allocated_Queue;
}

function isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, segment_ID, AllocationType) {
    let isSegmentAllocatedOnServingEntity = false;
    if (AllocationType == enums.AllocationTypes.Counter) {
        isSegmentAllocatedOnServingEntity = isSegmentAllocatedOnCounter(BranchConfig, CurrentCounter, segment_ID);
    }
    else {
        isSegmentAllocatedOnServingEntity = isSegmentAllocatedOnUser(BranchConfig, UserConfig, segment_ID);
    }
    return isSegmentAllocatedOnServingEntity;
}

function setServiceListAvailableActions(branchID, Service_ID, AllcatedEntities, ServiceAvailableActions) {
    try {
        //Get The workFlow
        let tmpWorkFlow = getWorkFlow(branchID, Service_ID);
        //Get Change Service permissions
        if (tmpWorkFlow) {
            ServiceAvailableActions.AllowSetAsServedAllowed = tmpWorkFlow.IsSetAsServedAllowed;
            ServiceAvailableActions.AllowWaitingListServiceChange = tmpWorkFlow.IsWaitingListChangeAllowed;
            ServiceAvailableActions.WaitingListChangeServiceID = tmpWorkFlow.WaitingListChangeServiceID;
            ServiceAvailableActions.ChangeServiceEntities = [];
            if (ServiceAvailableActions.AllowWaitingListServiceChange && ServiceAvailableActions.WaitingListChangeServiceID && ServiceAvailableActions.WaitingListChangeServiceID != "") {
                let EntitiesOnChangeList = _getAllocatedEntitiesOnService(branchID, ServiceAvailableActions.WaitingListChangeServiceID);
                let EntitiesForThisService = AllcatedEntities;
                if (EntitiesOnChangeList != null && EntitiesForThisService != null && EntitiesOnChangeList.Length > 0) {
                    ServiceAvailableActions.ChangeServiceEntities = EntitiesForThisService.filter(value => -1 !== EntitiesOnChangeList.indexOf(value));
                }
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
}

function getWaitingCustomersForAservice(branchID,Service_ID)
{
    try{
        let FilterStatistics = new statisticsData();
        FilterStatistics.queueBranch_ID = branchID;
        FilterStatistics.service_ID = Service_ID;
        let Statistics = statisticsManager.GetSpecificStatistics(FilterStatistics);
        let NumberOfWaitedCustomers = Statistics ? Statistics.WaitedCustomersNo : 0;
        return NumberOfWaitedCustomers;
    }
    catch (error) {
        logger.logError(error);
        return 0;
    }
}

function getServiceAvailableActions(branchID, Service_ID) {
    try {
        let AllcatedEntities = [];
        let tServiceAvailableActions = new ServiceAvailableActions();
        let service = configurationService.getService(Service_ID);
        //If the service is not found
        if (!service) {
            return;
        }

        AllcatedEntities = _getAllocatedEntitiesOnService(branchID, Service_ID);
        //If the Branch was not exist
        if (!AllcatedEntities) {
            return;
        }
        let IsAllocated = listCommonFunctions.isArrayValid(AllcatedEntities);

        //TODO: Enable service imp
        let mEnabled = true;

        if (mEnabled && IsAllocated) {
            //Allow adding service on this service
            tServiceAvailableActions.AllowAddingToAnother = service.AddThisToAnotherService;

            //Allow adding this service to another service
            tServiceAvailableActions.AllowAddingFromAnother = service.AddAnotherToThisService;

            //Allow Transfer to counter
            tServiceAvailableActions.AllowTransferingToCounter = service.TransferToCounter;

            //allow Transfer This To AnotherService
            tServiceAvailableActions.AllowTransferingToAnother = service.TransferThisToAnotherService;

            //allow TransferAnother To This Service
            tServiceAvailableActions.AllowTransferingFromAnother = service.TransferAnotherToThisService;

            //TODO: fill waiting customers
            let NumberOfWaitedCustomers = getWaitingCustomersForAservice(branchID,Service_ID);

            //Allow ticket issue On Ticketing Software
            tServiceAvailableActions.AllowTicketIssuing = (service.MaxCustomersPerDay == 0 || service.MaxCustomersPerDay >= NumberOfWaitedCustomers + 1);
            //allow Display On Ticketing Software
            tServiceAvailableActions.DisplayingOnTicketingSoftware = (service.DisplayOnKiosk && tServiceAvailableActions.AllowTicketIssuing);
        }

        //Get Change Service permissions
        setServiceListAvailableActions(branchID, Service_ID, AllcatedEntities, tServiceAvailableActions)
        return tServiceAvailableActions;
    }
    catch (error) {
        logger.logError(error);
        return;
    }

}
function IsServiceAllowedtoAddOrTransfer(CurrentWorkFlow, ServiceIDToCheck) {
    try {
        let isServiceAllowedtoAddOrTransfer = false;
        if (CurrentWorkFlow == null || CurrentWorkFlow.AreAllServicesAssossiated) {
            return true;
        }
        if (CurrentWorkFlow.AssossiatedServices && CurrentWorkFlow.AssossiatedServices.indexOf(ServiceIDToCheck) >= 0) {
            isServiceAllowedtoAddOrTransfer = true;
        }
        return isServiceAllowedtoAddOrTransfer;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function isCounterValidTypeTobeTransfered(branchID, counterID, counterConfig) {
    let CounterTypes = [enums.counterTypes.CustomerServing, enums.counterTypes.NoCallServing];
    return counterConfig.QueueBranch_ID == branchID && counterConfig.ID != counterID && (CounterTypes.indexOf(parseInt(counterConfig.Type_LV)) > -1);
}
function GetValidCounterToBeTransfered(branchID, CurrentCounterConfig) {
    let CountersList = [];
    //From same hall only
    let strictTransferToCounterInSameHalls = configurationService.getCommonSettingsBool(branchID, constants.STRICT_TRANSFER_COUNTER_TO_SAME_HALLS);
    let BranchCounters = configurationService.getBranchCountersConfig(branchID);
    if (strictTransferToCounterInSameHalls) {
        //Get counter from the same hall
        CountersList = BranchCounters.filter(function (counter) {
            return isCounterValidTypeTobeTransfered(branchID, CurrentCounterConfig.ID, counter) && counter.Hall_ID == CurrentCounterConfig.Hall_ID;
        });
    }
    else {
        //Get counter from the all halls
        CountersList = BranchCounters.filter(function (counter) {
            return isCounterValidTypeTobeTransfered(branchID, CurrentCounterConfig.ID, counter);
        });
    }
    return CountersList;
}
function isServiceSegmentValidOnCounter(branchID, CounterConfig, CurrentTransaction) {
    try {

        let BranchConfig = configurationService.getBranchConfig(branchID);

        //Check allocated Services
        let isServiceSegmentValidCounter = false;

        //Consider all segments
        let DifferentSegmentTransferEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_INTER_SEGMENT_TRANSFER);
        if (DifferentSegmentTransferEnabled || CounterConfig.SegmentAllocationType == enums.SegmentAllocationType.SelectAll) {
            let allocated_counters = getAllocatedServicesOnCounter(BranchConfig, CounterConfig.ID)
            isServiceSegmentValidCounter = listCommonFunctions.isArrayValid(allocated_counters);
            return isServiceSegmentValidCounter;
        }

        //Consider specific segment only
        if (CurrentTransaction) {
            let counters = getAllocatedCountersOnSegment(BranchConfig, CurrentTransaction.segment_ID);
            isServiceSegmentValidCounter = (counters != undefined &&
                counters.find(function (counter) { return counter == CounterConfig.ID; }) != undefined);

            return isServiceSegmentValidCounter;
        }

    }
    catch (error) {
        logger.logError(error);
        return false;
    }

}

//Prepare Transfer to Services
function PrepareTransferCountersList(orgID, branchID, counterID) {
    try {
        let FinalCounterList = [];
        let output = [];
        let BranchData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];

        //If invalid branch or counter
        if (!BranchData || !CounterData) {
            return;
        }

        //If there is no activity or no transaction on the counter
        if (!CurrentActivity || !CurrentTransaction) {
            return FinalCounterList;
        }
        let RestictTrnasferCounterToOpenCounter = configurationService.getCommonSettingsBool(branchID, constants.STRICT_TRANSFER_COUNTER_TO_OPEN_COUNTERS_ONLY);

        let CurrentCounter = configurationService.configsCache.counters.find(function (counter) {
            return counter.ID == counterID;
        });

        //Get serving counters and hall filtered counters
        let CountersList = GetValidCounterToBeTransfered(branchID, CurrentCounter);
        for (let CounterIndex = 0; CounterIndex < CountersList.length; CounterIndex++) {
            //Get current State
            let CounterConfig = CountersList[CounterIndex];
            let CounterData = dataService.getCounterData(BranchData, CounterConfig.ID);
            //Get Counter Status
            let CurrentActivity = dataService.getCurrentActivity(BranchData, CounterData);
            let CurrentTransaction = dataService.getCurrentTransaction(BranchData, CounterData);
            //if system setting was enabled to get only opened counter and no state exists (Not Loged In) 
            if (!CurrentActivity && RestictTrnasferCounterToOpenCounter == true) {
                continue;
            }
            //Check allocated Services
            let tServiceSegmentAvailables = isServiceSegmentValidOnCounter(branchID, CounterConfig, CurrentTransaction);

            //Check counter state
            let validStates = [enums.UserActiontypes.Ready, enums.UserActiontypes.Serving, enums.UserActiontypes.Processing, enums.UserActiontypes.NoCallServing];
            let isCounterStateValid = (RestictTrnasferCounterToOpenCounter == false) || (validStates.indexOf(parseInt(CurrentActivity.activityType)) > -1);
            if (tServiceSegmentAvailables && isCounterStateValid) {
                let User_ID = CurrentActivity ? CurrentActivity.user_ID : "-1";
                FinalCounterList.push(CounterConfig.ID + "#@%$" + User_ID);
            }
        }
        return FinalCounterList;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function isServiceValidForTransfer(CurrentServiceWorkflow, Service, isSegmentAllocatedOnServingEntity, DifferentSegmentTransferEnabled, segment_ID) {
    try {
        //check if the service is allocated on the segment
        let isSegmentAllocatedonService = false;
        let serviceSegmentPriorityRange = configurationService.getServiceSegmentPriorityRange(segment_ID, Service.ID);
        if (serviceSegmentPriorityRange) {
            isSegmentAllocatedonService = true;
        }
        if (DifferentSegmentTransferEnabled || (DifferentSegmentTransferEnabled == false && isSegmentAllocatedonService && isSegmentAllocatedOnServingEntity)) {
            return IsServiceAllowedtoAddOrTransfer(CurrentServiceWorkflow, Service.ID);
        }
        return false
    }
    catch (error) {
        logger.logError(error);
        return false
    }
}

//Prepare Transfer to Services
function PrepareTransferServicesList(orgID, branchID, counterID) {
    try {
        let TransferServicesList = [];
        let output = [];
        let BranchData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        let UserConfig;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        //If invalid branch or counter
        if (!BranchData || !CounterData) {
            return;
        }

        //If there is no activity or no transaction on the counter
        if (!CurrentActivity || !CurrentTransaction) {
            return TransferServicesList;
        }

        let BranchConfig = configurationService.getBranchConfig(branchID);
        let CurrentCounter = configurationService.configsCache.counters.find(function (counter) {
            return counter.ID == counterID;
        });

        UserConfig = configurationService.getUserConfig(CurrentActivity.user_ID);
        let AllocationType = configurationService.getCommonSettings(branchID, constants.ServiceAllocationTypeKey);
        //Allow different segments
        let DifferentSegmentTransferEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_INTER_SEGMENT_TRANSFER);
        let allocated_Queue = getAllocatedServicesOnEntity(BranchConfig, counterID, CurrentActivity.user_ID, AllocationType);
        //Get The workFlow
        let service_ID = CurrentTransaction.service_ID;
        let CurrentServiceWorkflow = getWorkFlow(branchID, service_ID);
        let isSegmentAllocatedOnServingEntity = isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, CurrentTransaction.segment_ID, AllocationType);

        let Unlocated_Services = configurationService.configsCache.services.filter(function (service) {
            return allocated_Queue.indexOf(service.ID) < 0;
        });

        for (let index = 0; index < Unlocated_Services.length; index++) {
            let TempService = Unlocated_Services[index];
            //Is Service Allocated on serving 
            let Entities = _getAllocatedEntitiesOnService(branchID, TempService.ID)
            if (!listCommonFunctions.isArrayValid(Entities)) {
                continue;
            }
            if (isServiceValidForTransfer(CurrentServiceWorkflow, TempService, isSegmentAllocatedOnServingEntity, DifferentSegmentTransferEnabled, CurrentTransaction.segment_ID)) {
                TransferServicesList.push(TempService.ID);
            }
        }
        return TransferServicesList;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

//Get Segments on this service that is allocated on the counter
function getAllocatedSegmentsForServiceOnCounter(BranchConfig, CurrentCounter, UserConfig, serviceID, AllocationType) {
    let segments = configurationService.getSegmentsOnService(serviceID);
    if (segments) {
        segments = segments.filter(function (segment) {
            return isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, segment.ID, AllocationType);
        });
    }
    return segments;
}

//Check if the service is valid to be added into the current state
function isServiceValidForAddition(BranchConfig, CurrentCounter, UserConfig, current_service_ID, current_SegmentID, current_ServiceWorkflow, serviceID, isSegmentAllocatedOnServingEntity, AllocationType, MaxRequestsPerAddedService) {
    try {
        let isServiceValidForAddition = false;

        if (!serviceID) {
            return isServiceValidForAddition;
        }

        //Check Segment Validation
        let serviceSegmentPriorityRange = configurationService.getServiceSegmentPriorityRange(current_SegmentID, serviceID);
        let IsAtleastSegmentValid = ((serviceSegmentPriorityRange != undefined) && isSegmentAllocatedOnServingEntity);

        //if there is no segments allocated on any counter then don't add the segment
        if (IsAtleastSegmentValid == false) {
            //Get Segments on this service that is allocated on the counter
            let segments = getAllocatedSegmentsForServiceOnCounter(BranchConfig, CurrentCounter, UserConfig, serviceID, AllocationType);
            if (!listCommonFunctions.isArrayValid(segments)) return false;
        }


        //Check Service validation
        let tmpServiceAvailableActions = getServiceAvailableActions(BranchConfig.ID, serviceID);
        if (tmpServiceAvailableActions.AllowAddingToAnother && IsServiceAllowedtoAddOrTransfer(current_ServiceWorkflow, serviceID)) {
            if (MaxRequestsPerAddedService == 0) {
                if (serviceID != current_service_ID) {
                    isServiceValidForAddition = true;
                }
            }
            else {
                //TODO: Check for maximum number of same service
                isServiceValidForAddition = true;
            }
        }

        return isServiceValidForAddition;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
//Get max added service number
function getMaxNumberOfAddedServices(branchID) {
    //Get Max Number Of add
    let MaxRequestsPerAddedService = 0;
    let TempMaxVirtRequests = configurationService.getCommonSettings(branchID, constants.MAX_REQUESTS_PER_VIRTUAL_SERVICE);
    if (!TempMaxVirtRequests) {
        MaxRequestsPerAddedService = 0;
    }
    else {
        MaxRequestsPerAddedService = parseInt(TempMaxVirtRequests);
    }
    return MaxRequestsPerAddedService;
}
//Prepare Transfer to Services
function PrepareAddList(orgID, branchID, counterID) {
    try {

        let AddServicesList = [];
        let BranchConfig = configurationService.getBranchConfig(branchID);
        let CurrentCounter = configurationService.configsCache.counters.find(function (counter) {
            return counter.ID == counterID;
        });

        let output = [];
        let BranchData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        let UserConfig;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        //Invalid counter or branch
        if (!BranchData || !CounterData) {
            return;
        }
        //If there is no activity or no transaction on the counter
        if (!CurrentActivity || !CurrentTransaction) {
            return AddServicesList;
        }

        //Get The workFlow
        let current_service_ID = CurrentTransaction.service_ID;
        let current_ServiceWorkflow = getWorkFlow(branchID, current_service_ID);
        let ServiceAvailableActions = getServiceAvailableActions(branchID, current_service_ID);
        if (ServiceAvailableActions.AllowAddingFromAnother == false || current_ServiceWorkflow.IsAddServiceEnabled == false) {
            return AddServicesList;
        }

        UserConfig = configurationService.getUserConfig(CurrentActivity.user_ID);

        //Get Max Number Of add
        let MaxRequestsPerAddedService = getMaxNumberOfAddedServices(branchID);
        let AllocationType = configurationService.getCommonSettings(branchID, constants.ServiceAllocationTypeKey);
        let allocated_Queue = getAllocatedServicesOnEntity(BranchConfig, counterID, CurrentActivity.user_ID, AllocationType);
        let isSegmentAllocatedOnServingEntity = isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, CurrentTransaction.segment_ID, AllocationType);


        //Check the allocate
        for (let index = 0; index < allocated_Queue.length; index++) {
            let serviceID = allocated_Queue[index];
            let t_isServiceValidForAddition = isServiceValidForAddition(BranchConfig, CurrentCounter,
                UserConfig, current_service_ID, CurrentTransaction.segment_ID, current_ServiceWorkflow,
                serviceID, isSegmentAllocatedOnServingEntity, AllocationType, MaxRequestsPerAddedService);
            if (t_isServiceValidForAddition) {
                AddServicesList.push(serviceID);
            }
        }



        return AddServicesList;
    }
    catch (error) {
        logger.logError(error);
    }
}
function IsTransferBackAllowedForCounter(branchID, CurrentTransaction) {

    let t_IsTransferBackAllowedForCounter = false;
    //Check if the user has the service and he is logged in a counter
    if (CurrentTransaction.transferByCounter_ID == "" && CurrentTransaction.transferredFromService_ID == "") {
        t_IsTransferBackAllowedForCounter = false;
    }
    if (CurrentTransaction.transferByCounter_ID != "" && CurrentTransaction.transferredFromService_ID != "") {
        //If these two was filled that means that the service should be allocated on the counter to allow the return
        let allocatedCounters = getAllocatedServingCounters(branchID, CurrentTransaction.transferredFromService_ID)
        if (allocatedCounters && allocatedCounters.indexOf(CurrentTransaction.transferByCounter_ID) >= 0) {
            t_IsTransferBackAllowedForCounter = true;
        }
    }
    else {
        t_IsTransferBackAllowedForCounter = true;
    }
    return t_IsTransferBackAllowedForCounter;
}
function IsTransferBackAllowedForUser(branchID, CurrentActivity, CurrentTransaction) {
    let t_IsTransferBackAllowedForUser = false;

    if (CurrentActivity) {
        return t_IsTransferBackAllowedForUser;
    }

    //Check if the user has the service and he is logged in a counter
    if (CurrentTransaction.transferByUser_ID == "" && CurrentTransaction.transferredFromService_ID == "") {
        t_IsTransferBackAllowedForUser = false;
    }
    if (CurrentTransaction.transferByUser_ID != "" && CurrentTransaction.transferredFromService_ID != "") {
        //Get the counter that the user is on
        let State = CurrentActivity.activityType;
        let InvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff]
        //If these two was filled that means that the service should be allocated on the counter to allow the return
        let allocatedUsers = getAllocatedServingUsers(branchID, CurrentTransaction.transferredFromService_ID)

        if (InvalidStates.indexOf(State) < 0 && allocatedUsers.indexOf(CurrentTransaction.transferByUser_ID) >= 0) {
            t_IsTransferBackAllowedForUser = true;
        }
    }
    else {
        t_IsTransferBackAllowedForUser = true;
    }
    return t_IsTransferBackAllowedForUser;
}
function IsTransferBackAllowed(orgID, branchID, counterID) {
    try {
        let isTransferBackAllowed = false;
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        if (!CounterData) {
            //invalid branch counter
            return ;
        }
        //Check if the ticket was transferred
        if (!CurrentTransaction || !CurrentTransaction.transferByCounter_ID || !CurrentTransaction.transferredFromService_ID) {
            return isTransferBackAllowed;
        }

        let AllocationType = configurationService.getCommonSettings(branchID, constants.SERVICE_ALLOCATION_TYPE);
        if (AllocationType == enums.AllocationTypes.Counter) {
            isTransferBackAllowed =  IsTransferBackAllowedForCounter(branchID, CurrentTransaction);
        }
        else {
            isTransferBackAllowed =  IsTransferBackAllowedForUser(branchID, CurrentActivity, CurrentTransaction);
        }
        return isTransferBackAllowed;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
//Get Allocated Segments For Client 
function getAllocatedSegments(OrgID, BranchID, CounterID, UserID, output) {
    try {
        let AllocatedSegments = [];
        //Get Branch Config
        let BranchConfig = configurationService.getBranchConfig(BranchID);
        if (!BranchConfig) {
            return common.error;
        }
        //If no counter or user was provided
        if (!CounterID && !UserID) {
            return common.error;
        }

        let CurrentCounter = configurationService.configsCache.counters.find(function (counter) {
            return counter.ID == CounterID;
        });
        let UserConfig = configurationService.getUserConfig(UserID);

        let AllocationType = configurationService.getCommonSettings(BranchID, constants.ServiceAllocationTypeKey);
        AllocatedSegments = configurationService.configsCache.segments.filter(function (segment) {
            return isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, segment.ID, AllocationType);
        });

        if (listCommonFunctions.isArrayValid(AllocatedSegments)) {
            AllocatedSegments.forEach(function (segment) {
                output.push(segment.ID);
            });
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
//Get Allocated Services For Client 
function getAllocatedServices(OrgID, BranchID, CounterID, UserID, output) {
    try {
        //Get Branch Config
        let BranchConfig = configurationService.getBranchConfig(BranchID);
        if (!BranchConfig) {
            return common.error;
        }
        //If no counter or user was provided
        if (!CounterID && !UserID) {
            return common.error;
        }
        let AllocationType = configurationService.getCommonSettings(BranchID, constants.ServiceAllocationTypeKey);
        let AllocatedQueues = getAllocatedServicesOnEntity(BranchConfig, CounterID, UserID, AllocationType)
        if (listCommonFunctions.isArrayValid(AllocatedQueues)) {
            AllocatedQueues.forEach(function (ServiceAllocation) {
                output.push(ServiceAllocation);
            });
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
module.exports.getDisabledServiceDueToMaxServingLimit = getDisabledServiceDueToMaxServingLimit;
module.exports.setServingProperitiesOnTransaction = setServingProperitiesOnTransaction
module.exports.getAllocatedEntitiesOnService = getAllocatedEntitiesOnService;
module.exports.getAllocatedServicesOnEntity = getAllocatedServicesOnEntity;
module.exports.isSegmentAllocated = isSegmentAllocated;
module.exports.getAllocatedSegments = getAllocatedSegments;
module.exports.getAllocatedServices = getAllocatedServices;
module.exports.PrepareTransferCountersList = PrepareTransferCountersList;
module.exports.PrepareAddList = PrepareAddList;
module.exports.PrepareTransferServicesList = PrepareTransferServicesList;
module.exports.IsTransferBackAllowed = IsTransferBackAllowed;
module.exports.getAllocatedEntitiesOnSegment = getAllocatedEntitiesOnSegment;
module.exports.getAllocatedCountersOnSegment = getAllocatedCountersOnSegment;
module.exports.getAllocatedUsersOnSegment = getAllocatedUsersOnSegment;
module.exports.getAllocatedCountersOnService = getAllocatedCountersOnService;
module.exports.getAllocatedUserssOnService = getAllocatedUserssOnService;
module.exports.getServiceAvailableActions = getServiceAvailableActions;
module.exports.getWorkFlow = getWorkFlow;