const preferences = require('./preferences');

module.exports.chips = (conv) => {
    const prefs = preferences.get(conv);
    const ret = [];
    if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
        if (prefs.backgrounds) {
            ret.push('Images Off');
        } else {
            ret.push('Images On');
        }
    }
    if (prefs.smoke_correction) {
        ret.push('Smoke Off');
    } else {
        ret.push('Smoke On');
    }
    ret.push({ classname: 'location', text: 'Update location' });
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