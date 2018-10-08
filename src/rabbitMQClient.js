var logger = require("./common/logger");
var common = require("./common/common");
var commonMethods = require("./common/commonMethods");
var amqp = require('amqplib/callback_api');

const EventEmitter = require('events');
class EmitterClass extends EventEmitter { }
var QS_EXCHANGE = 'QS_EXCHANGE';
var channels = [];
let RabbitMQconnection;


class rabbitMQClient {
    constructor(queueName, Topics) {
        this.id = commonMethods.guid().substring(3, 10)
        this.SubscribTopics = Topics;
        this.RPC_Queue = queueName;
        this.RPC_Queue_Reply = queueName + "_Reply_" + this.id;
        this.RPC_Queue_Listener = queueName + "_BroadcastListener_" + this.id;
        this.connection;
        this.channel;
        this.MessageRecieveEmitter = new EmitterClass();
        //Generate Channel Key
        this.keysString = "";
        if (Topics && Topics.length > 0) {
            this.keysString = Topics.join(",");
        }
    }

    //Create a consumer for the replies on this client
    async RecieveReplies() {
        let that = this;
        that.channel = channels.find(function (x) {
            return x.key == that.RPC_Queue + "_" + that.keysString
        }).value;
        that.channel.assertQueue(that.RPC_Queue_Reply, {
            durable: false, autoDelete: true, exclusive: true, arguments: {
                "x-message-ttl": 2000
            }
        }, async function (err, q) {
            that.channel.consume(that.RPC_Queue_Reply, function (msg) {
                that.MessageRecieveEmitter.emit('event', msg.properties.correlationId, msg.content.toString());
            }, { noAck: true });
        });
    }

    //Handle the channels and creation
    async setConnection() {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let channelItem = channels.find(function (x) {
                    return x.key == (that.RPC_Queue + "_" + that.keysString);
                });
                if (!channelItem) {
                    amqp.connect(common.settings.RabbitMQconnection, function (err, conn) {
                        conn.createChannel(function (err, ch) {
                            ch.assertExchange(QS_EXCHANGE, 'topic', { durable: false })
                            ch.assertQueue(that.RPC_Queue, { durable: false });
                            ch.assertQueue(that.RPC_Queue_Listener, { durable: false, autoDelete: true });
                            if (that.SubscribTopics && that.SubscribTopics.length > 0) {
                                for (let i = 0; i < that.SubscribTopics.length; i++) {
                                    ch.bindQueue(that.RPC_Queue_Listener, QS_EXCHANGE, that.SubscribTopics[i]);
                                }
                            }
                            ch.prefetch(1);
                            console.log('initialized');
                            that.connection = conn;
                            that.channel = ch;
                            channels.push({
                                key: (that.RPC_Queue + "_" + that.keysString),
                                value: ch

                            });
                            that.RecieveReplies();
                            resolve(common.success);
                        });
                    });
                }
                else {
                    that.channel = channelItem.value
                    resolve(common.success);
                }

            }
            catch (error) {
                logger.logError(error);
                resolve(common.error);
            }
        });
    }

    //Recieve the messages from topics and process it using the function
    async receive(ProcessMessageFunction) {
        let that = this;
        await this.setConnection();

        return new Promise(function (resolve, reject) {
            try {
                that.channel.consume(that.RPC_Queue, async function sendReply(msg) {
                    try {
                        let payloadBytes = msg.content;
                        let payload = JSON.parse(payloadBytes.toString());
                        console.log("Recieve request and send the reply");
                        await ProcessMessageFunction(payload);
                        that.channel.sendToQueue(msg.properties.replyTo,
                            new Buffer(JSON.stringify(payload)),
                            { correlationId: msg.properties.correlationId });

                        that.channel.ack(msg);
                        resolve(common.success);
                    }
                    catch (error) {
                        that.channel.sendToQueue(msg.properties.replyTo,
                            new Buffer(JSON.stringify("")),
                            { correlationId: msg.properties.correlationId });

                        that.channel.ack(msg);
                        logger.logError(error);
                        resolve(common.error);
                    }
                });
                that.channel.consume(that.RPC_Queue_Listener, async function sendReply(msg) {
                    try {
                        let payloadBytes = msg.content;
                        let payload = JSON.parse(payloadBytes.toString());
                        console.log("Recieve request and send the reply");
                        await ProcessMessageFunction(payload);
                        that.channel.sendToQueue(msg.properties.replyTo,
                            new Buffer(JSON.stringify(payload)),
                            { correlationId: msg.properties.correlationId });

                        that.channel.ack(msg);
                        resolve(common.success);
                    }
                    catch (error) {
                        that.channel.sendToQueue(msg.properties.replyTo,
                            new Buffer(JSON.stringify("")),
                            { correlationId: msg.properties.correlationId });

                        that.channel.ack(msg);
                        logger.logError(error);
                        resolve(common.error);
                    }
                });
            }
            catch (error) {
                logger.logError(error);
                resolve(common.error);
            }
        });
    };

    //Send to queue and wait for reply
    async send(QueueName, Message, Reply) {
        try {
            let that = this;
            await this.setConnection();
            return new Promise(function (resolve, reject) {
                try {
                    //Get the needed channel
                    that.channel = channels.find(function (x) {
                        return x.key == that.RPC_Queue + "_" + that.keysString
                    }).value;

                    //Function to handle the comming events
                    let random_correlationId = commonMethods.guid();
                    var handleReply = function (correlationId, msg) {
                        if (correlationId == random_correlationId) {
                            Reply.push(msg);
                            that.MessageRecieveEmitter.removeListener('event', handleReply);
                            resolve(common.success);
                        }
                    }

                    //Add handler to the recieve event
                    that.MessageRecieveEmitter.on('event', handleReply);

                    //Send the message to queue
                    console.log("Send Request");
                    that.channel.sendToQueue(QueueName,
                        new Buffer(Message.toString()),
                        { correlationId: random_correlationId, replyTo: that.RPC_Queue_Reply });

                    //Fallback handling (Remove the handler and resolve the promise after 2 seconds)
                    var TimeoutHandler = function () {
                        that.MessageRecieveEmitter.removeListener('event', handleReply);
                        resolve(common.error);
                    }
                    setTimeout(TimeoutHandler, 2000);
                }
                catch (error) {
                    logger.logError(error);
                    resolve(common.error);
                }

            });
        } catch (error) {
            logger.logError(error);
            resolve(common.error);
        }
    };

    async sendBroadcast(Topic, Message) {
        try {
            let that = this;
            await this.setConnection();
            return new Promise(function (resolve, reject) {
                try {
                    that.channel.publish(QS_EXCHANGE, Topic, new Buffer(Message));
                    resolve(common.success);
                }
                catch (error) {
                    logger.logError(error);
                    resolve(common.error);
                }

            });
        } catch (error) {
            logger.logError(error);
            resolve(common.error);
        }
    };
    async close() {
        try {
            let that = this;
            return new Promise(function (resolve, reject) {
                try {
                    that.connection.close();
                    resolve(common.success);
                }
                catch (error) {
                    logger.logError(error);
                    resolve(common.error);
                }

            });
        } catch (error) {
            logger.logError(error);
            resolve(common.error);
        }
    };
}


module.exports = rabbitMQClient;