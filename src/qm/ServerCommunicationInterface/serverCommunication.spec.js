delete require.cache[require.resolve("./serverCommunication")]; 
var should = require("should");
var mocha = require('mocha');
var request = require('request');
const url = require('url');
const querystring = require('querystring');
var describe = mocha.describe;
var it = mocha.it;
var serverCommunication = require("./serverCommunication");
var keyValue = require("./keyValue");
var common = require("../../common/common");
should.toString();

let filters = [];
let tkeyValue = new keyValue();
tkeyValue.key = common.ActiveFilter;
tkeyValue.value = common.Enable;
filters.push(tkeyValue);
const BranchID = "106";

//Assign New 
var sinon = require('sinon');
var stub = sinon.stub();
sinon.stub(request, 'get').callsFake(async function (args, callback) {
    try {
        let AllowedEntities = ["QueueBranch", "Service", "Counter", "Hall", "Segment", "ServiceConfig"
            , "ServiceSegmentPriorityRange", "User", "CommonConfig", "PriorityRange", "ServiceWorkflow"
            , "ServiceAllocation", "SegmentAllocation"];
        let result = common.success;
        let rawUrl = args.url;
        let parsedUrl = url.parse(rawUrl);
        let parsedQs = querystring.parse(parsedUrl.query);
        if (parsedQs.Entity1) {
            var Entity = AllowedEntities.find(function (x) { return x == parsedQs.Entity1 })
            if (!Entity) {
                result = common.error;
            }
        }

        let tArray = [];
        let response = {
            Result: result,
            ResponseString: JSON.stringify(tArray)
        }
        let body = JSON.stringify(response);
        callback("", response, body);
        return result;
    }
    catch (error) {
        console.log(error);
        return common.error;
    }
});

sinon.stub(request, 'post').callsFake(async function (args, callback) {
    try {
        let response = {
            Result: common.success,
            ResponseString: "123123123asd"
        }
        let body = response;
        callback("", response, body);
        return common.success;
    }
    catch (error) {
        console.log(error);
        return common.error;
    }
});



describe('Server Interface Tests', function () {
    it('Get authentication token from server', async function () {
        let result = await serverCommunication.initialize();
        result.should.equal(common.success);
    });

    it('Get branches from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "QueueBranch", "", [], data);
        result.should.equal(common.success);
    });
    it('Get invalid entity failed', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "InvalidEntity", "", [], data);
        result.should.equal(common.error);
    });
    it('Get branches from server with active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "QueueBranch", "", filters, data);
        result.should.equal(common.success);
    });

    it('Get Services from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Service", "", [], data);
        result.should.equal(common.success);
    });
    it('Get Services from server with active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Service", "", filters, data);
        result.should.equal(common.success);
    });


    it('Get Counters from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Counter", "", [], data);
        result.should.equal(common.success);
    });
    it('Get Counters from server with active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Counter", "", filters, data);
        result.should.equal(common.success);
    });

    it('Get Halls from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Hall", "", [], data);
        result.should.equal(common.success);
    });
    it('Get Halls from server with active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Hall", "", filters, data);
        result.should.equal(common.success);
    });


    it('Get Segments from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Segment", "", [], data);
        result.should.equal(common.success);
    });
    it('Get Segments from server with active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "Segment", "", filters, data);
        result.should.equal(common.success);
    });

    it('Get Service Configs from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "ServiceConfig", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Service Segment Priority Ranges from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "ServiceSegmentPriorityRange", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Users from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "User", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Common Configs from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "CommonConfig", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Priority Ranges from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "PriorityRange", "", [], data);
        result.should.equal(common.success);
    });


    it('Get Segment Allocations from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "SegmentAllocation", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Service Allocations from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "ServiceAllocation", "", [], data);
        result.should.equal(common.success);
    });

    it('Get Services Workflows from server without active filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "ServiceWorkflow", "", [], data);
        result.should.equal(common.success);
    });


    it('Get Branch Service many to many relation entities successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "QueueBranch", "Service", [], data);
        result.should.equal(common.success);
    });

    it('Get Branch Users Entities with permissions without branch filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetBranchesUsersAPI(common.settings.OrgID, "", data);
        result.should.equal(common.success);
    });

    it('Get Branch Users Entities with permissions with branch filter successfully', async function () {
        let data = [];
        let result = await serverCommunication.callGetBranchesUsersAPI(common.settings.OrgID, BranchID, data);
        result.should.equal(common.success);
    });


    it('Get Wrong entity it should failed', async function () {
        let data = [];
        let result = await serverCommunication.callGetEntitiesAPI(common.settings.OrgID, "QueueBranch123", "Service123", [], data);
        result.should.equal(common.error);
    });


});
