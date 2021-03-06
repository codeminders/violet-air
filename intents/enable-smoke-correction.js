const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Enable Smoke Correction', async(conv, params) => {
        preferences.set_smoke_correction(conv, true);
        return await get_stats_intent(conv, {
            feedback: 'Smoke correction is enabled.'
        });
    });
}