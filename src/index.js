const express = require('express');
const app = express();
const { v4 : uuidV4 } = require("uuid");

app.use(express.json());

const customer = [];

app.post("/", (req, res) => {
    const { name, cpf } = req.body;

    customer.push({
        name,
        cpf,
        id: uuidV4(),
        statement: []
    });

    return res.send(customer);
})

app.listen(3333);