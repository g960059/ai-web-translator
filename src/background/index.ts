import { translateText } from '../lib/openrouter';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate_api') {
        console.log("Background: Received translate_api request", request.requestId);
        const { apiKey, text, model, context, requestId } = request;

        // Immediate acknowledgement to apply "Fire and Forget" pattern for the channel
        sendResponse({ status: 'accepted' });

        if (sender.tab && sender.tab.id) {
            translateText(text, apiKey, model, context)
                .then(result => {
                    console.log("Background: Translation success", requestId);
                    chrome.tabs.sendMessage(sender.tab!.id!, {
                        action: 'translate_api_result',
                        requestId,
                        success: result.success,
                        data: result.data,
                        error: result.error
                    });
                })
                .catch(error => {
                    console.error("Background: Translation error", requestId, error);
                    chrome.tabs.sendMessage(sender.tab!.id!, {
                        action: 'translate_api_result',
                        requestId,
                        success: false,
                        error: error.message
                    });
                });
        }
    }
});
