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
    let TempString = configurationService.getCommonSettings(branchID, constants.CUSTOM_STATE_SETTINGS);
    if (TempString != null && TempString.startsWith("1") && (CurrentState == enums.EmployeeActiontypes.Serving || CurrentState == enums.EmployeeActiontypes.Ready || CurrentState == enums.EmployeeActiontypes.Processing || CurrentState == enums.EmployeeActiontypes.Break || CurrentState == enums.EmployeeActiontypes.NoCallServing)) {
        availableActions.CustomStateAllowed = true;
    }
}
function setBreakActions(orgID, branchID, CurrentState, availableActions) {
    let tEnableBreak = false;
    tEnableBreak = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_BREAK);
    if (tEnableBreak && (CurrentState == enums.EmployeeActiontypes.Serving || CurrentState == enums.EmployeeActiontypes.Ready || CurrentState == enums.EmployeeActiontypes.Processing || CurrentState == enums.EmployeeActiontypes.Custom || CurrentState == enums.EmployeeActiontypes.NoCallServing)) {
        availableActions.BreakAllowed = true;
    }

}

function prepareAvailableActions(orgID, branchID, counterID) {
    var availableActions = new AvailableActions();
    try {
        let CurrentWindow = configurationService.getCounterConfig(counterID);
        //Check for correct type
        if (CurrentWindow && (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing || CurrentWindow.Type_LV == enums.counterTypes.NoCallServing)) {
            let TransfToService0Enabled = false;
            let CustomerReturn0Enabled = false;

            let TransfToCounter0Enabled = false;
            let AddService0Enabled = false;
            let Hold0Enabled = false;
            let NextDebounceSeconds = 0;
            let BreakNotification = 7;
            let MaxRecallTimes = 3;
            let CurrentWorkFlow

            let output = [];
            let CounterData;
            let CurrentActivity;
            let CurrentTransaction;
            dataService.getCurrentData(orgID, branchID, counterID, output);
            CounterData = output[1];
            CurrentActivity = output[2];
            CurrentTransaction = output[3];
            let TempString;
            TransfToService0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_SERVICE);

            CustomerReturn0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_BACK);



            TransfToCounter0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TRANSFER_TO_WINDOW);

            AddService0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_ADDING_SERVICES_PARAMETER);

            Hold0Enabled = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_CUSTOMER_HOLD);

            availableActions.EnableTakingCustomerPhoto = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_TACKING_CUSTOMER_PHOTO);

            NextDebounceSeconds = configurationService.getCommonSettingsInt(branchID, constants.NEXT_DEBOUNCE_SECONDS);

            BreakNotification = configurationService.getCommonSettingsInt(branchID, constants.SHOW_CUSTOMER_NOTIFICATION_INTERVAL);

            MaxRecallTimes = configurationService.getCommonSettingsInt(branchID, constants.MAX_RECALL_TIMES);


            let State = CurrentActivity.type;
            if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                //Serve Button
                availableActions.HideServeButton = configurationService.getCommonSettingsBool(branchID, constants.HIDE_SERVE_BUTTON);


                //Serve Button
                availableActions.ShowServeWithButton = configurationService.getCommonSettingsBool(branchID, constants.SHOW_SERVE_WITH_BUTTON);

                //Check IF fINISH SERVING SHOULD BE ALLOWED
                let tShowServeWithButton = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_FINISH_SERVING);
                if (tShowServeWithButton && State == enums.EmployeeActiontypes.Serving) {
                    availableActions.FinishAllowed = true;
                }

                let service_ID;
                if (CurrentTransaction && CurrentTransaction.service_ID) {
                    service_ID = CurrentTransaction.service_ID;
                    CurrentWorkFlow = WorkFlowManager.getWorkFlow(branchID, service_ID);
                    let serviceAvailableActions = WorkFlowManager.getServiceAvailableActions(branchID, service_ID);
                    if (!CurrentWorkFlow) {
                        CurrentWorkFlow = new WorkFlow();
                    }
                    availableActions.NextEnabledAfter = 0;
                    if (CurrentWorkFlow.OverrideNextDebounceSeconds) {
                        availableActions = CurrentWorkFlow.NextDebouncSeconds;
                        availableActions.NextEnabledAfter = NextDebounceSeconds;
                    }
                    availableActions.TransferToServiceAllowed = TransfToService0Enabled && CurrentWorkFlow.IsTransferToServiceAllowed && serviceAvailableActions.AllowTransferingToAnother;
                    availableActions.TransferToCounterAllowed = TransfToCounter0Enabled && CurrentWorkFlow.IsTransferToCounterAllowed && serviceAvailableActions.AllowTransferingToCounter;
                    availableActions.AddServiceAllowed = AddService0Enabled && CurrentWorkFlow.IsAddServiceEnabled && serviceAvailableActions.AllowAddingFromAnother;
                    availableActions.HoldAllowed = Hold0Enabled && CurrentWorkFlow.IsHoldEnabled;
                    availableActions.AddServiceEnabledAfter = serviceAvailableActions.MinServiceTime;

                    //MaxAcceptableServiceTime
                    let serviceConfig = configurationService.getServiceConfigFromService(CurrentTransaction.service_ID);
                    availableActions.MaxAcceptableServiceTime = serviceConfig.KPI_AST_MaxAcceptedValue;

                    //Check Return
                    if (CurrentWorkFlow == null || CurrentWorkFlow.IsTransferBackEnabled == false || CustomerReturn0Enabled == false) {
                        availableActions.TransferBackAllowed = false;
                    }
                    else {
                        availableActions.TransferBackAllowed = WorkFlowManager.IsTransferBackAllowed(orgID, branchID, counterID);
                    }
                }
                if (availableActions.TransferToServiceAllowed) {
                    availableActions.TransferServicesIDs = WorkFlowManager.PrepareTransferServicesList(orgID, branchID, counterID);
                }

                if (availableActions.TransferToCounterAllowed) {
                    availableActions.TransferCounters = WorkFlowManager.PrepareTransferCountersList(orgID, branchID, counterID);
                }
                if (availableActions.AddServiceAllowed) {
                    availableActions.AddServices = WorkFlowManager.PrepareAddList(orgID, branchID, counterID);
                }
                TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_EDITING_SERVED_CUSTOMER_INFO);
                if (TempString && TempString == "1" && State == enums.EmployeeActiontypes.Serving) {

                    //TODO: Missing customer information logic
                    availableActions.EditCustomerInfoAllowed = true;
                }

                let tEnableIdentifyingTheCustomerMultipleTimes = configurationService.getCommonSettingsBool(branchID, constants.ENABLE_IDENTIFING_IDENTIFIED_CUSTOMER);
                //TODO: Missing Identification service logic
                if (availableActions.EditCustomerInfoAllowed && tEnableIdentifyingTheCustomerMultipleTimes) {
                    availableActions.IdentifyCustomerAllowed = true;
                }

                if (State == enums.EmployeeActiontypes.Serving) {
                    if (!CurrentWorkFlow || CurrentWorkFlow.IsNextEnabled) {
                        availableActions.NextAllowed = true;
                    }

                    if (!CurrentActivity || (State != enums.EmployeeActiontypes.Serving && State != enums.EmployeeActiontypes.Ready)) {
                        availableActions.NextEnabledAfter = 0;
                    }
                    else if (State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Processing) {
                        availableActions.NextEnabledAfter = NextDebounceSeconds;
                    }
                    else if (State == enums.EmployeeActiontypes.Ready) {
                        if (NextDebounceSeconds < BreakNotification) {
                            availableActions.NextEnabledAfter = NextDebounceSeconds;
                        }
                        else {
                            availableActions.NextEnabledAfter = BreakNotification;
                        }
                    }
                }

                //Set Break settings
                setBreakActions(orgID, branchID, State, availableActions);
                //Set Custom Settings
                setCustomStateActions(orgID, branchID, State, availableActions);


                let WindowListButtonsVisible = false;
                //TODO: THe list serving counter
                if (CurrentWindow.Type_LV == enums.counterTypes.NoCallServing) {
                    if (State != enums.EmployeeActiontypes.Serving && State != enums.EmployeeActiontypes.Ready && State != enums.EmployeeActiontypes.Processing && State != enums.EmployeeActiontypes.NoCallServing) {
                        availableActions.OpenAllowed = true;
                    }
                    WindowListButtonsVisible = true;
                }
                else {
                    if (Hold0Enabled) {
                        WindowListButtonsVisible = true;
                    }
                }

                if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                    //ListServingAllowed
                    if (WindowListButtonsVisible && (State == enums.EmployeeActiontypes.NotReady || State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Processing || State == enums.EmployeeActiontypes.Custom)) {
                        availableActions.ListServeAllowed = true;

                        //If (Serve) button was hidden then keep (Serve With) button enabled
                        if (availableActions.HideServeButton) {
                            availableActions.ListServeWithAllowed = true;
                        }
                    }
                    if (WindowListButtonsVisible && availableActions.HoldAllowed || (availableActions.TransferToServiceAllowed && availableActions.TransferServicesIDs != null && availableActions.TransferServicesIDs.Length > 0) || availableActions.TransferToCounterAllowed) {
                        availableActions.ListServeWithAllowed = true;
                    }


                    if (State == enums.EmployeeActiontypes.Serving && CurrentTransaction != null && CurrentTransaction.RecallNo < MaxRecallTimes) {
                        availableActions.RecallAllowed = true;
                    }
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
