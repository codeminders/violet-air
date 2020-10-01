const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');
const suggestions = require('./suggestion-chips');
const preferences = require('./preferences');

const prefix = (v) => 'The Air Quality Index is ' + v + '. '

module.exports.get = async(conv, options = {}) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const correction = preferences.get(conv).smoke_correction ? "EPA" : "NONE";
    
    // const value = 441;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude, correction);

    if (value == -1) {
        return conv.close('Oops... Cannot get the air quality data from Purple Air');
    }

    if (value == -2) {
        const message = 'No Purle Air sensors found close to you.'
        if (conv.screen && conv.surface.capabilities.has('actions.capability.WEB_BROWSER')) {
            conv.ask(new df.LinkOutSuggestion({
                name: 'PurpleAir.com',
                url: 'https://www.purpleair.com/',
            }));
        }
        return conv.close(message);
    }
    
    const bucket = buckets.get_bucket(value);
    const chips = suggestions.chips(conv);
    if (options.feedback) {
        conv.add(options.feedback);
    }

    conv.add(prefix(value) + bucket.voice);
    conv.close(suggestions.phrase(conv));
}