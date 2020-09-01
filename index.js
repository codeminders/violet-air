require('dotenv').config();

const express = require('./express');
const dialogflow = require('./dialogflow');

express.use((req, res, next) => {
    require('./intents')(req);
    next();
});

express.use('/google-assistant/webhook',
    dialogflow);

express.listen(process.env.port, async() => {
    console.log('At your service on port', process.env.port);
});