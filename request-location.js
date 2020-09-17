const df = require('actions-on-google');

module.exports = async(conv) => {
    const options = {
        context: 'To find out where you are',
        permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    return await conv.ask(new df.Permission(options));
}