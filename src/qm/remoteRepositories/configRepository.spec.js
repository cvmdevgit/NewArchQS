"use strict";
var configRepository = require("./configRepository");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
should.toString();

var sinon = require('sinon');
var stub = sinon.stub();
sinon.stub(configRepository,'GetAll').callsFake (async function(){
    return [0,1,2];
});

describe('Remote SQL DB Repos Test', function () {
    it('Getting Branches', async function () {
        let result = await configRepository.GetAll(undefined, "T_QueueBranch");
        (result !== undefined && result.length > 0).should.true();
    });
    it('Getting Counters', async function () {
        let result = await configRepository.GetAll(undefined, "T_Counter");
        (result !== undefined && result.length > 0).should.true();
    });
});
