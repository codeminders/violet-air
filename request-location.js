const df = require('actions-on-google');

module.exports = async(conv) => {
    const options = {
        context: 'To protect the world from devastation! To unite all peoples within our nation!',
        permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    return await conv.ask(new df.Permission(options));
}