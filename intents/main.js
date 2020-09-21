const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');

module.exports = async() => {
    dialogflow.intent('Default Welcome Intent', async(conv, params) => {
        if (conv.arguments.get('is_health_check')) {
            // ping from Google
            return conv.close('Ah, ha, ha, ha, stayin\' alive, stayin\' alive');
        }
        return await get_stats_intent(conv);
    });
}