const express = require('express');
const app = express();
const { v4 : uuidV4 } = require("uuid");

app.use(express.json());

const customers = [];

function verifyUserExists(req, res, next){
    const { cpf } = req.headers;

    const customer = customers.find((customers) => customers.cpf === cpf);

    if(!customer) {
        return res.status(400).json({ Error: "Customer not found!"});
    }

    req.customer = customer;

    next();
};

app.post("/account", (req, res) => {
    const { name, cpf } = req.body;

    customers.push({
        name,
        cpf,
        id: uuidV4(),
        statement: []
    });

    return res.status(201).send();
})

app.get("/account", verifyUserExists, (req, res) => {
    const { customer } = req;

    return res.json({customer});
})

app.listen(3333);