const dialogflow = require('../dialogflow');
const get_stats_intent = require('../get-stats-intent');

module.exports = async() => {
    dialogflow.intent('Enable Background Images', async(conv, params) => {
        conv.user.storage.backgrounds = true;
        return await get_stats_intent(conv);
    });
}