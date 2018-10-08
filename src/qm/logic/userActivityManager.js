var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var crypto = require("../../common/crypto");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var dataService = require("../data/dataService");
var userActivity = require("../data/userActivity");
var idGenerator = require("../localRepositories/idGenerator");
var configurationService = require("../configurations/configurationService");
var queuingPreperations = require("./queuingPreperations");

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

var UserLogin = function (OrgID, BranchID, CounterID, loginName, password, clientType,CountersInfo) {
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
        let CounterData = dataService.getCounterData(BracnhData,CounterID)
        
        //Error if the counter is not correct
        if (!CounterData) {
            return common.error;

        }
        if (!CounterData.currentState) {
            result = InitializeCounterActivity(OrgID, BranchID, CounterData, enums.UserActiontypes.NotReady);
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

//Update Activity
var UpdateActivity = function (userActivity) {
    try {
        //Get Branch Data
        let BracnhData = dataService.getBranchData(userActivity.org_ID, userActivity.branch_ID);
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
var AddActivity = function (userActivity) {
    try {
        //Generate ID in not exists
        if (userActivity.id <= 0) {
            userActivity.id = idGenerator.getNewID();
        }
        //Get Branch Data
        let BracnhData = dataService.getBranchData(userActivity.org_ID, userActivity.branch_ID);
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

//Create New User Activity
var CreateNewActivity = function (OrgID, BranchID, CounterID, type) {
    try {
        let NewActivity = new userActivity();
        NewActivity.org_ID = OrgID;
        NewActivity.branch_ID = BranchID;
        NewActivity.id = idGenerator.getNewID();
        NewActivity.type = type;
        NewActivity.counter_ID = CounterID;
        NewActivity.startTime = Date.now();
        NewActivity.duration = 0;
        NewActivity.calenderDuration = 0;
        NewActivity.closed = 0;
        AddActivity(NewActivity);
        return NewActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var UpdateActionTime = function (Activity) {
    try {
        Activity.lastActionTime = Date.now();
        repositoriesManager.entitiesRepo.UpdateSynch(Activity);
        return Activity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var CloseActivity = function (Activity) {
    try {
        if (Activity) {
            Activity.endTime = Date.now();
            Activity.duration = (Activity.endTime - Activity.startTime) / 1000;
            Activity.calenderDuration = (Activity.endTime - Activity.startTime) / 1000;
            Activity.closed = 1;
            UpdateActivity(Activity);
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

function InitializeCounterActivity(OrgID, BranchID, CounterData, EmployeeActionType) {
    try {
        let CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterData.id, EmployeeActionType);
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
        if (CurrentActivity && CurrentActivity.type == enums.UserActiontypes.Ready) {
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
var CounterValidationForOpen = function (errors, OrgID, BranchID, CounterID) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        let result = common.not_valid;
        // Change the Current activity
        if (CurrentActivity) {
            let ValidStates = [enums.UserActiontypes.Custom, enums.UserActiontypes.Break, enums.UserActiontypes.NotReady]
            if (checkIfValueEqualAtLeastOne(CurrentActivity.type, ValidStates)) {
                result = common.success;
            }
            else {
                errors.push("Not in the correct state to open");
                result = common.not_valid;
            }
        }
        else {
            result = InitializeCounterActivity(OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
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
var ChangeCurrentCounterStateForOpen = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        CloseActivity(CurrentActivity);

        let counter = configurationService.getCounterConfig(CounterID);

        //Check for correct type
        if (counter && counter.Type_LV == enums.counterTypes.CustomerServing) {

            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.UserActiontypes.Ready);
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.UserActiontypes.NoCallServing);
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
var CounterValidationForBreak = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        let result = common.not_valid;
        // Change the Current activity
        if (CurrentActivity) {
            let ArrayOfInvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff, enums.UserActiontypes.TicketDispensing, enums.UserActiontypes.Custom, enums.UserActiontypes.Break];
            if (checkIfValueNotEqualAnyValue(CurrentActivity.type, ArrayOfInvalidStates)) {
                result = common.success;
            }
            else {
                errors.push("Not in the correct state to Break");
                result = common.not_valid;
            }
        }
        else {
            result = InitializeCounterActivity(OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
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
        let counter = configurationService.getCounterConfig(CounterData.id);

        let result = common.success;
        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {
            result = common.not_valid;
        }
        // ths status should be serving
        if (CurrentActivity && CurrentActivity.type != enums.UserActiontypes.Serving) {
            result = common.not_valid;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Check Counter Validation ForNext
var CounterValidationForServe = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];
        let counter = configurationService.getCounterConfig(CounterData.id);
        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing && counter.Type_LV != enums.counterTypes.NoCallServing) {
            return common.not_valid;
        }

        // Change the Current activity
        if (CurrentActivity) {
            let ValidStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.NoCallServing, enums.UserActiontypes.Ready, enums.UserActiontypes.Serving, enums.UserActiontypes.Processing]
            if (checkIfValueEqualAtLeastOne(CurrentActivity.type, ValidStates)) {
                return common.success;
            }
            return common.not_valid;
        }
        else {
            return InitializeCounterActivity(OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


//Check Counter Validation ForNext
var CounterValidationForNext = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        let counter = configurationService.getCounterConfig(CounterData.id);

        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {

            return common.not_valid;
        }

        // Change the Current activity
        if (CurrentActivity) {
            let ArrayOfInvalidStates = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff, enums.UserActiontypes.NoCallServing, enums.UserActiontypes.TicketDispensing]
            if (checkIfValueNotEqualAnyValue(CurrentActivity.type, ArrayOfInvalidStates)) {
                return common.success;
            }
            else {
                return common.not_valid;
            }
        }
        else {
            return InitializeCounterActivity(OrgID, BranchID, CounterData, enums.UserActiontypes.Ready);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Change Current Counter State
var ChangeCurrentCounterStateForBreak = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        CloseActivity(CurrentActivity);

        CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.UserActiontypes.Break);
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


var firstUserActivity = function (OrgID, BranchID, CounterData) {
    try {
        let CurrentActivity;
        if (CounterData.currentTransaction_ID > 0) {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterData.id, enums.UserActiontypes.Serving);
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterData.id, enums.UserActiontypes.Ready);
        }
        return CurrentActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var updateServingUserActivity = function (OrgID, BranchID, CounterData, CurrentActivity) {
    try {
        if (CounterData.currentTransaction_ID > 0) {
            if (CurrentActivity.type != enums.UserActiontypes.Serving) {
                CloseActivity(CurrentActivity);
                CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterData.id, enums.UserActiontypes.Serving);
            }
            else {
                CurrentActivity = UpdateActionTime(CurrentActivity);
            }
        }
        else {
            if (CurrentActivity.type != enums.UserActiontypes.Ready) {
                CloseActivity(CurrentActivity);
                CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterData.id, enums.UserActiontypes.Ready);
            }
            else {
                CurrentActivity = UpdateActionTime(CurrentActivity);
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
var ChangeCurrentCounterStateForNext = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {
        let output = [];
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CurrentActivity = updateServingUserActivity(OrgID, BranchID, CounterData, CurrentActivity)
        }
        else {
            CurrentActivity = firstUserActivity(OrgID, BranchID, CounterData);
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
