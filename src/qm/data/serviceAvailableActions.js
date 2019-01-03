class serviceAvailable {
    constructor() {
        //Available Actions
       this.DisplayingOnTicketingSoftware=false;
       this.AllowTicketIssuing=false;
       this.AllowTransferingToAnother=false;
       this.AllowTransferingFromAnother=false;
       this.AllowTransferingToCounter=false;
       this.AllowAddingToAnother=false;
       this.AllowAddingFromAnother=false;
       this.AllowShowOnReservation=false;
       this.AllowSetAsServedAllowed=false;
       this.AllowWaitingListServiceChange=false;
       this.WaitingListChangeServiceID="";
       this.ChangeServiceEntities=[];
    }
}

module.exports = serviceAvailable;







