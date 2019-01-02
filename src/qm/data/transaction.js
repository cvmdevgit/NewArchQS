const INT_NULL = null;
const INT_ZERO = 0;
const STRING_NULL = "";
const TIME_NULL = 0;
var transactionStatisticsData = require("./transactionStatisticsData");
var commonMethods = require("../../common/commonMethods");

class transaction {
    constructor(transaction) {

        if (transaction) {
            this.clone(transaction);
        }
        else {
            //Attribute
            this.id = commonMethods.newDataID(); //Generate a negative number
            this.orgID = INT_NULL;
            this.queueBranch_ID = INT_NULL;

            this.ticketSequence = INT_NULL;
            this.ticketSymbol = STRING_NULL;
            this.service_ID = INT_NULL;
            this.segment_ID = INT_NULL;
            this.hall_ID = INT_NULL;
            this.priority = INT_NULL;
            this.orderOfServing = INT_NULL;
            this.servingNote = STRING_NULL;
            this.recallNo = INT_NULL;
            this.holdingCount = INT_ZERO;
            this.holdingReason_ID = INT_NULL;
            this.appointment_ID = INT_NULL;
            this.servingSession = STRING_NULL;
            this.origin = INT_NULL;
            this.state = INT_NULL;
            this.servingType = INT_NULL;
            this.queueBranchVisitID = INT_NULL;
            this.servingStep = INT_NULL;
            this.lastOfVisit = INT_NULL;
            this.reminderState = INT_NULL;
            this.integrationID = INT_NULL;
            this.smsTicket = INT_NULL;  //to be delayed
            this.displayTicketNumber = STRING_NULL;



            //Times
            this.arrivalTime = TIME_NULL;
            this.appointmentTime = TIME_NULL;
            this.waitingSeconds = TIME_NULL;
            this.servingSeconds = TIME_NULL;
            this.holdingSeconds = TIME_NULL;
            this.lastCallTime = TIME_NULL;
            this.servingEndTime = TIME_NULL;
            this.waitingStartTime = TIME_NULL;
            this.priorityTime = TIME_NULL;
            this.servingStartTime = TIME_NULL;
            this.creationTime = TIME_NULL;
            this.closedTime = TIME_NULL;


            //Counter and User IDs
            this.counter_ID = INT_NULL;
            this.user_ID = INT_NULL;
            this.transferByUser_ID = INT_NULL;
            this.transferByCounter_ID = INT_NULL;
            this.transferredFromService_ID = INT_NULL;
            this.heldByCounter_ID = INT_NULL;
            this.dispensedByUser_ID = INT_NULL;
            this.dispensedByCounter_ID = INT_NULL;
            this.assignedByCounter_ID = INT_NULL;


            this.customerLanguageIndex = INT_NULL;
            this.customerID = INT_NULL;

            this._servingCounters = [];
            this._servingUsers = [];
            this._isRandomCallAllowed = [];
            this._RequestID = INT_ZERO;
        }
    }

    clone(transaction) {
        this.id = Number(transaction.id);
        this.orgID = Number(transaction.orgID);
        this.queueBranch_ID = Number(transaction.queueBranch_ID);

        this.ticketSequence = parseInt(transaction.ticketSequence);
        this.ticketSymbol = transaction.ticketSymbol;
        this.service_ID = Number(transaction.service_ID);
        this.segment_ID = Number(transaction.segment_ID);
        this.hall_ID = transaction.hall_ID;
        this.priority = transaction.priority;
        this.orderOfServing = transaction.orderOfServing;
        this.servingNote = transaction.servingNote;
        this.recallNo = transaction.recallNo;
        this.holdingCount = transaction.holdingCount;
        this.holdingReason_ID = transaction.holdingReason_ID;
        this.appointment_ID = transaction.appointment_ID;
        this.servingSession = transaction.servingSession;
        this.origin = transaction.origin;
        this.state = transaction.state;
        this.servingType = transaction.servingType;
        this.queueBranchVisitID = transaction.queueBranchVisitID;
        this.servingStep = transaction.servingStep;
        this.lastOfVisit = transaction.lastOfVisit;
        this.reminderState = transaction.reminderState;
        this.integrationID = transaction.integrationID;
        this.smsTicket = transaction.smsTicket;  //to be delayed
        this.displayTicketNumber = transaction.displayTicketNumber;



        //Times
        this.arrivalTime = transaction.arrivalTime;
        this.appointmentTime = transaction.appointmentTime;
        this.waitingSeconds = transaction.waitingSeconds;
        this.servingSeconds = transaction.servingSeconds;
        this.holdingSeconds = transaction.holdingSeconds;
        this.lastCallTime = transaction.lastCallTime;
        this.servingEndTime = transaction.servingEndTime;
        this.waitingStartTime = transaction.waitingStartTime;
        this.priorityTime = transaction.priorityTime;
        this.servingStartTime = transaction.servingStartTime;
        this.creationTime = transaction.creationTime;
        this.closedTime = transaction.closedTime;


        //Counter and User IDs
        this.counter_ID = transaction.counter_ID;
        this.user_ID = transaction.user_ID;
        this.transferByUser_ID = transaction.transferByUser_ID;
        this.transferByCounter_ID = transaction.transferByCounter_ID;
        this.transferredFromService_ID = transaction.transferredFromService_ID;
        this.heldByCounter_ID = transaction.heldByCounter_ID;
        this.dispensedByUser_ID = transaction.dispensedByUser_ID;
        this.dispensedByCounter_ID = transaction.dispensedByCounter_ID;
        this.assignedByCounter_ID = transaction.assignedByCounter_ID;

        this.customerLanguageIndex = transaction.customerLanguageIndex;
        this.customerID = transaction.customerID;

        //Add Statistics
        this._StatisticsData = new transactionStatisticsData(transaction);
        this._servingCounters = transaction._servingCounters;
        this._servingUsers = transaction._servingUsers;
        this._isRandomCallAllowed = transaction._isRandomCallAllowed;
        this._isCalledByNextAllowed = transaction._isCalledByNextAllowed;
        this._RequestID = INT_ZERO;
        this._backup = INT_NULL;
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
module.exports = transaction;
