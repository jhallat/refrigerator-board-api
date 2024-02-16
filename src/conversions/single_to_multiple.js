require('dotenv').config();
const { pool } = require('./../data/db');

const convert = async () => {
    const {rows} = await pool.query(`select * from tasks where duration_type = 1 and amount > 0`);
    for (let row of rows) {
        const newDays = row.days.map(day => day * row.amount);
        await pool.query('update tasks set days=$1, duration_type=2 where id =$2', [newDays, row.id]);
    }
}

convert();