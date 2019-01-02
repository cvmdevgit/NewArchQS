const INT_ZERO = 0;
const INT_NULL = -1;
class statisticsData {
    constructor() {
        this.id = INT_NULL;
        this.queueBranch_ID = INT_NULL;
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
        this._RequestID = INT_ZERO;
        this._backup = INT_NULL;
    }
    clone(statisticsData) {
        this.id = statisticsData.id;
        this.queueBranch_ID = statisticsData.queueBranch_ID;
        this.segment_ID = statisticsData.segment_ID;
        this.hall_ID = statisticsData.hall_ID;
        this.counter_ID = statisticsData.counter_ID;
        this.user_ID = statisticsData.user_ID;
        this.service_ID = statisticsData.service_ID;


        this.WaitingCustomers = statisticsData.WaitingCustomers;
        this.AvgServiceTime = statisticsData.AvgServiceTime;
        this.ASTWeight = statisticsData.ASTWeight;
        this.AvgWaitingTime = statisticsData.AvgWaitingTime;
        this.TotalServiceTime = statisticsData.TotalServiceTime;
        this.TotalWaitingTime = statisticsData.TotalWaitingTime;
        this.StatisticsDate = statisticsData.StatisticsDate;
        this.ServedCustomersNo = statisticsData.ServedCustomersNo;
        this.WaitedCustomersNo = statisticsData.WaitedCustomersNo;
        this.NoShowCustomersNo = statisticsData.NoShowCustomersNo;
        this.NonServedCustomersNo = statisticsData.NonServedCustomersNo;
        this._RequestID = statisticsData._RequestID;
    }
    backup()
    {
        this._backup = new userActivity(this);
    }
    rollback()
    {
        if (this._backup)
        {
            clone(this._backup);
        }
    }
}
module.exports = statisticsData;

