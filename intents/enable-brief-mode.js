const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Enable Brief Mode', async(conv, params) => {
        preferences.set_brief_mode(conv, true);
        return await get_stats_intent(conv, {
            feedback: 'Okay.'
        });
    });
}