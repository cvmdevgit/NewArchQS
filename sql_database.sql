

IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N't_statisticsData') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
     drop table  [new].[dbo].t_statisticsData
END
##GO##

	IF ((SELECT COUNT(*) FROM sys.sequences WHERE object_id=object_id('SEQ_Transaction')) = 0)
	BEGIN
		CREATE SEQUENCE [dbo].SEQ_Transaction  
		START WITH 100000000  
		INCREMENT BY 1 ;  
	END

##GO##

IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N't_statisticsData') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[t_statisticsData](
	[id] [nvarchar](255) NOT NULL,
	[queueBranch_ID] [bigint] NULL,
	[segment_ID] [bigint] NULL,
	[hall_ID] [bigint] NULL,
	[counter_ID] [bigint] NULL,
	[user_ID] [bigint] NULL,
	[service_ID] [bigint] NULL,
	[WaitingCustomers] [bigint] NULL,
	[AvgServiceTime] [float] NULL,
	[ASTWeight] [bigint] NULL,
	[AvgWaitingTime] [float] NULL,
	[TotalServiceTime] [bigint] NULL,
	[TotalWaitingTime] [bigint] NULL,
	[StatisticsDate] [datetime] NULL,
	[ServedCustomersNo] [bigint] NULL,
	[WaitedCustomersNo] [bigint] NULL,
	[NoShowCustomersNo] [bigint] NULL,
	[NonServedCustomersNo] [bigint] NULL,
 CONSTRAINT [PK_t_statisticsData] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)
)

CREATE INDEX inx_t_statisticsData ON [dbo].[t_statisticsData] (id)
END

##GO##

if  (select COL_LENGTH('T_CustomerQTransactionsLive', 'orderOfServing')) IS NULL --The column Doesn't Exist; Create it
BEGIN
ALTER TABLE T_CustomerQTransactionsLive ADD [OrderOfServing] [int] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [RecallNo] [int] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [ServingSession] [nvarchar](50) NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [ReminderState] [int] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [SmsTicket] [bit] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [LastCallTime] [datetime] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [TransferredFromService_ID] [Bigint] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [HeldByCounter_ID] [Bigint] NULL
ALTER TABLE T_CustomerQTransactionsLive ADD [AssignedByCounter_ID] [Bigint] NULL
END


##GO##
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'P_QS_UpdateStatisticsData'))
BEGIN
DROP PROCEDURE [dbo].[P_QS_UpdateStatisticsData]
END;
##GO##

IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'P_QS_UpdateUserActivity'))
BEGIN
DROP PROCEDURE [dbo].[P_QS_UpdateUserActivity]
END;
##GO##

IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'P_QS_UpdateTransaction'))
BEGIN
DROP PROCEDURE [dbo].[P_QS_UpdateTransaction]
END;
##GO##

CREATE PROCEDURE [dbo].[P_QS_UpdateStatisticsData] 
				(@id nvarchar(255),@queueBranch_ID bigint,@segment_ID bigint ,@hall_ID bigint ,@counter_ID bigint 
,@user_ID bigint,@service_ID bigint,@WaitingCustomers bigint,@AvgServiceTime float,@ASTWeight bigint
      ,@AvgWaitingTime bigint,@TotalServiceTime bigint,@TotalWaitingTime bigint,@StatisticsDate datetime
      ,@ServedCustomersNo bigint,@WaitedCustomersNo bigint,@NoShowCustomersNo bigint,@NonServedCustomersNo bigint
				, @Errors nvarchar(max) output )
AS
BEGIN

    DECLARE @Result int = 0;
	DECLARE @CursorStatus smallint;  
	DECLARE	@Region_ID	bigint;
	DECLARE	@City_ID	bigint;
	DECLARE @ErrorMessage nvarchar(max) 
	DECLARE @ErrorNumber int
    DECLARE @ErrorLine int          

      BEGIN TRY
	  --Update first
  UPDATE [dbo].[t_statisticsData]
   SET [queueBranch_ID] = @queueBranch_ID
      ,[segment_ID] = @segment_ID
      ,[hall_ID] = @hall_ID
      ,[counter_ID] = @counter_ID
      ,[user_ID] = @user_ID
      ,[service_ID] = @service_ID
      ,[WaitingCustomers] = @WaitingCustomers
      ,[AvgServiceTime] = @AvgServiceTime
      ,[ASTWeight] = @ASTWeight
      ,[AvgWaitingTime] = @AvgWaitingTime
      ,[TotalServiceTime] = @TotalServiceTime
      ,[TotalWaitingTime] = @TotalWaitingTime
      ,[StatisticsDate] = @StatisticsDate
      ,[ServedCustomersNo] = @ServedCustomersNo
      ,[WaitedCustomersNo] = @WaitedCustomersNo
      ,[NoShowCustomersNo] = @NoShowCustomersNo
      ,[NonServedCustomersNo] = @NonServedCustomersNo
	WHERE [id] = @id

	if (@@ROWCOUNT = 0)
	begin
		INSERT INTO [dbo].[t_statisticsData]
           ([id] ,[queueBranch_ID],[segment_ID]
           ,[hall_ID] ,[counter_ID]   ,[user_ID]
           ,[service_ID],[WaitingCustomers],[AvgServiceTime]
           ,[ASTWeight] ,[AvgWaitingTime] ,[TotalServiceTime]
           ,[TotalWaitingTime],[StatisticsDate],[ServedCustomersNo],[WaitedCustomersNo],[NoShowCustomersNo] ,[NonServedCustomersNo])
		VALUES
           (@id ,@queueBranch_ID ,@segment_ID  ,@hall_ID  ,@counter_ID  
			,@user_ID ,@service_ID ,@WaitingCustomers ,@AvgServiceTime ,@ASTWeight 
			,@AvgWaitingTime ,@TotalServiceTime ,@TotalWaitingTime ,@StatisticsDate 
			,@ServedCustomersNo ,@WaitedCustomersNo ,@NoShowCustomersNo ,@NonServedCustomersNo )

		end

			SET @Result =0;
			RETURN @Result;
	  	END TRY
		BEGIN CATCH
		BEGIN
		SET @ErrorMessage = ERROR_MESSAGE();
		SET @ErrorNumber = ERROR_NUMBER();
		SET @ErrorLine = ERROR_LINE();
		SET @Errors = @Errors + @ErrorMessage + ' Error ID = (' + Convert(nvarchar(max),@ErrorNumber,0) + '):line ' + Convert(nvarchar(max),@ErrorLine,0);
		SET @Result = -1;
		RETURN @Result;
		END
	END CATCH

END

##GO##

CREATE PROCEDURE [dbo].[P_QS_UpdateUserActivity] (@ID bigint,@OrgID bigint,
		@QueueBranch_ID bigint,@User_ID bigint,@Counter_ID bigint ,@StartTime datetime,@EndTime datetime,
		@Duration int,@CalendarDuration int,@Closed int,@ActivityType int ,@LastChangedTime datetime, @Errors nvarchar(max) output , @NewID bigint output)
AS
BEGIN
	SET NOCOUNT ON  ;
    SET @Errors = '';

    DECLARE @Result int = 0;
	DECLARE @CursorStatus smallint;  
	DECLARE	@Region_ID	bigint;
	DECLARE	@City_ID	bigint;
	DECLARE @ErrorMessage nvarchar(max) 
	DECLARE @ErrorNumber int
    DECLARE @ErrorLine int           
	DECLARE @TimeNow datetime;
	DECLARE @cRESULT_SUCCESS_NEED_UPDATE int = 1;
	DECLARE @cRESULT_LOG_WARNING_AND_PROCEED int = 2;
	DECLARE @cRESULT_ERROR int = -1;
	DECLARE @QueueBranchTransactionIDAsNVarchar nvarchar(max);
	DECLARE @ExpiryPeriod numeric;
	DECLARE @QueueBranchTransactionID bigint;


	BEGIN TRY
	 	SET @NewID = @ID;
		SET @QueueBranchTransactionID = -1;
		SET @TimeNow = GETDATE();
		SET @LastChangedTime = DATEADD(ms, -DATEPART(ms, @TimeNow), @TimeNow)
		SET @ExpiryPeriod=30;
		set @Region_ID=null;
		set @City_ID=null;
		--SELECT @City_ID = [City_ID], @Region_ID = [Region_ID] from dbo.[T_QueueBranch] where [ID] = @QueueBranch_ID;


			if (@User_ID < 0)
			begin
				set @User_ID = Null;
			end
			IF (@ID > 0 )
			begin
				UPDATE dbo.T_UserQActivitiesLive SET [OrgID]=@OrgID,[Region_ID]=@Region_ID,[City_ID]=@City_ID,[QueueBranch_ID]=@QueueBranch_ID,[User_ID]=@User_ID,
					[Counter_ID]=@Counter_ID,[StartTime]=@StartTime,[EndTime]=@EndTime,[Duration]=@Duration,[CalendarDuration]=@CalendarDuration,
					[ActivityType]=@ActivityType,[Closed] = @Closed,[LastChangedTime]=@LastChangedTime
					WHERE ID = @ID

			end
			else
			begin
					INSERT INTO dbo.T_UserQActivitiesLive([OrgID],[Region_ID],[City_ID],[QueueBranch_ID],[User_ID],[Counter_ID],[StartTime],
					[EndTime],[Duration],[CalendarDuration],[ActivityType],[Closed],[LastChangedTime],[QueueBranchTransactionID]) 
					VALUES (@OrgID,@Region_ID,@City_ID,@QueueBranch_ID,@User_ID,@Counter_ID,@StartTime,@EndTime,
					@Duration,@CalendarDuration,@ActivityType,@Closed, @LastChangedTime,@QueueBranchTransactionID);
					set @NewID = @@Identity;
					
			end
				RETURN @Result;
	END TRY
	BEGIN CATCH
		BEGIN
		SET @ErrorMessage = ERROR_MESSAGE();
		SET @ErrorNumber = ERROR_NUMBER();
		SET @ErrorLine = ERROR_LINE();
		SET @Errors = @Errors + @ErrorMessage + ' Error ID = (' + Convert(nvarchar(max),@ErrorNumber,0) + '):line ' + Convert(nvarchar(max),@ErrorLine,0);
		SET @Result = -1;
		RETURN @Result;
		END
	END CATCH
END

##GO##

CREATE PROCEDURE [dbo].[P_QS_UpdateTransaction] 
				( @id bigint, @orgID bigint, @queueBranch_ID bigint,@ticketSequence int,@ticketSymbol nvarchar(3),
            @service_ID bigint, @segment_ID bigint,@hall_ID bigint, @priority int,@orderOfServing int, @servingNote nvarchar(255),
            @recallNo int, @holdingCount int, @holdingReason_ID bigint,@appointment_ID bigint, @servingSession nvarchar(100),
            @origin int,  @state int, @servingType int, @queueBranchVisitID bigint, @servingStep int,  @lastOfVisit int,
            @reminderState int, @integrationID nvarchar(50), @smsTicket int, @displayTicketNumber nvarchar(10),
            @arrivalTime datetime, @appointmentTime  datetime, @waitingSeconds  int, @servingSeconds  int,  @holdingSeconds  int,
            @lastCallTime  datetime, @servingEndTime  datetime, @waitingStartTime  datetime,@priorityTime  datetime, @servingStartTime  datetime,
            @creationTime  datetime,  @closedTime  datetime,  @counter_ID bigint, @user_ID bigint, @transferByUser_ID bigint,
            @transferByCounter_ID bigint, @transferredFromService_ID bigint, @heldByCounter_ID bigint,  @dispensedByUser_ID bigint,
            @dispensedByCounter_ID bigint, @assignedByCounter_ID bigint, @customerLanguageIndex int,    @customerID bigint,
            @Errors nvarchar(max) output , @NewID bigint output)
AS
BEGIN
	SET NOCOUNT ON  ;
    DECLARE @Result int = 0;
	DECLARE @CursorStatus smallint;  
	DECLARE	@Region_ID	bigint;
	DECLARE	@City_ID	bigint;
	DECLARE @ErrorMessage nvarchar(max) 
	DECLARE @ErrorNumber int
    DECLARE @ErrorLine int     
	DECLARE @TimeNow datetime;
	DECLARE @LastChangedTime datetime;
    BEGIN TRY
	  	SET @TimeNow = GETDATE();
		SET @LastChangedTime = DATEADD(ms, -DATEPART(ms, @TimeNow), @TimeNow);
		set @Region_ID=null;
		set @City_ID=null;
		--SELECT @City_ID = [City_ID], @Region_ID = [Region_ID] from dbo.[T_QueueBranch] where [ID] = @QueueBranch_ID;
		if (@id > 0)
			BEGIN
			UPDATE [dbo].[T_CustomerQTransactionsLive] SET 
			orgID=@orgID,queueBranch_ID=@queueBranch_ID , ticketSequence=@ticketSequence , ticketSymbol=@ticketSymbol , service_ID=@service_ID 
			,segment_ID = @segment_ID,hall_ID =@hall_ID ,[priority] = @priority , orderOfServing = @orderOfServing ,  
			servingNote = @servingNote, recallNo=@recallNo ,holdingCount=@holdingCount , holdingReason_ID =@holdingReason_ID 
			,  appointment_ID=@appointment_ID ,	servingSession=@servingSession ,  origin=@origin , [state] =@state , servingType =@servingType 
			, queueBranchVisitID =@queueBranchVisitID , servingStep=@servingStep , lastOfVisit=@lastOfVisit ,reminderState=@reminderState , 
			integrationID=@integrationID , smsTicket=@smsTicket ,displayTicketNumber=@displayTicketNumber 
			,arrivalTime=@arrivalTime, appointmentTime=@appointmentTime
			,waitingSeconds=@waitingSeconds,servingSeconds=@servingSeconds,holdingSeconds=@holdingSeconds 
			, lastCallTime=@lastCallTime 
			, servingEndTime=@servingEndTime , waitingStartTime=@waitingStartTime ,priorityTime=@priorityTime ,  servingStartTime=@servingStartTime  ,
       creationTime=@creationTime  ,  closedTime=@closedTime  ,   counter_ID=@counter_ID ,user_ID=@user_ID , transferByUser_ID = @transferByUser_ID , transferByCounter_ID=@transferByCounter_ID
	    , transferredFromService_ID=@transferredFromService_ID ,heldByCounter_ID=@heldByCounter_ID , dispensedByUser_ID=@dispensedByUser_ID 
		, dispensedByCounter_ID=@dispensedByCounter_ID , assignedByCounter_ID=@assignedByCounter_ID ,customerLanguageIndex=@customerLanguageIndex ,  customerID=@customerID
		,LastChangedTime = @LastChangedTime,Region_ID=@Region_ID,City_ID =@City_ID
							WHERE id = @id;

			END
		else
			BEGIN
						set @NewID = next value for SEQ_Transaction;
						Declare @Res int;
						INSERT INTO [dbo].[T_CustomerQTransactionsLive]
						   (
						   id,Region_ID,City_ID, orgID,queueBranch_ID , ticketSequence , ticketSymbol , service_ID ,  segment_ID ,  hall_ID ,
							priority ,  orderOfServing ,  servingNote , recallNo ,holdingCount , holdingReason_ID ,  appointment_ID ,
							servingSession ,  origin , state , servingType , queueBranchVisitID , servingStep , lastOfVisit ,
							reminderState , integrationID , smsTicket ,displayTicketNumber ,arrivalTime, appointmentTime,waitingSeconds,servingSeconds,
							holdingSeconds , lastCallTime , servingEndTime , waitingStartTime ,priorityTime ,  servingStartTime  ,
							creationTime  ,  closedTime  ,   counter_ID ,user_ID , transferByUser_ID , transferByCounter_ID , transferredFromService_ID ,
							heldByCounter_ID , dispensedByUser_ID , dispensedByCounter_ID , assignedByCounter_ID ,
							customerLanguageIndex ,  customerID ,  queueBranchTransactionID,LastChangedTime
						   )
						 VALUES
							   ( @NewID , @Region_ID,@City_ID, @orgID,@queueBranch_ID , @ticketSequence , @ticketSymbol , @service_ID ,  @segment_ID ,  @hall_ID ,
								@priority ,  @orderOfServing ,  @servingNote , @recallNo ,@holdingCount , @holdingReason_ID ,  @appointment_ID ,
								@servingSession ,  @origin , @state , @servingType , @queueBranchVisitID , @servingStep , @lastOfVisit ,
								@reminderState , @integrationID , @smsTicket ,@displayTicketNumber ,@arrivalTime, @appointmentTime,@waitingSeconds,@servingSeconds,
								@holdingSeconds , @lastCallTime , @servingEndTime , @waitingStartTime ,@priorityTime ,  @servingStartTime  ,
								@creationTime  ,  @closedTime  ,   @counter_ID ,@user_ID , @transferByUser_ID , @transferByCounter_ID , @transferredFromService_ID ,
								@heldByCounter_ID , @dispensedByUser_ID , @dispensedByCounter_ID , @assignedByCounter_ID ,
								@customerLanguageIndex ,  @customerID , @id,@LastChangedTime)
			END
			SET @Result =0;
			RETURN @Result;

	  	END TRY
		BEGIN CATCH
		BEGIN
		SET @ErrorMessage = ERROR_MESSAGE();
		SET @ErrorNumber = ERROR_NUMBER();
		SET @ErrorLine = ERROR_LINE();
		SET @Errors = @Errors + @ErrorMessage + ' Error ID = (' + Convert(nvarchar(max),@ErrorNumber,0) + '):line ' + Convert(nvarchar(max),@ErrorLine,0);
		SET @Result = -1;
		RETURN @Result;
		END
	END CATCH


END

##GO##