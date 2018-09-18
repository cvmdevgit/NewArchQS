class QueueBranch_config {
    constructor() {
        this.ID = "";
        this.OrgID = "";
        this.Department_ID = "";
        this.Identity= "";
        this.Name_L1 = "";
        this.Name_L2 = "";
        this.Name_L3 = "";
        this.Name_L4 = "";
        this.BranchConfig_ID = "";

        this.settings ; //array of settings from the config and common config
        this.counters ;
        this.usersAllocations ;
        this.segmentsAllocations ;
        this.servicesAllocations ;
        this.halls ;
    }
}

module.exports = QueueBranch_config;

