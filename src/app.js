const AppError = require('./common/appError');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

app.use(cors());
app.use(express.json());

const tasksRoute = require('./routes/tasksRoute');
const subtasksRoute = require('./routes/subtasksRoute');

app.use('/api/v1/tasks', tasksRoute);
app.use('/api/v1/subtasks', subtasksRoute);

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);

module.exports = app;