const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');



dotenv.config();

const pool = require('./connect');
pool.connect();

const port = 3000;

const app = express();


app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    app.use(cors())
    next()
})

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
        return response.status(422).json({ message: 'password must have at least6 characters!' })
    }

    if (!cel) {
        return response.status(422).json({ message: 'celNumber is required!' })
    }

    if (cel.length !== 9) {
        return response.status(422).json({ message: 'celNumber must have at least 9 characters!' })
    }

    const salt = await bcrypt.genSalt(14);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const user = await pool.query('INSERT INTO users (name, email, password, cel) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, passwordHash, cel]);

        return response.status(200).json(user.rows)

    } catch (error) {
        return response.status(500).json({ message: `Error: ${error}` })
    }

});

app.post('/user/singin', async (request, response) => {
    const { email, password } = request.body;

    if (!email) {
        return response.status(422).json({ message: 'email is required!' })
    }

    if (!password) {
        return response.status(422).json({ message: 'password is required!' })
    }

    if (password.length < 6) {
        return response.status(422).json({ message: 'password must have at least 6 characters!' })
    }


    try {
        const user = await pool.query('SELECT * FROM users WHERE email = ($1)', [email]);

        const checkPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!checkPassword) {
            return response.status(404).json({ message: 'password is wrong' })
        }
        const secret = process.env.SECRET;
        const token = jwt.sign(
            {
                id: user.rows[0].id
            },
            secret
        )

        const userData = {
            user: {
                ...user.rows[0],
            },
            token
        }

        return response.status(200).json(userData)

    } catch (error) {
        console.log(error)
        return response.status(500).json(`Error in the request ${error}`)
    }
});

app.post('/loan', async (request, response) => {
    const { uf, data_born, loan, value_month } = request.body;
    let percentual = 0
    if (uf === "MG") {
        percentual = 0.01
    }

    if (uf === "SP") {
        percentual = 0.008
    }

    if (uf === "RJ") {
        percentual = 0.009
    }

    if (uf === "ES") {
        percentual = 0.0111
    }

    let valueloan = loan;
    let rate_month = value_month;

    const dataLoans = []

    while (valueloan > 0) {

        let loanFess = (valueloan + (percentual * valueloan));
        let fees = percentual * valueloan


        const tableItem = {
            valueloan: Number(valueloan).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            fees: Number(fees).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            loanFess: Number(loanFess).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            value_portion: Number(rate_month).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }

        dataLoans.push(tableItem);



        if (valueloan > rate_month) {
            valueloan = (valueloan + fees) - rate_month
        } else {
            rate_month = valueloan
            valueloan = valueloan - valueloan
        }

        if (rate_month > valueloan) {
            rate_month = valueloan
        }
    }


    return response.status(200).json({
        uf,
        data_born,
        loan,
        value_month,
        dataLoans
    })
})


app.listen(port, () => console.log(`Rodando servidor na porta ${port}`))