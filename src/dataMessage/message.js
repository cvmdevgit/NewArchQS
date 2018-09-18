var commonMethods = require("../common/commonMethods");
class message {
    constructor() {
        this.time = Date.now();
        this.messageID = commonMethods.guid();
        this.source = "";
        this.correlationId = "";
        this.topicName = "";
        this.payload = "";
    }
}
module.exports = message;