//The settings inside the BD and not from the server
class branchData {
    constructor() {
        this.id;
        this.countersData = [];
        this.userData = [];
        this.visitData = [];
        this.userActivitiesData = [];
        this.transactionsData = [];
        this.servicesData=[];
        this.ticketSeqData=[];
 }
}
module.exports = branchData;