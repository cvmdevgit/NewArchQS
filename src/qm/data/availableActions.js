
class availableActions {
        constructor() {
                this.TransferToServiceAllowed;
                this.TransferServicesIDs = [];
                this.TransferToCounterAllowed;
                this.TransferCounters = [];
                this.AddServiceAllowed;
                this.AddServiceEnabledAfter;
                this.AddServices = [];
                this.NextAllowed;
                this.NextEnabledAfter;
                this.HoldAllowed;
                this.OpenAllowed;
                this.BreakAllowed;
                this.FinishAllowed;
                this.CustomStateAllowed;
                this.RecallAllowed;
                this.ListServeAllowed;
                this.ListServeWithAllowed;
                this.MaxAcceptableServiceTime;
                this.AutomaticTransferToServiceAllowed;
                this.AutomaticTransferToServiceID;
                this.AddPreServiceAllowed;
                this.AddPreServiceOnTransferToServiceAllowed;
                this.AddPreServiceID;
                this.AddPreServiceOnTransferID;
                this.HideServeButton;
                this.ShowServeWithButton;
                this.TransferBackAllowed;
                this.IdentifyCustomerAllowed;
        }
}
module.exports = availableActions;

