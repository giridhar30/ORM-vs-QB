const express = require("express");
const app = express();

require('dotenv/config');

const db = require('./models/db-config');
db.sequelize.sync();

app.use(express.json());

app.get('/', (req, res) => res.send("working!"));

app.get('/employee', (req, res) => {
    db.employee.findAll().then(data => res.json(data));
});

app.delete('/dropEmployeeTable', (req, res) => {
    db.employee.drop();
    res.send("dropped");
})

app.listen(process.env.PORT, () => console.log(`app running on port ${process.env.PORT}`));