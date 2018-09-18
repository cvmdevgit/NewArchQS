var EventEmitter = require('events');
class EmitterClass extends EventEmitter { }
var broadcastMessage = new EmitterClass();




module.exports.broadcastMessage = broadcastMessage;


