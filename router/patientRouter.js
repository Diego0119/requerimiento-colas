const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');

router.post('/addPatient', patientController.addPatient);
router.get('/getPatientDetails/:patientId', patientController.getPatientDetails);
router.get('/details/:patientId/:queueId', patientController.details);
router.put('/getIn/:queueId', patientController.getIn);

module.exports = router;
