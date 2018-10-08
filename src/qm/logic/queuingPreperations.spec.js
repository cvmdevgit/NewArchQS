"use strict";
delete require.cache[require.resolve("./queuingPreperations")];
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];
var queuingPreperationsInject = require("./queuingPreperations.SpecInject");
var rewire = require("rewire");
var queuingPreperations = rewire("./queuingPreperations");
var statisticsManager = require("./statisticsManager");
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var enums = require("../../common/enums");
var constants = require("../../common/constants");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var branchCountersState = require("../data/branchCountersState");
var it = mocha.it;
const OrgID = "1";
const BranchID = "106";
const CounterID = "120";
const CounterID2 = "121";
const Invalid_BranchID = "106123";
const Invalid_CounterID = "120123";

should.toString();


beforeEach(async function () {
    queuingPreperationsInject.initialize();
});


describe('Queuing Preperations Test', async function () {
    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Prepare Available Actions failed invalid branch', async function () {
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, Invalid_BranchID, CounterID);
        (AvailableActions == undefined).should.true();
    });
    it('Prepare Available Actions failed invalid counter', async function () {
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, Invalid_CounterID);
        (AvailableActions == undefined).should.true();
    });
    it('Prepare Available Actions on customer serving counter which next allowed on the counter it is serving', async function () {
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed).should.true();
    });
    it('Prepare Available Actions on Ticket Dispenser which will return undefind', async function () {
        queuingPreperationsInject.changeCounterType(OrgID, BranchID, CounterID, enums.counterTypes.TicketDispenser)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions == undefined).should.true();
    });
    it('Prepare Available Actions on Ticket Dispenser With User which will return undefind', async function () {
        queuingPreperationsInject.changeCounterType(OrgID, BranchID, CounterID, enums.counterTypes.TicketDispenserWithUser)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions == undefined).should.true();
    });
    it('Prepare Available Actions check break action on no call counter (not serving counter counter) break enabled and next is disabled', async function () {
        queuingPreperationsInject.changeCounterType(OrgID, BranchID, CounterID, enums.counterTypes.NoCallServing)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == false && AvailableActions.BreakAllowed == true).should.true();
    });
    it('Prepare Available Actions on counter who is on break (must = Next enabled,Break disabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == true && AvailableActions.BreakAllowed == false).should.true();
    });
    it('Prepare Available Actions on counter who is on Ready to server (must = Next enabled,Break enabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == true && AvailableActions.BreakAllowed == true).should.true();
    });
    it('Prepare Available Actions on counter who is on Ready to Processing (must = Next enabled,Break enabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Processing)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == true && AvailableActions.BreakAllowed == true).should.true();
    });
    it('Prepare Available Actions on counter who is on Ready to Custom state (must = Next enabled,Break enabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Custom)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == true && AvailableActions.BreakAllowed == true).should.true();
    });
    it('Prepare Available Actions on counter who is on Ready to Not Ready to serve (must = Next enabled,Break disabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.NotReady)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == true && AvailableActions.BreakAllowed == false).should.true();
    });
    it('Prepare Available Actions on counter who is logged out (must = everything should disabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.InsideCalenderLoggedOff)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == false && AvailableActions.BreakAllowed == false).should.true();
    });
    it('Prepare Available Actions on counter who is Supervising if something wrong (must = everything should disabled)', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Supervising)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextAllowed == false && AvailableActions.BreakAllowed == false).should.true();
    });

    //Custom state testing
    it('Prepare Available Actions when custom state is enabled (CustomStateAllowed should be true)', async function () {
        let customSettings = "1%%%Office work###Office work###Office work###";
        queuingPreperationsInject.setCustomStateSetting(BranchID, customSettings);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.CustomStateAllowed == true).should.true();
    });
    it('Prepare Available Actions when custom state is disabled (CustomStateAllowed should be false)', async function () {
        let customSettings = "0%%%Office work###Office work###Office work###";
        queuingPreperationsInject.setCustomStateSetting(BranchID, customSettings);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.CustomStateAllowed == false).should.true();
    });

    //Debounce Testing
    it('Prepare Available Actions Setting debounce time to 5 seconds', async function () {
        queuingPreperationsInject.setDebounceSeconds(BranchID, "5");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextEnabledAfter == "5").should.true();
    });
    it('Prepare Available Actions Setting debounce time=5 and customernotification to 3 when serving', async function () {
        queuingPreperationsInject.setDebounceSeconds(BranchID, "5");
        queuingPreperationsInject.setCustomerNotificationInterval(BranchID, "3");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextEnabledAfter == "5").should.true();
    });
    it('Prepare Available Actions Setting debounce time=5 and customernotification to 3 when ready this will make it take the lower value', async function () {
        queuingPreperationsInject.setDebounceSeconds(BranchID, "5");
        queuingPreperationsInject.setCustomerNotificationInterval(BranchID, "3");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready)
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.NextEnabledAfter == "3").should.true();
    });

    //Finish Finish
    it('Prepare Available Actions disable finish serving setting on serving counter (Finish serving is disabled)', async function () {
        queuingPreperationsInject.setFinishServingSettings(BranchID, "0");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.FinishAllowed == false).should.true();
    });
    it('Prepare Available Actions enable finish serving setting on serving counter (Finish serving is enabled)', async function () {
        queuingPreperationsInject.setFinishServingSettings(BranchID, "1");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.FinishAllowed == true).should.true();
    });

    it('Prepare Available Actions enabled finish serving setting on ready to serve counter (Finish serving is disabled)', async function () {
        queuingPreperationsInject.setFinishServingSettings(BranchID, "1");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.FinishAllowed == false).should.true();
    });
    it('Prepare Available Actions enabled finish serving setting on Break to serve counter (Finish serving is disabled)', async function () {
        queuingPreperationsInject.setFinishServingSettings(BranchID, "1");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.FinishAllowed == false).should.true();
    });

    //Recall Testing
    it('Prepare Available Actions set Max Recall to 0 (Disabled Recall)', async function () {
        queuingPreperationsInject.setMaxNumberOfRecalls(BranchID, "0");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.RecallAllowed == false).should.true();
    });
    it('Prepare Available Actions set Max Recall to 4 (Enabled Recall)', async function () {
        queuingPreperationsInject.setMaxNumberOfRecalls(BranchID, "4");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.RecallAllowed == true).should.true();
    });
    it('Prepare Available Actions set Max Recall to 4 but the counter is on break (Disabled Recall)', async function () {
        queuingPreperationsInject.setMaxNumberOfRecalls(BranchID, "4");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.RecallAllowed == false).should.true();
    });
    it('Prepare Available Actions set Max Recall to 4 but the counter is on custom state (Disabled Recall)', async function () {
        queuingPreperationsInject.setMaxNumberOfRecalls(BranchID, "4");
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Custom);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.RecallAllowed == false).should.true();
    });

    //Open Counter Testing
    it('Prepare Available Actions enabled Open when the counter is on Not Ready State', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.NotReady);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == true).should.true();
    });
    it('Prepare Available Actions enabled Open when the counter is on Break', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == true).should.true();
    });
    it('Prepare Available Actions enabled Open when the counter is on Custom', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Custom);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == true).should.true();
    });
    it('Prepare Available Actions disabled Open when the counter is on ready', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == false).should.true();
    });
    it('Prepare Available Actions disabled Open when the counter is on Serving', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Serving);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == false).should.true();
    });
    it('Prepare Available Actions disabled Open when the counter is on Processing', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Processing);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.OpenAllowed == false).should.true();
    });

    //EnableTakingCustomerPhoto Testing
    it('Prepare Available Actions disabled Taking Customer Photo', async function () {
        queuingPreperationsInject.setTakingPhotoCustomerEnable(BranchID, "0");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.EnableTakingCustomerPhoto == false).should.true();
    });
    it('Prepare Available Actions enabled Taking Customer Photo', async function () {
        queuingPreperationsInject.setTakingPhotoCustomerEnable(BranchID, "1");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.EnableTakingCustomerPhoto == true).should.true();
    });

    //ShowServeWithButton Enable
    it('Prepare Available Actions disabled Show Serve With Button', async function () {
        queuingPreperationsInject.setServeWithEnable(BranchID, "0");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.ShowServeWithButton == false).should.true();
    });
    it('Prepare Available Actions enabled Show Serve With Button', async function () {
        queuingPreperationsInject.setServeWithEnable(BranchID, "1");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.ShowServeWithButton == true).should.true();
    });

    //Hold Testing
    it('Prepare Available Actions disabled Hold feature (Disable Hold)', async function () {
        queuingPreperationsInject.setHoldEnable(BranchID, "0");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.HoldAllowed == false).should.true();
    });
    it('Prepare Available Actions enabled Hold feature (Enable Hold)', async function () {
        queuingPreperationsInject.setHoldEnable(BranchID, "1");
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.HoldAllowed == true).should.true();
    });
    it('Prepare Available Actions enabled Hold feature but the counter without transaction (Disable Hold)', async function () {
        queuingPreperationsInject.setHoldEnable(BranchID, "1");
        queuingPreperationsInject.removeTransaction(OrgID, BranchID, CounterID);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.HoldAllowed == false).should.true();
    });
    it('Prepare Available Actions filled Add Service Enabled After', async function () {
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.AddServiceEnabledAfter > 0).should.true();
    });
    it('Prepare Available Actions Empty Add Service Enabled After because of no transaction on the counter', async function () {
        queuingPreperationsInject.removeTransaction(OrgID, BranchID, CounterID);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.AddServiceEnabledAfter == 0).should.true();
    });
    it('Prepare Available Actions filled Max Acceptable Service Time', async function () {
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.MaxAcceptableServiceTime > 0).should.true();
    });
    it('Prepare Available Actions Empty Add Service Enabled After because of no transaction on the counter', async function () {
        queuingPreperationsInject.removeTransaction(OrgID, BranchID, CounterID);
        let AvailableActions = await queuingPreperations.prepareAvailableActionsForCounter(OrgID, BranchID, CounterID);
        (AvailableActions != undefined && AvailableActions.MaxAcceptableServiceTime == 0).should.true();
    });

    //TODO
    //Test Transfer Back
    //Test Transfer To Service
    //Test Transfer To Counter
    //Test Add to Service
    //Add Pre - Service
    //Automatic Transfer 

    ////////////////////////////////////////
    //Testing After Action Preparations 
    it('AfterActionPreperations The counter Stayed in its state Serving (ON to ON) then only 1 prepare should happened', async function () {
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID, CounterID2];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges == 1).should.true();
    });
    it('AfterActionPreperations The counter Stayed in its state Processing (ON to ON) then only 1 prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Processing);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID, CounterID2];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges == 1).should.true();
    });
    it('AfterActionPreperations The counter Stayed in its state Ready (ON to ON) then only 1 prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID, CounterID2];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges == 1).should.true();
    });
    it('AfterActionPreperations The counter Stayed in its state Break (OFF to OFF) then only 1 prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges == 1).should.true();
    });

    it('AfterActionPreperations The state was not cache inside the manager as active counter, then all counters prepare should happened', async function () {
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID2];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });
    it('AfterActionPreperations The counter changed to break when it was serving (ON to OFF) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to Custom when it was serving (ON to OFF) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Custom);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to NotReady when it was serving (ON to OFF) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.NotReady);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        let tbranchCountersState = new branchCountersState();
        tbranchCountersState.id = BranchID;
        tbranchCountersState.ActiveCounterIDs = [CounterID];
        branchCountersStateArray.push(tbranchCountersState);
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to Processing when it was off (OFF to ON) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Processing);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to Ready when it was off (OFF to ON) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to Serving when it was off (OFF to ON) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.Serving);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });

    it('AfterActionPreperations The counter changed to Serving when it was off (OFF to ON) then all counters prepare should happened', async function () {
        queuingPreperationsInject.setCurrentCounterState(OrgID, BranchID, CounterID, enums.UserActiontypes.NoCallServing);
        let branchCountersStateArray = []
        let NumberOfChanges = 0;
        queuingPreperations.__set__('branchCountersStateArray', branchCountersStateArray);
        let result = queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        NumberOfChanges = queuingPreperations.__get__('NumberOfChanged');
        (result == common.success && NumberOfChanges > 1).should.true();
    });



});
