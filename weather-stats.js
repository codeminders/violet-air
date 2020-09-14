const df = require('actions-on-google');

const sensors = require('./sensors');

module.exports.get = async(conv) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude);
    if (value == -1) {
        // TODO we got no data
        conv.close('Sorry');
    } else if (value == -2) {
        // TODO we got no sensor nearby
        conv.close('Sorry, no sensors detected in your area');
    } else {
        // TODO we got the data
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    value
                }
            }));
        }
        conv.close('AIR quality per the latest coordinates is ' + value +
            '.If you want to refresh your location, say: Update location');
    }
}