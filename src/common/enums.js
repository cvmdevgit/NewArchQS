const EmployeeActiontypes = {
    LoggedIn: 1,
    NotReady: 2,
    Ready: 3,
    Break: 4,
    Serving: 5,
    InsideCalenderLoggedOff: 6,
    OutsideCalenderLoggedOff: 7,
    TicketDispensing: 8,
    Processing: 9,
    Custom: 10,
    Supervising: 11,
    NoCallServing: 12
};

const AllocationTypes = {
    Counter: "0",
    User: "1"
};

const StateType = {
    Pending: 0,
    PendingRecall: 1,
    Serving: 2,
    closed: 3,
    Recall: 4,
    servingRecall: 5,
    OnHold: 6,
    Dependant: 7
};

const SegmentAllocationType = {
    SelectAll: 1,
    Customize: 2
};


const CustomerServingType = {
    NoCalled: 0,
    NoShow: 1,
    Served: 2,
    SetAsServed: 3,
    NoServingType: 4,
    Cancelled: 5,
    ServedWithAdded: 6,
    CancelledDueTransfer: 7
};

const OriginType = {
    //IF any change occours the simulation must be changed
    None: 0,
    TransferToService: 1,
    TransferToWindow: 2,
    AddVirtualService: 3,
    MultiService: 4,
    KioskBooking: 5,
    Supervisor: 6,
    ByUser: 7,
    ExternalBooking: 8,
    RemoteBooking: 9,
    TransferBack: 10,
    ChangeService: 11,
    AutoTransfer: 12,
    RemoteTicketing: 13
};

const commands = {
    IssueTicket: "issueTicket",
    Next: "next",
    Hold: "hold",
    ServeCustomer: "serveCustomer",
    AddService:"addService",
    Break: "break",
    Open: "open",
    Read: "read",
    ReadBranchStatistics: "readBranchStatistics",
    GetCounterStatus: "getCounterStatus",
    GetHeldCustomers:"getHeldCustomers"
};

const counterTypes = {
    CustomerServing: 0,
    TicketDispenser: 1,
    TicketDispenserWithUser: 2,
    NoCallServing: 3
};

const ConnectionStatus = {
    Connected: "0",
    Disconnected: "1"
};

module.exports.ConnectionStatus = ConnectionStatus;
module.exports.AllocationTypes = AllocationTypes;
module.exports.counterTypes = counterTypes;
module.exports.OriginType = OriginType;
module.exports.SegmentAllocationType = SegmentAllocationType;
module.exports.EmployeeActiontypes = EmployeeActiontypes;
module.exports.StateType = StateType;
module.exports.CustomerServingType = CustomerServingType;
module.exports.commands = commands;


