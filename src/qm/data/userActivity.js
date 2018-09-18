const INT_NULL = -1;
const TIME_NULL = 0;

class userActivity {
    //don't add the login/logout activies. 
    constructor(user_activity) {

        if (user_activity) {
            this.clone(user_activity);
        }
        else {
            this.id = INT_NULL;
            this.org_ID = INT_NULL;
            this.branch_ID = INT_NULL;

            this.type = INT_NULL;
            this.user_ID = INT_NULL;
            this.counter_ID = INT_NULL;
            this.startTime = TIME_NULL;
            this.endTime = TIME_NULL;
            this.lastActionTime = TIME_NULL;
            this.duration = INT_NULL;
            this.calenderDuration = INT_NULL;
            this.closed = INT_NULL;
        }
    }

    clone(user_activity) {
        this.id = user_activity.id;
        this.org_ID = user_activity.org_ID;
        this.branch_ID = user_activity.branch_ID;

        this.type = user_activity.type;
        this.user_ID = user_activity.user_ID;
        this.counter_ID = user_activity.counter_ID;
        this.startTime = user_activity.startTime;
        this.endTime = user_activity.endTime;
        this.lastActionTime = user_activity.lastActionTime;
        this.duration = user_activity.duration;
        this.calenderDuration = user_activity.calenderDuration;
        this.closed = user_activity.closed;
    }

}
module.exports = userActivity;


