var commonMethods = require("../common/commonMethods");
var enums = require("../common/enums");
class serviceStatus {
    constructor() {
        this.status = enums.ServiceStatuses.Unknown;
        this.details = [];
    }
}
module.exports = serviceStatus;
