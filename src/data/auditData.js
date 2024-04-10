const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

exports.insert = async({tableName,
                       fieldName,
                       parentId,
                       action,
                       originalValue,
                       newValue}) => {

    const id = uuidv4();
    const res = await pool.query(
        `INSERT INTO audit(id,
                           table_name, 
                           field_name, 
                           parent_id, 
                           action,
                           original_value,
                           new_value,
                           audit_date)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, tableName, fieldName, parentId, action, originalValue, newValue, new Date()]
    )
}

exports.findTasksWithPage = async (page, pageSize) => {
    const res = await pool.query(
        `SELECT audit.id, 
                table_name, 
                field_name, 
                description, 
                action, 
                original_value, 
                new_value, 
                audit_date,
                is_reverted
         FROM audit
         INNER JOIN tasks ON audit.parent_id = tasks.id
         WHERE table_name = 'tasks'
         ORDER BY audit_date DESC
         OFFSET $1 LIMIT $2`,
        [page * pageSize, pageSize]
    )

    const count = await pool.query(
        `SELECT COUNT(*) FROM audit WHERE table_name = 'tasks'`
    )
    return {
        data: res.rows.map(row => ({
            id: row.id,
            tableName: row.table_name,
            fieldName: row.field_name,
            description: row.description,
            action: row.action,
            originalValue: row.original_value,
            newValue: row.new_value,
            auditDate: row.audit_date,
            isReverted: row.is_reverted
        })),
        nextPageAvailable: count.rows[0].count > (page + 1) * pageSize
    }

}

exports.findById = async (id) => {
    console.log(id);
    const res = await pool.query(
        `SELECT audit.id, 
                parent_id, 
                table_name, 
                field_name, 
                description, 
                action, 
                original_value, 
                new_value, 
                audit_date,
                is_reverted
         FROM audit  
         INNER JOIN tasks 
            ON audit.parent_id = tasks.id
         WHERE audit.id = $1`,
        [id]
    )
    if (res.rows.length > 0) {
        const audit = res.rows[0];
        return {
            id: audit.id,
            tableName: audit.table_name,
            fieldName: audit.field_name,
            description: audit.description,
            action: audit.action,
            originalValue: audit.original_value,
            newValue: audit.new_value,
            auditDate: audit.audit_date,
            parentId: audit.parent_id,
            isReverted: audit.is_reverted
        }
    } else {
        return null;
    }
}

exports.markAsReverted = async (id) => {
    await pool.query(
        `UPDATE audit
         SET is_reverted = true
         WHERE id = $1`,
        [id]
    )
}