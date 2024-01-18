const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

exports.insert = async({tableName,
                       fieldName,
                       parentId,
                       action,
                       originalValue,
                       newValue}) => {

    const res = await pool.query(
        `INSERT INTO audit(table_name, 
                           field_name, 
                           parent_id, 
                           action,
                           original_value,
                           new_value,
                           audit_date)
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [tableName, fieldName, parentId, action, originalValue, newValue, new Date()]
    )
}