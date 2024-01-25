const express = require('express');
const router = express.Router();
const queueController = require('../controller/queueController');

router.post('/createQueue', queueController.createQueue);
router.get('/getQueueDetails/:queueId', queueController.getQueueDetails);
router.put('/editQueue', queueController.editQueueTime);
router.put('/closeQueue/:queueId', queueController.closeQueue);
router.put('/removePatient', queueController.removePatient);
router.get('/queueStatus', queueController.updateQueueStatus);

module.exports = router;
