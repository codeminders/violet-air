const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');

module.exports = async() => {
    dialogflow.intent('Disable Background Images', async(conv, params) => {
        conv.user.storage.backgrounds = false;
        return await get_stats_intent(conv);
    });
}