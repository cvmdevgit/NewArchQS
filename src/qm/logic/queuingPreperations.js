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


function prepareAvailableActions(orgID, branchID, counterID) {
    var availableActions = new AvailableActions();
    try {
        let CurrentWindow = configurationService.getCounterConfig(counterID);
        //Check for correct type
        if (CurrentWindow && (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing || CurrentWindow.Type_LV == enums.counterTypes.NoCallServing)) {
            let TransfToService0Enabled = false;
            let CustomerReturn0Enabled = false;
            let tEnableBreak = false;
            let TransfToCounter0Enabled = false;
            let AddService0Enabled = false;
            let Hold0Enabled = false;
            let NextDebounceSeconds = 0;
            let BreakNotification;
            let MaxRecallTimes;
            let CurrentWorkFlow

            let output = [];
            let CounterData;
            let CurrentActivity;
            let CurrentTransaction;
            dataService.getCurrentData(orgID, branchID, counterID, output);
            CounterData = output[1];
            CurrentActivity = output[2];
            CurrentTransaction = output[3];
            let userID = CounterData.userID;
            let AllocationType = configurationService.getCommonSettings(branchID, constants.SERVICE_ALLOCATION_TYPE);
            let TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_TRANSFER_TO_SERVICE);
            if (TempString && TempString == "1") {
                TransfToService0Enabled = true;
            }
            else {
                TransfToService0Enabled = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_TRANSFER_BACK);
            if (TempString && TempString == "1") {
                CustomerReturn0Enabled = true;
            }
            else {
                CustomerReturn0Enabled = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_BREAK);
            if (TempString && TempString == "1") {
                tEnableBreak = true;
            }
            else {
                tEnableBreak = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_TRANSFER_TO_WINDOW);
            if (TempString && TempString == "1") {
                TransfToCounter0Enabled = true;
            }
            else {
                TransfToCounter0Enabled = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_ADDING_SERVICES_PARAMETER);
            if (TempString && TempString == "1") {
                AddService0Enabled = true;
            }
            else {
                AddService0Enabled = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_CUSTOMER_HOLD);
            if (TempString && TempString == "1") {
                Hold0Enabled = true;
            }
            else {
                Hold0Enabled = false;
            }

            TempString = configurationService.getCommonSettings(branchID, constants.NEXT_DEBOUNCE_SECONDS);
            if (!TempString) {
                NextDebounceSeconds = 0;
            }
            else {
                NextDebounceSeconds = parseInt(TempString);
            }

            TempString = configurationService.getCommonSettings(branchID, constants.SHOW_CUSTOMER_NOTIFICATION_INTERVAL);
            if (!TempString) {
                BreakNotification = 7;
            }
            else {
                BreakNotification = parseInt(TempString);
            }

            TempString = configurationService.getCommonSettings(branchID, constants.MAX_RECALL_TIMES);
            if (!TempString) {
                MaxRecallTimes = 3;
            }
            else {
                MaxRecallTimes = parseInt(TempString);
            }

            TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_TACKING_CUSTOMER_PHOTO);
            if (TempString && TempString == "1") {
                availableActions.EnableTakingCustomerPhoto = true;
            }
            else {
                availableActions.EnableTakingCustomerPhoto = false;
            }

            availableActions.TransferToServiceAllowed = false;
            availableActions.TransferToCounterAllowed = false;
            availableActions.AddServiceAllowed = false;
            availableActions.HoldAllowed = false;
            availableActions.TransferBackAllowed = false;
            let State = CurrentActivity.type;

            if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing) {
                //Serve Button
                TempString = configurationService.getCommonSettings(branchID, constants.HIDE_SERVE_BUTTON);
                if (TempString && TempString == "1") {
                    availableActions.HideServeButton = true;
                }
                else {
                    availableActions.HideServeButton = false;
                }

                //Serve Button
                TempString = configurationService.getCommonSettings(branchID, constants.SHOW_SERVE_WITH_BUTTON);
                if (TempString && TempString == "1") {
                    availableActions.ShowServeWithButton = true;
                }
                else {
                    availableActions.ShowServeWithButton = false;
                }

                //Check IF fINISH SERVING SHOULD BE ALLOWED
                TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_FINISH_SERVING);
                if (TempString && TempString == "1") {
                    if (State == enums.EmployeeActiontypes.Serving) {
                        availableActions.FinishAllowed = true;
                    }
                    else {
                        availableActions.FinishAllowed = false;
                    }
                }
                else {
                    availableActions.FinishAllowed = false;
                }


                let service_ID ;
                if (CurrentTransaction && CurrentTransaction.service_ID) {
                    service_ID= CurrentTransaction.service_ID;
                    CurrentWorkFlow = WorkFlowManager.getWorkFlow(branchID,service_ID);
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
                    let serviceConfig =configurationService.getServiceConfigFromService(CurrentTransaction.service_ID);
                    availableActions.MaxAcceptableServiceTime =  serviceConfig.KPI_AST_MaxAcceptedValue;

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
                else {
                    availableActions.TransferServicesIDs = null;
                }

                if (availableActions.TransferToCounterAllowed) {
                    availableActions.TransferCounters = WorkFlowManager.PrepareTransferCountersList(orgID, branchID, counterID);
                }
                else {
                    availableActions.TransferCounters = null;
                }


                if (availableActions.AddServiceAllowed) {
                    availableActions.AddServices = WorkFlowManager.PrepareAddList(orgID, branchID, counterID);
                }
                else {
                    availableActions.AddServices = null;
                }

                availableActions.EditCustomerInfoAllowed = false;

                
                TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_EDITING_SERVED_CUSTOMER_INFO);
                if (TempString && TempString == "1" && State == enums.EmployeeActiontypes.Serving) {

                    //TODO: Missing customer information logic
                    availableActions.EditCustomerInfoAllowed = true;
                }


                TempString = configurationService.getCommonSettings(branchID, constants.ENABLE_IDENTIFING_IDENTIFIED_CUSTOMER);
                var tEnableIdentifyingTheCustomerMultipleTimes = ((TempString && TempString == "1") ? true : false);
                //TODO: Missing Identification service logic
                if (availableActions.EditCustomerInfoAllowed && tEnableIdentifyingTheCustomerMultipleTimes) {
                    availableActions.IdentifyCustomerAllowed = true;
                }
                
                if ( State == enums.EmployeeActiontypes.Serving)
                {
                    if (!CurrentWorkFlow || CurrentWorkFlow.IsNextEnabled) {
                        availableActions.NextAllowed = true;
                    }
                    else
                    {
                        availableActions.NextAllowed = false;
                    }

                    if (!CurrentActivity || (State != enums.EmployeeActiontypes.Serving && State != enums.EmployeeActiontypes.Ready))
                    {
                        availableActions.NextEnabledAfter = 0;
                    }
                    else if (State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Processing)
                    {
                        availableActions.NextEnabledAfter = NextDebounceSeconds;
                    }
                    else if (State == enums.EmployeeActiontypes.Ready)
                    {
                        if (NextDebounceSeconds < BreakNotification)
                        {
                            availableActions.NextEnabledAfter = NextDebounceSeconds;
                        }
                        else
                        {
                            availableActions.NextEnabledAfter = BreakNotification;
                        }
                    }
                }
                else
                {
                    availableActions.NextAllowed = false;
                }

                let WindowListButtonsVisible = false;
                //TODO: THe list serving counter
                if (CurrentWindow.Type_LV == enums.counterTypes.NoCallServing)
                {
                    if (State != enums.EmployeeActiontypes.Serving && State != enums.EmployeeActiontypes.Ready && State != enums.EmployeeActiontypes.Processing && State != enums.EmployeeActiontypes.NoCallServing)
                    {
                        availableActions.OpenAllowed = true;
                    }
                    WindowListButtonsVisible = true;
                }
                else
                {
                    if (Hold0Enabled)
                    {
                        WindowListButtonsVisible = true;
                    }
                }
                if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing)
                {
                    if (WindowListButtonsVisible && (State == enums.EmployeeActiontypes.NotReady || State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Processing || State == enums.EmployeeActiontypes.Custom))
                    {
                        availableActions.ListServeAllowed = true;

                        //If (Serve) button was hidden then keep (Serve With) button enabled
                        if (availableActions.HideServeButton)
                        {
                            availableActions.ListServeWithAllowed = true;
                        }
                    }
                    if (WindowListButtonsVisible && availableActions.HoldAllowed || (availableActions.TransferToServiceAllowed && availableActions.TransferServicesIDs != null && availableActions.TransferServicesIDs.Length > 0) || availableActions.TransferToCounterAllowed)
                    {
                        availableActions.ListServeWithAllowed = true;
                    }
                }

                if (tEnableBreak && (State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Ready || State == enums.EmployeeActiontypes.Processing || State == enums.EmployeeActiontypes.Custom || State == enums.EmployeeActiontypes.NoCallServing))
                {
                    availableActions.BreakAllowed = true;
                }

                TempString = configurationService.getCommonSettings(branchID, constants.CUSTOM_STATE_SETTINGS);
                if (TempString != null && TempString.startsWith("1") && (State == enums.EmployeeActiontypes.Serving || State == enums.EmployeeActiontypes.Ready || State == enums.EmployeeActiontypes.Processing || State == enums.EmployeeActiontypes.Break || State == enums.EmployeeActiontypes.NoCallServing))
                {
                    availableActions.CustomStateAllowed = true;
                }
                if (CurrentWindow.Type_LV == enums.counterTypes.CustomerServing)
                {
                    if (State == enums.EmployeeActiontypes.Serving && CurrentWindow.CurrentCustomerTransaction != null && CurrentWindow.CurrentCustomerTransaction.RecallNo < MaxRecallTimes)
                    {
                        availableActions.RecallAllowed = true;
                    }
                    //Automatic Transfer
                    if (CurrentWorkFlow == null || CurrentWorkFlow.IsAutomaticTransferToServiceEnabled == false || AvailableAction.TransferToServiceAllowed == false || CurrentWorkFlow.IsNextEnabled == false)
                    {
                        availableActions.AutomaticTransferToServiceAllowed = false;
                    }
                    else
                    {
                        availableActions.AutomaticTransferToServiceAllowed = true;
                    }

                    if (CurrentWorkFlow == null || CurrentWorkFlow.AutomaticTransferToServiceID == undefined || CurrentWorkFlow.AutomaticTransferToServiceID == "" )
                    {
                        availableActions.AutomaticTransferToServiceID = "";
                    }
                    else
                    {
                        availableActions.AutomaticTransferToServiceID = AvailableAction.TransferServicesIDs.find(function(ID){
                            return ID == CurrentWorkFlow.AutomaticTransferToServiceID
                        });
                    }
                    //Add PreService
                    if (CurrentWorkFlow == null || CurrentWorkFlow.IsAddPreServiceEnabled == false)
                    {
                        availableActions.AddPreServiceAllowed = false;
                    }
                    else
                    {
                        availableActions.AddPreServiceAllowed = true;
                    }

                    if (CurrentWorkFlow == null || CurrentWorkFlow.IsAddPreServiceEnabled == false)
                    {
                        availableActions.AddPreServiceID = "";
                    }
                    else
                    {
                        availableActions.AddPreServiceID = CurrentWorkFlow.AddPreServiceID;
                    }

                    //Add PreService on Transfer to Service
                    if (CurrentWorkFlow == null || CurrentWorkFlow.IsAddPreServiceOnTransferToServiceEnabled == false)
                    {
                        availableActions.AddPreServiceOnTransferToServiceAllowed = false;
                        availableActions.AddPreServiceOnTransferID = "";
                    }
                    else
                    {
                        availableActions.AddPreServiceOnTransferToServiceAllowed = true;
                        availableActions.AddPreServiceOnTransferID = CurrentWorkFlow.AddPreServiceOnTransferID;
                    }
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
