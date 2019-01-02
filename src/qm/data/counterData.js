var AvailableActions = require("../data/availableActions");
class counterData {
    constructor() {
        this.id;
        this.lockState;             //UnLocked = 0, TimeLock = 1, PermanentLock = 2, GlobalLockSetting = 3, TimeUnlock = 4, NextTimeLock = 5
        this.lockStateTime;
        this.currentState;      //this is a state and the user used in, can be replaced by current user ID and state
        this.currentTransaction;  //the transaction serving
        this.availableActions = new AvailableActions();
        this.allocatedServices = [];
        this.allocatedSegments = [];

        //Check Changed Properities
        this._CheckSum = "";
    }
}
module.exports = counterData;
