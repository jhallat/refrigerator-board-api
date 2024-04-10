require('dotenv').config();
const { pool } = require('./../data/db');
const { v4: uuidv4 } = require('uuid');

const addAuditId = async () => {
    const {rows} = await pool.query(`select * from audit where id is null`);
    for (let row of rows) {
        console.log(row);
        await pool.query('update audit set id=$1 where parent_id = $2 and audit_date = $3 ', [uuidv4(), row.parent_id, row.audit_date]);
    }
}

addAuditId();