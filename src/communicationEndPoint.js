"use strict";
var logger = require("./common/logger");
var common = require("./common/common");
var Message = require('./dataMessage/message');
var localMessagingService = require('./localMessagingService');
var io = require('socket.io')();
var client = require('./client');
var clients = [];






//Send the reply to specific client
function sendToClient(message) {
  try {
    //get the correponding Client
    var tClient = clients.find(function (pClient) {
      return pClient.id == message.source
    });

    if (tClient) {
      //Prepare the message
      let tmpMessage = new Message();
      tmpMessage.source = message.source;
      tmpMessage.correlationId = message.correlationId;
      tmpMessage.topicName = message.topicName;
      tmpMessage.payload = message.payload;
      tClient.socket.emit('message-from-server', tmpMessage);
    }

    return common.success;
  }
  catch (error) {
    logger.logError(error);
    return common.error;
  }
};

//Broadcast the message of updates
function broadcastMessage(message) {
  try {
    let tmpMessage = new Message();
    tmpMessage.source = "*";
    tmpMessage.correlationId = message.messageID;
    tmpMessage.topicName = message.topicName;
    tmpMessage.payload = message.payload;
    io.emit('message-from-server', tmpMessage);
    return common.success;
  }
  catch (error) {
    logger.logError(error);
    return common.error;
  }
};


function initialize(server) {
  try {
    localMessagingService.initialize();
    io.attach(server);
    io.on('connection', function (socket) {
      //Register the client to reach it if needed
      var address = socket.handshake.address;
      var tClient = new client(address, socket);
      clients.push(tClient);

      console.log("Client " + address + " Broadcast Connected");
      //Send the client id to the client to be used
      socket.emit("registered", tClient.id);
      //Recieve Client message
      socket.on('message-from-client', function (msg) {
        console.log('message recieved,source=' + msg.source + ' >>>>>>> topicName= ' + msg.topicName);
        console.log("");
        localMessagingService.queueMessage(msg);
      });
      socket.on('disconnect', function () {
        //Remove from the collection
        clients = clients.filter(function (pClient) {
          return pClient.id !== socket.id
        });
      });
    });
    return common.success;
  }
  catch (error) {
    logger.logError(error);
    return common.error;
  }
};



module.exports.initialize = initialize;
module.exports.broadcastMessage = broadcastMessage;
module.exports.sendToClient = sendToClient;

