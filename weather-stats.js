const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');

//TODO: error utterance 

const prefix = (v) => 'The AQI is ' + v + '. '

module.exports.get = async(conv) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    //const value = 158;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude);
    if (value == -1) {
        // TODO we got no data
        conv.close('Oops... Cannot get the air quality data from Purple Air');
    } else if (value == -2) {
        // TODO we got no sensor nearby
        conv.close('No sensors found around you. Maybe buy one on PurpleAir.com?');
    } else {
        const bucket = buckets.get_bucket(value);
        await conv.add(prefix(value) + bucket.voice);
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    value: value,
                    level: bucket.level,
                    title: bucket.title
                }
            }));
        }
        conv.add('Hint: You can say "update location" if you moved');
    }
}