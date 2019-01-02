"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var commonMethods = require("../../common/commonMethods");
var crypto = require("../../common/crypto");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var dataService = require("../data/dataService");
var userActivity = require("../data/userActivity");
var configurationService = require("../configurations/configurationService");
var queuingPreperations = require("./queuingPreperations");
var workFlowManager = require("./workFlowManager");

var updateUserAvitivityInData = function (BracnhData, userActivity) {
    try {
        if (BracnhData != null && BracnhData.userActivitiesData != null) {
            for (let i = 0; i < BracnhData.userActivitiesData.length; i++) {
                if (BracnhData.userActivitiesData[i].id == userActivity.id) {
                    BracnhData.userActivitiesData[i] = userActivity;
                    if (BracnhData.userActivitiesData[i].closed == 1) {
                        BracnhData.userActivitiesData.splice(i, 1);
                    }
                    break;
                }
            }
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Update Activity
var UpdateActivity = function (RequestID, userActivity) {
    try {
        if (!RequestID) {
            logger.logError("empty request ID");
        }
        userActivity._RequestID = RequestID;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(userActivity.orgID, userActivity.queueBranch_ID);
        //Update in memory
        let result = updateUserAvitivityInData(BracnhData, userActivity);
        if (result == common.success) {
            //Update in DB
            repositoriesManager.entitiesRepo.UpdateSynch(userActivity);
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Add or Update Activity
var AddActivity = function (RequestID, userActivity) {
    try {
        if (!RequestID) {
            logger.logError("empty request ID");
        }
        userActivity._RequestID = RequestID;
        //Generate ID in not exists
        if (userActivity.id <= 0) {
            userActivity.id = -1;
        }
        //Get Branch Data
        let BracnhData = dataService.getBranchData(userActivity.orgID, userActivity.queueBranch_ID);
        if (BracnhData != null && BracnhData.userActivitiesData != null) {
            //To Branch Transactions
            BracnhData.userActivitiesData.push(userActivity);

            //Update To data base
            repositoriesManager.entitiesRepo.AddSynch(userActivity);
            return common.success;
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

var UpdateActionTime = function (RequestID, Activity) {
    try {
        if (!RequestID) {
            logger.logError("empty request ID");
        }
        Activity.lastChangedTime = commonMethods.Now();
        Activity._RequestID = RequestID;
        repositoriesManager.entitiesRepo.UpdateSynch(Activity);
        return Activity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var UserLogin = function (RequestID, OrgID, BranchID, CounterID, loginName, password, clientType, CountersInfo) {
    try {
        let result = common.success;
        var user = configurationService.configsCache.users.find(function (user) {
            return (user.OrgID == OrgID && user.LoginName == loginName)
        });
        //Check User name
        if (!user) {
            return common.error;
        }

        //Check Passowrd
        if (crypto.Decrypt(user.Password) != password) {
            return common.error;
        }

        //Get Branch Data
        let BracnhData = dataService.getBranchData(OrgID, BranchID);
        let CounterData = dataService.getCounterData(BracnhData, CounterID)

        //Error if the counter is not correct
        if (!CounterData) {
            return common.error;

        }
        let ArrayOfInvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff];
        if (!CounterData.currentState) {
            result = InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.NotReady);
        }
        else {
            if (checkIfValueEqualAtLeastOne(CounterData.currentState.activityType, ArrayOfInvalidStates)) {
                CloseActivity(RequestID, CounterData.currentState);
                result = InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.NotReady);
            }
        }

        CounterData.currentState.user_ID = user.ID;
        queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        CountersInfo.push(CounterData);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};



//Create New User Activity
var CreateNewActivity = function (RequestID, OrgID, BranchID, CounterID, type) {
    try {
        let NewActivity = new userActivity();
        NewActivity.orgID = OrgID;
        NewActivity.queueBranch_ID = BranchID;
        NewActivity.id = -1;
        NewActivity.activityType = type;
        NewActivity.counter_ID = CounterID;
        NewActivity.startTime = commonMethods.Now();
        NewActivity.lastChangedTime = commonMethods.Now();
        NewActivity.duration = 0;
        NewActivity.calendarDuration = 0;
        NewActivity.closed = 0;
        AddActivity(RequestID, NewActivity);
        return NewActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};



var CloseActivity = function (RequestID, Activity) {
    try {
        if (Activity) {
            Activity.endTime = commonMethods.Now();
            Activity.duration = (Activity.endTime - Activity.startTime) / 1000;
            Activity.calendarDuration = (Activity.endTime - Activity.startTime) / 1000;
            Activity.closed = 1;
            UpdateActivity(RequestID, Activity);
            return Activity;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var checkIfValueEqualAtLeastOne = function (Value, ArrayOfValues) {
    try {
        let Exists = false;
        let ItemValue = ArrayOfValues.find(function (tValue) {
            return tValue == Value;
        });
        if (ItemValue) {
            Exists = true;
        }
        return Exists;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};
var checkIfValueNotEqualAnyValue = function (Value, ArrayOfValues) {
    try {
        let NotExists = false;
        let ItemValue = ArrayOfValues.find(function (tValue) {
            return tValue == Value;
        });
        if (!ItemValue) {
            NotExists = true;
        }
        return NotExists;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

function InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, EmployeeActionType) {
    try {
        let CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterData.id, EmployeeActionType);
        CounterData.currentState = CurrentActivity;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Check Counter Validation For Open
var isCounterValidForAutoNext = function (CurrentActivity) {
    try {
        // Change the Current activity
        if (CurrentActivity && CurrentActivity.activityType == enums.UserActiontypes.Ready) {
            return true;
        }
        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

//Check Counter Validation For Open
var CounterValidationForOpen = function (errors, RequestID, OrgID, BranchID, CounterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        if (!CounterData) {
            return common.not_valid;
        }

        let result = common.not_valid;
        // Change the Current activity
        if (CurrentActivity) {
            let ValidStates = [enums.UserActiontypes.Custom, enums.UserActiontypes.Break, enums.UserActiontypes.NotReady]
            if (checkIfValueEqualAtLeastOne(CurrentActivity.activityType, ValidStates)) {
                result = common.success;
            }
            else {
                errors.push("Not in the correct state to open");
                result = common.not_valid;
            }
        }
        else {
            result = InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Change Current Counter State
var ChangeCurrentCounterStateForOpen = function (errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        CloseActivity(RequestID, CurrentActivity);

        let counter = configurationService.getCounterConfig(CounterID);

        //Check for correct type
        if (counter && counter.Type_LV == enums.counterTypes.CustomerServing) {

            CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        }
        else {
            CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterID, enums.UserActiontypes.NoCallServing);
        }

        CounterData.currentState = CurrentActivity;
        queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        CountersInfo.push(CounterData);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Check Counter Validation ForNext
var CounterValidationForBreak = function (errors, RequestID, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        if (!CounterData) {
            return common.not_valid;
        }

        let result = common.not_valid;
        // Change the Current activity
        if (CurrentActivity) {
            let ArrayOfInvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff, enums.UserActiontypes.TicketDispensing, enums.UserActiontypes.Break];
            if (checkIfValueNotEqualAnyValue(CurrentActivity.activityType, ArrayOfInvalidStates)) {
                result = common.success;
            }
            else {
                errors.push("Not in the correct state to Break");
                result = common.not_valid;
            }
        }
        else {
            result = InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


//Check Counter Validation For Hold
var CounterValidationForHold = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        if (!CounterData) {
            return common.not_valid;
        }

        let counter = configurationService.getCounterConfig(CounterData.id);
        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {
            return common.not_valid;
        }
        // ths status should be serving
        if (CurrentActivity && CurrentActivity.activityType != enums.UserActiontypes.Serving) {
            return common.not_valid;
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Check Counter Validation ForNext
var CounterValidationForServe = function (errors, RequestID, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        if (!CounterData) {
            return common.not_valid;
        }

        let counter = configurationService.getCounterConfig(CounterData.id);
        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing && counter.Type_LV != enums.counterTypes.NoCallServing) {
            return common.not_valid;
        }

        // Change the Current activity
        if (CurrentActivity) {
            let ValidStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.NoCallServing, enums.UserActiontypes.Ready, enums.UserActiontypes.Serving, enums.UserActiontypes.Processing, enums.UserActiontypes.Custom, enums.UserActiontypes.Break]
            if (checkIfValueEqualAtLeastOne(CurrentActivity.activityType, ValidStates)) {
                return common.success;
            }
            return common.not_valid;
        }
        else {
            return InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Check Counter Validation ForNext
var CounterValidationForTransfer = function (errors, RequestID, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        if (!CounterData) {
            return common.not_valid;
        }
        let counter = configurationService.getCounterConfig(CounterData.id);

        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {
            return common.not_valid;
        }

        if (!CurrentActivity) {
            InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }

        // Change the Current activity
        if (CurrentActivity.activityType == enums.UserActiontypes.Serving) {
            return common.success;
        }
        else {
            return common.not_valid;
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Check Counter Validation ForNext
var CounterValidationForNext = function (errors, RequestID, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        let Currenttransaction;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        Currenttransaction = output[3];
        if (!CounterData) {
            return common.not_valid;
        }

        let counter = configurationService.getCounterConfig(CounterData.id);
        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {

            return common.not_valid;
        }

        // Change the Current activity
        if (CurrentActivity) {
            //Check Debounce
            if (Currenttransaction) {
                let secondDiff = (commonMethods.Now() - CurrentActivity.lastChangedTime)/1000 ;
                let NextEnabledAfter = CounterData.availableActions.NextEnabledAfter;
                if (NextEnabledAfter > 0 && secondDiff > 0 &&secondDiff < NextEnabledAfter)
                {
                    errors.push("nextDebounce");
                    return common.skip_command;
                }
            }
            let ArrayOfInvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff, enums.UserActiontypes.NoCallServing, enums.UserActiontypes.TicketDispensing]
            if (checkIfValueNotEqualAnyValue(CurrentActivity.activityType, ArrayOfInvalidStates)) {
                return common.success;
            }
            else {
                return common.not_valid;
            }
        }
        else {
            return InitializeCounterActivity(RequestID, OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Change Current Counter State
var ChangeCurrentCounterStateForBreak = function (errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        CloseActivity(RequestID, CurrentActivity);

        CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
        CounterData.currentState = CurrentActivity;
        queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        CountersInfo.push(CounterData);
        return common.success;
    }
    catch (error) {
        errors.push(error.toString());
        logger.logError(error);
        return common.error;
    }
};


var firstUserActivity = function (RequestID, OrgID, BranchID, CounterData) {
    try {
        let CurrentActivity;
        if (CounterData.currentTransaction) {
            CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterData.id, enums.UserActiontypes.Serving);
        }
        else {
            CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterData.id, enums.UserActiontypes.Ready);
        }
        return CurrentActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var updateServingUserActivity = function (RequestID, OrgID, BranchID, CounterData, CurrentActivity) {
    try {
        if (CounterData.currentTransaction) {
            if (CurrentActivity.activityType != enums.UserActiontypes.Serving) {
                CloseActivity(RequestID, CurrentActivity);
                CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterData.id, enums.UserActiontypes.Serving);
            }
            else {
                CurrentActivity = UpdateActionTime(RequestID, CurrentActivity);
            }
        }
        else {
            if (CurrentActivity.activityType != enums.UserActiontypes.Ready) {
                CloseActivity(RequestID, CurrentActivity);
                CurrentActivity = CreateNewActivity(RequestID, OrgID, BranchID, CounterData.id, enums.UserActiontypes.Ready);
            }
            else {
                CurrentActivity = UpdateActionTime(RequestID, CurrentActivity);
            }
        }
        return CurrentActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};


//Change Current Counter State
var ChangeCurrentCounterStateForNext = function (errors, RequestID, OrgID, BranchID, CounterID, CountersInfo) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CurrentActivity = updateServingUserActivity(RequestID, OrgID, BranchID, CounterData, CurrentActivity)
        }
        else {
            CurrentActivity = firstUserActivity(RequestID, OrgID, BranchID, CounterData);
        }
        CounterData.currentState = CurrentActivity;
        queuingPreperations.AfterActionPreperations(OrgID, BranchID, CounterID);
        CountersInfo.push(CounterData);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

module.exports.CounterValidationForTransfer = CounterValidationForTransfer;
module.exports.UserLogin = UserLogin;
module.exports.CounterValidationForHold = CounterValidationForHold;
module.exports.isCounterValidForAutoNext = isCounterValidForAutoNext;
module.exports.CounterValidationForNext = CounterValidationForNext;
module.exports.CounterValidationForServe = CounterValidationForServe;
module.exports.ChangeCurrentCounterStateForNext = ChangeCurrentCounterStateForNext;
module.exports.CounterValidationForBreak = CounterValidationForBreak;
module.exports.ChangeCurrentCounterStateForBreak = ChangeCurrentCounterStateForBreak;
module.exports.CounterValidationForOpen = CounterValidationForOpen;
module.exports.ChangeCurrentCounterStateForOpen = ChangeCurrentCounterStateForOpen;
