const express = require('express');
const bodyParser = require('body-parser');

const app = express();
module.exports = app;

app.use(bodyParser.json());

app.use('/healthy', (req, resp) => {
    resp.sendStatus(200);
});