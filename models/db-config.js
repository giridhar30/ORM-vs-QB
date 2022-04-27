const dbConfig = {
    HOST: process.env.DB_URL,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const employee = require('./employee.model');
const Employee = employee(sequelize, Sequelize);

const team = require('./team.model');
const Team = team(sequelize, Sequelize);

Employee.belongsTo(Team);
Team.hasMany(Employee);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.employee = Employee;
db.team = Team;

module.exports = db;