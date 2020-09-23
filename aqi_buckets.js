const path = require('path');
const fs = require('fs');

const buckets = [{
        min: 0,
        max: 50,
        level: 'clean',
        title: 'Perfect',
        voice: 'The air is clean. Go outside and play!'
    },
    {
        min: 51,
        max: 100,
        level: 'acceptable',
        title: 'Alright',
        voice: 'The air is fine. Breathe freely!'
    },
    {
        min: 101,
        max: 150,
        level: 'not-perfect',
        title: 'Not Perfect',
        voice: 'The air quality could be better. But you can go outside if you want.'
    },
    {
        min: 151,
        max: 200,
        level: 'not-good',
        title: 'Not Good',
        voice: 'The air quality is not good. But you can go outside if you really have to.'
    },
    {
        min: 201,
        max: 300,
        level: 'pretty-bad',
        title: 'Pretty Bad',
        voice: 'The air quality is just bad. I would not go outside if I were you.'
    },
    {
        min: 301,
        max: 400,
        level: 'terrible',
        title: 'Terrible',
        voice: 'The air quality is atrocious. Do not go outside!'
    },
    {
        min: 401,
        max: 1000,
        level: 'extremely-bad',
        title: 'Get Out!',
        voice: 'Are you on Mars? You really should not be here.'
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