'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('Teams', [
      {
        tname: 'Presidio Team 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tname: 'Presidio Team 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Teams', null, {});
  }
};
