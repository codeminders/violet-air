module.exports.get = async(conv) => {
    const coordinates = conv.device.location.coordinates;
    conv.close(coordinates.latitude + ', ' + coordinates.longitude);
}