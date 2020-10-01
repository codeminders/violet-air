const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');
const suggestions = require('./suggestion-chips');
const preferences = require('./preferences');
const geocoder = require('./geocoder');

const USE_CARDS = false;

const prefix = (v) => 'The Air Quality Index is ' + v + '. '

const get_closest = async(conv, coordinates, correction) => {
    const closest = await sensors.closests(coordinates.latitude, coordinates.longitude, false);
    if (sensors == null || !closest.length) {
        conv.close('Oops... Cannot get the air quality data from Purple Air');
        return null;
    }
    const sensor = closest[0];
    console.log('closest sensor is', sensor);
    return { sensor };
    // TODO
    const value = await sensors.value(sensor.lat, sensor.lon, correction);
    console.log('got closest value', value);
    if (value <= 0) {
        conv.close('Oops... Cannot get the air quality data from Purple Air');
        return null;
    }
    return { sensor, value };
}


module.exports.get = async(conv, options = {}) => {
    if (options.feedback) {
        conv.add(options.feedback);
    }
    const prefs = preferences.get(conv);
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const correction = prefs.smoke_correction ? 'EPA' : 'NONE';
    const chips = suggestions.chips(conv);

    // const value = 441;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude, correction);
    if (value == -1) {
        // TODO we got no data
        return conv.close('Oops... Cannot get the air quality data from Purple Air');
    } else if ( /*value == -2*/ true) {
        const closest = await get_closest(conv, coordinates, correction);
        if (!closest) {
            return;
        }
        console.log('?', await geocoder(closest.sensor.lat, closest.sensor.lon));
        conv.add('No Purple Air sensors around you found. The closest sensor is in {CITY NAME}. The AQI at that location is ' + closest.value);
    } else {
        const bucket = buckets.get_bucket(value);
        conv.add(prefix(value) + bucket.voice);
    }
    const s = prefs.smoke_correction ? 'off' : 'on';
    conv.add('You can ask me to update location or turn ' + s + ' smoke correction.');
    // if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
    //     return await conv.add(new df.HtmlResponse({
    //         url: 'https://' + conv.headers.host + '/google-assistant/index.html',
    //         data: {
    //             screen: 'stats',
    //             value: value,
    //             level: bucket.level,
    //             background_index: bucket.background_index,
    //             title: bucket.title,
    //             backgrounds: prefs.backgrounds,
    //             chips
    //         }
    //     }));
    // } else
    if (conv.screen) {
        // if (USE_CARDS) {
        //     const card = new df.BasicCard({
        //         title: value,
        //         subtitle: bucket.title,
        //         text: prefix(value) + bucket.voice
        //     });
        //     if (bucket.background_path) {
        //         const image = new df.Image({
        //             url: 'https://' + conv.headers.host + '/google-assistant/images/' + bucket.background_path,
        //             alt: bucket.title
        //         });
        //         card.image = image;
        //     }
        //     conv.ask(card);
        // }
        if (chips.length) {
            conv.ask(new df.Suggestions(suggestions.standard(chips)));
        }
    }
}