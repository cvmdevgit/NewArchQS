var queueCommandManager = require("../qm/logic/queueCommandManager");
var externalDataRequestService = require("../qm/logic/externalDataRequestService");
var logger = require("../common/logger");
var express = require('express');
var router = express.Router();
var communicationEndPoint=require('../communicationEndPoint');


/* GET home page. */
/*eslint-disable no-unused-vars*/
router.post('/processCommand', async function (req, res, next) {
  try {

    let message = req.body;
    await queueCommandManager.processCommand(message);

   
    console.log(message.payload);
    if (message)
    {
      communicationEndPoint.broadcastMessage(message);
    }    
    res.body=message;
    res.end(JSON.stringify(message));
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});



router.post('/getData', async function (req, res, next) {
  try {
    let message = req.body;
    await externalDataRequestService.getData(message);
    console.log(message.payload);
    if (message)
    {
      communicationEndPoint.broadcastMessage(message);
    }
    
    res.body=message;
    res.end(JSON.stringify(message));
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});





router.get('/', async function (req, res, next) {
  try {
    res.render('index', { title: 'Test APIs page', message: 'Hello there!'});
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});




module.exports = router;
