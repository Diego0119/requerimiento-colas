const QueueModel = require('../model/QueueModel.js');
const PatientModel = require('../model/PatientModel.js');

const queueController = {
    createQueue: async (req, res) => {
        try {
            const { profesional_id, startTime, endTime } = req.body;

            const createdQueue = await QueueModel.createQueue(profesional_id, startTime, endTime);

            res.json({
                id: createdQueue.id,
                quotas: createdQueue.quotas,
                status: createdQueue.status,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear la cola');
        }
    },
    getQueueDetails: async (req, res) => {
        try {
            const queue = await QueueModel.findOne({
                where: { id: req.params.queueId },
                attributes: ['status', 'quotas']
            });
            const patients = await PatientModel.findAll({});

            const quotas = QueueModel.findOne({
                where: { id: req.params.queueId },
                attributes: ['quotas']
            })
            latestQuotas = false;
            if (quotas <= 2) {
                latestQuotas = true;
            }

            const estimatedWaitingTime = 30 * 2;
            const currentPatient = await PatientModel.findOne({
                where: {
                    in_attention: true,
                },

            });
            const currentServiceNumber = currentPatient.id;


            if (currentPatient) {
                const currentServiceNumber = currentPatient.id;
                console.log(`Número de servicio actual en atención: ${currentServiceNumber}`);
            } else {
                console.log('No hay pacientes actualmente en atención.');
            }

            res.json({
                ...queue.toJSON(),
                estimated_time: estimatedWaitingTime,
                latest_quotas: latestQuotas,
                current_number: currentServiceNumber,
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener detalles de la cola');
        }
    },
    editQueue: async function editarTiempoDeCola(idCola, tiempo) {
        try {

            const cola = await QueueModel.findByPk(idCola);

            if (!cola) {
                console.log('No se encontró la cola con el ID proporcionado.');
                return { success: false, message: 'Cola no encontrada' };
            }

            const nuevaDuracion = cola.quotas - tiempoReduccion;

            if (nuevaDuracion < 0) {
                console.log('La reducción de tiempo excede la duración actual de la cola.');
                return { success: false, message: 'La reducción de tiempo excede la duración actual de la cola.' };
            }

            const pacientesEnCola = await Patient.findAll({
                where: { queue_id: idCola, in_queue: true },
            });

            if (pacientesEnCola.length > 0 && nuevaDuracion < pacientesEnCola.length * tiempoQuota) {
                console.log('La reducción de tiempo dejaría a algunos pacientes sin ser atendidos.');
                return { success: false, message: 'La reducción de tiempo dejaría a algunos pacientes sin ser atendidos.' };
            }

            await cola.update({ quotas: nuevaDuracion });

            console.log('Cola actualizada con éxito.');
            return { success: true, message: 'Cola actualizada con éxito.', updatedQueue: cola };
        } catch (error) {
            console.error('Error al editar la cola:', error);
            return { success: false, message: 'Error al editar la cola.', error };
        }
    },

    closeQueue: async (req, res) => {
        try {
            const idCola = req.params.queueId;

            const cola = await QueueModel.findByPk(idCola);

            if (!cola) {
                console.log('No se encontró la cola con el ID proporcionado.');
                return res.status(404).json({ success: false, message: 'Cola no encontrada' });
            }

            await cola.update({ status: 'Full' });

            console.log('Cola cerrada con éxito.');
            return res.json({ success: true, message: 'Cola cerrada con éxito.', updatedQueue: cola });
        } catch (error) {
            console.error('Error al cerrar la cola:', error);
            return res.status(500).json({ success: false, message: 'Error al cerrar la cola.', error });
        }
    },

    removePatient: async (req, res) => {
        try {
            const patientId = req.params.patientId;

            const patient = await PatientModel.findByPk(patientId);

            if (!patient) {
                console.log('No se encontro al paciente');
                return res.status(404).json({ success: false, message: 'Paciente no en contrado' });
            }
            else if (patient.in_queue == false) {
                console.log('El paciente no esta en una cola')
                return res.status(400).json({ success: false, message: 'El paciente no esta en una cola' });
            }

            await patient.update({
                in_queue: false,
            })

            return res.json({ success: true, message: 'Paciente sacado de la cola', updatedQueue: cola });

        } catch (err) {
            console.log(err);
        }
    }

};

module.exports = queueController;
