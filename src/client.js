class client {
    constructor(pAddress,pSocket) {
        this.id = pSocket.id
        this.address=pAddress;
        this.socket=pSocket;
    }
}

module.exports = client;