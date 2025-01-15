'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Foods', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: 'image',
      references: {
        model: 'Categories',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Foods', 'category_id');
  }
};
