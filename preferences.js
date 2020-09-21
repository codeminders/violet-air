module.exports.get = (conv) => {
    const storage = conv.user.storage;
    return {
        backgrounds: !storage.hasOwnProperty('backgrounds') || storage.backgrounds,
    };
}

module.exports.set_backgrounds = (conv, value) => {
    conv.user.storage.backgrounds = value;
}