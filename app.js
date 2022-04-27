const express = require("express");
const app = express();

require('dotenv/config');

const db = require('./orm/db-config');
db.sequelize.sync();

const knex = require('./qb/db-config');

app.use(express.json());

app.get('/', (req, res) => res.send("working!"));

app.get('/orm/employee', (req, res) => {
    db.employee.findAll().then(data => res.json(data));
});

app.delete('/orm/dropTables', (req, res) => {
    db.employee.drop();
    db.team.drop();
    res.send("dropped");
});

/*ORM - OrderBy Salary in Increasing order*/
app.get('/orm/orderBySalary', (req, res) => {
    db.employee.findAll({
        attributes: ["eid", "ename", "email", "designation", "salary"],
        order: ["salary"]
    }).then(data => res.json(data));
});

/*ORM - GroupBy Team Id*/
app.get('/orm/groupByTeam', async (req,res) => {
    const data = await db.employee.findAll({
        attributes: ["teamTid", [db.sequelize.fn("COUNT", db.sequelize.col("teamTid")), "countPerTeam"]],
        group: "teamTid"
    });
    res.json(data);
});

app.get('/qb/createTables', async (req, res) => {

    try {
        await knex.schema.createTable('team_qb', table => {
            console.log(table);
            table.string('tname');
            table.increments('id').primary();
        })
        
        await knex.schema.createTable('employee_qb', table => {
            table.string('ename');
            table.increments('id').primary();
            table.string('email');
            table.string('designation');
            table.integer('salary');
            // table.foreign('id').references('id').inTable('team_qb');
            table.integer('team_id')
                .unsigned()
                .index()
                .references('id')
                .inTable('team_qb');
        })
    } catch (error) {
        console.log(error);
    }

    res.send("created tables");
});

app.delete('/qb/dropTables', async (req, res) => {
    await knex.schema.dropTableIfExists('employee_qb');
    await knex.schema.dropTableIfExists('team_qb');
    res.send("dropped tables");
});

/* QueryBuilder - OrderBy Salary in Increasing order*/
app.get("/qb/orderBySalary", async (req, res) => {
    const rs = await knex('employee_qb').orderBy('salary');
    res.json(rs);
});

/* QueryBuilder - GroupBy Team*/
app.get("/qb/groupByTeam", async (req, res) => {
    const rs = await knex.select('teamTid', knex.raw('COUNT(teamTid) AS countPerTeam')).from('employees').groupBy('teamTid');
    res.json(rs);
})

app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));