'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      attention_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
      },
      in_queue: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      in_attention: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      queue_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'queues',
          key: 'id',
        },
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patients');
  }
};
