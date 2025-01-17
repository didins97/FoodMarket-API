'use strict';

const { faker } = require('@faker-js/faker');
const User = require('../models').User;
const Food = require('../models').Food;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll({ where: { role: 'user' } });
    const foods = await Food.findAll();

    const orders = [];
    const orderItems = [];

    for (let i = 0; i < 10; i++) {
      // Generate order
      const orderId = faker.string.uuid();
      const userId = faker.helpers.arrayElement(users).id;

      orders.push({
        id: orderId,
        user_id: userId,
        total_price: 0, // Akan dihitung dari item
        address: faker.location.streetAddress(),
        payment_method: faker.helpers.arrayElement(['cash', 'transfer']),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Generate items for the order
      const itemCount = faker.helpers.rangeToNumber({ min: 1, max: 5 });
      let totalPrice = 0;

      for (let j = 0; j < itemCount; j++) {
        const food = faker.helpers.arrayElement(foods);
        const qty = faker.helpers.rangeToNumber({ min: 1, max: 10 });
        const subTotal = food.price * qty;

        orderItems.push({
          // id: faker.string.uuid(),
          order_id: orderId,
          food_id: food.id,
          price: food.price,
          subtotal: subTotal,
          qty,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        totalPrice += subTotal;
      }

      // Update total_price dari order
      orders[i].total_price = totalPrice;
    }

    await queryInterface.bulkInsert('Orders', orders, {});
    await queryInterface.bulkInsert('OrderItems', orderItems, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
  }
};
