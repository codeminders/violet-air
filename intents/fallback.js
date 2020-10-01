const df = require('actions-on-google');

const dialogflow = require('../dialogflow');
const suggestions = require('../suggestion-chips');

module.exports = async() => {
    dialogflow.intent('Default Fallback Intent', async(conv) => {
        conv.add(suggestions.phrase(conv));
        const chips = suggestions.chips(conv);
        if (!conv.screen) {
            return;
        }
        conv.add(new df.Suggestions(suggestions.standard(chips)));
    });
}