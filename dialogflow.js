const df = require('actions-on-google');

const app = df.dialogflow();

app.catch((conv, ...args) => {
    console.error('something went wrong', ...args);
});

module.exports = app;