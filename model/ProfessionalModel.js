const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Professional = sequelize.define('professional', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Professional.sync();

module.exports = Professional;
