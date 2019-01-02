/*eslint no-unused-vars: "off"*/
"use strict";
var constants = require("../../common/constants");
var common = require("../../common/common");
var logger = require("../../common/logger");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var AvailableActions = require("../data/availableActions");
var WorkFlowManager = require("./workFlowManager");
var branchCountersState = require("../data/branchCountersState");
var branchCountersStateArray = [];
var ActiveStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.Ready, enums.UserActiontypes.Processing, enums.UserActiontypes.NoCallServing];
//Added for testing Purposes
var NumberOfChanged = 0;

function setTransferBackSettings(orgID, branchID, counterID, CurrentWorkFlow, availableActions) {
    let CustomerReturnEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_BACK);
    //Check Return
    if (CurrentWorkFlow && CurrentWorkFlow.IsTransferBackEnabled == true && CustomerReturnEnabled == true) {
        availableActions.TransferBackAllowed = WorkFlowManager.IsTransferBackAllowed(orgID, branchID, counterID);
    }
}

function setAddServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let AddServiceEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_ADDING_SERVICES_PARAMETER);
    availableActions.AddServiceAllowed = AddServiceEnabled && CurrentWorkFlow.IsAddServiceEnabled && serviceAvailableActions.AllowAddingFromAnother;
    if (availableActions.AddServiceAllowed) {
        availableActions.AddServices = WorkFlowManager.PrepareAddList(orgID, branchID, counterID);
    }
}
function setTransferToCounterSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let TransfToCounterEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_WINDOW);
    availableActions.TransferToCounterAllowed = TransfToCounterEnabled && CurrentWorkFlow.IsTransferToCounterAllowed && serviceAvailableActions.AllowTransferingToCounter;
    if (availableActions.TransferToCounterAllowed) {
        availableActions.TransferCounters = WorkFlowManager.PrepareTransferCountersList(orgID, branchID, counterID);
    }
}
function setTransferToServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let TransfToServiceEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_SERVICE);
    availableActions.TransferToServiceAllowed = TransfToServiceEnabled && CurrentWorkFlow.IsTransferToServiceAllowed && serviceAvailableActions.AllowTransferingToAnother;
    if (availableActions.TransferToServiceAllowed) {
        availableActions.TransferServicesIDs = WorkFlowManager.PrepareTransferServicesList(orgID, branchID, counterID);
    }
}
function setPreServiceSettings(CurrentWorkFlow, availableActions) {
    //Add PreService
    if (CurrentWorkFlow && CurrentWorkFlow.IsAddPreServiceEnabled == true) {
        availableActions.AddPreServiceAllowed = true;
        availableActions.AddPreServiceID = CurrentWorkFlow.AddPreServiceID;
    }

    //Add PreService on Transfer to Service
    if (CurrentWorkFlow && CurrentWorkFlow.IsAddPreServiceOnTransferToServiceEnabled == true) {
        availableActions.AddPreServiceOnTransferToServiceAllowed = true;
        availableActions.AddPreServiceOnTransferID = CurrentWorkFlow.AddPreServiceOnTransferID;
    }
}
function setAutomaticTransferSettings(CurrentWorkFlow, availableActions) {
    //Automatic Transfer
    if (CurrentWorkFlow && CurrentWorkFlow.IsAutomaticTransferToServiceEnabled == true && availableActions.TransferToServiceAllowed == true && CurrentWorkFlow.IsNextEnabled == true) {
        availableActions.AutomaticTransferToServiceAllowed = true;
    }


    if (CurrentWorkFlow && CurrentWorkFlow.AutomaticTransferToServiceID && CurrentWorkFlow.AutomaticTransferToServiceID != "") {
        availableActions.AutomaticTransferToServiceID = availableActions.TransferServicesIDs.find(function (ID) {
            return ID == CurrentWorkFlow.AutomaticTransferToServiceID
        });
    }
}
function setCustomStateActions(orgID, branchID, CurrentState, availableActions) {
    let ValidStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.Ready, enums.UserActiontypes.Processing, enums.UserActiontypes.Break, enums.UserActiontypes.NoCallServing];
    let TempString = configurationService.getCommonSettings(branchID, constants.CUSTOM_STATE_SETTINGS);
    if (TempString != null && TempString.startsWith("1") && (ValidStates.indexOf(CurrentState) > -1)) {
        availableActions.CustomStateAllowed = true;
    }
}
function setBreakActions(orgID, branchID, CurrentState, availableActions) {
    let BreakValidStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.Ready, enums.UserActiontypes.Processing, enums.UserActiontypes.Custom, enums.UserActiontypes.NoCallServing];
    let tEnableBreak = false;
    tEnableBreak = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_BREAK);
    if (tEnableBreak && (BreakValidStates.indexOf(CurrentState) > -1)) {
        availableActions.BreakAllowed = true;
    }
}
function setFinishActions(branchID, CurrentState, availableActions) {
    //Check IF fINISH SERVING SHOULD BE ALLOWED
    let tEnableFinish = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_FINISH_SERVING);
    if (tEnableFinish && CurrentState == enums.UserActiontypes.Serving) {
        availableActions.FinishAllowed = true;
    }
}
function setHoldSettings(branchID, CurrentWorkFlow, availableActions) {
    let HoldEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_CUSTOMER_HOLD);
    availableActions.HoldAllowed = HoldEnabled && CurrentWorkFlow.IsHoldEnabled;
}
function setCustomerInfoRelatedSettings(branchID, CurrentState, availableActions) {
    let TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_EDITING_SERVED_CUSTOMER_INFO);
    if (TempString && TempString == "1" && CurrentState == enums.UserActiontypes.Serving) {

        //TODO: Missing customer information logic
        availableActions.EditCustomerInfoAllowed = true;
    }

    let tEnableIdentifyingTheCustomerMultipleTimes = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_IDENTIFING_IDENTIFIED_CUSTOMER);
    //TODO: Missing Identification service logic
    if (availableActions.EditCustomerInfoAllowed && tEnableIdentifyingTheCustomerMultipleTimes) {
        availableActions.IdentifyCustomerAllowed = true;
    }

}
function setRecallSettings(branchID, CurrentState, CurrentTransaction, availableActions) {
    let MaxRecallTimes = 3;
    MaxRecallTimes = configurationService.getCommonSettingsInt(branchID, constants.MAX_RECALL_TIMES);
    if (CurrentState == enums.UserActiontypes.Serving && CurrentTransaction != null && CurrentTransaction.recallNo < MaxRecallTimes) {
        availableActions.RecallAllowed = true;
    }
}

function setOpenSettings(CurrentState, availableActions) {
    let OpenDisableStates = [enums.UserActiontypes.Serving, enums.UserActiontypes.Ready, enums.UserActiontypes.Processing, enums.UserActiontypes.NoCallServing];
    //Open Button
    if (OpenDisableStates.indexOf(CurrentState) < 0) {
        availableActions.OpenAllowed = true;
    }
}

function setServeWithSettings(branchID, CurrentWindow, CurrentState, availableActions) {
    //Serve Button
    availableActions.HideServeButton = configurationService.getCommonSettingsBool(branchID, constants.HIDE_SERVE_BUTTON);

    let WindowListButtonsVisible = false;
    //TODO: THe list serving counter
    if (CurrentWindow.Type_LV == enums.counterTypes.NoCallServing) {
        WindowListButtonsVisible = true;
    }
    else {
        let HoldEnabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_CUSTOMER_HOLD);
        WindowListButtonsVisible = HoldEnabled ? true : false;
    }
    let workingStates = [enums.UserActiontypes.Ready, enums.UserActiontypes.Serving, enums.UserActiontypes.Processing, enums.UserActiontypes.NoCallServing]
    let isNotWorking = workingStates.indexOf(CurrentState) < 0;
    //ListServingAllowed
    if (WindowListButtonsVisible) {
        if (isNotWorking) {
            availableActions.OpenAllowed = true;
        }
        availableActions.ListServeAllowed = true;
        //If (Serve) button was hidden then keep (Serve With) button enabled
        availableActions.ListServeWithAllowed = availableActions.HideServeButton ? true : false;
    }
    let isTransferEnabled = (availableActions.TransferToServiceAllowed == true && availableActions.TransferServicesIDs != null && availableActions.TransferServicesIDs.Length > 0)
    if (WindowListButtonsVisible && availableActions.HoldAllowed || isTransferEnabled || availableActions.TransferToCounterAllowed) {
        availableActions.ListServeWithAllowed = true;
    }
}

function setNextSettings(CurrentWorkFlow, availableActions) {
    if (!CurrentWorkFlow || CurrentWorkFlow.IsNextEnabled) {
        availableActions.NextAllowed = true;
    }
}
function setNextDebounceSettings(orgID, branchID, State, CurrentWorkFlow, availableActions) {
    let NextDebounceSeconds = configurationService.getCommonSettingsInt(branchID, constants.NEXT_DEBOUNCE_SECONDS);
    let BreakNotification = configurationService.getCommonSettingsInt(branchID, constants.SHOW_CUSTOMER_NOTIFICATION_INTERVAL);
    availableActions.NextEnabledAfter = 0;
    if (CurrentWorkFlow && CurrentWorkFlow.OverrideNextDebounceSeconds) {
        availableActions.NextEnabledAfter = CurrentWorkFlow.NextDebounceSeconds;
    }
    let Debouncestates = [enums.UserActiontypes.Serving, State == enums.UserActiontypes.Processing];
    if (Debouncestates.indexOf(State) > -1) {
        availableActions.NextEnabledAfter = NextDebounceSeconds;
    }

    if (State == enums.UserActiontypes.Ready) {
        availableActions.NextEnabledAfter = (NextDebounceSeconds < BreakNotification) ? NextDebounceSeconds : BreakNotification;
    }
}

function isCounterStateValid(State) {
    let ServingTypes = [enums.UserActiontypes.InsideCalenderLoggedOff, enums.UserActiontypes.OutsideCalenderLoggedOff, enums.UserActiontypes.TicketDispensing, enums.UserActiontypes.Supervising]
    return (ServingTypes.indexOf(State) < 0)
}


function prepareAvailableActionsForCounter(orgID, branchID, counterID) {
    var availableActions;
    try {
        let CurrentWindow = configurationService.getCounterConfig(counterID);
        if (!CurrentWindow) return;
        let ServingTypes = [enums.counterTypes.CustomerServing, enums.counterTypes.NoCallServing]
        let CounterIsServingOrNoCall = (ServingTypes.indexOf(CurrentWindow.Type_LV) > -1);
        //Check for correct type
        if (CounterIsServingOrNoCall) {
            availableActions = new AvailableActions();
            let CurrentWorkFlow;
            let serviceAvailableActions;
            let output = [];
            let BranchData;
            let CounterData;
            let CurrentActivity;
            let CurrentTransaction;
            dataService.getCurrentData(orgID, branchID, counterID, output);
            BranchData = output[0];
            CounterData = output[1];
            CurrentActivity = output[2];
            CurrentTransaction = output[3];
            //If the branch or the counter invalid return undifined
            if (!BranchData || !CounterData) {
                return;
            }
            if (!CurrentActivity) {
                return availableActions;
            }
            let State = parseInt(CurrentActivity.activityType);
            if (isCounterStateValid(State) == false) {
                return availableActions;
            }
            availableActions.EnableTakingCustomerPhoto = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TACKING_CUSTOMER_PHOTO);
            if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                //Serve Button
                availableActions.ShowServeWithButton = configurationService.getCommonSettingsBool(branchID, constants.SHOW_SERVE_WITH_BUTTON);
                //Check IF fINISH SERVING SHOULD BE ALLOWED
                setFinishActions(branchID, State, availableActions)
                let service_ID;
                if (CurrentTransaction && CurrentTransaction.service_ID) {
                    service_ID = CurrentTransaction.service_ID;
                    CurrentWorkFlow = WorkFlowManager.getWorkFlow(branchID, service_ID);
                    serviceAvailableActions = WorkFlowManager.getServiceAvailableActions(branchID, service_ID);
                    //MaxAcceptableServiceTime
                    let serviceConfig = configurationService.getServiceConfigFromService(service_ID);
                    availableActions.AddServiceEnabledAfter = serviceConfig.MinServiceTime;
                    availableActions.MaxAcceptableServiceTime = serviceConfig.KPI_AST_MaxAcceptedValue;

                    setHoldSettings(branchID, CurrentWorkFlow, availableActions);
                    //Check Complicated actions
                    setTransferBackSettings(orgID, branchID, counterID, CurrentWorkFlow, availableActions)
                    setAddServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions);
                    setTransferToCounterSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions);
                    setTransferToServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions);
                }
                //Set customer Info Settings
                setCustomerInfoRelatedSettings(branchID, State, availableActions);
                //Set Next and debounce settings
                setNextSettings(CurrentWorkFlow, availableActions);
                setNextDebounceSettings(orgID, branchID, State, CurrentWorkFlow, availableActions);
                //Set the recall setting
                setRecallSettings(branchID, State, CurrentTransaction, availableActions)
                //Open button settings
                setOpenSettings(State, availableActions)
                //Automatic Transfer
                setAutomaticTransferSettings(CurrentWorkFlow, availableActions);
                setPreServiceSettings(CurrentWorkFlow, availableActions);
            }
            //Serve with/ list serving settings
            setServeWithSettings(branchID, CurrentWindow, State, availableActions);
            //Set Break settings
            setBreakActions(orgID, branchID, State, availableActions);
            //Set Custom Settings
            setCustomStateActions(orgID, branchID, State, availableActions);
        }
        return availableActions;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}
function getBranchCountersData(branchID) {
    try {
        //Check the branch states
        let BranchCounters = branchCountersStateArray.find(function (BranchCounterStates) {
            return BranchCounterStates.id == branchID;
        });

        if (!BranchCounters) {
            BranchCounters = new branchCountersState();
            BranchCounters.id = branchID;
            BranchCounters.ActiveCounterIDs = [];
            branchCountersStateArray.push(BranchCounters);
        }
        return BranchCounters;
    }
    catch (error) {
        logger.logError(error);
        return;
    }
}
function isCounterActive(CurrentActivity) {
    if (CurrentActivity && (ActiveStates.indexOf(parseInt(CurrentActivity.activityType))) > -1) {
        return true;
    }
    return false;
}
function AfterActionPreperations(orgID, branchID, counterID) {
    try {
        //NumberOf changed records for unit testing purpose
        NumberOfChanged = 0;
        //Get current state
        let output = [];
        let BranchData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(orgID, branchID, counterID, output);
        BranchData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        if (!CounterData) {
            return;
        }
        //Check the branch states
        let BranchCounters = getBranchCountersData(branchID)
        let isCounterOn = isCounterActive(CurrentActivity);
        let CounterFound = BranchCounters.ActiveCounterIDs.find(function (ID) {
            return ID == counterID
        });

        //If the state stayed the same (On-On OR Off-off)
        let isSameState = (isCounterOn && CounterFound != undefined) || (!isCounterOn && CounterFound == undefined);
        if (isSameState) {
            CounterData.availableActions = prepareAvailableActionsForCounter(orgID, branchID, counterID);
            NumberOfChanged +=1;
            return common.success;
        }

        //If the counter changed
        if (!isCounterOn && CounterFound) {
            //Remove the Counter from the active counters
            BranchCounters.ActiveCounterIDs = BranchCounters.ActiveCounterIDs.find(function (ID) {
                return ID != counterID
            });
        }
        BranchCounters.ActiveCounterIDs = [];
        BranchData.countersData.forEach(function (counter) {
            if (isCounterActive(counter.currentState)) {
                BranchCounters.ActiveCounterIDs.push(counter.id.toString());
            }
            counter.availableActions = prepareAvailableActionsForCounter(orgID, branchID, counter.id)
            NumberOfChanged +=1;
        });
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}
module.exports.AfterActionPreperations = AfterActionPreperations;
module.exports.prepareAvailableActionsForCounter = prepareAvailableActionsForCounter;
