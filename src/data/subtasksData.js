const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');
const auditData = require(`./auditData`);

exports.insert = async ({taskId, description}) => {
    const date = new Date();
    const id = uuidv4();

    const res = await pool.query(
        `INSERT INTO subtasks(id, task_id, description, completed, last_updated)
         VALUES($1, $2, $3, $4, $5)`,
        [id, taskId, description, false, date]
    )

    return {
        id,
        taskId,
        description,
        completed: false,
        lastUpdated: date
    }

}

exports.findByTask = async (task_id) => {
    const res = await pool.query(
        'SELECT id, task_id, description, completed, last_updated FROM subtasks WHERE task_id = $1',
        [task_id]
    )
    const subtasks = res.rows.map(row => ({
        id: row.id,
        taskId: row.task_id,
        description: row.description,
        completed: row.completed,
        lastUpdated: row.lastUpdated
    }));
    console.log(subtasks);
    return subtasks;
}

const findById = async (id) => {
    const res = await pool.query(
        'SELECT id, task_id, description, completed last_updated FROM subtasks WHERE id = $1',
        [id]
    )
    if (res.rows.length > 0) {
        const subtask = res.rows[0];
        return {
            id: subtask.id,
            taskId: subtask.task_id,
            description: subtask.description,
            completed: subtask.completed,
            lastUpdated: subtask.lastUpdated
        }
    }
}

exports.update = async (id, {completed}) => {
    const subtask = await findById(id);
    if (subtask.completed !== completed) {
        const res = await pool.query(
            `UPDATE subtasks
             SET completed=$1,
                 last_updated = $2
             where id = $3`,
            [completed, new Date(), id]
        )
        await auditData.insert({
            tableName: 'subtasks',
            fieldName: 'completed',
            parentId: id,
            action: 'update',
            originalValue: subtask.completed,
            newValue: completed
        });
    }
    subtask.completed = completed;
    return subtask;
}