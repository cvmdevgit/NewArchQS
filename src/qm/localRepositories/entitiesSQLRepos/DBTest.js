var entity;
var db = require("../sqlConnector");
var Repo = require("./transactionSQLRepo");
var common = require("../../../common/common");
var procedureParameter = require("../procedureParameter");
var sql = require("mssql");
var ID = 12312312312;
async function TransactionProcedure() {
    try {
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let stri = '{"id":null,"orgID":"1","queueBranch_ID":"106","ticketSequence":2054,"ticketSymbol":"NNN","service_ID":"113","segment_ID":"111","hall_ID":838,"priority":500,"orderOfServing":null,"servingNote":"","recallNo":null,"holdingCount":0,"holdingReason_ID":null,"appointment_ID":null,"servingSession":"","origin":null,"state":0,"servingType":null,"queueBranchVisitID":null,"servingStep":null,"lastOfVisit":null,"reminderState":null,"integrationID":null,"smsTicket":null,"displayTicketNumber":"NNN2054","arrivalTime":"2018-12-17T13:18:08.798Z","appointmentTime":0,"waitingSeconds":0,"servingSeconds":0,"holdingSeconds":0,"lastCallTime":0,"servingEndTime":0,"waitingStartTime":"2018-12-17T13:18:08.798Z","priorityTime":"2018-12-17T13:18:08.798Z","servingStartTime":0,"creationTime":"2018-12-17T13:18:08.798Z","closedTime":0,"counter_ID":null,"user_ID":null,"transferByUser_ID":null,"transferByCounter_ID":null,"transferredFromService_ID":null,"heldByCounter_ID":null,"dispensedByUser_ID":null,"dispensedByCounter_ID":null,"assignedByCounter_ID":null,"customerLanguageIndex":null,"customerID":null,"customerMobile":null,"customerName":null,"_servingCounters":[120,121,605,606,607],"_servingUsers":[124,149,150,151,152,125],"_isRandomCallAllowed":false,"_DBTriesCount":0,"_StatisticsData":{"id":null,"queueBranch_ID":"106","segment_ID":"111","hall_ID":838,"counter_ID":null,"user_ID":null,"service_ID":"113","state":0,"servingType":null,"waitingSeconds":0,"servingSeconds":0}}';
        entity = JSON.parse(stri);
        entity = JSON.parse(stri);
        let time1 = Date.now();
        t_sqlResult = await Repo.AddorUpdate(db, entity);
        let timeDiff = (Date.now() - time1);
        console.log("TransactionProcedure = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function TransactionCommand() {
    try {
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let statement = `INSERT INTO [dbo].[T_CustomerQTransactionsLive]
        (
        id,Region_ID,City_ID, orgID,queueBranch_ID , ticketSequence , ticketSymbol , service_ID ,  segment_ID ,  hall_ID ,
         priority ,  orderOfServing ,  servingNote , recallNo ,holdingCount , holdingReason_ID ,  appointment_ID ,
         servingSession ,  origin , state , servingType , queueBranchVisitID , servingStep , lastOfVisit ,
         reminderState , integrationID , smsTicket ,displayTicketNumber ,arrivalTime, appointmentTime,waitingSeconds,servingSeconds,
         holdingSeconds , lastCallTime , servingEndTime , waitingStartTime ,priorityTime ,  servingStartTime  ,
         creationTime  ,  closedTime  ,   counter_ID ,user_ID , transferByUser_ID , transferByCounter_ID , transferredFromService_ID ,
         heldByCounter_ID , dispensedByUser_ID , dispensedByCounter_ID , assignedByCounter_ID ,
         customerLanguageIndex ,  customerID , customerMobile,  customerName , queueBranchTransactionID,LastChangedTime
        )
VALUES
( next value for SEQ_Transaction , 103,104, 1,106 , 1 , 'ss' , 113 ,  111 ,  838 ,
12 ,  1 ,  null , 1 ,1 , null ,  null ,
null ,  1 , 3 , 1 , next value for SEQ_Transaction , 1 , 1 ,
null , null , null ,'ss-123' ,GETDATE(), GETDATE(),1,1,
1 , GETDATE() , GETDATE() , GETDATE() ,GETDATE() ,  GETDATE()  ,
GETDATE()  ,  GETDATE()  ,   null ,null , null , null , null ,
null , null , null , null ,
null ,  null , null,  null , 123,GETDATE())`;


        let time1 = Date.now();
        t_sqlResult = await db.run(statement, undefined);
        let timeDiff = (Date.now() - time1);
        console.log("transaction time test command = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}


async function TransactionTesting()
{

await TransactionProcedure();
await TransactionCommand();
}


async function TestcommandParameters() {
    try {
        let params =[];
        ID = ID + 1;
        params.push(new procedureParameter('customerID1', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID2', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID3', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID4', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID5', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID6', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID7', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID8', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID9', ID, sql.BigInt, false));

        params.push(new procedureParameter('customerID10', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID11', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID12', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID13', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID14', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID15', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID16', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID17', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID18', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID19', ID , sql.BigInt, false));

        params.push(new procedureParameter('customerID20', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID21', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID22', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID23', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID24', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID25', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID26', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID27', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID28', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID29', ID , sql.BigInt, false));

        params.push(new procedureParameter('customerID30', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID31', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID32', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID33', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID34', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID35', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID36', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID37', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID38', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID39', ID , sql.BigInt, false));



        let statement = `INSERT INTO [Test]
        (ID,ID2,ID3,ID4,ID5,ID6,ID7,ID8,ID9,ID10,Date1,Date2,Date3,Date4)
  VALUES
         (next value for seq_next,@customerID1,@customerID2,13241234,12341324,12341324,1341234,1431234,12341234,123412412,GETDATE(),GETDATE(),GETDATE(),GETDATE())`
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let time1 = Date.now();
        t_sqlResult = await db.run(statement, params);
        let timeDiff = (Date.now() - time1);
        console.log("Test TestcommandParameters = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function TestcommandString() {
    try {
        let statement = `INSERT INTO [Test]
        (ID,ID2,ID3,ID4,ID5,ID6,ID7,ID8,ID9,ID10,Date1,Date2,Date3,Date4)
  VALUES
         (next value for seq_next,12341234,12412341324,13241234,12341324,12341324,1341234,1431234,12341234,123412412,GETDATE(),GETDATE(),GETDATE(),GETDATE())`
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let time1 = Date.now();
        t_sqlResult = await db.run(statement, undefined);
        let timeDiff = (Date.now() - time1);
        console.log("Test TestcommandString = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function TestProcedureWithParameters() {
    try {
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let params = [];
        let stri = '{"id":null,"orgID":"1","queueBranch_ID":"106","ticketSequence":2054,"ticketSymbol":"NNN","service_ID":"113","segment_ID":"111","hall_ID":838,"priority":500,"orderOfServing":null,"servingNote":"","recallNo":null,"holdingCount":0,"holdingReason_ID":null,"appointment_ID":null,"servingSession":"","origin":null,"state":0,"servingType":null,"queueBranchVisitID":null,"servingStep":null,"lastOfVisit":null,"reminderState":null,"integrationID":null,"smsTicket":null,"displayTicketNumber":"NNN2054","arrivalTime":"2018-12-17T13:18:08.798Z","appointmentTime":0,"waitingSeconds":0,"servingSeconds":0,"holdingSeconds":0,"lastCallTime":0,"servingEndTime":0,"waitingStartTime":"2018-12-17T13:18:08.798Z","priorityTime":"2018-12-17T13:18:08.798Z","servingStartTime":0,"creationTime":"2018-12-17T13:18:08.798Z","closedTime":0,"counter_ID":null,"user_ID":null,"transferByUser_ID":null,"transferByCounter_ID":null,"transferredFromService_ID":null,"heldByCounter_ID":null,"dispensedByUser_ID":null,"dispensedByCounter_ID":null,"assignedByCounter_ID":null,"customerLanguageIndex":null,"customerID":null,"customerMobile":null,"customerName":null,"_servingCounters":[120,121,605,606,607],"_servingUsers":[124,149,150,151,152,125],"_isRandomCallAllowed":false,"_DBTriesCount":0,"_StatisticsData":{"id":null,"queueBranch_ID":"106","segment_ID":"111","hall_ID":838,"counter_ID":null,"user_ID":null,"service_ID":"113","state":0,"servingType":null,"waitingSeconds":0,"servingSeconds":0}}';
        let entity = JSON.parse(stri);
        //Inputs
 
        
        ID = ID + 1;
        params.push(new procedureParameter('customerID1', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID2', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID3', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID4', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID5', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID6', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID7', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID8', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID9', ID, sql.BigInt, false));

        params.push(new procedureParameter('customerID10', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID11', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID12', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID13', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID14', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID15', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID16', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID17', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID18', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID19', ID , sql.BigInt, false));

        params.push(new procedureParameter('customerID20', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID21', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID22', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID23', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID24', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID25', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID26', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID27', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID28', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID29', ID , sql.BigInt, false));

        params.push(new procedureParameter('customerID30', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID31', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID32', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID33', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID34', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID35', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID36', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID37', ID, sql.BigInt, false));
        params.push(new procedureParameter('customerID38', ID , sql.BigInt, false));
        params.push(new procedureParameter('customerID39', ID , sql.BigInt, false));

/*
entity.customerName = "asddasdfjasdofkjhasdklfajlhfjklshfjkhajklfhajklshfjklasdhjklfhasjkldhfjklsdahfhasdkfhajklhfjklasdhfjklsdhjklfhd";
entity.servingNote = "asddasdfjasdofkjhasdklfajlhfjklshfjkhajklfhajklshfjklasdhjklfhasjkldhfjklsdahfhasdkfhajklhfjklasdhfjklsdhjklfhd";
entity.servingSession = "12342344412342314321412342341423414";
params.push(new procedureParameter('String1', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String2', entity.servingNote, sql.NVarChar(200), false));
params.push(new procedureParameter('String3', entity.servingSession, sql.NVarChar(200), false));
params.push(new procedureParameter('String4', entity.integrationID, sql.NVarChar(200), false));
params.push(new procedureParameter('String5', entity.displayTicketNumber, sql.NVarChar(200), false));
params.push(new procedureParameter('String6', entity.customerMobile, sql.NVarChar(200), false));
params.push(new procedureParameter('String7', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String8', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String9', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String10', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String11', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String12', entity.servingNote, sql.NVarChar(200), false));
params.push(new procedureParameter('String13', entity.servingSession, sql.NVarChar(100), false));
params.push(new procedureParameter('String14', entity.integrationID, sql.NVarChar(200), false));
params.push(new procedureParameter('String15', entity.displayTicketNumber, sql.NVarChar(200), false));
params.push(new procedureParameter('String16', entity.customerMobile, sql.NVarChar(200), false));
params.push(new procedureParameter('String17', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String18', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String19', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String20', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String21', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String22', entity.servingNote, sql.NVarChar(200), false));
params.push(new procedureParameter('String23', entity.servingSession, sql.NVarChar(200), false));
params.push(new procedureParameter('String24', entity.integrationID, sql.NVarChar(200), false));
params.push(new procedureParameter('String25', entity.displayTicketNumber, sql.NVarChar(200), false));
params.push(new procedureParameter('String26', entity.customerMobile, sql.NVarChar(200), false));
params.push(new procedureParameter('String27', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String28', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String29', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String30', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String31', entity.ticketSymbol, sql.NVarChar(200), false));
params.push(new procedureParameter('String32', entity.servingNote, sql.NVarChar(200), false));
params.push(new procedureParameter('String33', entity.servingSession, sql.NVarChar(200), false));
params.push(new procedureParameter('String34', entity.integrationID, sql.NVarChar(200), false));
params.push(new procedureParameter('String35', entity.displayTicketNumber, sql.NVarChar(200), false));
params.push(new procedureParameter('String36', entity.customerMobile, sql.NVarChar(200), false));
params.push(new procedureParameter('String37', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String38', entity.customerName, sql.NVarChar(200), false));
params.push(new procedureParameter('String39', entity.customerName, sql.NVarChar(200), false));
*/

/*
let minimumDate = new Date(0);
params.push(new procedureParameter('Time1', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time2', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time3', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time4', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time5', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time6', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time6', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time7', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time8', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time9', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time10', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time11', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time12', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time13', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time14', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time15', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time16', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time16', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time17', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time18', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time19', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time20', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time21', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time22', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time23', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time24', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time25', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time26', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time26', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time27', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time28', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time29', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time30', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time31', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time32', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time33', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time34', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time35', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time36', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time36', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time37', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time38', new Date(Date.now()), sql.DateTime, false));
params.push(new procedureParameter('Time39', new Date(Date.now()), sql.DateTime, false));
*/

/*
params.push(new procedureParameter('Time1', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time2', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time3', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time4', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time5', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time6', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time6', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time7', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time8', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time9', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time10', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time11', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time12', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time13', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time14', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time15', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time16', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time16', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time17', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time18', undefined, sql.DateTime, false));
params.push(new procedureParameter('Time19', undefined, sql.DateTime, false));

*/
        //Outputs
        //params.push(new procedureParameter('Errors', '', sql.VarChar(sql.MAX), true));
        //params.push(new procedureParameter('NewID', entity.id, sql.BigInt, true));
        //console.log("#parameters = " + params.length);
        let time1 = Date.now();
        t_sqlResult = await db.callprocedure("testupdate", params);
        let timeDiff = (Date.now() - time1);
        console.log("Test TestProcedureWithParameters = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function TestProcedureWithCustomType() {
    try {

        ID = ID + 1;
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let params = [];
        const tvp = new sql.Table() // You can optionally specify table type name in the first argument.
        tvp.columns.add('customerID1', sql.BigInt);
        tvp.columns.add('customerID2', sql.BigInt);
        tvp.columns.add('customerID3', sql.BigInt);
        tvp.columns.add('customerID4', sql.BigInt);
        tvp.columns.add('customerID5', sql.BigInt);
        tvp.columns.add('customerID6', sql.BigInt);
        tvp.columns.add('customerID7', sql.BigInt);
        tvp.columns.add('customerID8', sql.BigInt);
        tvp.columns.add('customerID9', sql.BigInt);
        tvp.columns.add('customerID10', sql.BigInt);
        tvp.columns.add('customerID11', sql.BigInt);
        tvp.columns.add('customerID12', sql.BigInt);
        tvp.columns.add('customerID13', sql.BigInt);
        tvp.columns.add('customerID14', sql.BigInt);
        tvp.columns.add('customerID15', sql.BigInt);
        tvp.columns.add('customerID16', sql.BigInt);
        tvp.columns.add('customerID17', sql.BigInt);
        tvp.columns.add('customerID18', sql.BigInt);
        tvp.columns.add('customerID19', sql.BigInt);
        tvp.columns.add('customerID20', sql.BigInt);
        tvp.columns.add('customerID21', sql.BigInt);
        tvp.columns.add('customerID22', sql.BigInt);
        tvp.columns.add('customerID23', sql.BigInt);
        tvp.columns.add('customerID24', sql.BigInt);
        tvp.columns.add('customerID25', sql.BigInt);
        tvp.columns.add('customerID26', sql.BigInt);
        tvp.columns.add('customerID27', sql.BigInt);
        tvp.columns.add('customerID28', sql.BigInt);
        tvp.columns.add('customerID29', sql.BigInt);
        tvp.columns.add('customerID30', sql.BigInt);
        tvp.columns.add('customerID31', sql.BigInt);
        tvp.columns.add('customerID32', sql.BigInt);
        tvp.columns.add('customerID33', sql.BigInt);
        tvp.columns.add('customerID34', sql.BigInt);
        tvp.columns.add('customerID35', sql.BigInt);
        tvp.columns.add('customerID36', sql.BigInt);
        tvp.columns.add('customerID37', sql.BigInt);
        tvp.columns.add('customerID38', sql.BigInt);
        tvp.columns.add('customerID39', sql.BigInt);

        tvp.rows.add(ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID,ID);


        params.push(new procedureParameter('TestType', tvp, undefined, false));
        //console.log("#parameters2 = " + params.length);
        let time1 = Date.now();
        t_sqlResult = await db.callprocedure("testupdate2", params);
        let timeDiff = (Date.now() - time1);
        console.log("Test TestProcedureWithCustomType = " + timeDiff);
        if (t_sqlResult.result == common.success) {
            console.log("Done");
        }
        else {
            console.log("error");
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function Testing() {
    await TestcommandString();
    await TestcommandParameters();
    await TestProcedureWithCustomType();
    await TestProcedureWithParameters();
}

async function Test() {
    try {
        let stri = '{"id":null,"orgID":"1","queueBranch_ID":"106","ticketSequence":2054,"ticketSymbol":"NNN","service_ID":"113","segment_ID":"111","hall_ID":838,"priority":500,"orderOfServing":null,"servingNote":"","recallNo":null,"holdingCount":0,"holdingReason_ID":null,"appointment_ID":null,"servingSession":"","origin":null,"state":0,"servingType":null,"queueBranchVisitID":null,"servingStep":null,"lastOfVisit":null,"reminderState":null,"integrationID":null,"smsTicket":null,"displayTicketNumber":"NNN2054","arrivalTime":"2018-12-17T13:18:08.798Z","appointmentTime":0,"waitingSeconds":0,"servingSeconds":0,"holdingSeconds":0,"lastCallTime":0,"servingEndTime":0,"waitingStartTime":"2018-12-17T13:18:08.798Z","priorityTime":"2018-12-17T13:18:08.798Z","servingStartTime":0,"creationTime":"2018-12-17T13:18:08.798Z","closedTime":0,"counter_ID":null,"user_ID":null,"transferByUser_ID":null,"transferByCounter_ID":null,"transferredFromService_ID":null,"heldByCounter_ID":null,"dispensedByUser_ID":null,"dispensedByCounter_ID":null,"assignedByCounter_ID":null,"customerLanguageIndex":null,"customerID":null,"customerMobile":null,"customerName":null,"_servingCounters":[120,121,605,606,607],"_servingUsers":[124,149,150,151,152,125],"_isRandomCallAllowed":false,"_DBTriesCount":0,"_StatisticsData":{"id":null,"queueBranch_ID":"106","segment_ID":"111","hall_ID":838,"counter_ID":null,"user_ID":null,"service_ID":"113","state":0,"servingType":null,"waitingSeconds":0,"servingSeconds":0}}';
        entity = JSON.parse(stri);
        let t_sqlResult = await db.open(common.settings.sqldbConnection)
        let time1;
        let timeDiff;

        if (t_sqlResult.result == common.success) {
            let time1 = Date.now();
            t_sqlResult = await Repo.AddorUpdate(db, entity);
            let timeDiff = (Date.now() - time1);
            console.log("transaction time test 1 = " + timeDiff);
            if (t_sqlResult.result == common.success) {
                console.log("Done");
            }
            else {
                console.log("error");
            }
        }


        setInterval(TransactionTesting, 500);

        //setInterval(Testing, 500);

        //setInterval(TestProcedureWithCustomType, 850);
        //setInterval(TestProcedureWithParameters, 760);
        //setInterval(TestcommandString, 730);
        //setInterval(TestcommandParameters, 900);
    }
    catch (err) {
        console.log(err)
    }
}
//Test();