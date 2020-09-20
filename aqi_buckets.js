const buckets = [{
        min: 0,
        max: 50,
        level: 'clean',
        title: 'Clean',
        voice: 'The air is clean. Go outside and play!'
    },
    {
        min: 51,
        max: 100,
        level: 'acceptable',
        title: 'Acceptable',
        voice: 'The air is fine. Breathe freely!'
    },
    {
        min: 101,
        max: 150,
        level: 'not-perfect',
        title: 'Not perfect',
        voice: 'The air quality could be better. But you can go outside if you want.'
    },
    {
        min: 151,
        max: 200,
        level: 'not-good',
        title: 'Not good',
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
        title: 'Extremely bad',
        voice: 'Are you on Mars? You really should not be here.'
    }
]

module.exports.get_bucket = (value) => {
    return buckets.find(b => value >= b.min && value <= b.max);
}