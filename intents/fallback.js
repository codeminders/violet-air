const df = require('actions-on-google');

const dialogflow = require('../dialogflow');
const suggestions = require('../suggestion-chips');
const preferences = require('../preferences');

module.exports = async() => {
    dialogflow.intent('Default Fallback Intent', async(conv) => {
        const prefs = preferences.get(conv);
        const s = prefs.smoke_correction ? 'off' : 'on';
        conv.add('Sorry, I did not get that. You can ask me to update location, remember location, or turn ' + s + ' smoke correction.');
        const chips = suggestions.chips(conv);
        if (!conv.screen) {
            return;
        }
        // if (conv.surface.capabilities.has('actions.capability.INTERACTIVE_CANVAS')) {
        //     return await conv.add(new df.HtmlResponse({
        //         url: 'https://' + conv.headers.host + '/google-assistant/index.html',
        //         data: {
        //             screen: 'fallback',
        //             chips
        //         }
        //     }));
        // }
        conv.add(new df.Suggestions(suggestions.standard(chips)));
    });
}