const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');
const suggestions = require('./suggestion-chips');
const preferences = require('./preferences');
const geocoder = require('./geocoder');

//TODO: can we find out if user wants to use miles vs km?
const meters_to_miles = (m) => 1609.34 * m

module.exports.get = async(conv, options = {}) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const correction = preferences.get(conv).smoke_correction ? "EPA" : "NONE";

    // const value = 441;
    const res = await sensors.value(coordinates.latitude, coordinates.longitude, correction);

    if (res.value == -1) {
        return conv.close('Oops... Cannot get the air quality data from Purple Air');
    }

    if (!res.found) {
        let message = 'There are no Purple Air sensors close to your location.';
        const geo = await geocoder(res.closest.lat, res.closest.lon);
        if (geo) {

            message += ' The closest sensor we found is ';
            if (geo.country == 'US') {
                message += Math.round(meters_to_miles(res.closest.distance)) + ' miles';
            } else {
                message += (res.closest.distance / 1000.0).toFixed(1) + ' km';
            }
            message += ' from you in ' + geo.locality + '. ';
        } else {
            message += ' The closest sensor we found is ' + Math.round(meters_to_miles(res.closest.distance)) + ' miles from you. ';
        }
        message += 'Its Air Quality Index is ' + res.value;
        conv.add(message);

        if (conv.screen && conv.surface.capabilities.has('actions.capability.WEB_BROWSER')) {
            conv.ask(new df.LinkOutSuggestion({
                name: 'Learn more about PurpleAir',
                url: 'https://www.purpleair.com/',
            }));
        }
        return conv.close('Learn more about PurpleAir sensors at PurpleAir.com');
    }

    const bucket = buckets.get_bucket(res.value);
    if (options.feedback) {
        conv.add(options.feedback);
    }

    const hints = suggestions.phrase(conv);
    const fn = hints ? conv.add : conv.close;
    fn.call(conv,
        'The Air Quality level is "' +
        bucket.color_code +
        '" with an index of ' +
        res.value + '. ' +
        bucket.voice);
    if (hints) {
        conv.close(hints);
    }
}