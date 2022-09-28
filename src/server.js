const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const pool = require('./connect');

const RowTable = require('./Models/rowLoan');

const validate = require('./middlewares/validate');

const { UserSchema, singInSchema } = require('./Schemas/userSchema');
const CheckToken = require('./middlewares/Authenticated');

pool.connect();

const port = 3000;

const app = express();


app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    app.use(cors())
    next()
})

app.get('/', (request, response) => {
    return response.status(201).json({ message: 'Initial API', stack: 'Node JS', database: 'PostgreSQL' })
});

app.post('/users/singup', validate(UserSchema), async (request, response) => {
    const { name, email, password, cel } = request.body

    const salt = await bcrypt.genSalt(14);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const user = await pool.query('INSERT INTO users (name, email, password, cel) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, passwordHash, cel]);

        return response.status(200).json(user.rows)

    } catch (error) {
        return response.status(500).json({ message: `Error: ${error}` })
    }

});

app.post('/user/singin', validate(singInSchema), async (request, response) => {
    const { email, password } = request.body;

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

//Private Route
app.get('/users', CheckToken, async (request, response) => {
    try {
        const users = await pool.query('SELECT * FROM users');

        return response.status(201).json(users.rows)

    } catch (error) {
        return response.status(400).json({ message: `Error: ${error}` })
    }
});


app.post('/loan', CheckToken, async (request, response) => {
    const { uf, data_born, loan, value_month } = request.body;


    try {
        const percentual = await pool.query('SELECT * FROM rate_uf WHERE uf = ($1)', [uf]);

        let debit_balance = loan;
        let rate_month = value_month;

        const dataLoans = []

        while (debit_balance > 0) {

            let adjusted_debt_balance = (debit_balance + (percentual.rows[0].rate * debit_balance));
            let fees = percentual.rows[0].rate * debit_balance

            const tableItem = new RowTable(Number(debit_balance), Number(fees), Number(adjusted_debt_balance), Number(rate_month))

            dataLoans.push(tableItem);


            if (debit_balance > rate_month) {
                debit_balance = (debit_balance + fees) - rate_month
            } else {
                rate_month = debit_balance
                debit_balance = debit_balance - debit_balance
            }

            if (rate_month > debit_balance) {
                rate_month = debit_balance
            }
        }

        return response.status(200).json({
            percentual: percentual.rows[0].rate * 100,
            data_born,
            loan,
            value_month,
            dataLoans
        })
    } catch (error) {
        console.log(error)
        response.json({ message: error })
    }

})

app.get('/loan/:uf', CheckToken, async (request, response) => {
    const { uf } = request.params

    try {
        const percentual = await pool.query('SELECT * FROM rate_uf WHERE uf = ($1)', [uf])

        return response.json(percentual.rows[0])

    } catch (error) {
        console.log(error)
        response.json({ message: error })
    }
})


app.listen(port, () => console.log(`Rodando servidor na porta ${port}`))