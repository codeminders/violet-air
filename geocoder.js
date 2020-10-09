const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

module.exports = async(lat, lng) => {
    console.log('Performing reverse geocoding for', { lat, lng });

    try {
        const result = await client.reverseGeocode({
            params: {
                latlng: { lat, lng },
                result_type: 'locality|country',
                key: process.env.google_maps_api_key
            }
        });
        if (!result || !result.data || !result.data.results || !result.data.results.length) {
            console.log('Reverse geocoding returned no results for', { lat, lng });
            return null;
        }
        const data = result.data.results[0];
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