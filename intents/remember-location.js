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

const duration_unit_to_str = (unit) => {
    switch (unit) {
        case 's':
            return 'second';
        case 'min':
            return 'minute';
        case 'h':
            return 'hour';
        case 'day':
            return 'day';
        case 'wk':
            return 'week';
        case 'mo':
            return 'month';
        case 'yr':
            return 'year';
        default:
            return '';
    }
}

const duration_to_str = (duration) => {
    return '' + duration.amount + ' ' + 
        duration_unit_to_str(duration.unit) +
        (duration.amount == 1 ? '' : 's');
}

module.exports = async(req) => {
    dialogflow.intent('Remember Location', async(conv, params) => {
        if (conv.user.storage) {
            conv.user.storage.coords_ttl = duration_to_msecs(params.duration);
        }
        return await intent(conv, { feedback: 'Location remembered for ' + duration_to_str(params.duration)});
    });
}

// console.log(duration_to_str({unit: 'min', amount: 3}));