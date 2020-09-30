const dialogflow = require('../dialogflow');
const intent = require('../get-stats-intent');

const duration_to_msecs = (duration) => {
    switch (duration.unit) {
        case 's':
            return duration.amount * 1000;
        case 'min':
            return duration.amount * 60 * 1000;
        case 'h':
            return duration.amount * 3600 * 1000;
        case 'day':
            return duration.amount * 3600 * 24 * 1000;
        case 'wk':
            return duration.amount * 3600 * 24 * 7 * 1000;
        case 'mo':
            return duration.amount * 3600 * 24 * 30 * 1000;
        case 'yr':
            return duration.amount * 3600 * 24 * 365 * 1000;
        default:
            return duration.amount * 1000;
    }
}

module.exports = async(req) => {
    dialogflow.intent('Remember Location', async(conv, params) => {
        if (conv.user.storage) {
            conv.user.storage.coords_ttl = duration_to_msecs(params.duration);
        }
        return await intent(conv, { feedback: 'Noted. ' });
    });
}