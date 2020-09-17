const dialogflow = require('../dialogflow');

module.exports = async() => {
    dialogflow.intent('Default Fallback Intent', async(conv, params) => {
        conv.ask('Sorry, what?');
    });
}