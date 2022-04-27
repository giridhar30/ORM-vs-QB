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

app.get('/orm/joinTables',async (req,res)=>{
    //orders records by salary in increasing order
    const employees = await db.employee.findAll({ order:['salary'],include: db.team });
    console.log(employees);
    // res.json(JSON.stringify(employees,null,2))
    res.json(employees);
})

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
app.get('/qb/joinTables',async (req,res)=>{
    const result = await knex('employee_qb')
  .join('team_qb')
  .orderBy('salary')
//   .groupBy('team_qb.tname')
  .select('employee_qb.ename','team_qb.tname','employee_qb.salary');
  console.log(result);
    res.json(result);
})
app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));