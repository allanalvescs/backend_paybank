const express = require('express');
const bcrypt = require('bcrypt')
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
});

app.post('/users/singup', async (request, response) => {
    const { name, email, password, cel } = request.body

    if (!name) {
        return response.status(422).json({ message: 'name is required!' })
    }

    if (!email) {
        return response.status(422).json({ message: 'email is required!' })
    }

    if (!password) {
        return response.status(422).json({ message: 'password is required!' })
    }

    if (password.length < 6) {
        return response.status(422).json({ message: 'password needs minimum 6 characters!' })
    }

    if (!cel) {
        return response.status(422).json({ message: 'celNumber is required!' })
    }

    if (cel.length !== 9) {
        return response.status(422).json({ message: 'celNumber needs 9 characters!' })
    }

    const salt = await bcrypt.genSalt(14);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const user = await pool.query('INSERT INTO users (name, email, password, cel) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, passwordHash, cel]);

        return response.status(200).json(user.rows)

    } catch (error) {
        return response.status(500).json({ message: `Error: ${error}` })
    }

})


app.listen(port, () => console.log(`Rodando servidor na porta ${port}`))