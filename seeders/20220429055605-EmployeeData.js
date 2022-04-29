'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Employees', [
      {
        ename: 'Employee 1',
        email: 'employee1@gmail.com',
        designation: 'Software Engineer',
        salary: '50000',
        team_id: 1,
        work_location: 'Bangalore',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ename: 'Employee 2',
        email: 'employee2@gmail.com',
        designation: 'Jr Software Engineer',
        salary: '25000',
        team_id: 2,
        work_location: 'Chennai',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('Employees', null, {});
  }
};
