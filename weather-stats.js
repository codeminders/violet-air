const fs = require('fs');
const path = require('path');

const df = require('actions-on-google');

const sensors = require('./sensors');
const buckets = require('./aqi_buckets');
const suggestions = require('./suggestion-chips');
const preferences = require('./preferences');

const prefix = (v) => 'The Air Quality Index is ' + v + '. '

module.exports.get = async(conv) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const correction = conv.user.storage.smoke_correction ? "EPA" : "NONE";
    // const value = 70;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude, correction); 
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
        const prefs = preferences.get(conv);
        const chips = suggestions.chips(conv);
        conv.add(prefix(value) + bucket.voice);
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    screen: 'stats',
                    value: value,
                    level: bucket.level,
                    title: bucket.title,
                    backgrounds: prefs.backgrounds,
                    chips
                }
            }));
        } else
        if (conv.screen) {
            const card = new df.BasicCard({
                title: value,
                subtitle: bucket.title,
                text: prefix(value) + bucket.voice
            });
            if (fs.existsSync(path.join(__dirname, 'ui', 'images', bucket.level + '.jpg'))) {
                const image = new df.Image({
                    url: 'https://' + conv.headers.host + '/google-assistant/images/' + bucket.level + '.jpg',
                    alt: bucket.title
                });
                card.image = image;
            }
            conv.ask(card);
        } else {
            if (conv.screen && chips.length) {
                conv.ask(new df.Suggestions(suggestions.standard(chips)));
            }
        }
    }
}