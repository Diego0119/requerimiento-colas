const QueueModel = require('../model/QueueModel.js');
const PatientModel = require('../model/PatientModel.js');

const queueController = {
    createQueue: async (req, res) => {
        try {
            const { profesional_id, startTime, endTime } = req.body;

            const createdQueue = await QueueModel.createQueue(profesional_id, startTime, endTime);

            res.json({
                queue_id: createdQueue.id,
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

            const patientsInQueue = await PatientModel.findAll({
                where: {
                    queue_id: req.params.queueId,
                    in_attention: true,
                },
                order: [['attention_number', 'DESC']],
                limit: 1,
            });

            const time = await QueueModel.findByPk(req.params.queueId);

            const quotas = await QueueModel.findOne({
                where: { id: req.params.queueId },
                attributes: ['quotas']
            });

            let latestQuotas = false;
            if (quotas <= 2) {
                latestQuotas = true;
            }

            const averageAppointmentDuration = 30;
            const estimatedWaitingTime = patientsInQueue.length * averageAppointmentDuration;

            let remainingAttentionTime = null;
            if (patientsInQueue.length > 0) {
                const currentPatient = patientsInQueue[0];
                const endTime = time.endTime;
                const startTime = time.startTime;
                const now = new Date();

                const remainingTimeInMinutes = Math.ceil((endTime - now) / (1000 * 60));

                remainingAttentionTime = Math.max(0, remainingTimeInMinutes);
            }

            res.json({
                ...queue.toJSON(),
                estimated_waiting_time: estimatedWaitingTime,
                latest_quotas: latestQuotas,
                current_number: patientsInQueue.length > 0 ? patientsInQueue[0].attention_number : null,
                remaining_attention_time: remainingAttentionTime,
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener detalles de la cola');
        }
    },

    editQueueTime: async (req, res) => {
        try {
            const { queueId, newTotalTime, operation } = req.body;

            if (!Number.isInteger(newTotalTime) || newTotalTime <= 0) {
                return res.status(400).json({ success: false, message: 'El nuevo tiempo de atención debe ser un número positivo' });
            }

            if (operation !== 'sumar' && operation !== 'restar') {
                return res.status(400).json({ success: false, message: 'La operación debe ser "sumar" o "restar"' });
            }

            const queue = await QueueModel.findByPk(queueId);

            if (!queue) {
                return res.status(404).json({ success: false, message: 'Cola no encontrada' });
            }

            const patientsInQueue = await PatientModel.findAll({
                where: {
                    queue_id: queueId,
                    in_queue: true,
                },
            });

            const averageAppointmentDuration = 30;

            const currentTotalTime = patientsInQueue.length * averageAppointmentDuration;

            const startTime = queue.startTime;
            const endTime = queue.endTime;
            const totalMilliseconds = (new Date(endTime) - new Date(startTime));
            const totalMinutes = totalMilliseconds / 60000;

            if (operation === 'restar' && totalMinutes < newTotalTime) {
                return res.status(400).json({ success: false, message: 'La reducción excede el tiempo total actual de atención a los pacientes' });
            }

            const newEndTime = new Date(queue.endTime);


            if (operation === 'sumar') {
                newEndTime.setMinutes(newEndTime.getMinutes() + newTotalTime);
            } else if (operation === 'restar') {
                newEndTime.setMinutes(newEndTime.getMinutes() - newTotalTime);
            }

            if (totalMinutes < newTotalTime) {
                return res.status(400).json({ success: false, message: 'La reducción excede el tiempo total actual de atención a los pacientes' });
            }

            await queue.update({
                endTime: newEndTime,
            });

            return res.json({ success: true, message: 'Tiempo de atención actualizado con éxito', queue });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error al editar el tiempo de atención' });
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

            const { patientId, queueId } = req.body;

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

            const updatedQueueDetails = await QueueModel.findByPk(queueId)

            return res.json({
                success: true,
                message: 'Paciente sacado de la cola',
                updatedQueueDetails: updatedQueueDetails,
            });

        } catch (err) {
            console.log(err);
        }
    },

    updateQueueStatus: async (req, res) => {
        try {
            const { queueId } = req.body;
            const patientsInQueue = await PatientModel.findAll({
                where: {
                    queue_id: queueId,
                    in_queue: true,
                },
            });

            let queueStatus;

            if (patientsInQueue.length === 0) {
                queueStatus = 'Green';
            } else if (patientsInQueue.length === 1) {
                queueStatus = 'Yellow';
            } else if (patientsInQueue.length <= 3) {
                queueStatus = 'Red';
            } else {
                queueStatus = 'Full';
            }

            await QueueModel.update({ status: queueStatus }, { where: { id: queueId } });

            const updatedQueue = await QueueModel.findByPk(queueId);

            res.json({ success: true, message: 'Estado de la cola actualizado con éxito', queue: updatedQueue });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al actualizar el estado de la cola' });
        }
    }

};

module.exports = queueController;
