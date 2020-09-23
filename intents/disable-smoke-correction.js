const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Disable Smoke Correction', async(conv, params) => {
        preferences.set_smoke_correction(conv, false);
        return await get_stats_intent(conv);
    });
}