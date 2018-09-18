IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N't_transaction') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE t_transaction(
        id nvarchar(50) PRIMARY KEY,
        org_ID nvarchar(50) NOT NULL,
        branch_ID nvarchar(50) NOT NULL,
        ticketSequence nvarchar(50) NOT NULL,
        symbol text NOT NULL,
        service_ID nvarchar(50) NOT NULL,
        segment_ID nvarchar(50) NOT NULL,
        priority nvarchar(50) NOT NULL,
        orderOfServing nvarchar(50) NOT NULL,
        note text NULL,
        recallNo nvarchar(50) NOT NULL,
        holdCount nvarchar(50) NOT NULL,
        holdReason_ID nvarchar(50) NULL,
        appointment_ID nvarchar(50) NULL,
        servingSession nvarchar(50) NULL,
        origin nvarchar(50) not NULL,
        state nvarchar(50) not NULL,
        servingType nvarchar(50) not NULL,
        visit_ID nvarchar(50) not NULL,
        serveStep nvarchar(50) not NULL,
        lastOfVisit nvarchar(50) not NULL,
        reminderState nvarchar(50) not NULL,
        integration_ID nvarchar(50) NULL,
        smsTicket nvarchar(50) NULL,
        displayTicketNumber text not NULL,
        hall_ID nvarchar(50) NOT NULL,
        arrivalTime nvarchar(50) not NULL,
        appointmentTime nvarchar(50) NULL,
        waitingSeconds nvarchar(50) NULL,
        serviceSeconds nvarchar(50) NULL,
        holdingSeconds nvarchar(50) NULL,
        lastCallTime nvarchar(50) NULL,
        endServingTime nvarchar(50) NULL,
        waitingStartTime nvarchar(50) NULL,
        priorityTime nvarchar(50) not NULL,
        startServingTime nvarchar(50) NULL,
        creationTime nvarchar(50) not NULL,
        closeTime nvarchar(50) NULL,
        counter_ID nvarchar(50) NULL,
        user_ID nvarchar(50) NULL,
        transferredByUser_ID nvarchar(50) NULL,
        transferredByCounter_ID nvarchar(50) NULL,
        transferredFromService_ID nvarchar(50) NULL,
        heldByCounter_ID nvarchar(50) NULL,
        dispensedByUser_ID nvarchar(50) NULL,
        dispensedByCounter_ID nvarchar(50) NULL,
        assignedByCounter_ID nvarchar(50) NULL
)
END;

IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N't_userActivity') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE t_userActivity(
        id nvarchar(50) PRIMARY KEY,
        org_ID nvarchar(50) NOT NULL,
        branch_ID nvarchar(50) NOT NULL,
        type  nvarchar(50) NOT NULL,
        user_ID  nvarchar(50) NOT NULL,
        counter_ID  nvarchar(50) NOT NULL,
        startTime  nvarchar(50) NOT NULL,
        endTime  nvarchar(50) NULL,
        lastActionTime  nvarchar(50) NULL,
        duration  nvarchar(50) NULL,
        calenderDuration  nvarchar(50) NULL,
        closed  nvarchar(50) NOT NULL
)
END;


IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N't_statisticsData') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE  t_statisticsData(
        id nvarchar(50) PRIMARY KEY,
        branch_ID nvarchar(50) NULL,
        segment_ID nvarchar(50) NULL,
        hall_ID nvarchar(50) NULL,
        counter_ID nvarchar(50) NULL,
        user_ID nvarchar(50) NULL,
        service_ID nvarchar(50) NULL,
        WaitingCustomers nvarchar(50) NULL,
        AvgServiceTime nvarchar(50) NULL,
        ASTWeight nvarchar(50) NULL,
        AvgWaitingTime nvarchar(50) NULL,
        TotalServiceTime nvarchar(50) NULL,
        TotalWaitingTime nvarchar(50) NULL,
        StatisticsDate nvarchar(50) NULL,
        ServedCustomersNo nvarchar(50) NULL,
        WaitedCustomersNo nvarchar(50) NULL,
        NoShowCustomersNo nvarchar(50) NULL,
        NonServedCustomersNo nvarchar(50) NULL
)
END;

IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'seq') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE seq(
        seqID nvarchar(50) PRIMARY KEY,
        seqNumber nvarchar(50) NOT NULL
)
END;

if (select count(*) from seq) = 0 
BEGIN
INSERT seq (seqID,seqNumber) values ('OBJECT', '100')
END;
