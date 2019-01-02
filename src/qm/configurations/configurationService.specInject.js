var common = require("../../common/common");
delete require.cache[require.resolve("../data/dataService")];
delete require.cache[require.resolve("../configurations/configurationService")];
var configurationService = require("./configurationService");
var fs = require("fs");
let str = fs.readFileSync("src/qm/logic/testingDataFiles/C1Serving_C2Serving_20Tickets.json")
async function initialize() {
    common.settings.mock = true;
    await configurationService.initialize();
}
module.exports.initialize = initialize;
module.exports.configurationService = configurationService;