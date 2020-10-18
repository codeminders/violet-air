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

const closests = async(lat, lon) => {
    // TODO: refresh cache here
    if (cache.length == 0 || Date.now() - last_update_ts > LIST_REFRESH_RATE) {
        const status = await load();
        if (status < 0)
            return null;
    }

    const closeset_n = cache.map(v => {
        return {...v, distance: haversine(v.lat, v.lon, lat, lon) }
    }).sort((a, b) => {
        return a.distance - b.distance;
    }).slice(0, NUM_SENSORS);

    if (closeset_n.length == 0) {
        return null;
    }

    const within_radius = closeset_n.filter(v => {
        return v.distance <= MAX_DISTANCE;
    });

    if (within_radius.length) {
        return { found: true, sensors: within_radius };
    } else {
        return { found: false, sensors: closeset_n };
    }
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
const EPA = (x, h) => Math.max(0.534 * x - 0.0844 * h + 5.604, 0);

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
    try {
        return JSON.parse(data.Stats).v1;
    } catch(e) {
        console.error('Error parsing Stats JSON for ' + data.ID);
        console.error('JSON: ' + data.Stats);
        throw e;
    }
}

const get_pm25_cf1 = (data) => {
    return parseFloat(data.pm2_5_cf_1);
}

const get_pm25_fn = (correction) => {
    return correction == "EPA" ? get_pm25_cf1 : get_pm25_10m;
}

const is_pm25_valid = (data, correction) => {

    if (!('pm2_5_cf_1' in data)) {
        return false;
    }

    if (data.AGE > MAX_AGE) {
        console.log('Skipping channel "%s" for not reporting data for %d minutes', data.Label, data.AGE);
        return false;
    }
    // sanity check, some sensors return 0.0 (instant)
    // this is hacky, need to do proper statistical
    // filtering of outliers based on distribution
    if (data.PM2_5Value > PM_25_HIGH_LIMIT || data.PM2_5Value < 0.1) {
        console.log('Skipping channel "%s" due to abnormal PM2.5 reading: %d', data.Label, data.PM2_5Value);
        return false;
    }

    //TODO: we may also want to check if data.Stats.v or data.Stats.pm are different from data.PM2_5Value (it is not suppose to be)

    return true;
}

module.exports.value = async(lat, lon, correction = Correction.NONE) => {

    const ERROR = { value: -1, found: false };

    let t = 0;
    let n = 0;
    let dt = 0;

    const res = await closests(lat, lon);
    if (res == null) {
        return ERROR; // Catastrofic error. No data from PA
    }

    const sensors = res.sensors;

    if (res.found) {
        console.log('Closest sensors', lat, lon, sensors);
    } else {
        console.log('No sensors within ' + (MAX_DISTANCE / 1000) + ' km. Using the closeset one', lat, lon, sensors);
    }

    const dict = sensors.reduce((result, s) => {
        result[s.id] = s;
        return result;
    }, {});

    const query = sensors.map(v => v.id).join('|');
    console.log('Query: ' + query);

    try {
        let json;
        try {
            const response = await fetch('https://www.purpleair.com/json?show=' + query);
            const body = await response.text();
            try {
                json = JSON.parse(body);
                // console.log('JSON data', json);
            } catch (e) {
                console.error('Failed to obtain JSON response from purpleair', response.status, body);
                return ERROR;
            }
        } catch (e) {
            console.error('Failed to obtain response from purple air', e);
            return ERROR;
        }

        // filter out all sensors with invalid JSON first
        // then filter out all sensors with invalid reading
        let sensors_list = json.results;
        
        if (correction != "EPA") {
            sensors_list = sensors_list.filter((v => {
                return 'Stats' in v; // has 'Stats' field in its JSON 
            }));
        }

        sensors_list = sensors_list.filter((v => {
            return is_pm25_valid(v, correction);
        }));

        const fn = get_pm25_fn(correction);
        // only filer out outiers if we close sensors were found
        if (res.found) {
            sensors_list = outliers.filter_outliers(sensors_list, (i) => fn(i));
        } else {
            // if no close sensors, we need to leave JSON results from the closest sensor
            //TODO: either sort of just leave the closest one in sensors_list
            //TODO: !!!!
        }

        let n = 0;
        let humidity = 0; // this is an ugly hack. we reuse the last known humidity because it is only repoted on A channel, but not on B channel
        for (const sensor_json of sensors_list) {
            const raw_pm25 = fn(sensor_json);
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

            // if there are no sensors within MAX_DISTANCE we are using only the closest one with valid PM25 readings 
            if (!res.found) {
                return { value: Math.round(AQI(v)), found: false, closest: sensor };
            }
        }

        return { value: Math.round(AQI(t / (Math.max(dt, 1) * 1.0))), found: true };

    } catch (e) {
        console.error('Failed to load PurpleAir data', e);
        return ERROR;
    }
}

(async() => {
    //
    // console.log(await module.exports.value(37.846336, -122.26603, Correction.NONE));
})();