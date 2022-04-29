'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Employee.belongsTo(models.Team, {
        foreignKey: 'team_id',
        as: 'team'
      });
    }
  }
  Employee.init({
    ename: DataTypes.STRING,
    email: DataTypes.STRING,
    designation: DataTypes.STRING,
    salary: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};