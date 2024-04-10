const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.route('/')
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

router.route('/:id')
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

router.route('/revert/:auditId')
    .put(taskController.revertTask);

module.exports = router;