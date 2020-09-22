const preferences = require('./preferences');

module.exports = (conv) => {
    const prefs = preferences.get(conv);
    const ret = [];
    ret.push('Refresh location');
    if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
        if (prefs.backgrounds) {
            ret.push('Images Off');
        } else {
            ret.push('Images On');
        }
    }
    return ret;
}