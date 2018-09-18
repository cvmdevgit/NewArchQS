var should = require("should");
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var repositoriesManager = require("./repositoriesManager");
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");
var common = require("../../common/common");
var idGenerator = require("./idGenerator");

should.toString();

describe('Database testing', function () {
    it('DB initialize Successfully', async function () {
        let result = await repositoriesManager.initialize();
        result.should.equal(0);
    });
});

describe('Test Transaction Repo', function () {
    it('Get All Transactions successfully', async function () {
        let transactioninst = new transaction();
        transactioninst.id = idGenerator.getNewID();
        let result = await repositoriesManager.entitiesRepo.getAll(transactioninst);
        await idGenerator.UpdateSeqOnDB(repositoriesManager.entitiesRepo.db);
        (result !== undefined).should.true();
    });

    it('Create New transaction successfully 2', async function () {
        let transactioninst = new transaction();
        transactioninst.id = idGenerator.getNewID();
        transactioninst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Add(transactioninst);
        await idGenerator.UpdateSeqOnDB(repositoriesManager.entitiesRepo.db);
        (result == common.success).should.true();
    });

    it('ADD OR UPDATE Trancaction With ID = 5 successfully', async function () {
        let transactioninst = new transaction();
        transactioninst.id = 5;
        transactioninst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Update(transactioninst);
        (result == common.success).should.true();
    });
    it('Get Transaction by ID, ID = 5 successfully', async function () {
        let result = await repositoriesManager.entitiesRepo.getFilterBy(new transaction(),["id"], ["5"]);
        (result !== undefined).should.true();
    });
    it('Delete Transaction, ID = 6 successfully', async function () {
        let transactioninst = new transaction();
        transactioninst.id = 6;
        transactioninst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Add(transactioninst);
        if (result == common.success) {
            result = await repositoriesManager.entitiesRepo.remove(transactioninst);
            (result == common.success).should.true();
        }
        else {
            (result == common.success).should.true();
        }
    });
});

describe('Test User Activity Repo', function () {
    it('Get All user Activities successfully', async function () {
        let result = await repositoriesManager.entitiesRepo.getAll(new userActivity());
        (result !== undefined).should.true();
    });

    it('Create New Activity successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.id = idGenerator.getNewID();
        userActivityinst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Add(userActivityinst);
        await idGenerator.UpdateSeqOnDB(repositoriesManager.entitiesRepo.db);
        (result == common.success).should.true();
    });

    it('ADD OR UPDATE Activity With ID = 5 successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.id = 5;
        userActivityinst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Update(userActivityinst);
        (result == common.success).should.true();
    });
    it('Get Activity by ID, ID = 5 successfully', async function () {
        let result = await repositoriesManager.entitiesRepo.getFilterBy(new userActivity(),["id"], ["5"]);
        (result !== undefined).should.true();
    });
    it('Delete Activity, ID = 6 successfully', async function () {
        let userActivityinst = new userActivity();
        userActivityinst.id = 6;
        userActivityinst.org_ID = 1;
        let result = await repositoriesManager.entitiesRepo.Update(userActivityinst);
        if (result == common.success) {
            result = await repositoriesManager.entitiesRepo.remove(userActivityinst);
            (result == common.success).should.true();
        }
        else {
            (result == common.success).should.true();
        }
    });
});