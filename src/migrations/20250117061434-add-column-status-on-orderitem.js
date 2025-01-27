'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('OrderItems', 'status', {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['awaited', 'packed', 'shipped', 'received', 'canceled'],
      defaultValue: 'awaited'
    })

    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'processed', 'completed', 'canceled'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    });

    await queryInterface.removeColumn('OrderItems', 'status')
  }
};
