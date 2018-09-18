var common = require("../../common/common");
var logger = require("../../common/logger");
var requestPayload = require("./requestPayload");
var responsePayload = require("./responsePayload");

function setResponsePayload(message,result,errors,transactionsInfo,countersInfo,statisticsInfo)
{
    try{
        let payload = new responsePayload();
        payload.transactionsInfo=transactionsInfo;
        payload.countersInfo = countersInfo ;
        payload.statisticsInfo = statisticsInfo ;
        payload.result = result;
        if (payload.result != common.success) {
            payload.errorCode = errors.join(",");
        }
        message.payload=payload;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}
function getQSRequestObject(MessagePayload) {
    try {
        let t_requestPayload = new requestPayload();
        t_requestPayload.branchid = MessagePayload["branchid"];
        t_requestPayload.segmentid = MessagePayload["segmentid"];
        t_requestPayload.serviceid = MessagePayload["serviceid"];
        t_requestPayload.counterid = MessagePayload["counterid"];
        t_requestPayload.languageindex = MessagePayload["languageindex"];
        t_requestPayload.origin = MessagePayload["origin"];
        t_requestPayload.orgid = MessagePayload["orgid"];
        t_requestPayload.transactionid = MessagePayload["transactionid"];
        t_requestPayload.holdreasonid = MessagePayload["holdreasonid"];
        return t_requestPayload;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

module.exports.setResponsePayload = setResponsePayload;
module.exports.getQSRequestObject = getQSRequestObject;
