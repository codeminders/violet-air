const dialogflow = require('../dialogflow');
const stats = require('../weather-stats');
const request_location = require('../request-location');

module.exports = async() => {
    dialogflow.intent('Default Welcome Intent', async(conv, params) => {
        if (conv.arguments.get('is_health_check')) {
            // ping from Google
            return conv.close('Ah, ha, ha, ha, stayin\' alive, stayin\' alive');
        }
        if (conv.user.verification !== 'VERIFIED') {
            return await conv.close('Sorry, we can\'t obtain location for guest users');
        }
        if (conv.surface.capabilities.has('actions.capability.WEB_BROWSER') ||
            !conv.user.storage.coords) {
            return await request_location(conv);
        }
        return await stats.get(conv);
    });
}