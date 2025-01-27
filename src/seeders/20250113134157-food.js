'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const foods = [];

    for (let i = 0; i < 10; i++) {
      const food = {
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        category_id: faker.number.int({ min: 1, max: 3 }),
        image: faker.image.dataUri(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      foods.push(food);
    }

    await queryInterface.bulkInsert('Foods', foods, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Foods', null, {});
  }
};
