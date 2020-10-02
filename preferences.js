module.exports.get = (conv) => {
    const storage = conv.user.storage;
    return {
        backgrounds: !storage.hasOwnProperty('backgrounds') || storage.backgrounds,
        smoke_correction: !storage.hasOwnProperty('smoke_correction') || storage.smoke_correction,
        brief: storage.brief
    };
}

module.exports.set_backgrounds = (conv, value) => {
    conv.user.storage.backgrounds = value;
}

module.exports.set_smoke_correction = (conv, value) => {
    conv.user.storage.smoke_correction = value;
}

module.exports.set_brief_mode = (conv, value) => {
    conv.user.storage.brief = value;
}