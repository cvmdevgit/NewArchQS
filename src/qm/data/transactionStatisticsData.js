class transactionStatisticsData {
    constructor(transaction) {
        this.id = transaction.id;
        this.branch_ID = transaction.branch_ID;
        this.segment_ID = transaction.segment_ID;
        this.hall_ID = transaction.hall_ID;
        this.counter_ID = transaction.counter_ID;
        this.user_ID = transaction.user_ID;
        this.service_ID = transaction.service_ID;
        this.state = transaction.state;
        this.servingType = transaction.servingType;
        this.waitingSeconds = transaction.waitingSeconds;
        this.serviceSeconds = transaction.serviceSeconds;
    }
}
module.exports = transactionStatisticsData;