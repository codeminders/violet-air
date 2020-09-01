const dialogflow = require('../dialogflow');
const df = require('actions-on-google');
const stats = require('../weather-stats');

module.exports = async() => {
    dialogflow.intent('Default Welcome Intent', async(conv, params) => {
        if (conv.arguments.get('is_health_check')) {
            // ping from Google
            return conv.close('Ah, ha, ha, ha, stayin\' alive, stayin\' alive');
        }
        if (conv.device.location) {
            return await stats.get(conv);
        }
        if (conv.user.verification !== 'VERIFIED') {
            return await conv.close('Sorry, we can\'t obtain current location from guest users');
        }
        const options = {
            context: 'To protect the world from devastation! To unite all peoples within our nation!',
            permissions: ['DEVICE_PRECISE_LOCATION'],
        };
        conv.ask(new df.Permission(options));
    });
}