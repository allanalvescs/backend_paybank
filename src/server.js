const express = require('express');

const port = 3000;

const app = express();

app.use(express.json());

app.get('/', (_, response) => {
    return response.status(201).json({ message: 'Initial API', stack: 'Node JS', database: 'PostgreSQL' })
})

app.listen(port, () => console.log(`Rodando servidor na porta ${port}`))