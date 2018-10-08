//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var commonMethods = require("../../common/commonMethods");
var QueueBranch_Service_Config = require("./QueueBranch_Service_Config");
var configRepository = require("../remoteRepositories/configRepository");
var ConfigsWrapper = require("./ConfigsWrapper");
var serverCommunication = require("../ServerCommunicationInterface/serverCommunication");
//var serverEndPoints = require("../ServerCommunicationInterface/serverEndPoints");
var keyValue = require("../ServerCommunicationInterface/keyValue");
var intialized = false;
var configsCache = new ConfigsWrapper();
var fs = require("fs");

var ReadCommands = {
    branch: "branch",
    counter: "counter",
    segment: "segment",
    service: "service",
    user: "user",
    hall: "hall",
    serviceSegmentPriorityRange: "servicesegmentpriorityrange"
};
function isArrayValid(ArrayOfEntities) {
    return ArrayOfEntities && ArrayOfEntities.length > 0;
}

function filterArray(ArrayOfEntities, BranchID) {
    let tArray = [];
    if (isArrayValid(ArrayOfEntities)) {
        tArray = ArrayOfEntities.filter(function (value) {
            return value.QueueBranch_ID.toString() == BranchID.toString();
        });
    }
    return tArray;
}

function find(ArrayOfEntities, EntityID) {
    let Entity;
    if (isArrayValid(ArrayOfEntities)) {
        Entity = ArrayOfEntities.find(function (value) {
            return value.ID.toString() == EntityID.toString();
        });
    }
    return Entity;
}

function filterCommonConfigs(ArrayOfEntities, BranchID, BranchConfigID) {
    if (isArrayValid(ArrayOfEntities)) {
        return ArrayOfEntities.filter(function (value) {
            return (value.BranchConfig_ID == null && value.QueueBranch_ID == null) || value.BranchConfig_ID == BranchConfigID || value.QueueBranch_ID == BranchID;
        });
    }
    return [];
}

//Populate branch cofigs
var populateEntities = async function () {
    try {

        if (isArrayValid(configsCache.branches)) {
            for (let i = 0; i < configsCache.branches.length; i++) {
                let BranchID = configsCache.branches[i].ID;
                let BranchConfigID = configsCache.branches[i].BranchConfig_ID;
                //Assign counters
                configsCache.branches[i].counters = filterArray(configsCache.counters, BranchID);
                //Branch Users Allocations
                configsCache.branches[i].usersAllocations = filterArray(configsCache.branch_UsersAllocations, BranchID);
                //Halls
                configsCache.branches[i].halls = filterArray(configsCache.halls, BranchID);
                //Segment Allocations
                configsCache.branches[i].segmentsAllocations = filterArray(configsCache.segmentsAllocations, BranchID);
                //Serives allocations
                configsCache.branches[i].servicesAllocations = filterArray(configsCache.servicesAllocations, BranchID);
                //commonConfigs
                configsCache.branches[i].settings = filterCommonConfigs(configsCache.commonConfigs, BranchID, BranchConfigID);
            }
        }
        fs.writeFileSync("Configs.json", JSON.stringify(configsCache));
        fs.writeFileSync("settings.json", JSON.stringify(common.settings));
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var getCommonSettings = function (BranchID, Key) {
    try {
        //Get Branch Data
        let BracnhConfig = configsCache.branches.find(function (value) {
            return value.ID == BranchID;
        }
        );

        if (BracnhConfig) {
            let commonConfig = BracnhConfig.settings.find(function (value) {
                return value.Key == Key;
            });

            if (commonConfig) {
                return commonConfig.Value;
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
};
var getCommonSettingsBool = function (BranchID, Key) {
    let TempString = getCommonSettings(BranchID, Key);
    if (TempString && TempString == "1") {
        return true;
    }
    return false;
};
var getCommonSettingsInt = function (BranchID, Key) {
    let TempString = getCommonSettings(BranchID, Key);
    if (TempString && TempString != "") {
        return parseInt(TempString);
    }
    return 0;
};

function getUserConfig(UserID) {
    //counter Config
    let counter = configsCache.users.find(function (value) {
        return value.ID == UserID;
    }
    );
    return counter;
}

function getCounterConfig(CounterID) {
    //counter Config
    let counter = configsCache.counters.find(function (value) {
        return value.ID == CounterID;
    }
    );
    return counter;
}

function getBranchConfig(BranchID) {
    //Branch Config
    var branch = configsCache.branches.find(function (value) {
        return value.ID == BranchID;
    });
    return branch;
}
function getBranchCountersConfig(BranchID) {
    //counter Config
    let counters = configsCache.counters.filter(function (value) {
        return value.QueueBranch_ID == BranchID;
    }
    );
    return counters;
}


/*eslint complexity: ["error", 100]*/
async function getBranchServiceAllocation(entities) {
    commonMethods.clearArray(entities);
    let tM_MEntities = [];
    let result = await getEntitiesFromServer("QueueBranch", "Service", [], [], tM_MEntities);
    if (tM_MEntities && tM_MEntities.length > 0) {
        for (let i = 0; i < tM_MEntities.length; i++) {
            let tBranch_Service = new QueueBranch_Service_Config()
            tBranch_Service.OrgID = tM_MEntities[i].OrgID;
            tBranch_Service.QueueBranch_ID = tM_MEntities[i].ObjectID1;
            tBranch_Service.Service_ID = tM_MEntities[i].ObjectID2;
            entities.push(tBranch_Service);
        }
    }
    return result;
}
async function GetBranchesAllocatedUsers(BranchID, entities) {
    let data = [];
    let result;
    commonMethods.clearArray(entities);
    //call server
    result = await serverCommunication.callGetBranchesUsersAPI(common.settings.OrgID, BranchID, data);
    if (result != common.error) {
        if (data && data.length > 0) {
            //Reutrn successful results
            Array.prototype.push.apply(entities, data[0]);
        }
    }
    else {
        entities = [];
        //Log error for the results
        let error = "Error getting data from server for Branch Allocated Users";
        logger.logError(error);
    }
    return result;
}
async function getEntitiesFilter(EntityClass, EntityTable, Filter, FilterValue) {
    let DBEntity = require("./" + EntityClass);
    let tDBEntity = new DBEntity();
    let attributes = Object.getOwnPropertyNames(tDBEntity);
    return await configRepository.GetByFilter(attributes, EntityTable, Filter, FilterValue);
}
async function getAllEntities(EntityClass, EntityTable) {
    let DBEntity = require("./" + EntityClass);
    let tDBEntity = new DBEntity();
    let attributes = Object.getOwnPropertyNames(tDBEntity);
    return await configRepository.GetAll(attributes, EntityTable);
}


//Cache Server Configs from DB
var cacheServerEnities = async function () {
    try {
        let result = common.error;
        result = await serverCommunication.initialize();
        if (result == common.success) {
            //Branches
            result = await getEntitiesFromServer("QueueBranch", "", [common.ActiveFilter], [common.Enable], configsCache.branches);
        }
        if (result == common.success) {
            //Counters
            result = await getEntitiesFromServer("Counter", "", [common.ActiveFilter], [common.Enable], configsCache.counters);
        }
        if (result == common.success) {
            //Halls
            result = await getEntitiesFromServer("Hall", "", [common.ActiveFilter], [common.Enable], configsCache.halls);
        }
        if (result == common.success) {
            //segments
            result = await getEntitiesFromServer("Segment", "", [common.ActiveFilter], [common.Enable], configsCache.segments);
        }
        if (result == common.success) {
            //services
            result = await getEntitiesFromServer("Service", "", [common.ActiveFilter], [common.Enable], configsCache.services);
        }
        if (result == common.success) {
            //services Config
            result = await getEntitiesFromServer("ServiceConfig", "", [], [], configsCache.serviceConfigs);
        }
        if (result == common.success) {
            //Service Segment Priority Range
            result = await getEntitiesFromServer("ServiceSegmentPriorityRange", "", [], [], configsCache.serviceSegmentPriorityRanges);
        }
        if (result == common.success) {
            //User Config
            result = await getEntitiesFromServer("User", "", [], [], configsCache.users);
        }
        if (result == common.success) {
            //Common Config
            result = await getEntitiesFromServer("CommonConfig", "", [], [], configsCache.commonConfigs);
        }
        if (result == common.success) {
            //PriorityRanges
            result = await getEntitiesFromServer("PriorityRange", "", [], [], configsCache.priorityRanges);
        }
        if (result == common.success) {
            //segments Allocate
            result = await getEntitiesFromServer("SegmentAllocation", "", [], [], configsCache.segmentsAllocations);
        }
        if (result == common.success) {
            //services Allocate
            result = await getEntitiesFromServer("ServiceAllocation", "", [], [], configsCache.servicesAllocations);
        }
        if (result == common.success) {
            //Service Workflow Config
            result = await getEntitiesFromServer("ServiceWorkflow", "", [], [], configsCache.serviceWorkFlow);
        }
        if (result == common.success) {
            //Special case since the many to many have same columns names
            result = await getBranchServiceAllocation(configsCache.branch_serviceAllocations);
        }
        if (result == common.success) {
            //User Allocation Config
            result = await GetBranchesAllocatedUsers("", configsCache.branch_UsersAllocations);
        }
        if (result == common.success) {
            result = await populateEntities();
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

async function getEntitiesFromServer(entity1, entity2, filterKeys, filterValues, entities) {
    try {
        let data = [];
        let filters = [];
        let result;
        commonMethods.clearArray(entities);

        //Add Filter values
        if (filterKeys && filterValues && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
            for (let i = 0; i < filterKeys.length; i++) {
                tentity1NameParameter = new keyValue();
                tentity1NameParameter.key = filterKeys[i];
                tentity1NameParameter.value = (filterValues[i]) ? filterValues[i].toString() : "";
                filters.push(tentity1NameParameter);
            }
        }

        //call server
        result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, entity1, entity2, filters, data);
        if (result != common.error) {
            if (data && data.length > 0) {
                //Reutrn successful results
                Array.prototype.push.apply(entities, data[0]);
            }
        }
        else {
            entities = [];
            //Log error for the results
            let error = "Error getting data from server for entity1Name=" + entity1;
            if (entity2 != "") {
                error += " and entity2Name=" + entity2;
            }
            logger.logError(error);
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function ReadCounters(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.counters = Cache.counters.filter(function (value) {
        return value.QueueBranch_ID == apiMessagePayLoad.BranchID && (!apiMessagePayLoad.types || apiMessagePayLoad.types.indexOf(value.Type_LV.toString()) > -1);
    });
    let ClientCounter_Config = require("./ClientConfigEntities/ClientCounter_Config");
    if (apiMessagePayLoad.counters) {
        apiMessagePayLoad.counters = apiMessagePayLoad.counters.map(counter => new ClientCounter_Config(counter));
    }
    return common.success;
}

function ReadServices(apiMessagePayLoad, Cache) {
    let servicesAllocations = Cache.branch_serviceAllocations.filter(function (value) {
        return value.QueueBranch_ID == apiMessagePayLoad.BranchID;
    });
    apiMessagePayLoad.services = Cache.services.filter(function (value) {
        for (let i = 0; i < servicesAllocations.length; i++) {
            if (servicesAllocations[i].Service_ID == value.ID) {
                return true;
            }
        }
        return false;
    });
    let ClientService_Config = require("./ClientConfigEntities/ClientService_Config");
    if (apiMessagePayLoad.services) {
        apiMessagePayLoad.services = apiMessagePayLoad.services.map(service => new ClientService_Config(service));
    }
    return common.success;
}
function ReadBranches(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.branches = Cache.branches.filter(function (branch) {
        return branch.OrgID == apiMessagePayLoad.orgid;
    });
    let ClientQueueBranch_config = require("./ClientConfigEntities/ClientQueueBranch_config");
    if (apiMessagePayLoad.branches) {
        apiMessagePayLoad.branches = apiMessagePayLoad.branches.map(branch => new ClientQueueBranch_config(branch));
    }
    return common.success;
}
function ReadServiceSegmentPriorityRanges(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.serviceSegmentPriorityRanges = Cache.serviceSegmentPriorityRanges.filter(function (serviceSegmentPriorityRange) {
        return serviceSegmentPriorityRange.OrgID == apiMessagePayLoad.orgid;
    });
    let ClientServiceSegmentPriorityRange_Config = require("./ClientConfigEntities/ClientServiceSegmentPriorityRange_Config");
    if (apiMessagePayLoad.serviceSegmentPriorityRanges) {
        apiMessagePayLoad.serviceSegmentPriorityRanges = apiMessagePayLoad.serviceSegmentPriorityRanges.map(serviceSegmentPriorityRange => new ClientServiceSegmentPriorityRange_Config(serviceSegmentPriorityRange));
    }
    return common.success;
}
function ReadSegments(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.segments = Cache.segments.filter(function (segment) {
        return segment.OrgID == apiMessagePayLoad.orgid;
    });
    let ClientSegment_Config = require("./ClientConfigEntities/ClientSegment_Config");
    if (apiMessagePayLoad.segments) {
        apiMessagePayLoad.segments = apiMessagePayLoad.segments.map(segment => new ClientSegment_Config(segment));
    }
    return common.success;
}

function ReadUsers(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.users = Cache.users.filter(function (user) {
        return user.OrgID == apiMessagePayLoad.orgid;
    });
    let ClientUser_Config = require("./ClientConfigEntities/ClientUser_Config");
    if (apiMessagePayLoad.users) {
        apiMessagePayLoad.users =  apiMessagePayLoad.users.map(user => new ClientUser_Config(user));
    }
    return common.success;
}
function ReadHalls(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.halls = Cache.halls.filter(function (hall) {
        return hall.OrgID == apiMessagePayLoad.orgid && hall.QueueBranch_ID == apiMessagePayLoad.BranchID;
    });
    let ClientHall_Config = require("./ClientConfigEntities/ClientHall_Config");
    if (apiMessagePayLoad.halls) {
        apiMessagePayLoad.halls = apiMessagePayLoad.halls.map(hall => new ClientHall_Config(hall));
    }
    return common.success;
}

var Read = function (apiMessagePayLoad) {
    try {
        if (apiMessagePayLoad) {
            switch (apiMessagePayLoad.EntityName.toLowerCase()) {
                case ReadCommands.branch:
                    return ReadBranches(apiMessagePayLoad, configsCache);
                case ReadCommands.counter:
                    return ReadCounters(apiMessagePayLoad, configsCache);
                case ReadCommands.segment:
                    return ReadSegments(apiMessagePayLoad, configsCache)
                case ReadCommands.service:
                    return ReadServices(apiMessagePayLoad, configsCache);
                case ReadCommands.hall:
                    return ReadHalls(apiMessagePayLoad, configsCache);
                case ReadCommands.user:
                    return ReadUsers(apiMessagePayLoad, configsCache);
                case ReadCommands.serviceSegmentPriorityRange:
                    return ReadServiceSegmentPriorityRanges(apiMessagePayLoad, configsCache);
                default:
                    return common.error;
            }
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var getServiceSegmentPriorityRange = function (SegmentID, ServiceID) {
    try {
        let serviceSegmentPriorityRange = configsCache.serviceSegmentPriorityRanges.find(function (value) {
            return value.Segment_ID == SegmentID && value.Service_ID == ServiceID;
        }
        );
        return serviceSegmentPriorityRange;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
};

var getSegmentsOnService = function (ServiceID) {
    let Segments;
    try {
        let serviceSegmentPriorityRanges = configsCache.serviceSegmentPriorityRanges.filter(function (value) {
            return value.Service_ID == ServiceID;
        }
        );
        if (serviceSegmentPriorityRanges) {
            let SegmentIDs = serviceSegmentPriorityRanges.map(PriorityRange => PriorityRange.Segment_ID);
            Segments = configsCache.segments.filter(function (value) {
                return SegmentIDs.indexOf(value.ID) > -1;
            }
            );
        }
        return Segments;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
};

var getService = function (ServiceID) {
    return find(configsCache.services, ServiceID);
};

var getServiceConfig = function (ServiceConfigID) {
    return find(configsCache.serviceConfigs, ServiceConfigID);
};

var getServiceConfigFromService = function (ServiceID) {
    try {
        //Get min service time
        let service = this.getService(ServiceID);

        //Get min service time
        let serviceConfig = this.getServiceConfig(service.ServiceConfig_ID);

        return serviceConfig;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};
function getMockingDataCache() {
    try {
        let str = fs.readFileSync("Configs.json")
        var FileconfigsCache = JSON.parse(str);

        configsCache.branches = FileconfigsCache.branches
        configsCache.counters = FileconfigsCache.counters
        configsCache.halls = FileconfigsCache.halls
        configsCache.segments = FileconfigsCache.segments
        configsCache.services = FileconfigsCache.services
        configsCache.serviceConfigs = FileconfigsCache.serviceConfigs
        configsCache.serviceSegmentPriorityRanges = FileconfigsCache.serviceSegmentPriorityRanges
        configsCache.users = FileconfigsCache.users
        configsCache.commonConfigs = FileconfigsCache.commonConfigs
        configsCache.priorityRanges = FileconfigsCache.priorityRanges
        configsCache.segmentsAllocations = FileconfigsCache.segmentsAllocations
        configsCache.servicesAllocations = FileconfigsCache.servicesAllocations
        configsCache.serviceWorkFlow = FileconfigsCache.serviceWorkFlow
        configsCache.branch_serviceAllocations = FileconfigsCache.branch_serviceAllocations
        configsCache.branch_UsersAllocations = FileconfigsCache.branch_UsersAllocations

        intialized = true;
    }
    catch (error) {
        logger.logError(error);
    }
};

var initialize = async function () {
    try {
        if (common.settings.mock) {
            getMockingDataCache();
            return common.success;
        }
        else {
            var result = await cacheServerEnities();
            //Retry on every 30 seconds
            if (result != common.success) {
                intialized = false;
                setTimeout(initialize, 30000);
            }
            else {
                intialized = true;
            }
            return result;
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.getBranchCountersConfig = getBranchCountersConfig;
module.exports.getCommonSettings = getCommonSettings;
module.exports.getCommonSettingsBool = getCommonSettingsBool;
module.exports.getCommonSettingsInt = getCommonSettingsInt;
module.exports.getSegmentsOnService = getSegmentsOnService;
module.exports.getServiceSegmentPriorityRange = getServiceSegmentPriorityRange;
module.exports.getUserConfig = getUserConfig;
module.exports.getCounterConfig = getCounterConfig;
module.exports.getBranchConfig = getBranchConfig;
module.exports.getService = getService;
module.exports.getServiceConfig = getServiceConfig;
module.exports.getServiceConfigFromService = getServiceConfigFromService;
module.exports.Read = Read;
module.exports.initialize = initialize;
module.exports.configsCache = configsCache;
