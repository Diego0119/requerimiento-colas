const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Queue = require('./QueueModel.js');

const Patient = sequelize.define('patients', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    in_queue: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    in_attention: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    queue_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    attention_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

Patient.belongsTo(Queue, { foreignKey: 'queue_id' })

Patient.sync();

module.exports = Patient;
