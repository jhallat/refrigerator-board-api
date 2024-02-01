const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');
const subtaskData = require('./subtasksData')
const auditData = require('./auditData');

const insert = async ({ description, durationType, selectedDays, amount }) => {
    const date = new Date();
    const day = date.getDay();
    const count = selectedDays[day] === 1 ? amount : 0;
    const id = uuidv4();

    const res = await pool.query(
        `INSERT INTO tasks(id, description, duration_type, days, count, last_updated, completed, amount)
         VALUES($1,$2, $3, $4, $5, $6, $7, $8)`,
        [id, description, durationType, selectedDays, count, date, false, amount]
    );
    return {
        id,
        description,
        durationType,
        selectedDays,
        count,
        lastUpdated : date,
        completed : false,
        amount
    }
}

const calculateAdditionalCount = (last_updated, days, amount) => {
    let additionalCount = 0;
    const today = new Date(new Date().toDateString());
    let compare = new Date(last_updated.toDateString());
    //Do not consider the day the task was last updated
    if (today <= compare) {
        return additionalCount;
    }
    compare.setDate(compare.getDate() + 1);
    while (today >= compare) {
        const day = compare.getDay();
        if (days[day] === 1) {
            additionalCount += amount;
        }
        compare.setDate(compare.getDate() + 1);
    }
    return additionalCount;
}

const updateCount = (id, newCount) => {
    pool.query(
        `UPDATE tasks SET count = $1, last_updated = $2 WHERE id = $3`,
        [newCount, new Date(), id]
    );
}


const calculateCompleted = (task) => {
    if (task.last_updated >= new Date(new Date().toDateString())) {
        return task.completed;
    }
    if (task.duration_type === 0 || task.durationType === 0) {
        return task.completed;
    }
    return task.days[new Date().getDay()] === 1;
}

const findAll = async () => {
    const res = await pool.query(
        'SELECT id, description, duration_type, days, count, last_updated, completed, amount FROM tasks WHERE deleted = false');

    const tasks = [];
    for (let row of res.rows) {
        const additionalCount =
            row.duration_type === 0 ?
                0 :
                calculateAdditionalCount(row.last_updated, row.days, row.amount);
        let useCount = row.count;
        if (additionalCount > 0) {
            useCount += additionalCount;
            updateCount(row.id, useCount);
            await auditData.insert({tableName: 'tasks',
                fieldName: 'count',
                parentId: row.id,
                action: 'schedule',
                originalValue: row.count,
                newValue: useCount
            });
        }
        let completed = calculateCompleted(row);
        if (completed != row.completed) {
            await updateCompletedStatus(row, completed);
        }
        if (!completed) {
            const subtasks = await subtaskData.findByTask(row.id);
            tasks.push({
                id: row.id,
                description: row.description,
                durationType: row.duration_type,
                selectedDays: row.days,
                count: useCount,
                lastUpdated: row.last_updated,
                completed,
                amount: row.amount,
                subtasks
            })
        }
    }

    return tasks;
}

const adjustCount = ({count, newAmount, originalAmount, newDays, originalDays, lastUpdate}) => {
    if (lastUpdate < new Date()) {
        //Records have not been updated for today yet
        return count;
    }
    const day = new Date().getDay();
    if (originalDays[day] === 0 && newDays[day] === 0) {
        return count;
    }
    if (originalDays[day] === 0 && newDays[day] === 1) {
        return count + (newAmount * 1);
    }
    if (originalDays[day] === 1 && newDays[day] === 0) {
        return count - originalAmount;
    }
    return count + (newAmount - originalAmount);
}

const findById = async (id) => {
    const res = await pool.query(`SELECT id,
                                         description,
                                         duration_type,
                                         days,
                                         count,
                                         last_updated,
                                         completed,
                                         amount
                                  FROM tasks WHERE id = $1`, [id]);
    let task;
    if (res.rows.length > 0) {
        const found = res.rows[0];
        const subtasks = await subtaskData.findByTask(found.id);
        task = {
            id: found.id,
            description: found.description,
            durationType: found.duration_type,
            selectedDays: found.days,
            count: found.count,
            lastUpdated: found.last_updated,
            completed: found.completed,
            amount: found.amount,
            subtasks
        }
    }
    return task;
}

const updateCompletedStatus = async (task, completed) => {
    const res = await pool.query(
        'UPDATE tasks set completed = $1, last_updated = $2 WHERE id = $3',
        [completed, new Date(), task.id]
    )
    const updated = {...task};
    updated.completed = completed;
    return updated;
}

const update = async (id, { count, description, durationType, selectedDays, amount, completed }) => {
    const task = await findById(id);
    if (completed && completed !== task.completed) {
        return updateCompletedStatus(task, completed);
    }
    if (count && count < 0) {
        let currentCount = 0;
        if (task) {
            currentCount = task.count;
            await pool.query('UPDATE tasks SET count = $1 WHERE id = $2', [currentCount + count, id]);
            await auditData.insert({tableName: 'tasks',
                                                                             fieldName: 'count',
                                                                             parentId: id,
                                                                             action: 'update',
                                                                             originalValue: currentCount,
                                                                             newValue: currentCount + count
            });
        }
        return {
            id: task.id,
            description: task.description,
            durationType: task.durationType,
            selectedDays: task.days,
            count: currentCount + count,
            lastUpdated: task.lastUpdated,
            completed: task.completed,
            amount: task.amount,
            subtasks: task.subtasks
        }
    } else {
        if (task) {
            const currentCount = adjustCount({
                count: task.count,
                newAmount: amount,
                originalAmount: task.amount,
                newDays: selectedDays,
                originalDays: task.selectedDays});
            await pool.query(`UPDATE tasks SET count = $1, 
                                               amount = $2, 
                                               days = $3, 
                                               duration_type = $4, 
                                               description = $5
                                WHERE id = $6`,
                [currentCount, amount, selectedDays, durationType, description, id])
            if (task.count !== currentCount) {
                await auditData.insert({tableName: 'tasks',
                    fieldName: 'count',
                    parentId: id,
                    action: 'update',
                    originalValue: task.count,
                    newValue: currentCount
                });
            }
            return {
                id: task.id,
                description,
                durationType,
                selectedDays,
                count: currentCount,
                lastUpdated: task.lastUpdated,
                completed: task.completed,
                amount,
                subtasks: task.subtasks
            }
        }
    }
}

const deleteOne = async (id) => {
    await pool.query(`UPDATE tasks SET deleted = true WHERE id = $1`,
        [id])
    await auditData.insert({
        tableName: 'tasks',
        fieldName: 'deleted',
        parentId: id,
        action: 'delete',
        originalValue: 'false',
        newValue: 'true'
    });
}

module.exports = { calculateCompleted, update, deleteOne, findAll, insert };