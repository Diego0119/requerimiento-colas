const PatientModel = require('../model/PatientModel');
const QueueModel = require('../model/QueueModel.js');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const asignarAttentionNumber = async (patient_id, queue_id) => {
    try {

        const ultimoPaciente = await PatientModel.findOne({
            where: {
                queue_id: queue_id,
            },
            order: [['attention_number', 'DESC']],
        });

        let nuevoAttentionNumber = 0;

        if (ultimoPaciente && ultimoPaciente.attention_number !== null) {
            nuevoAttentionNumber = parseInt(ultimoPaciente.attention_number, 10) + 1;
        }

        return nuevoAttentionNumber;
    } catch (error) {
        console.error('Error al asignar attention_number:', error);
        throw error;
    }
};

const patientController = {
    addPatient: async (req, res) => {
        try {
            const patient_id = req.body.patient_id;
            const queue_id = req.params.queueId;

            const queue_quotas = await QueueModel.findByPk(queue_id);

            const patients_in_queue = await PatientModel.count({
                where: {
                    queue_id: queue_id,
                    in_attention: false,
                },
            });

            const activeQueue = await QueueModel.findOne({
                where: {
                    profesional_id: req.body.professional_id,
                    status: { [Op.not]: 'Full' },
                },
            });

            if (patients_in_queue >= activeQueue.quotas) {
                return res.status(400).send('La cola está llena. No se pueden agregar más pacientes.');
            }

            if (!activeQueue) {
                return res.status(404).send('No hay colas activas para el profesional en este momento.');
            }

            const nuevoAttentionNumber = await asignarAttentionNumber(patient_id, queue_id);

            const newPatient = await PatientModel.create({
                id: patient_id,
                in_queue: true,
                in_attention: false,
                queue_id: queue_id,
                attention_number: nuevoAttentionNumber,
            });

            const positionInQueue = await PatientModel.count({
                where: {
                    queue_id: queue_id,
                    attention_number: { [Op.lte]: nuevoAttentionNumber },
                    in_attention: false,
                },
            });

            const calculateEstimatedWaitTime = async (queue, patientAttentionNumber) => {
                try {

                    const patientsBefore = await PatientModel.count({
                        where: {
                            queue_id: queue.id,
                            in_queue: true,
                            attention_number: {
                                [Op.lt]: patientAttentionNumber,
                            },
                        },
                    });

                    const averageAppointmentDuration = 30;
                    if (patientsBefore.length === 0) {
                        return estimatedWaitTime = 30;
                    }
                    const estimatedWaitTime = patientsBefore * averageAppointmentDuration;

                    return estimatedWaitTime;
                } catch (error) {
                    console.error('Error al calcular el tiempo de espera estimado:', error);
                    throw error;
                }
            };

            const estimatedWaitTime = calculateEstimatedWaitTime(activeQueue, positionInQueue);

            res.json({
                positionInQueue: positionInQueue,
                currentlyServing: nuevoAttentionNumber,
                estimatedWaitTime: estimatedWaitTime,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al ingresar al paciente en la cola');
        }
    },

    getDetails: async (req, res) => {
        try {
            const { patientId, queueId } = req.body;

            const patient = await PatientModel.findByPk(patientId);
            const queue = await QueueModel.findByPk(queueId);

            if (!patient) {
                return res.status(404).send('No se encontró el paciente');
            }
            if (!queue) {
                return res.status(404).send('No se encontró la cola');
            }

            const currentPatient = await PatientModel.findOne({
                where: {
                    queue_id: queueId,
                    in_queue: true,
                },
            });

            const currentServiceNumber = currentPatient.attention_number;

            const patientsBefore = await PatientModel.findAll({
                attributes: ['attention_number', [sequelize.fn('COUNT', sequelize.literal('DISTINCT id')), 'count']],
                where: {
                    queue_id: queueId,
                    in_queue: true,
                    attention_number: {
                        [Op.lt]: currentServiceNumber,
                    },
                },
                group: ['attention_number'],
            });

            const current_attention_number = await PatientModel.findByPk(patientId);

            if (patientsBefore.length === 0) {
                patients_before = 1;
            }
            let estimatedWaitTime = 0;

            if (patients_before == 1) {
                estimatedWaitTime = 30;
            }
            else {
                estimatedWaitTime = patientsBefore * 30;
            }

            res.json({
                attention_number: current_attention_number.attention_number,
                patients_before: patients_before,
                estimatedWaitTime: estimatedWaitTime,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener detalles');
        }
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
