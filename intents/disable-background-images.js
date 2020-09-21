const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Disable Background Images', async(conv, params) => {
        preferences.set_backgrounds(conv, false);
        return await get_stats_intent(conv);
    });
}