require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Vacation Planning API listening on port ${port}...`)
});