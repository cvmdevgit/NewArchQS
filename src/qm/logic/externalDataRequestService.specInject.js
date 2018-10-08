var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
var rewire = require("rewire");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var dataService = require("../data/dataService");
var configurationService = require("../configurations/configurationService");
var statisticsManager = rewire("./statisticsManager");
var dataService = require("../data/dataService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var entitiesRepo = repositoriesManager.entitiesRepo;
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json");
var sinon = require('sinon');
const OrgID = "1";
const BranchID = "106";
var branches_statisticsData; 
//override the commit function on the repo manager
sinon.stub(repositoriesManager, 'commit').callsFake(async function () {
    try {
        return ;
    }
    catch (error) {
        console.log(error);
    }
});
//Override the get transactions function from sql
sinon.stub(entitiesRepo, 'getAll').callsFake(async function () {
    try {
        let Now = new Date();
        let BranchData = dataService.getBranchData(OrgID, BranchID);
        BranchData.transactionsData.forEach(function(trans){
            trans.creationTime = Now;
        }); 
        return BranchData.transactionsData;
    }
    catch (error) {
        console.log(error);
    }
});

//Override clear from repo
sinon.stub(entitiesRepo, 'clear').callsFake(async function () {
    try {
        return;
    }
    catch (error) {
        console.log(error);
    }
});
//Override the clear entities from repo
sinon.stub(entitiesRepo, 'clearEntities').callsFake(async function () {
    try {
        return;
    }
    catch (error) {
        console.log(error);
    }
});

async function initialize() {
    await configurationService.initialize();
    statisticsManager.__set__('configurationService', configurationService);
    branches_statisticsData = statisticsManager.__get__('branches_statisticsData');
    let OrgData = JSON.parse(str);
    while (dataService.organizationsData.length > 0) {
        dataService.organizationsData.pop();
    }
    OrgData.forEach(function (Branch) {
        dataService.organizationsData.push(Branch);
    });
    if (!branches_statisticsData || branches_statisticsData.length == 0)
    {
        result = await statisticsManager.initialize();
        branches_statisticsData = statisticsManager.__get__('branches_statisticsData');
    }
    else
    {
        statisticsManager.__set__('branches_statisticsData',branches_statisticsData);
    }
}

module.exports.initialize = initialize;
module.exports.statisticsManager = statisticsManager;