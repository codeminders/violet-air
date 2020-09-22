const preferences = require('./preferences');

module.exports.chips = (conv) => {
    const prefs = preferences.get(conv);
    const ret = [];
    ret.push({ classname: 'location', text: 'Update location' });
    if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
        if (prefs.backgrounds) {
            ret.push('Images Off');
        } else {
            ret.push('Images On');
        }
    }
    return ret;
}

module.exports.standard = (items) => {
    return items.map(v => {
        if (typeof v === 'string') {
            return v;
        }
        return v.text;
    });
}