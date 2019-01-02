"use strict";
var rewire = require("rewire");
delete require.cache[require.resolve("./workFlowManager")];
delete require.cache[require.resolve("./statisticsManager")];
delete require.cache[require.resolve("./queueCommandManager")];
var userActivityManagerInject = require("./userActivityManager.SpecInject");
var queueCommandManager = require("./queueCommandManager");
var userActivityManager = rewire("./userActivityManager");
var common = require("../../common/common");
var enums = require("../../common/enums");
var commonMethods = require("../../common/commonMethods");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const OrgID = "1";
const BranchID = "106";
const SegmentID = "325";
const ServiceID = "364";
const Invalid_BranchID = "106123";
const Invalid_ServiceID = "36422";
const CounterID = "120";
const CounterID2 = "121";
const Invalid_CounterID = "120123";
const ServiceID_DisableAdd = "113";
should.toString();

let RequestID = commonMethods.GenerateRequestID();


beforeEach(async function () {
    await userActivityManagerInject.initialize();
    //Set the cache to the same object
    userActivityManager.__set__('dataService', userActivityManagerInject.dataService);
    userActivityManager.__set__('configurationService', userActivityManagerInject.configurationService);
    RequestID = commonMethods.GenerateRequestID();
});

describe('User Activity Manager Test', async function () {

    it('Initialize', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result != undefined).should.true();
    });

    // test CounterValidationForTransfer
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Transfer succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Transfer failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Transfer failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Transfer failed not a customer serving counter', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToTicketingType(CounterID);
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID2 + ' Validation For Transfer succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID2);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID2);
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID2);
        (result === common.success).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Transfer failed the counter on break', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Transfer the counter is ready not serving', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToReady(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForTransfer(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });


    // test CounterValidationForHold
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Hold succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Hold failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Hold failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Hold failed not a customer serving counter', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToTicketingType(CounterID);
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID2 + ' Validation For Hold succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID2);
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID2);
        (result === common.success).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Hold failed the counter on break', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToBreak(OrgID, BranchID, CounterID)
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Hold the counter is ready not serving', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToReady(OrgID, BranchID, CounterID)
        let result = userActivityManager.CounterValidationForHold(errors, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });



    // test CounterValidationForBreak
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Break succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Break failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Break failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Break failed the counter on break already', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Break succeed the counter on Office work', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToOfficeWork(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForBreak(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });



    // test CounterValidationForNext
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Next succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Next failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Next failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Next failed not a customer serving counter', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToTicketingType(CounterID);
        let result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Next failed the counter is no call state', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToNoCallServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForNext(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    // test CounterValidationForServe
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Serve Customer succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForServe(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Serve Customer failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForServe(errors, RequestID, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Serve Customer failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForServe(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Serve Customer Succeed No calling counter', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToNoCallType(CounterID);
        let result = userActivityManager.CounterValidationForServe(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });


    // test CounterValidationForServe
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Open From Break succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToCustomerServingType(CounterID);
        userActivityManagerInject.setCounterToBreak(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' Validation For Open failed invalid branch', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, Invalid_BranchID, CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' Validation For Open failed invalid counter', async function () {
        let errors = [];
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, Invalid_CounterID);
        (result === common.not_valid).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Open From OfficeWork succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToOfficeWork(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Open From Not ready to serve succeed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToNotReadyToServe(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.success).should.true();
    });

    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Open From Serving Failed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToServing(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' Validation For Open From Ready To Serving Failed', async function () {
        let errors = [];
        userActivityManagerInject.setCounterToReady(OrgID, BranchID, CounterID);
        let result = userActivityManager.CounterValidationForOpen(errors, RequestID, OrgID, BranchID, CounterID);
        (result === common.not_valid).should.true();
    });


    // test UserLogin
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' UserLogin succeed', async function () {
        let CountersInfo = [];
        let loginName = "root";
        let password = "123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, CounterID, loginName, password, clientType, CountersInfo);
        (result === common.success).should.true();
    });
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' UserLogin failed wrong username', async function () {
        let CountersInfo = [];
        let loginName = "root123";
        let password = "123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, CounterID, loginName, password, clientType, CountersInfo);
        (result === common.error).should.true();
    });
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' UserLogin failed wrong password', async function () {
        let CountersInfo = [];
        let loginName = "root";
        let password = "123123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, CounterID, loginName, password, clientType, CountersInfo);
        (result === common.error).should.true();
    });
    it('Branch(' + Invalid_BranchID + ') Counter ' + CounterID + ' UserLogin failed wrong Branch', async function () {
        let CountersInfo = [];
        let loginName = "root";
        let password = "123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, Invalid_BranchID, CounterID, loginName, password, clientType, CountersInfo);
        (result === common.error).should.true();
    });
    it('Branch(' + BranchID + ') Counter ' + Invalid_CounterID + ' UserLogin failed wrong counter', async function () {
        let CountersInfo = [];
        let loginName = "root";
        let password = "123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, Invalid_CounterID, loginName, password, clientType, CountersInfo);
        (result === common.error).should.true();
    });
    it('Branch(' + BranchID + ') Counter ' + CounterID + ' UserLogin succeed', async function () {
        let CountersInfo = [];
        let loginName = "user1";
        let password = "123";
        let clientType = "CES";
        let result = userActivityManager.UserLogin(RequestID, OrgID, BranchID, CounterID, loginName, password, clientType, CountersInfo);
        (result === common.success).should.true();
    });

    // test isCounterValidForAutoNext
    it('isCounterValidForAutoNext succeed', async function () {
        let CurrentActivity = userActivityManagerInject.getValidCurrentActivity();
        let isCounterValid = userActivityManager.isCounterValidForAutoNext(CurrentActivity);
        (isCounterValid === true).should.true();
    });
    it('isCounterValidForAutoNext failed the activity is already serving', async function () {
        let CurrentActivity = userActivityManagerInject.getInvalidCurrentActivity();
        let isCounterValid = userActivityManager.isCounterValidForAutoNext(CurrentActivity);
        (isCounterValid === false).should.true();
    });
    it('isCounterValidForAutoNext failed the activity is undefined', async function () {
        let CurrentActivity = undefined;
        let isCounterValid = userActivityManager.isCounterValidForAutoNext(CurrentActivity);
        (isCounterValid === false).should.true();
    });


    // test isCounterValidForAutoNext
    it('ChangeCurrentCounterStateForNext succeed with activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        let result = userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && (CountersInfo[0].currentState.activityType == enums.UserActiontypes.Ready || CountersInfo[0].currentState.activityType == enums.UserActiontypes.Serving)).should.true();
    });
    it('ChangeCurrentCounterStateForNext succeed without activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        userActivityManagerInject.removeCurrentActivities(OrgID, BranchID, CounterID)
        let result = userActivityManager.ChangeCurrentCounterStateForNext(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && (CountersInfo[0].currentState.activityType == enums.UserActiontypes.Ready || CountersInfo[0].currentState.activityType == enums.UserActiontypes.Serving)).should.true();
    });


    // test ChangeCurrentCounterStateForBreak
    it('ChangeCurrentCounterStateForBreak succeed with activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        let result = userActivityManager.ChangeCurrentCounterStateForBreak(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && CountersInfo[0].currentState.activityType == enums.UserActiontypes.Break).should.true();
    });
    it('ChangeCurrentCounterStateForBreak succeed without activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        userActivityManagerInject.removeCurrentActivities(OrgID, BranchID, CounterID)
        let result = userActivityManager.ChangeCurrentCounterStateForBreak(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && CountersInfo[0].currentState.activityType == enums.UserActiontypes.Break).should.true();
    });

    // test ChangeCurrentCounterStateForOpen
    it('ChangeCurrentCounterStateForOpen succeed with activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        let result = userActivityManager.ChangeCurrentCounterStateForOpen(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && CountersInfo[0].currentState.activityType == enums.UserActiontypes.Ready).should.true();
    });
    it('ChangeCurrentCounterStateForOpen succeed without activity set', async function () {
        let errors = [];
        let CountersInfo = [];
        userActivityManagerInject.removeCurrentActivities(OrgID, BranchID, CounterID)
        let result = userActivityManager.ChangeCurrentCounterStateForOpen(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && CountersInfo[0].currentState.activityType == enums.UserActiontypes.Ready).should.true();
    });


    it('ChangeCurrentCounterStateForOpen succeed ON No call counter', async function () {
        let errors = [];
        let CountersInfo = [];
        userActivityManagerInject.setCounterToNoCallType(CounterID);
        let result = userActivityManager.ChangeCurrentCounterStateForOpen(errors, RequestID, OrgID, BranchID, CounterID, CountersInfo);
        (result === common.success && CountersInfo && CountersInfo[0].currentState.activityType == enums.UserActiontypes.NoCallServing).should.true();
    });
});



