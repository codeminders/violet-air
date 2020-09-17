const df = require('actions-on-google');

const sensors = require('./sensors');

//TODO: error utterance 
//TODO: use utterance for smart speakers (no canvas, no surface)

const prefix = (v) => 'The AQI is ' + v + '. '

const AQI_buckets = [{
    min: 0,
    max: 50,
    color: 'green',
    description: 'Clean',
    utterance: 'The air is perfect. Go outside and play!' 
},
{
    min: 51,
    max: 100,
    color: 'yellow',
    description: 'Acceptable',
    utterance: 'The air is fine. Breathe freely!'    
},
{
    min: 101,
    max: 150,
    color: 'orange',
    description: 'Not perfect',
    utterance: 'The air quality is meh. You can go outside if you want.'    
},
{
    min: 151,
    max: 200,
    color: 'red',
    description: 'Not good',
    utterance: 'The air quality is just bad. But you can go outside if you really have to.'    
},
{
    min: 201,
    max: 300,
    color: 'purple',
    description: 'Pretty Bad',
    utterance: 'The air quality is just bad. I would not go outside if I were you.'    
},
{
    min: 301,
    max: 400,
    color: 'brown',
    description: 'Terrible',
    utterance: 'The air quality is atrocious. Do not go outside!'    
},
{
    min: 401,
    max: 1000,
    color: 'maroon',
    description: 'Extremely bad',
    utterance: 'Are you on Mars? You really should not be here.'    
}
]

const get_bucket = (value) => {
    const bucket = AQI_buckets.filter(b => value >= b.min && value <= b.max);

    if(bucket.length == 0)
        return null;
    
    return bucket[0];
}

module.exports.get = async(conv) => {
    const location = conv.device.location || conv.user.storage.coords;
    const coordinates = location.coordinates;
    // const value = 440;
    const value = await sensors.value(coordinates.latitude, coordinates.longitude);
    if (value == -1) {
        // TODO we got no data
        conv.close('Oops... Cannot get the air quality data from Purple Air');
    } else if (value == -2) {
        // TODO we got no sensor nearby
        conv.close('No sensors found around you. Maybe buy one on PurpleAir.com?');
    } else {
        // TODO we got the data
        const bucket = get_bucket(value);
        //TODO: handle error
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            await conv.add(prefix(value) + bucket.utterance);
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    value: value,
                    color: bucket.color,
                    label: bucket.description
                }
            }));
        }
        conv.close('AQI number for your location is ' + value +
            '. You can say "update location" if you moved');
    }
}