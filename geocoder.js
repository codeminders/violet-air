const client = require('@google/maps').createClient({
    key: process.env.google_geocode_api_key,
    Promise: Promise
});

module.exports = async(lat, lng) => {
    console.log('Performing reverse geocoding for', { lat, lng });

    try {
        const result = await client.reverseGeocode({
            latlng: { lat, lng },
            result_type: 'locality|country'
        }).asPromise();
        if (!result || !result.json || !result.json.results || !result.json.results.length) {
            console.log('Reverse geocoding returned no results for', { lat, lng });
            return null;
        }
        const data = result.json.results[0];
        let locality = null;
        let country_short_name = null;
        let country_full_name = null;
        for (const address_component of data.address_components) {
            for (const t of address_component.types) {
                if (t == 'locality') {
                    locality = address_component.long_name;
                } else if (t == 'country') {
                    country_short_name = address_component.short_name;
                    country_full_name = address_component.long_name;
                }
            }
        }
        if (country_short_name) {
            return { locality: locality || country_full_name, country: country_short_name };
        }
    } catch (e) {
        console.log('Failed reverse geocoding for', lat, lng, e);
    }
    return null;
};