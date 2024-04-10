const auditData = require('../data/auditData');

exports.getTasksAuditsByPage = async (req, res) => {
    const audits = await auditData.findTasksWithPage(req.query.page, req.query.pageSize);
    res.status(200).json({
        status: 'success',
        results: audits.length,
        data: audits.data,
        nextPageAvailable: audits.nextPageAvailable
    })
}