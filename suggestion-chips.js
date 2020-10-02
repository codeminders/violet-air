const preferences = require('./preferences');

const SHOW_SUGGESTIONS_EVERY_N_TIMES = 5;

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
    let counter = conv.user.storage.q || 1;
    if (counter % SHOW_SUGGESTIONS_EVERY_N_TIMES == 0) {
        counter = 1;
    } else {
        counter++;
    }
    conv.user.storage.q = counter;

    if (counter != 2) {
        return null;
    }
    const s = preferences.get(conv).smoke_correction ? 'off' : 'on';
    return 'You can ask me to update location, remember location or turn ' + s + ' smoke correction.';
}