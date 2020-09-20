const dialogflow = require('../dialogflow');
const stats = require('../weather-stats');
const request_location = require('../request-location');

const LOCATION_EXPIRATION = 10*60*1000; // 10 minutes in milliseconds

const is_phone = (conv) => conv.surface.capabilities.has('actions.capability.WEB_BROWSER')

const need_location = (conv) => {
    return !conv.user.storage.coords || 
    (is_phone(conv) && Date.now() - conv.user.storage.coords_ts > LOCATION_EXPIRATION);
}

module.exports = async() => {
    dialogflow.intent('Default Welcome Intent', async(conv, params) => {
        if (conv.arguments.get('is_health_check')) {
            // ping from Google
            return conv.close('Ah, ha, ha, ha, stayin\' alive, stayin\' alive');
        }
        if (conv.user.verification !== 'VERIFIED') {
            return await conv.close('Sorry, we can\'t obtain location for guest users');
        }

        // if (is_phone(conv) || !conv.user.storage.coords) {
        if (need_location(conv)) {
            return await request_location(conv);
        }

        return await stats.get(conv);
    });
}