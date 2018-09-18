const INT_ZERO = 0;
const INT_NULL = -1;
class statisticsData {
    constructor() {
        this.id = INT_NULL;
        this.branch_ID = INT_NULL;
        this.segment_ID = INT_NULL;
        this.hall_ID = INT_NULL;
        this.counter_ID = INT_NULL;
        this.user_ID = INT_NULL;
        this.service_ID = INT_NULL;


        this.WaitingCustomers = INT_ZERO;
        this.AvgServiceTime = INT_ZERO;
        this.ASTWeight = INT_ZERO;
        this.AvgWaitingTime = INT_ZERO;
        this.TotalServiceTime = INT_ZERO;
        this.TotalWaitingTime = INT_ZERO;
        this.StatisticsDate = INT_ZERO;
        this.ServedCustomersNo = INT_ZERO;
        this.WaitedCustomersNo = INT_ZERO;
        this.NoShowCustomersNo = INT_ZERO;
        this.NonServedCustomersNo = INT_ZERO;

        //this.SentToServer;

    }
}
module.exports = statisticsData;

