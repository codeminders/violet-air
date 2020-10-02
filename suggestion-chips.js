const preferences = require('./preferences');

module.exports.chips = (conv) => {
    const prefs = preferences.get(conv);
    const ret = [];
    ret.push('Smoke ' + (prefs.smoke_correction ? 'Off' : 'On'));
    if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS'))
        ret.push('Images ' + (prefs.backgrounds ? 'Off' : 'On'));
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

module.exports.phrase = (conv) => {
    const s = preferences.get(conv).smoke_correction ? 'off' : 'on';
    return 'You can ask me to update location, remember location or turn ' + s + ' smoke correction.';
}
