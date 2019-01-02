
var queueCommandManager = require("./logic/queueCommandManager");
var externalDataRequestService = require("./logic/externalDataRequestService");
var backgroundQSManager = require("./logic/backgroundQSManager");
var RabbitMQClient = require("../rabbitMQClient");
var logger = require("../common/logger");
var common = require("../common/common");
var events = require("../common/events");
var Keys = [(queueCommandManager.ModuleName + ".*")];
var QueueName = queueCommandManager.ModuleName;

var externaKeys = [(externalDataRequestService.ModuleName + ".*")];
var externalDataQueueName = externalDataRequestService.ModuleName;

let QueuingrabbitMQClient = new RabbitMQClient(QueueName, Keys);
let externalDatarabbitMQClient = new RabbitMQClient(externalDataQueueName, externaKeys);

//Start listening to Queuing Queue
async function initialize() {
    try {
        let result = common.error;
        //Handle the request on recieve with QS module
        result = QueuingrabbitMQClient.receive(processQueuingRequest);
        //Handle the request on recieve with External Module
        result = externalDatarabbitMQClient.receive(processExternalDataRequest);
        //Add handler to the broadcast message
        events.broadcastMessage.on('broadcast', broadcastMessage);
        result = await queueCommandManager.initialize();
        result = (result == common.success) ?  await backgroundQSManager.startBackgroundActions() : result;
        return result;
    }
    catch (error) {
        logger.log(error);
        return common.error;
    }
}

//Process the request for Queung command module (Commands)
async function processQueuingRequest(request, reply) {
    let result = common.error;
    try {
        result = await queueCommandManager.processCommand(request);
        reply = request;
        return result;
    }
    catch (error) {
        logger.log(error);
        return result;
    }
};

//Process the request for external data module (Read module)
async function processExternalDataRequest(request, reply) {
    let result = common.error;
    try {
        result = await externalDataRequestService.getData(request);
        reply = request;
        return result;
    }
    catch (error) {
        logger.log(error);
        return result;
    }
};

//broadcast Message
async function broadcastMessage(broadcastTopic, request) {
    let result = common.error;
    try {
        await QueuingrabbitMQClient.sendBroadcast(broadcastTopic, JSON.stringify(request));
        return result;
    }
    catch (error) {
        logger.log(error);
        return result;
    }
};


module.exports.initialize = initialize;
module.exports.processQueuingRequest = processQueuingRequest;
module.exports.broadcastMessage = broadcastMessage;