var common = require("../../common/common");
class sqlResult {
    constructor() {
        this.result = common.error;
        this.affected = 0
        this.recordsets = null;
        this.errorMessage = "";
    }
}
module.exports = sqlResult;