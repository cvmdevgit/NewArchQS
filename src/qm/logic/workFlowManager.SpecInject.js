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

var setCommonSettings = function (BranchID, Key, value) {
    try {
        //Get Branch Data
        let BracnhConfig = configurationService.getBranchConfig(BranchID);

        if (BracnhConfig) {
            let commonConfig = BracnhConfig.settings.find(function (value) {
                return value.Key == Key;
            });

            if (commonConfig) {
                commonConfig.Value = value;
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
};

async function initialize() {
    await configurationService.initialize();
    let OrgData = JSON.parse(str);
    while (dataService.organizationsData.length > 0) {
        dataService.organizationsData.pop();
    }
    OrgData.forEach(function (Branch) {
        dataService.organizationsData.push(Branch);
    });
}
function setInvalidWorkFlow(branchID, service_ID) {
    //Set XML to invalid workflow
    let workflowRecord = configurationService.configsCache.serviceWorkFlow.find(function (Item) {
        return Item.QueueBranch_ID == branchID && Item.Service_ID == service_ID;
    });
    workflowRecord.Workflow = "12312312@#$@#$";
    workflowRecord.WorkflowObject = undefined;
}
function setCounterToBreak(orgID, branchID, counterID) {
    let output = [];
    let CounterData;
    let CurrentActivity;
    let CurrentTransaction;
    dataService.getCurrentData(orgID, branchID, counterID, output);
    CounterData = output[1];
    CurrentActivity = output[2];
    CurrentTransaction = output[3];
    CounterData.currentState.type = enums.UserActiontypes.Break;
}
function removeTransaction(orgID, branchID, counterID) {
    let output = [];
    let CounterData;
    let CurrentActivity;
    let CurrentTransaction;
    dataService.getCurrentData(orgID, branchID, counterID, output);
    CounterData = output[1];
    CurrentActivity = output[2];
    CurrentTransaction = output[3];
    CounterData.currentTransaction = undefined;
}
function removeAllCountersTransaction(orgID, branchID, counterID) {
    let BranchData = dataService.getBranchData(orgID, branchID);
    BranchData.countersData.filter(function (counter) {
        if (counter.id != counterID) {
            counter.currentTransaction = undefined;
        }
    });

}
function setSameHallParameters(branchID, value) {
    setCommonSettings(branchID, constants.STRICT_TRANSFER_COUNTER_TO_SAME_HALLS, value);
}
function setRestrictToOpenCountersOnly(branchID, value) {
    setCommonSettings(branchID, constants.STRICT_TRANSFER_COUNTER_TO_OPEN_COUNTERS_ONLY, value);
}
function setOtherCounterTohalls(orgID, branchID, counterID) {
    let Counter = configurationService.getCounterConfig(counterID);
    let halls = configurationService.configsCache.halls.filter(function (hall) {
        return Counter.Hall_ID != hall.ID;
    });
    let counterBranches = configurationService.getBranchCountersConfig(branchID);
    counterBranches.filter(function (counter) {
        if (counter.ID != counterID) {
            counter.Hall_ID = halls[0].ID;
        }
    });

}
function removeSegmentAllocationFromOtherCounters(orgID, branchID, counterID) {
    let counterBranches = configurationService.getBranchCountersConfig(branchID);
    counterBranches.filter(function (counter) {
        if (counter.ID != counterID) {
            counter.SegmentAllocationType = enums.SegmentAllocationType.Customize;
        }
    });
}
function removeSegmentAllocationFromCounter(orgID, branchID, counterID) {
    let counterBranches = configurationService.getBranchCountersConfig(branchID);
    counterBranches.filter(function (counter) {
        if (counter.ID == counterID) {
            counter.SegmentAllocationType = enums.SegmentAllocationType.Customize;
        }
    }
    );
    let BracnhConfig = configurationService.getBranchConfig(branchID);
    BracnhConfig.segmentsAllocations.filter(function (allocation) {
        if (allocation.Counter_ID == counterID) {
            allocation.Counter_ID = -1;
        }
    });
}
function removeAllAllocatedServices(orgID, branchID, counterID) {
    let BracnhConfig = configurationService.getBranchConfig(branchID);
    BracnhConfig.servicesAllocations = BracnhConfig.servicesAllocations.filter(function (allocation) {
        return allocation.Counter_ID != counterID;
    })
}
function SetAddThisToAnotherService(orgID, branchID, Service_ID, Enable) {
    let service = configurationService.getService(Service_ID);
    service.AddThisToAnotherService = Enable;
}
function SetAddAnotherToThisService(orgID, branchID, Service_ID, Enable) {
    let service = configurationService.getService(Service_ID);
    service.AddAnotherToThisService = Enable;
}


function removeServicesAllocationFromOtherCounter(orgID, branchID, counterID) {
    let BracnhConfig = configurationService.getBranchConfig(branchID);
    BracnhConfig.servicesAllocations.filter(function (allocation) {
        if (allocation.Counter_ID != counterID) {
            allocation.Counter_ID = -1;
        }
    })
}
function setEnableInterSegmentTransfer(branchID, value) {
    setCommonSettings(branchID, constants.ENABLE_INTER_SEGMENT_TRANSFER, value);
}

function setAllTransactionsToserving(orgID, branchID) {
    let BranchData = dataService.getBranchData(orgID, branchID);
  
    BranchData.transactionsData[0].state=enums.StateType.Serving;
    BranchData.transactionsData[1].state=enums.StateType.Serving;
    BranchData.transactionsData[2].state=enums.StateType.Serving;
    BranchData.transactionsData[3].state=enums.StateType.Serving;
    BranchData.transactionsData[4].state=enums.StateType.Serving;
    BranchData.transactionsData[5].state=enums.StateType.Serving;
}

function setServiceMaxNumberOfcounter(WorkFlowManager, branchID,service_ID,MaxCounterNumber) {
    let Workflow = WorkFlowManager.getWorkFlow(branchID, service_ID);
    let workflowRecord = configurationService.configsCache.serviceWorkFlow.find(function (Item) {
        return Item.QueueBranch_ID == branchID && Item.Service_ID == service_ID;
    });

    Workflow.EnableLimitMaxCounter = "1";
    Workflow.MaxCounterNumber = MaxCounterNumber;

    workflowRecord.WorkflowObject =Workflow;
}


module.exports.setAllTransactionsToserving = setAllTransactionsToserving;
module.exports.setServiceMaxNumberOfcounter = setServiceMaxNumberOfcounter;
module.exports.setRestrictToOpenCountersOnly = setRestrictToOpenCountersOnly;
module.exports.setEnableInterSegmentTransfer = setEnableInterSegmentTransfer;
module.exports.removeServicesAllocationFromOtherCounter = removeServicesAllocationFromOtherCounter;
module.exports.SetAddAnotherToThisService = SetAddAnotherToThisService;
module.exports.SetAddThisToAnotherService = SetAddThisToAnotherService;
module.exports.removeAllAllocatedServices = removeAllAllocatedServices;
module.exports.removeAllCountersTransaction = removeAllCountersTransaction;
module.exports.removeSegmentAllocationFromCounter = removeSegmentAllocationFromCounter;
module.exports.removeSegmentAllocationFromOtherCounters = removeSegmentAllocationFromOtherCounters;
module.exports.setOtherCounterTohalls = setOtherCounterTohalls;
module.exports.setSameHallParameters = setSameHallParameters;
module.exports.initialize = initialize;
module.exports.setInvalidWorkFlow = setInvalidWorkFlow;
module.exports.removeTransaction = removeTransaction;
module.exports.setCounterToBreak = setCounterToBreak;
module.exports.dataService = dataService;
module.exports.configurationService = configurationService;

