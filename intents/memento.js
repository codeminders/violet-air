const dialogflow = require('../dialogflow');

module.exports = async() => {
    dialogflow.intent('Memento', async(conv, params) => {
        conv.user.storage = {};
        conv.data = {};
        conv.close('I don\'t know who you are. I don\'t know what you want. I will not look for you, I will not pursue you');
    });
}