const df = require('actions-on-google');

const dialogflow = require('../dialogflow');
const suggestions = require('../suggestion-chips');

module.exports = async() => {
    dialogflow.intent('Default Fallback Intent', async(conv) => {
        conv.add('Sorry, I did not get that. You can ask me to update your location or change the pollution type settings.');
        const chips = suggestions.chips(conv);
        if (!conv.screen) {
            return;
        }
        if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
            return await conv.add(new df.HtmlResponse({
                url: 'https://' + conv.headers.host + '/google-assistant/index.html',
                data: {
                    screen: 'fallback',
                    chips
                }
            }));
        }
        conv.add(new df.Suggestions(suggestions.standard(chips)));
    });
}