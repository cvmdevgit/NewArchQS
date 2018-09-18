var count = 0;
var callsnumber = 0;
var socket;
var empty = "...";

var branchID;

function LoadPage() {
    socket = io.connect('');
    socket.on('connect', function (data) {
        // socket.emit('join', 'Hello World from client');
    });
    socket.on('broadcast', function (message) {
        let tbody = " .... ";
        if (message.payload.transactionsInfo && message.payload.transactionsInfo.length > 0) {
            tbody = 'Ticket Number=' + message.payload.transactionsInfo[0].displayTicketNumber + " ";
        }
        if (message.payload.countersInfo && message.payload.countersInfo.length > 0) {
            tbody = tbody + ' Counter State =' + message.payload.countersInfo[0].type + " "
        }

        tbody = tbody + ' ErrorMessage=' + message.payload.errorCode;

        var elem = document.getElementById('ticketnumberAll');
        elem.innerHTML = tbody;
    });
    FillBranches();
    //setInterval(CGetCurrentState,5000);
}

function SendMessage() {
    socket.emit('message', 'hello to Message');
}
function IssueTicketMultiple(number) {
    var index = 0;
    for (index = 0; index < number; index++) {
        IssueTicket();
    }
}

function nextMultiple(number) {
    var index = 0;
    for (index = 0; index < number; index++) {
        Next();
    }
}

function readBranchStatistics() {
    var e = document.getElementById("branches");
    var branchid = e.options[e.selectedIndex].value;

    var Message = {
        time: new Date(),
        topicName: 'readBranchStatistics',
        payload: {
            EntityName: "service",
            BranchID: branchid
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var statistics = JSON.parse(this.responseText).payload.statistics;
        var options = `<tr>
        <th>Service ID</th>
        <th>Segment ID</th>
        <th>Hall ID</th>
        <th>Counter ID</th>

        <th>Waiting Customers</th>
        <th>Served Customers</th> 
        <th>No Show Customers</th>
        <th>Avg Service Time</th>
        <th>Avg Waiting Time</th>
      </tr>`;

        for (let i = 0; i < statistics.length; i++) {
            options = options + '<tr>';
            options = options + '<th>' + statistics[i].service_ID + '</th>';
            options = options + '<th>' + statistics[i].segment_ID + '</th>';
            options = options + '<th>' + statistics[i].hall_ID + '</th>';
            options = options + '<th>' + statistics[i].counter_ID + '</th>';

            options = options + '<th>' + statistics[i].WaitingCustomers + '</th>';
            options = options + '<th>' + statistics[i].ServedCustomersNo + '</th>';
            options = options + '<th>' + statistics[i].NoShowCustomersNo + '</th>';
            options = options + '<th>' + statistics[i].AvgServiceTime + '</th>';
            options = options + '<th>' + statistics[i].AvgWaitingTime + '</th>';
            options = options + '</tr>';
        }

        elem = document.getElementById('statistics');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
}

function CServeCustomer() {
    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;
    let transaction = document.getElementById("transactionid");
    var Message = {
        time: Date.now(),
        topicName: 'serveCustomer',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            transactionid: transaction.value,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {

        // do something to response
       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);
        CgetCustomers();
    };
    xhr.send(JSON.stringify(Message));
}

function CgetCustomers() {
    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'getHeldCustomers',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {

        // do something to response
        var payload = JSON.parse(this.responseText).payload;
        var HeldCustomers = payload.HeldCustomers;
        var options = `<tr>
                <th>Trans ID</th>
                <th>Ticket Number</th>
              </tr>`;

        for (let i = 0; i < HeldCustomers.length; i++) {
            options = options + '<tr>';
            options = options + '<th>' + HeldCustomers[i].id + '</th>';
            options = options + '<th>' + HeldCustomers[i].displayTicketNumber + '</th>';
            options = options + '</tr>';
        }

        var elem = document.getElementById('heldCustomers');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
}

function CGetCurrentState() {
    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'getCounterStatus',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);
    };
    xhr.send(JSON.stringify(Message));
}


function RenderUI(payload) {
    var transactionsInfo = payload.transactionsInfo;
    var elem = document.getElementById('servedticketnumber');
    if (transactionsInfo && transactionsInfo.length > 0) {
        elem.innerHTML = transactionsInfo[0].displayTicketNumber;
    }
    else {
        elem.innerHTML = empty;
    }

    elem = document.getElementById('ticketnumberCalled');
    if (transactionsInfo && transactionsInfo.length > 0) {
        elem.innerHTML = transactionsInfo[transactionsInfo.length - 1].displayTicketNumber;
    }
    else {
        elem.innerHTML = empty;
    }


    if (payload.countersInfo && payload.countersInfo.length > 0) {
        elem = document.getElementById('counterState');
        elem.innerHTML = payload.countersInfo[0].type;
    }


    elem = document.getElementById('errorMessage');
    elem.innerHTML = payload.errorCode;
}

function Next() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'next',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);
    };
    xhr.send(JSON.stringify(Message));



}
function Connect() {
    var e = document.getElementById("branches");
    branchID = e.options[e.selectedIndex].value;
    e.disabled = true;

    var e = document.getElementById("btnconnect");
    e.disabled = true;
    console.log(branchID);

    FillServices(branchID);
    FillCounters(branchID);
    FillSegments(branchID);
}

function FillBranches(branchid) {

    var Message = {
        time: Date.now(),
        topicName: 'read',
        payload: {
            EntityName: "branch"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var branches = JSON.parse(this.responseText).payload.branches;
        var options = "";
        for (let i = 0; i < branches.length; i++) {
            options = options + '<option value="' + branches[i].ID + '">' + branches[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('branches');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};

function FillServices(branchid) {

    var Message = {
        time: Date.now(),
        topicName: 'read',
        payload: {
            EntityName: "service",
            BranchID: branchid
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var services = JSON.parse(this.responseText).payload.services;
        var options = "";
        for (let i = 0; i < services.length; i++) {
            options = options + '<option value="' + services[i].ID + '">' + services[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('services');
        elem.innerHTML = options;

        elem = document.getElementById('addservices');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};
function FillSegments(branchid) {

    var Message = {
        time: Date.now(),
        topicName: 'read',
        payload: {
            EntityName: "segment",
            BranchID: branchid
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var segments = JSON.parse(this.responseText).payload.segments;
        var options = "";
        for (let i = 0; i < segments.length; i++) {
            options = options + '<option value="' + segments[i].ID + '">' + segments[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('segments');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};
function FillCounters(branchid) {
    //Get serving or no call counters
    var Message = {
        time: Date.now(),
        topicName: 'read',
        payload: {
            EntityName: "counter",
            BranchID: branchid,
            types: ["0", "3"]
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getData', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var counters = JSON.parse(this.responseText).payload.counters;
        var options = "";
        for (let i = 0; i < counters.length; i++) {
            options = options + '<option value="' + counters[i].ID + '">' + counters[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('counters');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};
function CAddService() {
    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;
    e = document.getElementById("addservices");
    let serviceID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'addService',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            serviceid: serviceID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

        var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);


    };
    xhr.send(JSON.stringify(Message));
}

function COpen() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'open',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);


    };
    xhr.send(JSON.stringify(Message));



}
function CHold() {
    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'hold',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0",
            holdreasonid: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);
        CgetCustomers();

    };
    xhr.send(JSON.stringify(Message));
}
function CBreak() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'break',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

       var payload = JSON.parse(this.responseText).payload;
        RenderUI(payload);

    };
    xhr.send(JSON.stringify(Message));



}

function IssueTicket() {

    var e = document.getElementById("services");
    let serviceID = e.options[e.selectedIndex].value;

    var e = document.getElementById("segments");
    let segmentID = e.options[e.selectedIndex].value;

    var Message = {
        time: Date.now(),
        topicName: 'issueTicket',
        payload: {
            orgid: "1",
            segmentid: segmentID,
            serviceid: serviceID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };


    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

        var payload = JSON.parse(this.responseText).payload;
        var elem = document.getElementById('ticketnumber');
        elem.innerHTML = payload.transactionsInfo[0].displayTicketNumber;

        elem = document.getElementById('errorMessage');
        elem.innerHTML = payload.errorCode;

        if (count < 1000) {
            // Postdata();
        }
    };

    xhr.send(JSON.stringify(Message));
    callsnumber++;
    var elem = document.getElementById('calls');
    elem.innerHTML = callsnumber;
}