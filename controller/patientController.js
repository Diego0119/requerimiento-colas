const PatientModel = require('../model/PatientModel');
const QueueModel = require('../model/QueueModel.js');
const { Op } = require('sequelize');

const patientController = {
    addPatient: async (req, res) => {
        try {
            const patient_id = req.body.patient_id;

            const activeQueue = await QueueModel.findOne({
                where: {
                    profesional_id: req.body.professional_id,
                    status: { [Op.not]: 'Full' },

                },
            });

            if (!activeQueue) {
                return res.status(404).send('No hay colas activas para el profesional en este momento.');
            }

            patients = await PatientModel.findAll();

            if (patients.length >= activeQueue.quotes) {
                return res.status(400).send('La cola está llena. No se pueden agregar más pacientes.');
            }

            const newPatient = await PatientModel.create({
                id: patient_id,
                in_queue: true,
                in_attention: false,
                queue_id: 4,
            });

            const positionInQueue = patients.length + 1;

            const currentlyServing = activeQueue.currentlyServing || 0;

            const calculateEstimatedWaitTime = (queue, positionInQueue) => {

                const averageAppointmentDuration = 30;

                const estimatedWaitTime = positionInQueue * averageAppointmentDuration;

                return estimatedWaitTime;
            };

            const estimatedWaitTime = calculateEstimatedWaitTime(activeQueue, positionInQueue);

            res.json({
                positionInQueue: positionInQueue,
                currentlyServing: currentlyServing,
                estimatedWaitTime: estimatedWaitTime,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al ingresar al paciente en la cola');
        }
    },


    getPatientDetails: async (req, res) => {
        try {

            const result = await PatientModel.getPatientDetails(req.params.patientId);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener detalles del paciente');
        }
    },
    details: async (req, res) => {

        const patientId = req.params.patientId;
        const queueId = req.params.queueId;

        const patient = await PatientModel.findByPk(patientId);
        const queue = await QueueModel.findByPk(queueId);

        if (!patient) {
            return res.status(404).send('No se encontro el paciente');
        }
        if (!queue) {
            return res.status(404).send('No se encontro la cola');
        }

        res.json({
            service_number: 1,
            patients_before: 2,
            estimatedWaitTime: 60,
        });
    },

    getIn: async (req, res) => {
        try {

            const queueId = req.params.queueId;
            const queue = await QueueModel.findByPk(queueId);

            if (!queue) {
                console.log('No se encontró la cola con el ID proporcionado.');
                return res.status(404).json({ success: false, message: 'Cola no encontrada' });
            }

            const beforePatient = await PatientModel.findOne({
                where: {
                    queue_id: queueId,
                    in_queue: true,
                    in_attention: true,
                },
                order: [['createdAt', 'ASC']],
            });


            const nextPatient = await PatientModel.findOne({
                where: {
                    queue_id: queueId,
                    in_queue: true,
                    in_attention: false,
                },
                order: [['createdAt', 'ASC']],
            });

            if (!nextPatient) {
                console.log('No hay pacientes en espera en la cola.');
                return res.status(404).json({ success: false, message: 'No hay pacientes en espera en la cola.' });
            }

            await nextPatient.update({ in_attention: true });
            await beforePatient.update({
                in_attention: false,
                in_queue: false
            });


            console.log('Paciente pasado a atención con éxito.');
            return res.status(200).json({ success: true, message: 'Paciente pasado a atención con éxito.', nextPatient });
        } catch (error) {
            console.error('Error al pasar al siguiente paciente:', error);
            return res.status(500).json({ success: false, message: 'Error al pasar al siguiente paciente.', error });
        }
    }

};

module.exports = patientController;
