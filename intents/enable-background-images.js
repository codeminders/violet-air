const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Enable Background Images', async(conv, params) => {
        preferences.set_backgrounds(conv, true);
        return await get_stats_intent(conv);
    });
}