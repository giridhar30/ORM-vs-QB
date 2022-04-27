const team = (sequelize, Sequelize) => {
    const Team = sequelize.define("team", {
        tid: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tname: {
            type: Sequelize.STRING
        },
    });

    return Team;
}

module.exports = team;