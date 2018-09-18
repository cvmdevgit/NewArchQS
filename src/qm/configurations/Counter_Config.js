class Counter_Config {
    constructor() {
        this.ID = "";
        this.OrgID = "";
        this.QueueBranch_ID = "";
        this.Name_L1 = "";
        this.Name_L2 = "";
        this.Name_L3 = "";
        this.Name_L4 = "";
        this.Type_LV = "";  //CustomerServing = 0,TicketDispenser = 1,TicketDispenserWithUser = 2,NoCallServing = 3
        this.Number = "";
        this.Hall_ID = "";
        this.ScreenTitle = "";
        this.AnnouncementKeys = "";
        this.SegmentAllocationType = "";  //   SelectAll = 1,Customize = 2
    }
}

module.exports = Counter_Config;