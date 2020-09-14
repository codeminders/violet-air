const dialogflow = require('../dialogflow');
const request_location = require('../request-location');

module.exports = async() => {
    dialogflow.intent('Update Location', async(conv, params) => {
        if (conv.user.verification !== 'VERIFIED') {
            return await conv.close('Sorry, we can\'t obtain current location from guest users');
        }
        return await request_location(conv);
    });
}