
var queueCommandManager = require("./logic/queueCommandManager");
var externalDataRequestService = require("./logic/externalDataRequestService");
var backgroundQSManager = require("./logic/backgroundQSManager");
var RabbitMQClient = require("../rabbitMQClient");
var logger = require("../common/logger");
var common = require("../common/common");
var events = require("../common/events");
var Keys = ["Queuing.*"];
var QueueName = "Queuing";


let rabbitMQClient = new RabbitMQClient(QueueName, Keys);
//Start listening to Queuing Queue
async function initialize() {
    await queueCommandManager.initialize();
    await backgroundQSManager.startBackgroundActions();
    rabbitMQClient.receive(processQueuingRequest);
    //Add handler to the broadcast message
    events.broadcastMessage.on('event', broadcastMessage);
}

//Process the request
async function processQueuingRequest(request, reply) {
    let result = common.error;
    try {
        if (request.topicName.startsWith(queueCommandManager.ModuleName)) {
            result = await queueCommandManager.processCommand(request);
            reply = request;
            return result;
        }
        if (request.topicName.startsWith(externalDataRequestService.ModuleName)) {
            result = await externalDataRequestService.getData(request);
            reply = request;
            return result;
        }
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
        await rabbitMQClient.sendBroadcast(broadcastTopic, JSON.stringify(request));
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