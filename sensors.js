var fs = require('fs');

const fetch = require('node-fetch');
const outliers = require('./outliers');

const MAX_DISTANCE = 5000; // max distance from the user's location (metres)
const NUM_SENSORS = 10; //  max number of sensors to consider
const LIST_REFRESH_RATE = 12 * 60 * 60 * 1000; // Reload list of sensors if it is older than this value (milliseconds) (12 hours)
const PM_25_HIGH_LIMIT = 500; // To filter out abnormal sensor reading (due to hardware fault or dirt in the sensor)
const MAX_AGE = 10; // filer out sensors not reporting data for X minutes

//TODO: handle "Rate limit exceeded" error
//TODO:  { code: 429, message: 'Rate limit exceeded. Try again in 43 milli seconds.' }

//TODO: error while loading the sensor list:
//TODO:   message:
//   'invalid json response body at https://www.purpleair.com/data.json reason: Unexpected token [ in JSON at position 287',

let cache = [];
let last_update_ts = 0;

const DEBUG_MODE = true;

const load = async() => {
    console.log('refreshing list of sensors');
    try {
        let response = null;
        let body = '';
        if (DEBUG_MODE) {
            body = fs.readFileSync('./data.json', 'utf8');
        } else {
            response = await fetch('https://www.purpleair.com/data.json');
            body = await response.text();
        }

        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            console.error('Failed to parse JSON response from purpleair',
                (response != null ? response.status : ''), body.slice(0, 1000));
            console.error('Parsing error', e)
            return -1;
        }

        if (json.data === undefined) {
            console.error('Unexpected JSON from server.', body.slice(0, 200));
            return -1;
        }

        cache = json.data.
        filter(row => row[23] == 0). //only outdoor sensors
        map(row => {
            return {
                id: row[0],
                label: row[24],
                lat: row[25],
                lon: row[26]
            };
        });
        last_update_ts = Date.now();
    } catch (error) {
        console.error('Failed to parse response from purpleair', error);
        return -1;
    }

    return 0;
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

module.exports.closests = async(lat, lon, use_max_distance = true) => {
    // TODO: refresh cache here
    if (cache.length == 0 || Date.now() - last_update_ts > LIST_REFRESH_RATE) {
        const status = await load();
        if (status < 0)
            return null;
    }
    return cache.map(v => {
        return {...v, distance: haversine(v.lat, v.lon, lat, lon) }
    }).filter(v => {
        return !use_max_distance || v.distance <= MAX_DISTANCE;
    }).sort((a, b) => {
        return a.distance - b.distance;
    }).slice(0, NUM_SENSORS);
}

const Correction = {
    NONE: "NONE",
    LRAPA: "LRAPA",
    EPA: "EPA",
    AQandU: "AQandU"
}

// LRAPA correction https://www.lrapa.org/DocumentCenter/View/4147/PurpleAir-Correction-Summary
const LRAPA = (x) => Math.max(0.5 * x - 0.66, 0);

// EPA correction https://cfpub.epa.gov/si/si_public_file_download.cfm?p_download_id=540979&Lab=CEMM
// PM2.5 corrected= 0.52*[PA_cf1(avgAB)] - 0.085*RH +5.71
// x - raw PM2.5 value
// h - humidity
// only apply for PM2.5 > 65
const EPA = (x, h) => x < 65 ? x : Math.max(0.52 * x - 0.085 * h + 5.71, 0);

//AQandU correction https://www.aqandu.org/airu_sensor#calibrationSection
// PM2.5 (µg/m³) = 0.778 x PA + 2.65
const AQandU = (x) => 0.778 * x + 2.65;

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
        // console.log('?', Blo, Bhi, Ilo, Ihi, Cp);
        if (Cp >= Blo && Cp <= Bhi) {
            return Math.max(((Ihi - Ilo) / ((Bhi - Blo) * 1.0)) * (Cp - Blo) + Ilo, 0);
        }
    }
    return 501; //  "Beyond the AQI"
}

const get_pm25_10m = (data) => {
    return JSON.parse(data.Stats).v1;
}

const sensor_pm25 = (data) => {
    if (data.AGE > MAX_AGE) {
        console.log('Skipping channel "%s" for not reporting data for %d minutes', data.Label, data.AGE);
        return -1;
    }
    // sanity check, some sensors return 0.0 (instant)
    // this is hacky, need to do proper statistical
    // filtering of outliers based on distribution
    if (data.PM2_5Value > PM_25_HIGH_LIMIT || data.PM2_5Value < 0.1) {
        console.log('Skipping channel "%s" due to abnormal PM2.5 reading: %d', data.Label, data.PM2_5Value);
        return -1;
    }

    //TODO: we may also want to check if data.Stats.v or data.Stats.pm are different from data.PM2_5Value (it is not suppose to be)

    return get_pm25_10m(data); // getting 10 minutes averages
}

module.exports.value = async(lat, lon, correction = Correction.NONE) => {
    let t = 0;
    let n = 0;
    let dt = 0;
    const sensors = await module.exports.closests(lat, lon);
    if (sensors == null) {
        return -1;
    }
    if (!sensors.length) {
        console.log('No close sensors found for', lat, lon);
        return -2;
    }
    console.log('Closest sensors', lat, lon, sensors);

    const dict = sensors.reduce((result, s) => {
        result[s.id] = s;
        return result;
    }, {});

    const query = sensors.map(v => v.id).join('|');

    try {
        let json;
        const url = 'https://www.purpleair.com/json?show=' + query;
        try {
            const response = await fetch(url);
            const body = await response.text();
            try {
                json = JSON.parse(body);
                console.log('JSON data', json);
            } catch (e) {
                console.error('Failed to obtain JSON response from purpleair', url, response.status, body);
                return -1;
            }
        } catch (e) {
            console.error('Failed to obtain response from purple air', url, e);
            return -1;
        }

        const sensors_list = outliers.filter_outliers(json.results, (i) => get_pm25_10m(i));

        // console.log("Before: " + sensors.length*2);
        // console.log("without outliers: " + sensors_list.length);

        let n = 0;
        let humidity = 0; // this is an ugly hack. we reuse the last known humidity because it is only repoted on A channel, but not on B channel
        for (const sensor_json of sensors_list) {
            const raw_pm25 = sensor_pm25(sensor_json);
            if (raw_pm25 >= 0) {
                // Look up original sensor from the sensor list
                const sensor = (sensor_json.ID in dict) ? dict[sensor_json.ID] : dict[sensor_json.ParentID];

                if (sensor_json.humidity !== undefined)
                    humidity = sensor_json.humidity;

                let v = 0;
                switch (correction) {
                    case Correction.NONE:
                        v = raw_pm25;
                        break;
                    case Correction.LRAPA:
                        v = LRAPA(raw_pm25);
                        break;
                    case Correction.EPA:
                        v = EPA(raw_pm25, humidity);
                        break;
                    case Correction.AQandU:
                        v = AQandU(raw_pm25);
                        break;
                }

                console.log('"%s" PA (PM2.5: %d AQI: %d) %s (PM2.5: %d AQI: %d)',
                    sensor_json.Label, raw_pm25, AQI(raw_pm25), correction, v, AQI(v));

                const d = MAX_DISTANCE - sensor.distance;

                dt += d;
                t += v * d;
                n += 1;
            }
        }

        return Math.round(AQI(t / (Math.max(dt, 1) * 1.0)));

    } catch (e) {
        console.error('Failed to load PurpleAir data', e);
        return -1;
    }
}

// (async() => {
//     //
//     // console.log(await module.exports.value(37.846336, -122.26603, Correction.NONE));
//     console.log(await module.exports.value(37.416682, -122.103521, Correction.EPA));
// })();