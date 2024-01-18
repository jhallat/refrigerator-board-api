const express = require('express');
const subtaskController = require('../controllers/subtaskController');

const router = express.Router();

router.route('/')
   .post(subtaskController.createSubTask);

router.route('/:id')
    .patch(subtaskController.updateSubTask);

module.exports = router;