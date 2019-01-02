var EventEmitter = require('events');
class EmitterClass extends EventEmitter { }
var broadcastMessage = new EmitterClass();
var serviceStatusChange = new EmitterClass();

module.exports.serviceStatusChange = serviceStatusChange;
module.exports.broadcastMessage = broadcastMessage;


