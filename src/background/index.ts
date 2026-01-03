import { translateText } from '../lib/openrouter';

// State tracking
const tabStates = new Map<number, boolean>(); // tabId -> isTranslated

function updateContextMenu(isTranslated: boolean) {
    chrome.contextMenus.removeAll(() => {
        if (!isTranslated) {
            // State 1: Not Translated - Top Level Toggle
            chrome.contextMenus.create({
                id: "toggle-translation",
                title: "Toggle Page Translation",
                contexts: ["all"]
            });
        } else {
            // State 2: Translated - Nested Menu
            chrome.contextMenus.create({
                id: "root-menu",
                title: "AI Web Translator",
                contexts: ["all"]
            });

            chrome.contextMenus.create({
                id: "toggle-translation",
                parentId: "root-menu",
                title: "Toggle Page Translation", // Or "Stop / Restore"
                contexts: ["all"]
            });

            chrome.contextMenus.create({
                id: "retranslate-selection",
                parentId: "root-menu",
                title: "Re-translate Selection",
                contexts: ["selection"]
            });

            chrome.contextMenus.create({
                id: "toggle-selection",
                parentId: "root-menu",
                title: "Toggle Selection (Original/Translated)",
                contexts: ["selection"]
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    updateContextMenu(false);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    const isTranslated = tabStates.get(activeInfo.tabId) || false;
    updateContextMenu(isTranslated);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        tabStates.set(tabId, false); // Reset on reload
        // Only update menu if this is the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id === tabId) {
                updateContextMenu(false);
            }
        });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab?.id) {
        if (info.menuItemId === "retranslate-selection") {
            chrome.tabs.sendMessage(tab.id, {
                action: "retranslate_selection",
                selectionText: info.selectionText
            });
        } else if (info.menuItemId === "toggle-selection") {
            chrome.tabs.sendMessage(tab.id, {
                action: "toggle_selection",
                selectionText: info.selectionText
            });
        } else if (info.menuItemId === "toggle-translation") {
            // We optimize this: If not translated, this triggers start.
            // If translated, this toggles off.
            // Content script handles "translate" action as a toggle if already running, 
            // OR we can be explicit here. 
            // For now, "translate" action with scope 'page' acts as toggle in content script logic.
            chrome.tabs.sendMessage(tab.id, {
                action: "translate",
                translationScope: 'page'
            });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'state_update') {
        if (sender.tab && sender.tab.id) {
            tabStates.set(sender.tab.id, request.isTranslated);
            // Update menu immediately if this is the active tab
            if (sender.tab.active) {
                updateContextMenu(request.isTranslated);
            }
        }
    } else if (request.action === 'translate_api') {
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
