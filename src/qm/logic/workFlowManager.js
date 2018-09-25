/*eslint no-unused-vars: "off"*/
"use strict";
var constants = require("../../common/constants");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var statisticsData = require("../data/statisticsData");
var statisticsManager = require("./statisticsManager");
var Workflow = require("../data/workflow");
var ServiceAvailableActions = require("../data/serviceAvailableActions");
var parseString = require('xml2js').parseString;


function getWorkFlow(branchID, service_ID) {
    try {
        let tWorkflow = new Workflow();
        //Branch Config
        let workflowRecord = configurationService.configsCache.serviceWorkFlow.find(function (Item) {
            return Item.QueueBranch_ID == branchID && Item.Service_ID == service_ID;
        });
        if (workflowRecord) {
            let workflowXML = workflowRecord.Workflow;
            parseString(workflowXML, function (err, result) {
                if (result && result.ArrayOfClsKeyData && result.ArrayOfClsKeyData.clsKeyData) {
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
                }
            });
            return tWorkflow;
        }
        return;
    }
    catch (error) {
        logger.logError(error);
        return new WorkFlow();
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
        //Get users with this service allocated
        let allocated_usersOnServices = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Service_ID == Service_ID && allocation.User_ID;
        }).map(allocation => allocation.User_ID);
        if (allocated_usersOnServices) {
            return allocated_usersOnServices;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getAllocatedServingCounters(branchID, Service_ID) {
    try {

        let branch = configurationService.getBranchConfig(branchID);
        //Get Counters with this service allocated
        let allocated_countersOnServices = getAllocatedCountersOnService(branch, Service_ID);

        let CounterTypes = [enums.counterTypes.CustomerServing, enums.counterTypes.NoCallServing];

        //Get hall counters
        let counters = branch.counters.filter(function (counter) {
            return (CounterTypes.indexOf(counter.Type_LV) > -1) && allocated_countersOnServices.indexOf(counter.ID) > -1;
        }
        );
        if (counters) {
            return counters;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedServingUsers(branchID, Service_ID) {
    try {
        let branch = configurationService.getBranchConfig(branchID);
        //Get Counters with this service allocated
        let allocated_usersOnServices = getAllocatedUsersOnService(branch, Service_ID);
        if (allocated_usersOnServices) {
            return allocated_usersOnServices;
        }
        return [];
    }
    catch (error) {
        logger.logError(error);
        return [];
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
function get_GetAllocatedEntities(branchID, Service_ID) {
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

function getAllocatedEntitiesOnEntity(BranchConfig, counterID, user_ID, AllocationType) {
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
                let EntitiesOnChangeList = get_GetAllocatedEntities(branchID, ServiceAvailableActions.WaitingListChangeServiceID);
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

function getServiceAvailableActions(branchID, Service_ID) {
    try {
        let AllcatedEntities = [];
        let tServiceAvailableActions = new ServiceAvailableActions();
        AllcatedEntities = get_GetAllocatedEntities(branchID, Service_ID);
        let IsAllocated = ((AllcatedEntities && AllcatedEntities.length) > 0 ? true : false);

        let service = configurationService.configsCache.services.find(function (service) {
            return service.ID == Service_ID;
        })

        //TODO: Enable service imp
        let mEnabled = true;
        let mWorkFlowPermissions;
        tServiceAvailableActions.AllowAddingToAnother = false;
        tServiceAvailableActions.AllowAddingFromAnother = false;
        tServiceAvailableActions.AllowTransferingToCounter = false;
        tServiceAvailableActions.AllowTransferingToAnother = false;
        tServiceAvailableActions.AllowTransferingFromAnother = false;
        tServiceAvailableActions.DisplayingOnTicketingSoftware = false;
        tServiceAvailableActions.AllowTicketIssuing = false;

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
            let FilterStatistics = new statisticsData();
            FilterStatistics.branch_ID = branchID;
            FilterStatistics.service_ID = Service_ID;
            let Statistics = statisticsManager.GetSpecificStatistics(FilterStatistics);
            let NumberOfWaitedCustomers = Statistics ? Statistics.WaitedCustomersNo : 0;

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
        if (CurrentWorkFlow == null || CurrentWorkFlow.AreAllServicesAssossiated || (CurrentWorkFlow.AssossiatedServices && CurrentWorkFlow.AssossiatedServices.indexOf(ServiceIDToCheck) >= 0)) {
            return true;
        }
        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

function GetValidCounterToBeTransfered(branchID, CurrentCounterConfig) {
    let CountersList = [];
    //From same hall only
    let strictTransferToCounterInSameHalls = configurationService.getCommonSettingsBool(branchID, constants.STRICT_TRANSFER_COUNTER_TO_SAME_HALLS);
    let CounterTypes = [enums.counterTypes.CustomerServing, enums.counterTypes.NoCallServing];
    if (strictTransferToCounterInSameHalls) {
        //Get counter from the same hall
        CountersList = configurationService.configsCache.counters.filter(function (counter) {
            return counter.QueueBranch_ID == branchID && counter.ID != CurrentCounterConfig.ID && counter.Hall_ID == CurrentCounterConfig.Hall_ID && (CounterTypes.indexOf(counter.Type_LV) > -1);
        });
    }
    else {
        //Get counter from the all halls
        CountersList = configurationService.configsCache.counters.filter(function (counter) {
            return counter.QueueBranch_ID == branchID && counter.ID != CurrentCounterConfig.ID && (CounterTypes.indexOf(counter.Type_LV) > -1);
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
            isServiceSegmentValidCounter = (allocated_counters && allocated_counters.length > 0) ? true : false;

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
        let BranchData = dataService.getBranchData(branchID);
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
            if (!CurrentActivity) {
                continue;
            }
            //Check allocated Services
            let tServiceSegmentAvailables = isServiceSegmentValidOnCounter(branchID, CounterConfig, CurrentTransaction);

            //Check counter state
            let validStates = [enums.EmployeeActiontypes.Ready, enums.EmployeeActiontypes.Serving, enums.EmployeeActiontypes.Processing, enums.EmployeeActiontypes.NoCallServing];
            if (tServiceSegmentAvailables && (validStates.indexOf(CurrentActivity.type) > -1)) {
                FinalCounterList.push(CounterConfig.ID + "#@%$" + CurrentActivity.user_ID);
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
        if (!orgID || !branchID || !counterID) {
            return TransferServicesList;
        }
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
        //If there is no activity or no transaction on the counter
        if (!CurrentActivity || !CurrentTransaction) {
            return TransferServicesList;
        }

        UserConfig = configurationService.getUserConfig(CurrentActivity.user_ID);
        let AllocationType = configurationService.getCommonSettings(branchID, constants.ServiceAllocationTypeKey);
        //Allow different segments
        let DifferentSegmentTransferEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_INTER_SEGMENT_TRANSFER);
        let allocated_Queue = getAllocatedEntitiesOnEntity(BranchConfig, counterID, CurrentActivity.user_ID, AllocationType);
        //Get The workFlow
        let service_ID = CurrentTransaction.service_ID;
        let CurrentServiceWorkflow = getWorkFlow(branchID, service_ID);
        let isSegmentAllocatedOnServingEntity = isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, CurrentTransaction.segment_ID, AllocationType);

        let Unlocated_Services = configurationService.configsCache.services.filter(function (service) {
            return allocated_Queue.indexOf(service.ID) < 0;
        });

        for (let index = 0; index < Unlocated_Services.length; index++) {
            let TempService = Unlocated_Services[index];
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
            let segments = configurationService.getSegmentsOnService(serviceID);
            if (segments) {
                segments = segments.filter(function (segment) {
                    return isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, segment.ID, AllocationType);
                });
            }
            if (!segments) return false;
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
        //If there is no activity or no transaction on the counter
        if (!CurrentActivity || !CurrentTransaction) {
            return AddServicesList;
        }

        //Get Max Number Of add
        let MaxRequestsPerAddedService = getMaxNumberOfAddedServices(branchID);
        let AllocationType = configurationService.getCommonSettings(branchID, constants.ServiceAllocationTypeKey);
        UserConfig = configurationService.getUserConfig(CurrentActivity.user_ID);
        let allocated_Queue = getAllocatedEntitiesOnEntity(BranchConfig, counterID, CurrentActivity.user_ID, AllocationType);
        let isSegmentAllocatedOnServingEntity = isSegmentAllocated(BranchConfig, CurrentCounter, UserConfig, CurrentTransaction.segment_ID, AllocationType);

        //Get The workFlow
        let current_service_ID = CurrentTransaction.service_ID;
        let current_ServiceWorkflow = getWorkFlow(branchID, current_service_ID);
        let ServiceAvailableActions = getServiceAvailableActions(branchID, current_service_ID);
        if (ServiceAvailableActions.AllowAddingFromAnother && current_ServiceWorkflow.IsAddServiceEnabled && allocated_Queue) {
            for (let index = 0; index < allocated_Queue.length; index++) {
                let serviceID = allocated_Queue[index];
                let t_isServiceValidForAddition = isServiceValidForAddition(BranchConfig, CurrentCounter,
                    UserConfig, current_service_ID, CurrentTransaction.segment_ID, current_ServiceWorkflow,
                    serviceID, isSegmentAllocatedOnServingEntity, AllocationType, MaxRequestsPerAddedService);
                if (t_isServiceValidForAddition) {
                    AddServicesList.push(serviceID);
                }
            }
        }
        return AddServicesList;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function IsTransferBackAllowedForCounter(branchID, CurrentTransaction) {

    let t_IsTransferBackAllowedForCounter = false;
    //Check if the employee has the service and he is logged in a counter
    if (CurrentTransaction.TransferredByWinID == "" && CurrentTransaction.TransferredFromServiceID == "") {
        t_IsTransferBackAllowedForCounter = false;
    }
    if (CurrentTransaction.TransferredByWinID != "" && CurrentTransaction.TransferredFromServiceID != "") {
        //If these two was filled that means that the service should be allocated on the counter to allow the return
        let allocatedCounters = getAllocatedServingCounters(branchID, CurrentTransaction.TransferredFromServiceID)
        if (allocatedCounters && allocatedCounters.indexOf(CurrentTransaction.TransferredByWinID) >= 0) {
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
    //Check if the employee has the service and he is logged in a counter
    if (CurrentTransaction.TransferredByEmpID == "" && CurrentTransaction.TransferredFromServiceID == "") {
        t_IsTransferBackAllowedForUser = false;
    }
    if (CurrentTransaction.TransferredByEmpID != "" && CurrentTransaction.TransferredFromServiceID != "") {
        if (CurrentActivity) {
            //Get the counter that the user is on
            let State = CurrentActivity.type;
            let InvalidStates = [enums.EmployeeActiontypes.InsideCalenderLoggedOff, enums.EmployeeActiontypes.OutsideCalenderLoggedOff]
            if (InvalidStates.indexOf(State) < 0) {
                //If these two was filled that means that the service should be allocated on the counter to allow the return
                let allocatedUsers = getAllocatedServingUsers(branchID, CurrentTransaction.TransferredFromServiceID)
                if (!allocatedUsers && allocatedUsers.indexOf(CurrentTransaction.TransferredByEmpID) >= 0) {
                    t_IsTransferBackAllowedForUser = true;
                }
            }
        }
    }
    else {
        t_IsTransferBackAllowedForUser = true;
    }
    return t_IsTransferBackAllowedForUser;
}
function IsTransferBackAllowed(orgID, branchID, counterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        //Check if the ticket was transferred
        if (!CurrentTransaction && !CurrentTransaction.TransferredByWinID && !CurrentTransaction.TransferredFromServiceID) {
            return false;
        }
        let AllocationType = configurationService.getCommonSettings(branchID, constants.SERVICE_ALLOCATION_TYPE);
        if (AllocationType == enums.AllocationTypes.Counter) {
            return IsTransferBackAllowedForCounter(branchID, CurrentTransaction);
        }
        else {
            return IsTransferBackAllowedForUser(branchID, CurrentActivity, CurrentTransaction);
        }
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

module.exports.PrepareTransferCountersList = PrepareTransferCountersList;
module.exports.PrepareAddList = PrepareAddList;
module.exports.PrepareTransferServicesList = PrepareTransferServicesList;
module.exports.IsTransferBackAllowed = IsTransferBackAllowed;
module.exports.getAllocatedCountersOnSegment = getAllocatedCountersOnSegment;
module.exports.getAllocatedUsersOnSegment = getAllocatedUsersOnSegment;
module.exports.getAllocatedCountersOnService = getAllocatedCountersOnService;
module.exports.getAllocatedUserssOnService = getAllocatedUserssOnService;
module.exports.getServiceAvailableActions = getServiceAvailableActions;
module.exports.getWorkFlow = getWorkFlow;