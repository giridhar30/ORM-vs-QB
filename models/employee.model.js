const employee = (sequelize, Sequelize) => {
    const Employee = sequelize.define("employee", {
        eid: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ename: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        designation: {
            type: Sequelize.STRING
        },
        salary: {
            type: Sequelize.INTEGER
        }
    });

    return Employee;
}



module.exports = employee;