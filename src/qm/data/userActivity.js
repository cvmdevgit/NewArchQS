var commonMethods = require("../../common/commonMethods");
const INT_NULL = null;
const TIME_NULL = 0;
const INT_ZERO = 0;

class userActivity {
    //don't add the login/logout activies. 
    constructor(user_activity) {

        if (user_activity) {
            this.clone(user_activity);
        }
        else {
            this.id = commonMethods.newDataID(); //Generate a negative number
            this.orgID = INT_NULL;
            this.queueBranch_ID = INT_NULL;

            this.activityType = INT_NULL;
            this.user_ID = INT_NULL;
            this.counter_ID = INT_NULL;
            this.startTime = TIME_NULL;
            this.endTime = TIME_NULL;
            this.lastChangedTime = TIME_NULL;
            this.duration = INT_ZERO;
            this.calendarDuration = INT_ZERO;
            this.closed = INT_ZERO;
            this._RequestID = INT_ZERO;
            this._backup = INT_NULL;
        }
    }

    clone(DB_user_activity) {
        this.id = Number(DB_user_activity.id);
        this.orgID = Number(DB_user_activity.orgID);
        this.queueBranch_ID = Number(DB_user_activity.queueBranch_ID);
        this.activityType = Number(DB_user_activity.activityType);
        this.user_ID = DB_user_activity.User_ID > 0 ? Number(DB_user_activity.user_ID) : -1;
        this.counter_ID = DB_user_activity.counter_ID > 0 ? Number(DB_user_activity.counter_ID) : -1;
        this.startTime = DB_user_activity.startTime;
        this.endTime = DB_user_activity.endTime;
        this.lastChangedTime = DB_user_activity.lastChangedTime;
        this.duration = DB_user_activity.duration > 0 ? Number(DB_user_activity.duration) : 0;
        this.calendarDuration = DB_user_activity.calendarDuration > 0 ? Number(DB_user_activity.calendarDuration) : 0;
        this.closed = Number(DB_user_activity.closed);
        this._RequestID = INT_ZERO;
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
module.exports = userActivity;


