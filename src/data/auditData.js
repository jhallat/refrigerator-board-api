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

exports.findTasksWithPage = async (page, pageSize) => {
    const res = await pool.query(
        `SELECT id, table_name, field_name, description, action, original_value, new_value, audit_date
         FROM audit
         INNER JOIN tasks ON audit.parent_id = tasks.id
         WHERE table_name = 'tasks'
         ORDER BY audit_date DESC
         OFFSET $1 LIMIT $2`,
        [page * pageSize, pageSize]
    )
    return res.rows.map(row => ({
        id: row.id,
        tableName: row.table_name,
        fieldName: row.field_name,
        description: row.description,
        action: row.action,
        originalValue: row.original_value,
        newValue: row.new_value,
        auditDate: row.audit_date
    }));
}