var should = require("should");
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
delete require.cache[require.resolve("./repositoriesManager")]; 
var repositoriesManager = require("./repositoriesManager");
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");
var common = require("../../common/common");
var commonMethods = require("../../common/commonMethods");
const ServiceID = "364";
should.toString();

describe('Database testing', function () {
    it('DB initialize Successfully', async function () {
        this.timeout(15000);
        let result = await repositoriesManager.initialize();
        (result == common.success).should.true();
    });
});

describe('Test Transaction Repo', function () {
    it('Get All Transactions successfully', async function () {
        let transactioninst = new transaction();
        let entities = [];
        let result = await repositoriesManager.entitiesRepo.getAll(transactioninst,entities);
        (result == common.success && entities !== undefined).should.true();
    });

    it('Create New transaction successfully 2', async function () {
        let transactioninst = new transaction();
        transactioninst.orgID = 1;
        transactioninst.queueBranch_ID = 106;
        transactioninst.counter_ID = 120;
        transactioninst.service_ID = ServiceID;
        let result = await repositoriesManager.entitiesRepo.Add(transactioninst);
        (result == common.success).should.true();
    });

    it('ADD OR UPDATE Trancaction With ID = 5 successfully', async function () {
        let transactioninst = new transaction();
        transactioninst.id = 5;
        transactioninst.orgID = 1;
        transactioninst.service_ID = ServiceID;
        let result = await repositoriesManager.entitiesRepo.Update(transactioninst);
        (result == common.success).should.true();
    });

    it('Delete Trancaction With ID = 5 successfully', async function () {
        let transactioninst = new transaction();
        transactioninst.id = 5;
        transactioninst.orgID = 1;
        transactioninst.service_ID = ServiceID;
        let result = await repositoriesManager.entitiesRepo.remove(transactioninst);
        (result == common.success).should.true();
    });
});

describe('Test User Activity Repo', function () {
    it('Get All user Activities successfully', async function () {
        let entities = [];
        let result = await repositoriesManager.entitiesRepo.getAll(new userActivity(),entities);
        (result ==common.success  && entities !== undefined).should.true();
    });

    it('Create New Activity successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.orgID = 1;
        userActivityinst.queueBranch_ID = 106;
        userActivityinst.counter_ID = 120;
        userActivityinst.activityType = 3;
        userActivityinst.startTime = commonMethods.Now();
        userActivityinst.closed = 0;
        let result = await repositoriesManager.entitiesRepo.Add(userActivityinst);
        (result == common.success).should.true();
    });

    it('ADD OR UPDATE Activity With ID = 5 successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.id = 5;
        userActivityinst.orgID = 1;
        userActivityinst.queueBranch_ID = 106;
        userActivityinst.counter_ID = 120;
        userActivityinst.activityType = 3;
        userActivityinst.closed = 0;
        let result = await repositoriesManager.entitiesRepo.Update(userActivityinst);
        (result == common.success).should.true();
    });

    it('Delete Activity With ID = 5 successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.id = 5;
        userActivityinst.orgID = 1;
        userActivityinst.queueBranch_ID = 106;
        userActivityinst.counter_ID = 120;
        userActivityinst.activityType = 3;
        userActivityinst.closed = 0;
        let result = await repositoriesManager.entitiesRepo.remove(userActivityinst);
        (result == common.success).should.true();
    });
});