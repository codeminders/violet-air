const path = require('path');
const fs = require('fs');

const buckets = [{
        min: 0,
        max: 50,
        level: 'clean',
        color_code: 'Green', 
        title: 'Perfect',
        voice: 'The air is clean. Go outside and play!'
    },
    {
        min: 51,
        max: 100,
        level: 'acceptable',
        color_code: 'Yellow', 
        title: 'Alright',
        voice: 'The air quality is OK.'
    },
    {
        min: 101,
        max: 150,
        level: 'not-perfect',
        color_code: 'Orange', 
        title: 'Not Perfect',
        voice: 'The air quality could be better.'
    },
    {
        min: 151,
        max: 200,
        level: 'not-good',
        color_code: 'Red', 
        title: 'Not Good',
        voice: 'The air quality is not good.'
    },
    {
        min: 201,
        max: 300,
        level: 'pretty-bad',
        color_code: 'Purple', 
        title: 'Pretty Bad',
        voice: 'The air quality is very bad. Do not go outside!'
    },
    {
        min: 301,
        max: 1000,
        level: 'terrible',
        color_code: 'Maroon', 
        title: 'Terrible',
        voice: 'The air quality is atrocious. Get out of there!'
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