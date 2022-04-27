const express = require("express");
const app = express();

require('dotenv/config');

const db = require('./orm/db-config');
db.sequelize.sync();

const knex = require('./qb/db-config');

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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


app.put('/qb/employee/:id', async (req, res) => {
    await knex('employee_qb').where('id', req.params.id).update(req.body).then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

app.delete('/qb/employee/:id', async (req, res) => {
    await knex('employee_qb').where('id', req.params.id).del().then(data => data ? res.json({ message: "Deleted Successfully" }) : res.send("no data found"))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

app.put('/qb/team/:id', async (req, res) => {
    await knex('team_qb').where('id', req.params.id).update(req.body).then(data => data ? res.json({ message: "updated" }) : res.json({ message: "not found" }))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})

app.delete('/qb/team/:id', async (req, res) => {
    await knex('team_qb').where('id', req.params.id).del().then(data => data ? res.json({ message: "Deleted Successfully" }) : res.send("no data found"))
    .catch(err => {
        console.log(err)
        res.json(err)
    }
    );
})



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