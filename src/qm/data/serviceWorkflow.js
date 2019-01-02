class serviceWorkflow {
    constructor() {
        this.IsNextEnabled = true;
        this.IsAutomaticTransferToServiceEnabled = false;
        this.IsTransferToCounterAllowed = true;
        this.IsTransferToServiceAllowed = true;
        this.IsHoldEnabled = true;
        this.IsAddServiceEnabled = true;
        this.AreAllServicesAssossiated = true;
        this.AssossiatedServices = null;
        this.AutomaticTransferToServiceID = "";
        this.IsAddPreServiceEnabled = false;
        this.AddPreServiceID = "";
        this.IsAddPreServiceOnTransferToServiceEnabled = false;
        this.IsAddPreServiceOnTransferToServiceAtMostOnceEnabled = false;
        this.IsTransferBackEnabled = false;
        this.IsAutoNextEnabled = true;
        this.IsReservationAllowed = true;
        this.OverrideNextDebounceSeconds = false;
        this.NextDebounceSeconds = 0;
        this.IsSetAsServedAllowed = true;
        this.IsWaitingListChangeAllowed = false;
        this.WaitingListChangeServiceID = "";
        this.WaitingCustomersCanBeCalledByNext = true;
        this.IsListServingService = false;
        this.EnableSMSReminder = false;
        this.RemindFactor = -1;
        this.MinimumCustomersReminded = -1;
        this.IsApplyCustomActionAfterWaitingEnabled = false;
        this.ApplyCustomActionMaxWaitingTime = 0;
        this.CustomActionCustomers = 0;
        this.IsAutomaticTransferAfterWaitingEnabled = false;
        this.AutomaticTransferAfterWaitingToServiceID = "";
        this.IsTransferOnlyToAvailableEmployeeEnabled = false;
        this.IsAutomaticCloseAfterWaitingEnabled = false;
        this.DisplayCIFormWhenAnotherServiceTransferredToThis = false;
        this.EnableLimitMaxCounter = false;
        this.MaxCounterNumber = 0;
    }
}

module.exports = serviceWorkflow;





