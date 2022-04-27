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

// insert a employee
app.post('/orm/insert',async(req,res)=>{
    var name = req.body.ename;
    var email =  req.body.email;
    var designation = req.body.designation;
    var salary = parseInt(req.body.salary);
    var teamid = parseInt(req.body.teamid);
    console.log(name);
    const employee = await db.employee
                    .create({ ename: name, email:email, designation: designation , salary:salary , teamTid: teamid });
    res.send("Record added !!");
})
// Display all employees 
app.get('/orm/displayemp', async(req,res) =>{
    
    const employee = await db.employee.findAll();
    console.log(employee.every(emp => emp instanceof db.employee));
    console.log("All employees:", JSON.stringify(employee, null, 2));
    res.json(employee);
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

// insert a employee
app.post('/qb/insert',async(req,res)=>{
    var name = req.body.ename;
    var email =  req.body.email;
    var designation = req.body.designation;
    var salary = parseInt(req.body.salary);
    var teamid = parseInt(req.body.teamid);
   await knex('employee_qb').insert( 
                                    [{   ename: name, 
                                         email: email, 
                                         designation: designation,
                                         salary: salary,
                                         team_id:teamid 
                                    }] 
                                    )
    res.send("Record added !!");
})

//display all employees
app.get('/qb/displayemp', async(req,res) =>{
    const emp =  await knex
        .from('employee_qb')
        // .select('title', 'author', 'year')
    res.json(emp)
})


app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));