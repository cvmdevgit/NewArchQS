const INT_NULL = -1;
const INT_ZERO = 0;
const STRING_NULL = "";
const TIME_NULL = 0;
var transactionStatisticsData = require("./transactionStatisticsData");

class transaction {
    constructor(transaction) {

        if (transaction) {
            this.clone(transaction);
        }
        else {
            //Attribute
            this.id = INT_NULL;
            this.org_ID = INT_NULL;
            this.branch_ID = INT_NULL;

            this.ticketSequence = INT_NULL;
            this.symbol = STRING_NULL;
            this.service_ID = INT_NULL;
            this.segment_ID = INT_NULL;
            this.hall_ID = INT_NULL;
            this.priority = INT_NULL;
            this.orderOfServing = INT_NULL;
            this.note = STRING_NULL;
            this.recallNo = INT_NULL;
            this.holdCount = INT_ZERO;
            this.holdReason_ID = INT_NULL;
            this.appointment_ID = INT_NULL;
            this.servingSession = STRING_NULL;
            this.origin = INT_NULL;
            this.state = INT_NULL;
            this.servingType = INT_NULL;
            this.visit_ID = INT_NULL;
            this.serveStep = INT_NULL;
            this.lastOfVisit = INT_NULL;
            this.reminderState = INT_NULL;
            this.integration_ID = INT_NULL;
            this.smsTicket = INT_NULL;  //to be delayed
            this.displayTicketNumber = STRING_NULL;



            //Times
            this.arrivalTime = TIME_NULL;
            this.appointmentTime = TIME_NULL;
            this.waitingSeconds = TIME_NULL;
            this.serviceSeconds = TIME_NULL;
            this.holdingSeconds = TIME_NULL;
            this.lastCallTime = TIME_NULL;
            this.endServingTime = TIME_NULL;
            this.waitingStartTime = TIME_NULL;
            this.priorityTime = TIME_NULL;
            this.startServingTime = TIME_NULL;
            this.creationTime = TIME_NULL;
            this.closeTime = TIME_NULL;


            //Counter and User IDs
            this.counter_ID = INT_NULL;
            this.user_ID = INT_NULL;
            this.transferredByUser_ID = INT_NULL;
            this.transferredByCounter_ID = INT_NULL;
            this.transferredFromService_ID = INT_NULL;
            this.heldByCounter_ID = INT_NULL;
            this.dispensedByUser_ID = INT_NULL;
            this.dispensedByCounter_ID = INT_NULL;
            this.assignedByCounter_ID = INT_NULL;

            this._StatisticsData = undefined;
        }
    }

    clone(transaction) {
        this.id = transaction.id;
        this.org_ID = transaction.org_ID;
        this.branch_ID = transaction.branch_ID;

        this.ticketSequence = transaction.ticketSequence;
        this.symbol = transaction.symbol;
        this.service_ID = transaction.service_ID;
        this.segment_ID = transaction.segment_ID;
        this.hall_ID = transaction.hall_ID;
        this.priority = transaction.priority;
        this.orderOfServing = transaction.orderOfServing;
        this.note = transaction.note;
        this.recallNo = transaction.recallNo;
        this.holdCount = transaction.holdCount;
        this.holdReason_ID = transaction.holdReason_ID;
        this.appointment_ID = transaction.appointment_ID;
        this.servingSession = transaction.servingSession;
        this.origin = transaction.origin;
        this.state = transaction.state;
        this.servingType = transaction.servingType;
        this.visit_ID = transaction.visit_ID;
        this.serveStep = transaction.serveStep;
        this.lastOfVisit = transaction.lastOfVisit;
        this.reminderState = transaction.reminderState;
        this.integration_ID = transaction.integration_ID;
        this.smsTicket = transaction.smsTicket;  //to be delayed
        this.displayTicketNumber = transaction.displayTicketNumber;



        //Times
        this.arrivalTime = transaction.arrivalTime;
        this.appointmentTime = transaction.appointmentTime;
        this.waitingSeconds = transaction.waitingSeconds;
        this.serviceSeconds = transaction.serviceSeconds;
        this.holdingSeconds = transaction.holdingSeconds;
        this.lastCallTime = transaction.lastCallTime;
        this.endServingTime = transaction.endServingTime;
        this.waitingStartTime = transaction.waitingStartTime;
        this.priorityTime = transaction.priorityTime;
        this.startServingTime = transaction.startServingTime;
        this.creationTime = transaction.creationTime;
        this.closeTime = transaction.closeTime;


        //Counter and User IDs
        this.counter_ID = transaction.counter_ID;
        this.user_ID = transaction.user_ID;
        this.transferredByUser_ID = transaction.transferredByUser_ID;
        this.transferredByCounter_ID = transaction.transferredByCounter_ID;
        this.transferredFromService_ID = transaction.transferredFromService_ID;
        this.heldByCounter_ID = transaction.heldByCounter_ID;
        this.dispensedByUser_ID = transaction.dispensedByUser_ID;
        this.dispensedByCounter_ID = transaction.dispensedByCounter_ID;
        this.assignedByCounter_ID = transaction.assignedByCounter_ID;

        //Add Statistics
        this._StatisticsData = new transactionStatisticsData(transaction);
    }



}
module.exports = transaction;
