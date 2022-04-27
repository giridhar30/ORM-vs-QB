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


// Select record by Id 
    // Using ORM (sequelize)
    app.get('/orm/employee/:eid', async(req, res) => {
            const employee = await db.employee.findByPk(req.params.eid);
            
            if(employee === null){
                res.send("Employee not found with given id");            
            } else {
                res.status(200).json(employee);
            }   
    })
    app.get('/orm/team/:tid', async(req, res) => {
            const team = await db.team.findByPk(req.params.tid);
            
            if(team === null){
                res.send("Team not found with given id");            
            } else {
                res.status(200).json(team);
            }   
    })

    // Using QueryBuilder (knex)
    app.get('/qb/employee/:eid', async(req, res) => {
        const employee = await knex.from('employee_qb').where({
            id: req.params.eid
        }).first()
        console.log(employee);
        
        if(!employee){
            res.send("Employee not found with given id");            
        } else {
            res.status(200).json(employee);
        }   
    })

    app.get('/qb/team/:tid', async(req, res) => {
        const team = await knex.from('team_qb').where({
            id: req.params.tid
        }).first()

        if(!team){
            res.send("Team not found with given id");            
        } else {
            res.status(200).json(team);
        }   
    })

// Aggregate functions
    // Using ORM (sequelize)
    app.get('/orm/employeeSalarySum', async(req, res) => {
        const salary = await db.employee.sum('salary'); 
        
        if(salary === null){
            res.send("Sum not got");            
        } else {
            res.status(200).json(salary);
        }   
    })
    // Using QueryBuilder (knex)
    app.get('/qb/employeeSalarySum', async(req, res) => {
        const salary = await knex.from('employee_qb').sum('salary')

        if(!salary){
            res.send("Team not found with given id");            
        } else {
            res.status(200).json(salary[0]["sum(`salary`)"]);
        }   
    })

app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));