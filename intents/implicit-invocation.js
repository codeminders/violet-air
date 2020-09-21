const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');

module.exports = async() => {
    dialogflow.intent('Implicit Invocation', async(conv, params) => {
        return await get_stats_intent(conv);
    });
}