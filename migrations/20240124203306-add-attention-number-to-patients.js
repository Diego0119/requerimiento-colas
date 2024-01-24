'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patients', 'attention_number', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('patients', 'attention_number');
  },
};
