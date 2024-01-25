const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');

router.post('/addPatient', patientController.addPatient);
router.get('/details', patientController.getDetails);
router.put('/getIn/:queueId', patientController.getIn);

module.exports = router;
