const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { v4 : uuidV4 } = require("uuid");

app.use(express.json());
app.use(bodyParser.json());

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

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if( operation.type === 'deposit' ){
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }}, 0);

        return balance;
};

app.post("/account", (req, res) => {
    const { name, cpf } = req.body;

    const customer = customers.some((customers) => customers.cpf === cpf);

    if(customer){
        return res.status(400).json({ Error: "Customer already exists!"});
    }

    customers.push({
        name,
        cpf,
        id: uuidV4(),
        statement: []
    });

    return res.status(201).send();
});

app.get("/account", verifyUserExists, (req, res) => {
    const { customer } = req;

    return res.json(customer);
});

app.get("/statement", verifyUserExists, (req, res) => {
    const { customer } = req;

    return res.send(customer.statement);
});

app.post("/statement/deposit", verifyUserExists, (req, res) => {
    const { description, amount} = req.body;
    const { customer } = req;

    const statementOperation = ({
        description,
        amount,
        created_at: new Date(),
        type: 'deposit'
    });

    customer.statement.push(statementOperation);

    return res.status(201).send();
});

app.post("/statement/withdraw", verifyUserExists, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    console.log(balance, " ", amount);

    if( balance < amount) {
        return res.status(400).json({ Error: "Insufficient funds!"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'withdraw'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send();
});

app.put("/account", verifyUserExists, (req, res) => {
    const { name } = req.body;
    const { customer } = req;

    customer.name = name;

    return res.status(201).send();
});

app.delete("/account", verifyUserExists, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(201).send();
});

app.post("/allUsers", (req, res) => {
    return res.send(customers);
});

app.listen(3333);