const fetch = require('node-fetch');

const MAX = 5000; // metres

let cache = [];

const load = async() => {
    try {
        const response = await fetch('https://www.purpleair.com/data.json');
        const json = await response.json();
        cache = json.data.map(row => {
            return {
                id: row[0],
                label: row[24],
                lat: row[25],
                lon: row[26]
            };
        });
    } catch (error) {
        console.error(error);
    }
};

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

const closests = async(lat, lon) => {
    if (!cache.length) {
        await load();
    }
    return cache.map(v => {
        return {...v, distance: haversine(v.lat, v.lon, lat, lon) }
    }).filter(v => {
        return v.distance <= MAX;
    }).sort((a, b) => {
        return a.distance - b.distance;
    }).slice(0, 5);
}

// LRAPA correction https://www.lrapa.org/DocumentCenter/View/4147/PurpleAir-Correction-Summary
const LRAPA = (x) => 0.5 * x - 0.66;

// Calculate AQI for PM2.5.
// https://www3.epa.gov/airnow/aqi-technical-assistance-document-sept2018.pdf

const breakpoints = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500]
];

const AQI = (pm25) => {
    const Cp = Math.round(pm25 * 10) / 10;
    for (const breakpoint of breakpoints) {
        const [Blo, Bhi, Ilo, Ihi] = breakpoint;
        console.log('?', Blo, Bhi, Ilo, Ihi, Cp);
        if (Cp >= Blo && Cp <= Bhi) {
            return ((Ihi - Ilo) / ((Bhi - Blo) * 1.0)) * (Cp - Blo) + Ilo;
        }
    }
    return 501; //  "Beyond the AQI"
}

module.exports.value = async(lat, lon) => {
    let t = 0;
    let n = 0;
    const sensors = await closests(lat, lon);
    console.log('using sensors', sensors);
    for (const sensor of sensors) {
        console.log('loading sensor data from', sensor);
        try {
            const response = await fetch('https://www.purpleair.com/json?show=' + sensor.id);
            const json = await response.json();
            console.log('got', json);
            const stats = json.results[0].Stats;
            console.log('got stats', stats);
            const raw = JSON.parse(stats).v1;
            console.log('got raw', raw);
            // sanity check, some sensors return 0.0 (instant)
            // this is hacky, need to do proper statistical
            // filtering of outliers based on distribution
            // TODO: use 'AGE' field to filter stale data
            if (raw > 5.0) {
                const v = LRAPA(raw);
                console.log('got LRAPA', v);
                t = t + v;
                n = n + 1;
            }
        } catch (e) {
            console.error('failed to load sensor data from', sensor, e);
        }

    }
    return Math.round(AQI(t / (Math.max(n, 1) * 1.0)));
}

(async() => {
    console.log(await module.exports.value(37.846336, -122.26603));
})();