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

function setTransferBackSettings(orgID, branchID, counterID, CurrentWorkFlow, availableActions) {
    let CustomerReturn0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_BACK);
    //Check Return
    if (CurrentWorkFlow && CurrentWorkFlow.IsTransferBackEnabled == true && CustomerReturn0Enabled == true) {
        availableActions.TransferBackAllowed = WorkFlowManager.IsTransferBackAllowed(orgID, branchID, counterID);
    }
}

function setAddServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let AddService0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_ADDING_SERVICES_PARAMETER);
    availableActions.AddServiceAllowed = AddService0Enabled && CurrentWorkFlow.IsAddServiceEnabled && serviceAvailableActions.AllowAddingFromAnother;
    if (availableActions.AddServiceAllowed) {
        availableActions.AddServices = WorkFlowManager.PrepareAddList(orgID, branchID, counterID);
    }
}
function setTransferToCounterSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let TransfToCounter0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_WINDOW);
    availableActions.TransferToCounterAllowed = TransfToCounter0Enabled && CurrentWorkFlow.IsTransferToCounterAllowed && serviceAvailableActions.AllowTransferingToCounter;
    if (availableActions.TransferToCounterAllowed) {
        availableActions.TransferCounters = WorkFlowManager.PrepareTransferCountersList(orgID, branchID, counterID);
    }
}
function setTransferToServiceSettings(orgID, branchID, counterID, CurrentWorkFlow, serviceAvailableActions, availableActions) {
    let TransfToService0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_SERVICE);
    availableActions.TransferToServiceAllowed = TransfToService0Enabled && CurrentWorkFlow.IsTransferToServiceAllowed && serviceAvailableActions.AllowTransferingToAnother;
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
    let ValidStates = [enums.EmployeeActiontypes.Serving, enums.EmployeeActiontypes.Ready, enums.EmployeeActiontypes.Processing, enums.EmployeeActiontypes.Break, enums.EmployeeActiontypes.NoCallServing];
    let TempString = configurationService.getCommonSettings(branchID, constants.CUSTOM_STATE_SETTINGS);
    if (TempString != null && TempString.startsWith("1") && (ValidStates.indexOf(CurrentState) > -1)) {
        availableActions.CustomStateAllowed = true;
    }
}
function setBreakActions(orgID, branchID, CurrentState, availableActions) {
    let BreakValidStates = [enums.EmployeeActiontypes.Serving, enums.EmployeeActiontypes.Ready, enums.EmployeeActiontypes.Processing, enums.EmployeeActiontypes.Custom, enums.EmployeeActiontypes.NoCallServing];
    let tEnableBreak = false;
    tEnableBreak = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_BREAK);
    if (tEnableBreak && (BreakValidStates.indexOf(CurrentState) > -1)) {
        availableActions.BreakAllowed = true;
    }
}
function setFinishActions(branchID, CurrentState, availableActions) {
    //Check IF fINISH SERVING SHOULD BE ALLOWED
    let tShowServeWithButton = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_FINISH_SERVING);
    if (tShowServeWithButton && CurrentState == enums.EmployeeActiontypes.Serving) {
        availableActions.FinishAllowed = true;
    }
}
function setHoldSettings(branchID, CurrentWorkFlow, availableActions) {
    let Hold0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_CUSTOMER_HOLD);
    availableActions.HoldAllowed = Hold0Enabled && CurrentWorkFlow.IsHoldEnabled;
}
function setCustomerInfoRelatedSettings(branchID, CurrentState, availableActions) {
    let TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_EDITING_SERVED_CUSTOMER_INFO);
    if (TempString && TempString == "1" && CurrentState == enums.EmployeeActiontypes.Serving) {

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
    if (CurrentState == enums.EmployeeActiontypes.Serving && CurrentTransaction != null && CurrentTransaction.recallNo < MaxRecallTimes) {
        availableActions.RecallAllowed = true;
    }
}

function setOpenSettings(CurrentState, availableActions) {
    let OpenDisableStates = [enums.EmployeeActiontypes.Serving, enums.EmployeeActiontypes.Ready, enums.EmployeeActiontypes.Processing, enums.EmployeeActiontypes.NoCallServing];
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
        let Hold0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_CUSTOMER_HOLD);
        WindowListButtonsVisible = Hold0Enabled ? true : false;
    }
    let validStates = [enums.EmployeeActiontypes.NotReady, enums.EmployeeActiontypes.Serving, enums.EmployeeActiontypes.Processing, enums.EmployeeActiontypes.Custom]
    let isValidCounterStates = validStates.indexOf(CurrentState) > -1;
    //ListServingAllowed
    if (WindowListButtonsVisible && isValidCounterStates) {
        availableActions.ListServeAllowed = true;
        //If (Serve) button was hidden then keep (Serve With) button enabled
        availableActions.ListServeWithAllowed = availableActions.HideServeButton ? true : false;
    }
    let isTransferEnabled = (availableActions.TransferToServiceAllowed == true && availableActions.TransferServicesIDs != null && availableActions.TransferServicesIDs.Length > 0)
    if (WindowListButtonsVisible && availableActions.HoldAllowed || isTransferEnabled || availableActions.TransferToCounterAllowed) {
        availableActions.ListServeWithAllowed = true;
    }
}


function setNextSettings(orgID, branchID, State, CurrentWorkFlow, availableActions) {
    let NextDebounceSeconds = configurationService.getCommonSettingsInt(branchID, constants.NEXT_DEBOUNCE_SECONDS);
    let BreakNotification = configurationService.getCommonSettingsInt(branchID, constants.SHOW_CUSTOMER_NOTIFICATION_INTERVAL);
    if (State == enums.EmployeeActiontypes.Serving) {
        if (!CurrentWorkFlow || CurrentWorkFlow.IsNextEnabled) {
            availableActions.NextAllowed = true;
        }
    }
    availableActions.NextEnabledAfter = 0;
    if (CurrentWorkFlow && CurrentWorkFlow.OverrideNextDebounceSeconds) {
        availableActions.NextEnabledAfter = CurrentWorkFlow.NextDebounceSeconds;
    }
    let Debouncestates = [enums.EmployeeActiontypes.Serving, State == enums.EmployeeActiontypes.Processing];
    if (Debouncestates.indexOf(State) > -1) {
        availableActions.NextEnabledAfter = NextDebounceSeconds;
    }

    if (State == enums.EmployeeActiontypes.Ready) {
        availableActions.NextEnabledAfter = (NextDebounceSeconds < BreakNotification) ? NextDebounceSeconds : BreakNotification;
    }
}

function prepareAvailableActions(orgID, branchID, counterID) {
    var availableActions = new AvailableActions();
    try {
        let CurrentWindow = configurationService.getCounterConfig(counterID);
        let CounterIsServingOrNoCall = (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing || CurrentWindow.Type_LV == enums.counterTypes.NoCallServing);
        //Check for correct type
        if (CounterIsServingOrNoCall) {

            let CurrentWorkFlow
            let output = [];
            let CounterData;
            let CurrentActivity;
            let CurrentTransaction;
            dataService.getCurrentData(orgID, branchID, counterID, output);
            CounterData = output[1];
            CurrentActivity = output[2];
            CurrentTransaction = output[3];

            availableActions.EnableTakingCustomerPhoto = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TACKING_CUSTOMER_PHOTO);

            let State = parseInt(CurrentActivity.type);
            if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                //Serve Button
                availableActions.ShowServeWithButton = configurationService.getCommonSettingsBool(branchID, constants.SHOW_SERVE_WITH_BUTTON);
                //Check IF fINISH SERVING SHOULD BE ALLOWED
                setFinishActions(branchID, State, availableActions)
                let service_ID;
                if (CurrentTransaction && CurrentTransaction.service_ID) {
                    service_ID = CurrentTransaction.service_ID;
                    CurrentWorkFlow = WorkFlowManager.getWorkFlow(branchID, service_ID);
                    let serviceAvailableActions = WorkFlowManager.getServiceAvailableActions(branchID, service_ID);
                    availableActions.AddServiceEnabledAfter = serviceAvailableActions.MinServiceTime;
                    //MaxAcceptableServiceTime
                    let serviceConfig = configurationService.getServiceConfigFromService(service_ID);
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
                setNextSettings(orgID, branchID, State, CurrentWorkFlow, availableActions);
                //Set Break settings
                setBreakActions(orgID, branchID, State, availableActions);
                //Set Custom Settings
                setCustomStateActions(orgID, branchID, State, availableActions);

                if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                    //Set the recall setting
                    setRecallSettings(branchID, State, CurrentTransaction, availableActions)
                    //Open button settings
                    setOpenSettings(State, availableActions)
                    //Serve with/ list serving settings
                    setServeWithSettings(branchID, CurrentWindow, State, availableActions);
                    //Automatic Transfer
                    setAutomaticTransferSettings(CurrentWorkFlow, availableActions);
                    setPreServiceSettings(CurrentWorkFlow, availableActions);
                }
            }
            else {
                availableActions.HideServeButton = true;
                availableActions.ShowServeWithButton = false;
                availableActions.FinishAllowed = false;
                availableActions.TransferToServiceAllowed = false;
                availableActions.TransferToCounterAllowed = false;
                availableActions.AddServiceAllowed = false;
                availableActions.HoldAllowed = false;
                availableActions.TransferBackAllowed = false;
                availableActions.AddServices = null;
                availableActions.TransferCounters = null;
                availableActions.TransferServicesIDs = null;
                availableActions.EditCustomerInfoAllowed = false;
                availableActions.IdentifyCustomerAllowed = false;
            }
        }
        return availableActions;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}



module.exports.prepareAvailableActions = prepareAvailableActions;
