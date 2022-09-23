const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./connect');
pool.connect();

const port = 3000;

const app = express();

app.use(express.json());

app.get('/', (_, response) => {
    return response.status(201).json({ message: 'Initial API', stack: 'Node JS', database: 'PostgreSQL' })
});

app.get('/users', async (request, response) => {
    try {
        const users = await pool.query('SELECT * FROM users');

        return response.status(201).json(users.rows)

    } catch (error) {
        return response.status(400).json({ message: `Error: ${error}` })
    }
})


app.listen(port, () => console.log(`Rodando servidor na porta ${port}`))