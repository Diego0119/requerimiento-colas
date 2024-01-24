const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Professional = require('./ProfessionalModel.js');

const Queue = sequelize.define('queue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    quotas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, // O el tipo de dato adecuado para el estado
        allowNull: false,
    },
    profesional_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Professional, // Usa el modelo importado
            key: 'id',
        },
        allowNull: false,
    },
});

Queue.belongsTo(Professional, { foreignKey: 'profesional_id' }); // Ajusta esto según la estructura real de tu modelo Profesional

Queue.createQueue = async (profesional_id, startTime, endTime) => {
    try {
        // Calcular la duración total de la atención en minutos
        const totalMinutes = (new Date(endTime) - new Date(startTime)) / (1000 * 60);

        // Verificar si la duración cumple con el tiempo mínimo de atención
        if (totalMinutes < 60) {
            throw new Error('El tiempo de atención debe ser de al menos una hora.');
        }

        // Calcular la cantidad de cupos (cada 30 minutos)
        const quotas = Math.ceil(totalMinutes / 30);

        // Determinar el estado de la cola
        let status;
        if (quotas) {
            status = 'Green';
        } else if (quotas === 1) {
            status = 'Yellow';
        } else if (quotas >= 2 && quotas <= 3) {
            status = 'Red';
        } else if (cup) {
            status = 'Full';
        }

        // Crear la cola en la base de datos
        const createdQueue = await Queue.create({
            profesional_id,
            startTime,
            endTime,
            quotas,
            status,
        });

        return createdQueue;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

Queue.sync();

module.exports = Queue;
