const dialogflow = require('../dialogflow');
const stats = require('../weather-stats');

module.exports = async(req) => {
    dialogflow.intent('Got Location', async(conv, params, granted) => {
        if (granted) {
            console.log(conv.device.location);
            conv.user.storage.coords = conv.device.location;
            conv.user.storage.coords_ts = Date.now();
            return await stats.get(conv);
        } else {
            conv.close('Well, goodbye then.');
        }
    });
}