var common = require("../../common/common");
class messagePayload {
    constructor() {
        this.result = common.error;
        this.errorCode = "";
        this.countersInfo = [];
        this.transactionsInfo = [];
        this.statisticsInfo = [];
    }
}
module.exports = messagePayload;