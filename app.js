const express = require("express");
const app = express();

require('dotenv/config');

const db = require('./orm/db-config');
db.sequelize.sync();

const knex = require('./qb/db-config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// home
app.get('/', (req, res) => res.send("working!"));

/*
 *  CREATING AND DROPPING TABLES 
 */

// ORM - drop tables
app.delete('/orm/dropTables', (req, res) => {
    db.employee.drop();
    db.team.drop();
    res.send("dropped");
});

// QB - create tables
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

// QB - drop tables
app.delete('/qb/dropTables', async (req, res) => {
    await knex.schema.dropTableIfExists('employee_qb');
    await knex.schema.dropTableIfExists('team_qb');
    res.send("dropped tables");
});

/*
 *  CREATING AND READING DATA (SELECT & UPDATE) 
 */

// ORM - insert a employee
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

// QB - insert a employee
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

// ORM - Display all employees 
app.get('/orm/employee', async(req,res) =>{
    const employee = await db.employee.findAll();
    res.json(employee);
})

// QB - display all employees
app.get('/qb/employee', async(req,res) =>{
    const emp =  await knex
        .from('employee_qb')
        // .select('title', 'author', 'year')
    res.json(emp)
})

/*
 *  UPDATING AND DELETING DATA 
 */

// ORM - update employee
app.put('/orm/employee/:id', (req, res) => {
    db.employee.update(req.body, {
        where: { eid: req.params.id }
    })
    .then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// ORM - delete employee
app.delete('/orm/employee/:id', (req, res) => {
    db.employee.destroy({
        where: { eid: req.params.id }
    })
    .then(data => data ? res.json("Deleted Successfully") : res.send("no data found"))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// ORM - update team
app.put('/orm/team/:id', (req, res) => {
    db.team.update(req.body, {
        where: { tid: req.params.id }
    })
    .then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// ORM - delete team
app.delete('/orm/team/:id', (req, res) => {
    db.team.destroy({
        where: { tid: req.params.id }
    })
    .then(data => data ? res.json({ message: "Team deleted" }) : res.json({ message: "Team not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// QB - update employee
app.put('/qb/employee/:id', async (req, res) => {
    await knex('employee_qb').where('id', req.params.id).update(req.body).then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// QB - delete employee
app.delete('/qb/employee/:id', async (req, res) => {
    await knex('employee_qb').where('id', req.params.id).del().then(data => data ? res.json({ message: "Deleted Successfully" }) : res.send("no data found"))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// QB - update team
app.put('/qb/team/:id', async (req, res) => {
    await knex('team_qb').where('id', req.params.id).update(req.body).then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

// QB - delete team
app.delete('/qb/team/:id', async (req, res) => {
    await knex('team_qb').where('id', req.params.id).del().then(data => data ? res.json({ message: "Deleted Successfully" }) : res.send("no data found"))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

/*
 *  JOINING TABLES 
 */

// ORM - join tables
app.get('/orm/joinTables',async (req,res)=>{
    //orders records by salary in increasing order
    const employees = await db.employee.findAll({ order:['salary'],include: db.team });
    console.log(employees);
    // res.json(JSON.stringify(employees,null,2))
    res.json(employees);
})

// QB - join tables
app.get('/qb/joinTables',async (req,res)=>{
    const result = await knex('employee_qb')
  .join('team_qb')
  .orderBy('salary')
  .select('employee_qb.ename','team_qb.tname','employee_qb.salary');
  console.log(result);
    res.json(result);
})

/*
 *  SELECTING DATA BY ID 
 */

// ORM - employee by Id
app.get('/orm/employee/:eid', async(req, res) => {
    const employee = await db.employee.findByPk(req.params.eid);
    
    if(employee === null){
        res.send("Employee not found with given id");            
    } else {
        res.status(200).json(employee);
    }   
})

// ORM - team by Id
app.get('/orm/team/:tid', async(req, res) => {
    const team = await db.team.findByPk(req.params.tid);
    
    if(team === null){
        res.send("Team not found with given id");            
    } else {
        res.status(200).json(team);
    }   
})

// QB - employee by Id
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

// QB - team by Id
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

/*
 *  AGGREGATE FUNCTIONS
 */

// ORM - Aggregate functions
app.get('/orm/employeeSalarySum', async(req, res) => {
const salary = await db.employee.sum('salary'); 

if(salary === null){
    res.send("Sum not got");            
} else {
    res.status(200).json(salary);
}   
})

// QB - Aggregate functions
app.get('/qb/employeeSalarySum', async(req, res) => {
const salary = await knex.from('employee_qb').sum('salary')

if(!salary){
    res.send("Team not found with given id");            
} else {
    res.status(200).json(salary[0]["sum(`salary`)"]);
}   
})

/*
 *  ORDERING AND GROUPING DATA 
 */

/*ORM - OrderBy Salary in Increasing order*/
app.get('/orm/orderBySalary', (req, res) => {
    db.employee.findAll({
        attributes: ["eid", "ename", "email", "designation", "salary"],
        order: ["salary"]
    }).then(data => res.json(data));
});

/* QueryBuilder - OrderBy Salary in Increasing order*/
app.get("/qb/orderBySalary", async (req, res) => {
    const rs = await knex('employee_qb').orderBy('salary');
    res.json(rs);
});

/*ORM - GroupBy Team Id*/
app.get('/orm/groupByTeam', async (req,res) => {
    const data = await db.employee.findAll({
        attributes: ["teamTid", [db.sequelize.fn("COUNT", db.sequelize.col("teamTid")), "countPerTeam"]],
        group: "teamTid"
    });
    res.json(data);
});

/* QueryBuilder - GroupBy Team*/
app.get("/qb/groupByTeam", async (req, res) => {
    const rs = await knex.select('teamTid', knex.raw('COUNT(teamTid) AS countPerTeam')).from('employees').groupBy('teamTid');
    res.json(rs);
})

app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));