
class availableActions {
        constructor() {
                this.TransferToServiceAllowed = false;
                this.TransferServicesIDs = [];
                this.TransferToCounterAllowed = false;
                this.TransferCounters = [];
                this.AddServiceAllowed = false;
                this.AddServiceEnabledAfter;
                this.AddServices = [];
                this.NextAllowed = false;
                this.NextEnabledAfter;
                this.HoldAllowed = false;
                this.OpenAllowed = false;
                this.BreakAllowed = false;
                this.FinishAllowed = false;
                this.CustomStateAllowed = false;
                this.RecallAllowed = false;
                this.ListServeAllowed = false;
                this.ListServeWithAllowed = false;
                this.MaxAcceptableServiceTime;
                this.AutomaticTransferToServiceAllowed = false;
                this.AutomaticTransferToServiceID = "";
                this.AddPreServiceAllowed = false;
                this.AddPreServiceOnTransferToServiceAllowed = false;
                this.AddPreServiceID = "";
                this.AddPreServiceOnTransferID = "";
                this.HideServeButton = false;
                this.ShowServeWithButton = false;
                this.TransferBackAllowed = false;
                this.IdentifyCustomerAllowed = false;
                this.EditCustomerInfoAllowed = false;
        }
}
module.exports = availableActions;

