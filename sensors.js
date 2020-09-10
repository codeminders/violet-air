const fetch = require('node-fetch');

const MAX_DISTANCE = 5000; // max distance from the user's location (metres)
const NUM_SENSORS = 10; //  max number of sensors to consider
const LIST_REFRESH_RATE = 12*60*60*1000; // Reload list of sensors if it is older than this value (milliseconds) (12 hours)
const SENSOR_REFRESH_RATE = 5*60; //  Sensors fetch rate limit - do not request more than once in this timeframe (seconds)
const PM_25_HIGH_LIMIT = 500; // To filter out abnormal sensor reading (due to hardware fault or dirt in the sensor)

//TODO: individual sensor access rate limit

let cache = [];
let last_update_ts = 0;

const load = async() => {
    try {
        const response = await fetch('https://www.purpleair.com/data.json');
        const json = await response.json();
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
    // TODO: refresh cache here
    if (cache.length == 0 || Date.now() - last_update_ts > LIST_REFRESH_RATE) {
        await load();
    }
    return cache.map(v => {
        return {...v, distance: haversine(v.lat, v.lon, lat, lon) }
    }).filter(v => {
        return v.distance <= MAX_DISTANCE;
    }).sort((a, b) => {
        return a.distance - b.distance;
    }).slice(0, NUM_SENSORS);
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
        // console.log('?', Blo, Bhi, Ilo, Ihi, Cp);
        if (Cp >= Blo && Cp <= Bhi) {
            return ((Ihi - Ilo) / ((Bhi - Blo) * 1.0)) * (Cp - Blo) + Ilo;
        }
    }
    return 501; //  "Beyond the AQI"
}

const channel_pm25 = (data) => {
    // sanity check, some sensors return 0.0 (instant)
    // this is hacky, need to do proper statistical
    // filtering of outliers based on distribution
    if(data.PM2_5Value > PM_25_HIGH_LIMIT || data.PM2_5Value < 5.0) {
        console.log('Skipping channel %s due to abnormal PM2.5 reading: %d', data.Label, data.PM2_5Value);
        return -1;
    }
    //TODO: we may also want to check if data.Stats.v or data.Stats.pm are different from data.PM2_5Value (it is not suppose to be)
    const stats = JSON.parse(data.Stats);
    console.log('Sensor stats: ', stats);

    return stats.v1; // getting 10 minutes averages
}

module.exports.value = async(lat, lon) => {
    let t = 0;
    let n = 0;
    let dt = 0;
    const sensors = await closests(lat, lon);
    console.log('Using sensors', sensors);
    for (const sensor of sensors) {
        console.log('Loading sensor data from', sensor);
        //TODO: individual sensor rate limit 
        //TODO: Should we introduce a global rate limit as well to avoid blacklisting
        try {
            const response = await fetch('https://www.purpleair.com/json?show=' + sensor.id);
            const json = await response.json();
            console.log('Sensor Data: ', json);

            let s = 0;
            let n_valid_channels = 0;
            for(const channel of json.results) {
                const pm25 = channel_pm25(channel);
                if(pm25 >= 0) {
                    s += pm25;
                    n_valid_channels += 1;
                }
            }
            if(n_valid_channels == 0) {
                console.log('No valid channels. skipping sensor "%s" ', sensor.label);
                continue;
            }

            const sensor_raw_pm25 = s / n_valid_channels; // average pm25 between valid channels 
            console.log('Raw PM25 ', sensor_raw_pm25);
            console.log('Raw AQI ', AQI(sensor_raw_pm25));
            // TODO: use 'AGE' field to filter stale data
            if (sensor_raw_pm25 > 0) {
                const v = LRAPA(sensor_raw_pm25);
                console.log('PM2.5 after LRAPA correction ', v);
                const d = MAX_DISTANCE - sensor.distance;
                dt += d;
                t = t + v*d;
                n = n + 1;
            }
        } catch (e) {
            console.error('failed to load sensor data from', sensor, e);
        }

    }
    console.log('# sensors %d sum %d avg %d', n, t, t / (Math.max(n, 1) * 1.0));
    // return Math.round(AQI(t / (Math.max(n, 1) * 1.0)));
    return Math.round(AQI(t / (Math.max(dt, 1) * 1.0)));
}

(async() => {
    console.log(await module.exports.value(37.846336, -122.26603));
})();