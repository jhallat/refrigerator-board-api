const { Pool } = require('pg');

const pool = new Pool({
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

module.exports = { pool };