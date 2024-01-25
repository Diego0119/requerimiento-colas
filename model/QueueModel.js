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
        type: DataTypes.STRING,
        allowNull: false,
    },
    profesional_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Professional,
            key: 'id',
        },
        allowNull: false,
    },
});

Queue.belongsTo(Professional, { foreignKey: 'profesional_id' });

Queue.createQueue = async (profesional_id, startTime, endTime) => {
    try {

        const totalMilliseconds = (new Date(endTime) - new Date(startTime));
        const totalMinutes = totalMilliseconds / 60000;

        if (totalMinutes < 60) {
            throw new Error('El tiempo de atención debe ser de al menos una hora.');
        }

        const quotas = Math.ceil(totalMinutes / 30);

        let status;
        if (quotas) {
            status = 'Green';
        } else if (quotas === 1) {
            status = 'Yellow';
        } else if (quotas >= 2 && quotas <= 3) {
            status = 'Red';
        } else if (quotas) {
            status = 'Full';
        }

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
