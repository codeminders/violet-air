const path = require('path');
const fs = require('fs');

const buckets = [{
        min: 0,
        max: 50,
        level: 'clean',
        color_code: 'Green', 
        title: 'Good',
        voice: 'The air is clean. Go outside and play!'
    },
    {
        min: 51,
        max: 100,
        level: 'acceptable',
        color_code: 'Yellow', 
        title: 'Moderate',
        voice: 'The air is OK.'
    },
    {
        min: 101,
        max: 150,
        level: 'not-perfect',
        color_code: 'Orange', 
        title: 'Unhealthy for Sensitive Groups',
        voice: 'This is not very good.'
    },
    {
        min: 151,
        max: 200,
        level: 'not-good',
        color_code: 'Red', 
        title: 'Unhealthy',
        voice: 'The air is unhealthy.'
    },
    {
        min: 201,
        max: 300,
        level: 'pretty-bad',
        color_code: 'Purple', 
        title: 'Pretty Bad',
        voice: 'The air is terrible. Do not go outside!'
    },
    {
        min: 301,
        max: 1000,
        level: 'hazardous',
        color_code: 'Maroon', 
        title: 'Hazardous',
        voice: 'It is atrocious. Get out of there now!'
    }
]

const random_background = (level) => {
    const folder = path.join(__dirname, 'ui', 'images', level);
    if (!fs.existsSync(folder)) {
        return {};
    }
    const items = fs.readdirSync(folder).filter(v => {
        return v.endsWith('.jpg');
    });
    if (!items.length) {
        return {};
    }
    const item = items[Math.floor(Math.random() * items.length)];
    return {
        background_index: item.substring(0, item.indexOf('.')),
        background_path: level + '/' + item
    };

}

module.exports.get_bucket = (value) => {
    const ret = Object.assign({}, buckets.find(b => value >= b.min && value <= b.max));
    return Object.assign(ret, random_background(ret.level));
}