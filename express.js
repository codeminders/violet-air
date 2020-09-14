const express = require('express');
const bodyParser = require('body-parser');

const app = express();
module.exports = app;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/healthy', (req, resp) => {
    resp.sendStatus(200);
});
app.use('/google-assistant', express.static('ui'));