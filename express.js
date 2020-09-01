const express = require('express');

const app = express();
module.exports = app;

app.use('/healthy', (req, resp) => {
    resp.sendStatus(200);
});