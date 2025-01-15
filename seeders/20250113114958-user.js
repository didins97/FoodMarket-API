'use strict';

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const users = [];

    for (let i = 0; i < 10; i++) {
      users.push({
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password: bcrypt.hashSync('password', 10),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Users', users, {});

    // admin
    await queryInterface.bulkInsert('Users', [{
      name: 'admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('Users', null, {});
  }
};
