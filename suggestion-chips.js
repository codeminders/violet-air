const preferences = require('./preferences');

module.exports = (conv) => {
    const prefs = preferences.get(conv);
    const ret = [];
    if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
        if (prefs.backgrounds) {
            ret.push('Images off');
        } else {
            ret.push('Images on');
        }
    }
    ret.push('Update location');
    return ret;
}