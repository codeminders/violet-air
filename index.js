require('dotenv').config();

const express = require('./express');

express.listen(process.env.port, async() => {
    console.log('At your service on port', process.env.port);
});