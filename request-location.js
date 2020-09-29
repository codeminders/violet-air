const df = require('actions-on-google');

module.exports = async(conv) => {
    let context = '';
    if (conv.user.storage.hasOwnProperty('returned_user')) 
        context = 'To find out where you are';
    else
        context = 'Welcome to Purple Turtle. I can provide Real-time Air Quality Information for your location if you are not too far from PurpleAir sensors.';

    const options = {
        context: context,
        permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    conv.user.storage.returned_user = true;
    return await conv.ask(new df.Permission(options));
}