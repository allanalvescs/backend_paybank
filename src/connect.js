const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'controlle'
})

module.exports = pool