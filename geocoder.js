const client = require('@google/maps').createClient({
    key: process.env.google_geocode_api_key,
    Promise: Promise
});

module.exports = async(lat, lng) => {
    console.log('Performing reverse geocoding', { lat, lng });
    try {
        const result = await client.reverseGeocode({
            latlng: { lat, lng },
            result_type: 'locality'
        }).asPromise();
        if (!result || !result.json || !result.json.results || !result.json.results.length) {
            console.log('Geocoding returned no results');
            return null;
        }
        const data = result.json.results[0];
        console.log(data);
        for (const address_component of data.address_components) {
            for (const t of address_component.types) {
                if (t == 'locality') {
                    return address_component.short_name;
                }
            }
        }
    } catch (e) {
        logger.info('Failed geolocation', components, e);
    }
    return null;
};