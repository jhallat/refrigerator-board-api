const subtaskData = require('./../data/subtasksData');
const catchAsync = require(`./../common/catchAsync`)

exports.createSubTask = (req, res) => {
    subtaskData.insert(req.body).then((subtask) => {
        res.status(201).json({
            status: 'success',
            data: {
                subtask
            }
        })
    })
}

exports.updateSubTask = (req, res) => {
    subtaskData.update(req.params.id, req.body).then((subtask) => {
        res.status(200).json({
            status: 'success',
            data: {
                subtask
            }
        })
    })
}

exports.deleteSubTask = catchAsync(async (req, res, next) => {
    await subtaskData.delete(req.params.id);
    res.status(204).json({
        status: 'success'
    })
})