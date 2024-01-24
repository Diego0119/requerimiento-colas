const express = require('express');
const router = express.Router();
const queueController = require('../controller/queueController');

router.post('/createQueue', queueController.createQueue);
router.get('/getQueueDetails/:queueId', queueController.getQueueDetails);
router.put('/editQueue/:queueId', queueController.editQueue);
router.put('/closeQueue/:queueId', queueController.closeQueue);
router.put('/removePatient/:patientId', queueController.removePatient);

module.exports = router;
