"use strict";
var logger = require("./common/logger");
var common = require("./common/common");
var Message = require('./dataMessage/message');
var communicationEndPoint = require('./communicationEndPoint')
var queueCommandManager = require("./qm/logic/queueCommandManager");
var externalDataRequestService = require("./qm/logic/externalDataRequestService");
var messages = [];
var started = false;

function newMessage(source) {
    try {
        var NewMessage = new Message();
        NewMessage.source = source;
        return NewMessage;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};


//Needed to create a replay where the message id is new and the correlationId is the same
function cloneWithNewID(message) {
    try {
        var NewMessage = new Message();
        NewMessage.source = message.source;
        NewMessage.correlationId = message.correlationId;
        NewMessage.topicName = message.topicName;
        NewMessage.payload = message.payload;
        return NewMessage;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

function sendReply(message) {
    try {
        var newMessage = cloneWithNewID(message);
        queueMessage(newMessage);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

function sendToModule(message) {
    try {
        //Send to Queuing
        if (message.topicName.startsWith(queueCommandManager.ModuleName)) {
            queueCommandManager.processCommand(message);
        }
        //Send to External Data
        if (message.topicName.startsWith(externalDataRequestService.ModuleName)) {
            externalDataRequestService.getData(message);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

function queueMessage(message) {
    try {
        var existedMessage = messages.find(function (msg) { return msg.messageID == message.messageID });
        if (existedMessage) {
            //If newer remove the old one and pusgh the new
            if (existedMessage.time < Message.time) {
                messages = messages.filter(function (msg) { return msg.messageID != message.messageID });
            }
        }
        messages.push(message);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

function processMessage(message) {
    try {
        //If the source was * then it is a broadcase
        if (message.source == "*") {
            communicationEndPoint.broadcastMessage(message);
            return common.success;
        };
        //If the ID not the same as the correlationId then it is a reply return to source
        if (message.messageID != message.correlationId) {
            communicationEndPoint.sendToClient(message);
            return common.success;
        };

        //Send to carrossopnding module
        sendToModule(message);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//check the queue for messages
function checkMessages() {
    try {
        while (messages && messages.length > 0) {
            processMessage(messages[messages.length - 1]);
            messages = messages.slice(0, -1);
        };
    }
    catch (error) {
        logger.logError(error);
    }
};

function initialize() {
    try {
        if (!started) {
            messages = [];
            setInterval(checkMessages, 2000);
            started = true;
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.initialize = initialize;
module.exports.queueMessage = queueMessage;
module.exports.sendReply = sendReply;
module.exports.newMessage = newMessage;
