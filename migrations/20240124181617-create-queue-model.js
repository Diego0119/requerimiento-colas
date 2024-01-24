'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('queues', {
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
      professional_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'professionals',
          key: 'id',
        },
        allowNull: false,
      },
    });

    await queryInterface.addIndex('queues', ['profesional_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('queues');
  }
};
