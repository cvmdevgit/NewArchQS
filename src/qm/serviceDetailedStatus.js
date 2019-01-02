var commonMethods = require("../common/commonMethods");
var enums = require("../common/enums");
class serviceDetailedStatus {
    constructor() {
        this.id = commonMethods.guid();
        this.time = commonMethods.Now();
        this.source = "";
        this.status = enums.ServiceStatuses.Unknown;
        this.errorCode = enums.ServiceErrorCodes.NoErrors;
    }
}
module.exports = serviceDetailedStatus;
