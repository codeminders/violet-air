const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');

const prefix = (v) => 'The Air Quality Index is ' + v + '. '

module.exports.get = async(conv) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude);
    if (value == -1) {
        // TODO we got no data
        conv.close('Oops... Cannot get the air quality data from Purple Air');
    } else if (value == -2) {
        if (conv.screen && conv.surface.capabilities.has('actions.capability.WEB_BROWSER')) {
            conv.ask(new df.LinkOutSuggestion({
                name: 'PurpleAir.com',
                url: 'https://www.purpleair.com/',
            }));
            return conv.close('No sensors found around you. Maybe buy one on PurpleAir.com?');
        }
        conv.close('No sensors found around you. Maybe buy one on PurpleAir.com?');
    } else {
        const bucket = buckets.get_bucket(value);
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            await conv.add(prefix(value) + bucket.voice);
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    value: value,
                    level: bucket.level,
                    title: bucket.title,
                    backgrounds: !conv.user.storage.hasOwnProperty('backgrounds') ||
                        conv.user.storage.backgrounds
                }
            }));
        } else {
            conv.ask(prefix(value) + bucket.voice);
        }
    }
}