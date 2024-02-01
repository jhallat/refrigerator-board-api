const taskData = require('./../data/tasksData');
const catchAsync = require(`./../common/catchAsync`)


exports.createTask = catchAsync(async (req, res, next) => {
    const newTask = await taskData.insert(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            task: newTask
        }
    })
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
    const allTasks = await taskData.findAll();
    res.status(200).json({
         status: 'success',
         results: allTasks.length,
         data: {
             tasks: allTasks
         }
     })
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const updatedTask = await taskData.update(req.params.id, req.body)
    res.status(200).json({
        status: 'success',
        data: {
            task: updatedTask
        }
    })
});

exports.deleteTask = catchAsync(async (req, res, next) => {
    await taskData.deleteOne(req.params.id)
    res.status(204).json({
        status: 'success'
    })
})