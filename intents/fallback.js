const dialogflow = require('../dialogflow');

module.exports = async() => {
    dialogflow.intent('Default Fallback Intent', async(conv, params) => {
        conv.ask('Sorry, I did not get that. You can ask me to update your location or change the pollution type settings.');
    });
}