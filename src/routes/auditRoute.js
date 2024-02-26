const express = require('express');
const auditController = require('../controllers/auditController');

const router = express.Router();

router.route('/')
    .get(auditController.getTasksAuditsByPage);

module.exports = router;