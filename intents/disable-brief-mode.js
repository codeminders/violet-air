const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Disable Brief Mode', async(conv, params) => {
        preferences.set_brief_mode(conv, false);
        return await get_stats_intent(conv, {
            feedback: 'Okay.'
        });
    });
}