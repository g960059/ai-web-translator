import { getTranslatableBlocks, replaceBlockHTML, BlockNodeData, minifyHTML, restoreHTML } from '../lib/dom-utils';
import { getCachedTranslation, setCachedTranslation, removeCachedTranslation } from '../lib/cache';
import { overlay } from '../lib/overlay';

// Global state
let currentMode: 'quality' | 'efficiency' = 'quality'; // Default
let currentScope: 'page' | 'main' = 'page'; // Default
let originalBlocks: BlockNodeData[] = [];
let hasFullPageScan = false;
let isTranslated = false;
let shouldStop = false;

// Pending requests map for async messaging
const pendingRequests = new Map<string, { resolve: (val: any) => void, reject: (err: any) => void, timeoutId?: ReturnType<typeof setTimeout> }>();

// Helper to identify trivial content
const UI_TERMS = new Set(['read more', 'learn more', 'share', 'login', 'sign up', 'signup', 'menu', 'search', 'follow', 'subscribe', 'comment', 'reply', 'like', 'loading...', 'privacy policy', 'terms of use']);

// Inject Styles for Re-translation Feedback
const styleEl = document.createElement('style');
styleEl.textContent = `
    @keyframes tx-pulse {
        0% { background-color: rgba(255, 165, 0, 0.05); outline-color: rgba(255, 165, 0, 0.3); }
        50% { background-color: rgba(255, 165, 0, 0.15); outline-color: rgba(255, 165, 0, 0.8); }
        100% { background-color: rgba(255, 165, 0, 0.05); outline-color: rgba(255, 165, 0, 0.3); }
    }
    .tx-retranslating {
        outline: 2px solid #ffa500 !important;
        animation: tx-pulse 1.5s infinite;
        transition: all 0.3s;
    }
`;
document.head.appendChild(styleEl);

function containsJapanese(text: string): boolean {
    // Check for Hiragana (\u3040-\u309f) or Katakana (\u30a0-\u30ff)
    // Presence of these is a very strong signal of Japanese text.
    return /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
}

function isTrivialContent(html: string): boolean {
    // Strip tags to check text content
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length === 0) return true;

    // Skip if only digits, symbols, currency, common punctuation
    if (/^[\d\s\W]+$/.test(text)) return true;

    // Skip Common UI Terms (short text only)
    if (text.length < 50 && UI_TERMS.has(text.toLowerCase())) return true;

    // Skip if already contains Japanese
    if (containsJapanese(text)) return true;

    return false;
}

function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function sendTranslationRequest(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const requestId = generateId();
        const timeoutId = setTimeout(() => {
            if (pendingRequests.has(requestId)) {
                pendingRequests.delete(requestId);
                reject(new Error("Request timed out"));
            }
        }, 60000); // 60s timeout

        pendingRequests.set(requestId, { resolve, reject, timeoutId });
        chrome.runtime.sendMessage({ ...payload, requestId }).catch(err => {
            clearTimeout(timeoutId);
            pendingRequests.delete(requestId);
            reject(err);
        });
    });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'translate_api_result') {
        const { requestId, success, data, error } = request;
        if (pendingRequests.has(requestId)) {
            const { resolve, reject, timeoutId } = pendingRequests.get(requestId)!;
            clearTimeout(timeoutId);
            pendingRequests.delete(requestId);
            if (success) resolve({ success, data });
            else reject(new Error(error || 'Unknown error'));
        }
        return;
    }

    if (request.action === 'translate') {
        // Update settings from request if provided
        if (request.translationScope) currentScope = request.translationScope;

        if (isTranslated) {
            restoreOriginal();
            isTranslated = false;
            // overlay.showToggle(false); // Removed
            sendResponse({ status: 'original' });
        } else {
            shouldStop = false;
            // Check if we already have data for the current mode
            const hasData = (originalBlocks.length > 0 && originalBlocks.some(n => n.translatedHTML));

            if (hasData) {
                showTranslated();
                isTranslated = true;
                // overlay.showToggle(true); // Removed
                sendResponse({ status: 'translated' });
            } else {
                // FIRE AND FORGET - Do not await.
                // This prevents the channel from timing out if the popup closes.
                // We assume successful start. Logic handles state.
                performTranslation().then(() => {
                    if (!shouldStop) {
                        isTranslated = true;
                        // Notify background to update menu
                        chrome.runtime.sendMessage({ action: 'state_update', isTranslated: true }).catch(() => { });
                        // overlay.showToggle(true) // Removed
                    }
                }).catch(console.error);

                sendResponse({ status: 'started' });
            }
        }

    } else if (request.action === 'toggle_selection') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const targetBlocks: BlockNodeData[] = [];

        originalBlocks.forEach(block => {
            if (range.intersectsNode(block.element)) {
                targetBlocks.push(block);
            }
        });

        if (targetBlocks.length === 0) return;

        // Toggle Logic:
        // We check the first block to decide direction (Unified toggle).
        // If showing translated -> restore. If showing original -> translate (or re-apply if already has it).
        // Since we don't strictly track "isShowingTranslation" per block in a simple boolean property efficiently exposed here,
        // we check if the current innerHTML matches the cached translation.

        let needsTranslation = false;
        // Simple heuristic: If the block has translatedHTML and it is currently displayed, we act to RESTORE.
        // Otherwise, we translate.

        // Let's assume if 'isTranslated' globally is true, blocks usually show translation.
        // But individual blocks might be toggled.
        // Let's check the first block's state.
        const first = targetBlocks[0];
        const currentHTML = first.element.innerHTML;

        // If current matches original, we want to SHOW TRANSLATION.
        // If current matches translation, we want to SHOW ORIGINAL.
        // If neither (maybe modified?), default to SHOW TRANSLATION.

        // To be robust:
        const isShowingOriginal = (minifyHTML(currentHTML) === minifyHTML(first.originalHTML));

        if (isShowingOriginal) {
            // ACTION: Show Translation
            targetBlocks.forEach(block => {
                if (block.translatedHTML) {
                    replaceBlockHTML(block, block.translatedHTML);
                } else {
                    // Logic to request translation for just this block could go here, 
                    // but for now "Toggle Selection" implies switching existing states.
                    // If no translation exists, we might treat it as "Re-translate" or ignore.
                    // Let's fall back to "Re-translate" logic if missing? 
                    // For the user request "Show Original and Show Translation are merged", 
                    // it implies switching. If translation is missing, we can't switch to it easily without async api call.
                    // Let's do nothing if missing, OR better, trigger re-translation flow.
                    // For simplicity in this refactor step, we switch ONLY if data exists.
                }
            });
        } else {
            // ACTION: Show Original
            targetBlocks.forEach(block => {
                replaceBlockHTML(block, block.originalHTML);
            });
        }
    } else if (request.action === 'retranslate_selection') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const targetBlocks: BlockNodeData[] = [];

        originalBlocks.forEach(block => {
            if (range.intersectsNode(block.element)) {
                targetBlocks.push(block);
            }
        });

        if (targetBlocks.length > 0) {
            // Group blocks by content to deduplicate API calls
            const blocksByContent = new Map<string, BlockNodeData[]>();
            targetBlocks.forEach(block => {
                if (!blocksByContent.has(block.originalHTML)) {
                    blocksByContent.set(block.originalHTML, []);
                }
                blocksByContent.get(block.originalHTML)!.push(block);

                // Visual Feedback
                block.element.classList.add('tx-retranslating');
                // Clear Memory
                delete block.translatedHTML;
            });

            const uniqueContents = Array.from(blocksByContent.keys());

            // Clear Cache for these items
            for (const content of uniqueContents) {
                await removeCachedTranslation(content, "Japanese");
            }

            // Prepare Request
            // Use current global context
            const context = {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
            };
            const settings = await chrome.storage.local.get(['apiKey', 'model']);
            const apiKey = settings.apiKey;
            const model = settings.model || 'openai/gpt-3.5-turbo';

            if (!apiKey) {
                alert('Please set your OpenRouter API Key in the extension popup.');
                targetBlocks.forEach(b => b.element.classList.remove('tx-retranslating'));
                return;
            }

            // Batched Request
            try {
                const contentsToSend = uniqueContents.map(content => {
                    if (currentMode === 'efficiency') {
                        const { minified } = minifyHTML(content);
                        return minified;
                    }
                    return content;
                });

                const response = await sendTranslationRequest({
                    action: 'translate_api',
                    apiKey,
                    model,
                    text: contentsToSend,
                    context
                });

                if (response.success && Array.isArray(response.data)) {
                    const translations = response.data;

                    uniqueContents.forEach((originalContent, idx) => {
                        let translated = translations[idx];
                        if (translated) {
                            // Restore if needed
                            if (currentMode === 'efficiency') {
                                const { map } = minifyHTML(originalContent);
                                translated = restoreHTML(translated, map);
                            }

                            // Update Cache
                            setCachedTranslation(originalContent, "Japanese", translated);

                            // Update DOM
                            const blocks = blocksByContent.get(originalContent);
                            if (blocks) {
                                blocks.forEach(block => {
                                    block.element.classList.remove('tx-retranslating');
                                    replaceBlockHTML(block, translated);
                                    block.translatedHTML = translated;
                                });
                            }
                        }
                    });
                    overlay.showToast(`Re-translated ${targetBlocks.length} blocks`);
                } else {
                    console.error("Re-translation failed", response.error);
                    overlay.showToast("Re-translation failed");
                    targetBlocks.forEach(b => b.element.classList.remove('tx-retranslating'));
                }

            } catch (e) {
                console.error("Re-translation exception", e);
                overlay.showToast("Error during re-translation");
                targetBlocks.forEach(b => b.element.classList.remove('tx-retranslating'));
            }

        } else {
            overlay.showToast("No content found in selection");
        }
    } else if (request.action === 'restore_selection') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        let restoredCount = 0;

        originalBlocks.forEach(block => {
            if (range.intersectsNode(block.element)) {
                if (block.originalHTML) {
                    replaceBlockHTML(block, block.originalHTML);
                    restoredCount++;
                    // Optional: we don't clear memory cache here, so "toggle" can bring it back?
                    // But if user performs 'Show Original', they might expect it to stay that way until they toggle page?
                    // Current global state 'isTranslated' is true. If they toggle page off/on, it comes back.
                    // This is transient "peek".
                }
            }
        });

        if (restoredCount > 0) {
            overlay.showToast(`Restored ${restoredCount} blocks`);
        } else {
            overlay.showToast("No translated content found in selection");
        }

    } else if (request.action === 'retranslate_selection') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const forcedBlocks: BlockNodeData[] = [];

        // Find blocks intersecting selection
        originalBlocks.forEach(block => {
            // Simple intersection check: is block element contained or intersecting range?
            if (range.intersectsNode(block.element)) {
                forcedBlocks.push(block);
            }
        });

        if (forcedBlocks.length > 0) {
            overlay.showToast(`Re-translating ${forcedBlocks.length} blocks...`);

            // Allow processing even if "stopped" ideally, but let's reset stop
            shouldStop = false;

            for (const block of forcedBlocks) {
                // 1. Restore original visual
                replaceBlockHTML(block, block.originalHTML);
                // 2. Clear cached status in memory (so we don't just restore valid cache)
                // Actually, if we want to "Retry", we should probably invalidate the cache for this item?
                // The user usually wants to fix a bad translation.
                // So let's force a fresh request -> Meaning, remove from cache?

                // Remove from cache to force API call
                if (block.originalHTML) {
                    await removeCachedTranslation(block.originalHTML, "Japanese"); // Assume default target lang?
                }
                delete block.translatedHTML;

                // 3. Reset state logic
                const content = block.originalHTML;
                // Find state
                // We need access to 'contentStates' map which is currently local to 'performTranslation'.
                // Refactor: We need 'performTranslation' to be more flexible or expose a "translateItems" method.
                // Or we can just modify 'performTranslation' to handle a "forcedList"?
                // BUT 'performTranslation' is a big function with local state maps.

                // For now, simpler approach:
                // Just trigger a new partial translation flow?
                // The current 'performTranslation' is designed to scan everything.
                // If we reset 'isTranslated', it scans everything.

                // To support "Selection", we need to inject these items back into the queue of the *running* (or new) translation process.
                // Problem: 'performTranslation' might not be running.
                // If we call 'performTranslation' again, it re-scans.
                // If we reset the block.translatedHTML and call 'performTranslation', it should pick them up as "fresh".
            }

            // Trigger translation flow
            if (!isTranslated) {
                // If globally not translated, we just start normal translation?
                // But maybe we only want to translate selection?
                // Global "isTranslated" flag implies "Mode is Active".
                // If user selects text on original page and says "Re-translate", they effectively want "Translate".
                isTranslated = true;
                // overlay.showToggle(true); // Removed
            }

            // Re-run main loop
            performTranslation().catch(console.error);
        } else {
            overlay.showToast("No translatable content found in selection");
        }
    } else if (request.action === 'translate_api_result') {
        const resolver = pendingRequests.get(request.requestId);
        if (resolver) {
            pendingRequests.delete(request.requestId);
            if (request.success) resolver.resolve(request);
            else resolver.reject(new Error(request.error || 'Unknown error'));
        }
    } else if (request.action === 'get_stats') {
        // If we don't have blocks, scan body (Safe default for "Page Cost")
        let statsBlocks = originalBlocks;
        if (statsBlocks.length === 0) {
            statsBlocks = getTranslatableBlocks(document.body);
        }

        let qualityCharCount = 0;
        let efficiencyCharCount = 0;

        for (const block of statsBlocks) {
            const html = block.originalHTML;

            // Skip trivial in stats too, to be accurate
            if (isTrivialContent(html)) continue;

            if (html.trim().length > 0) {
                qualityCharCount += html.length;

                // Calculate minified length
                const { minified } = minifyHTML(html);
                efficiencyCharCount += minified.length;
            }
        }

        sendResponse({
            nodeCount: statsBlocks.length,
            quality: { charCount: qualityCharCount },
            efficiency: { charCount: efficiencyCharCount }
        });
    } else if (request.action === 'translate_selection') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        // We ideally want to find all "translatable blocks" that are fully or partially within this range.
        // We can use the common ancestor and then scan?
        const commonAncestor = range.commonAncestorContainer;
        let rootElement = (commonAncestor.nodeType === Node.ELEMENT_NODE)
            ? commonAncestor as HTMLElement
            : commonAncestor.parentElement;

        if (!rootElement) rootElement = document.body;

        // 1. Get potential blocks in this area
        // We pass the rootElement to minimize scanning
        const potentialBlocks = getTranslatableBlocks(rootElement);

        const targetBlocks: BlockNodeData[] = [];

        // 2. Filter by intersection with Range
        potentialBlocks.forEach(block => {
            if (range.intersectsNode(block.element)) {
                // Check if we already have this block in originalBlocks to avoid duplicates/state mismatch
                const existing = originalBlocks.find(b => b.element === block.element);
                if (existing) {
                    targetBlocks.push(existing);
                } else {
                    originalBlocks.push(block);
                    targetBlocks.push(block);
                }
            }
        });

        if (targetBlocks.length > 0) {
            // overlay.showToast(`Translating ${targetBlocks.length} selected blocks...`);

            // 3. Trigger Translation for these specific blocks
            // We can reuse the "queue" logic but we need to ensure they get pushed to API.
            // Just push them to queue via checkCacheAndQueue or similar.

            // Ensure settings are loaded or use defaults?
            // performTranslation usually initializes everything. 
            // If we are NOT in active translation mode, 'performTranslation' might not have run or variables like 'apiKey' are unset.
            // We should initiate a "Targeted Translation" flow.

            const settings = await chrome.storage.local.get(['apiKey', 'model', 'translationMode', 'translationScope']);
            const apiKey = settings.apiKey;
            if (!apiKey) {
                alert('Please set your OpenRouter API Key in the extension popup.');
                return;
            }
            const model = settings.model || 'openai/gpt-3.5-turbo';
            // We use global vars? They might be stale if performTranslation wasn't called.
            // Let's set them.
            currentMode = (settings.translationMode as 'quality' | 'efficiency') || 'quality';

            // We need to re-initialize 'contentStates' locally if not active? 
            // OR just use a transient map for this operation.
            // BUT we want to update the cache and global state.

            // Let's manually process this batch to ensure immediate execution
            const contentStates = new Map<string, ContentState>();
            const blocksByContent = new Map<string, BlockNodeData[]>();

            for (const block of targetBlocks) {
                const content = block.originalHTML;
                if (!blocksByContent.has(content)) {
                    blocksByContent.set(content, []);
                    contentStates.set(content, {
                        status: 'queued',
                        key: content,
                        originalContent: content,
                        rawLength: content.length,
                        retryCount: 0
                    });
                }
                blocksByContent.get(content)!.push(block);
            }

            const queue = Array.from(contentStates.values());

            // "Manual" processBatch function logic...
            // Or reuse processBatch but we need to hoist it or pass context.
            // Since 'processBatch' is inside 'performTranslation', we can't easily call it.
            // Let's duplicate the relevant "send batch" logic for this dedicated selection action 
            // to avoid complex refactoring of the main loop right now.

            try {
                const contentsToSend = queue.map(item => {
                    if (currentMode === 'efficiency') {
                        const { minified, map } = minifyHTML(item.originalContent);
                        item.minifiedContent = minified;
                        item.minificationMap = map;
                        return minified;
                    }
                    return item.originalContent;
                });

                const context = {
                    title: document.title,
                    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
                };

                const response = await sendTranslationRequest({
                    action: 'translate_api',
                    apiKey,
                    model,
                    text: contentsToSend,
                    context
                });

                if (response.success && Array.isArray(response.data)) {
                    const translations = response.data;
                    queue.forEach((item, idx) => {
                        let translated = translations[idx];
                        if (translated) {
                            if (item.minificationMap) {
                                translated = restoreHTML(translated, item.minificationMap);
                            }
                            // Store in cache
                            setCachedTranslation(item.originalContent, "Japanese", translated);

                            // Apply to DOM
                            const blocks = blocksByContent.get(item.originalContent);
                            if (blocks) {
                                blocks.forEach(block => {
                                    replaceBlockHTML(block, translated);
                                    block.translatedHTML = translated;
                                });
                            }
                        }
                    });
                    // overlay.showToast("Selection translated");

                    // IMPORTANT: If we are not in "IsTranslated" mode, do we switch?
                    // User might just want partial translation.
                    // If we switch `isTranslated = true`, the toggle button appears and "Show Original" works for page.
                    // This seems appropriate if we want to allow toggling it back.
                    // We DO NOT trigger global isTranslated state switch here,
                    // To keep progress bar hidden.
                    // But we DO want "Toggle Selection" context menu to work.
                    // The context menu state is updated by background script independently?
                    // Background script listens to 'state_update'. We didn't send it. 
                    // So background thinks page is NOT translated.
                    // But we modified `updateContextMenu` in background to ALWAYS show Toggle Selection on selection context.
                    // So that's covered.
                    if (!isTranslated) {
                        isTranslated = true;
                    }

                } else {
                    console.error("Selection translation failed", response.error);
                    // overlay.showToast("Translation failed");
                }
            } catch (e) {
                console.error("Selection translation error", e);
                // overlay.showToast("Error translating selection");
            }

        } else {
            // overlay.showToast("No translatable content found in selection");
        }

    } else if (request.action === 'clear_page_cache') {
        let blocksToClear = originalBlocks;
        if (blocksToClear.length === 0) {
            blocksToClear = getTranslatableBlocks(document.body);
        }
        if (blocksToClear.length > 0) await clearPageSpecificCache(blocksToClear);
        overlay.showToast("Page cache cleared");
        sendResponse({ success: true });
    }
});

async function clearPageSpecificCache(blocks: BlockNodeData[]) {
    for (const block of blocks) {
        if (!block.originalHTML || block.originalHTML.trim().length === 0) continue;
        await removeCachedTranslation(block.originalHTML, "Japanese");
        // Clear memory
        delete block.translatedHTML;
    }
}

function restoreOriginal() {
    originalBlocks.forEach(item => replaceBlockHTML(item, item.originalHTML));
}

function showTranslated() {
    originalBlocks.forEach(item => {
        if (item.translatedHTML) replaceBlockHTML(item, item.translatedHTML);
    });
}


interface ContentState {
    status: 'fresh' | 'checking' | 'queued' | 'done';
    key: string;
    originalContent: string;
    minifiedContent?: string;
    minificationMap?: Record<string, string>;
    retryCount: number;
    rawLength: number; // Add this explicitly
}

async function performTranslation() {
    overlay.show();
    overlay.update(0, "Scanning...");

    overlay.onStop = () => {
        shouldStop = true;
        // User requested: Stop should be "Complete" (hide overlay)
        overlay.update(100, "Done");
        overlay.complete();
    };

    overlay.onResume = () => {
        shouldStop = false;
        overlay.setProcessingState();
    };

    // overlay.onToggle removed as per user request to hide toggle button
    /*
    overlay.onToggle = () => {
        if (isTranslated) {
            restoreOriginal();
            isTranslated = false;
        } else {
            showTranslated();
            isTranslated = true;
        }
    };
    */

    const settings = await chrome.storage.local.get(['apiKey', 'model', 'translationMode', 'translationScope']);
    const apiKey = settings.apiKey;
    const model = settings.model || 'openai/gpt-3.5-turbo';
    currentMode = (settings.translationMode as 'quality' | 'efficiency') || 'quality';
    currentScope = (settings.translationScope as 'page' | 'main') || 'page';

    if (!apiKey) {
        alert('Please set your OpenRouter API Key in the extension popup.');
        overlay.hide();
        return;
    }

    // Prepare Items based on mode
    // If we haven't scanned the full page yet (or if scope changed?), we must scan.
    // Even if originalBlocks has items (from selection translation), we need the rest.
    if (!hasFullPageScan || originalBlocks.length === 0) {
        let root = document.body;
        if (currentScope === 'main') {
            const main = document.querySelector('main') || document.querySelector('article') || document.querySelector('[role="main"]');
            if (main) root = main as HTMLElement;
        }

        const allBlocks = getTranslatableBlocks(root);

        // Merge with existing logic:
        // If we have existing "originalBlocks" (e.g. from selection), we want to PRESERVE them 
        // because they might hold 'translatedHTML' state.
        // We match by Element reference.

        if (originalBlocks.length > 0) {
            const mergedBlocks: BlockNodeData[] = [];
            const existingMap = new Map<HTMLElement, BlockNodeData>();
            originalBlocks.forEach(b => existingMap.set(b.element, b));

            for (const newBlock of allBlocks) {
                if (existingMap.has(newBlock.element)) {
                    mergedBlocks.push(existingMap.get(newBlock.element)!);
                } else {
                    mergedBlocks.push(newBlock);
                }
            }
            originalBlocks = mergedBlocks;
        } else {
            originalBlocks = allBlocks;
        }

        hasFullPageScan = true;
    }

    const blocksByContent = new Map<string, BlockNodeData[]>();
    const contentStates = new Map<string, ContentState>();

    // Preparation Phase
    let totalChars = 0;
    let finishedChars = 0;

    for (const block of originalBlocks) {
        const content = block.originalHTML;
        if (content.trim().length === 0) continue;

        // Skip trivial
        if (isTrivialContent(content)) {
            // Mark as done for stats (conceptually)
            continue;
        }

        if (!blocksByContent.has(content)) {
            blocksByContent.set(content, []);
            contentStates.set(content, {
                status: 'fresh',
                key: content,
                originalContent: content,
                rawLength: content.length,
                retryCount: 0
            });
            totalChars += content.length;
        } else {
            // Duplicate content contributes to total chars implicitly?
            // Actually, let's track unique content chars or total page chars?
            // Usually progress is "how much of the page is done".
            totalChars += content.length;
        }

        blocksByContent.get(content)!.push(block);
    }

    if (totalChars === 0) {
        chrome.runtime.sendMessage({ action: 'progress', percent: 100 });
        overlay.update(100, "Done");
        overlay.complete(); // This now auto-hides after 2s
        return;
    }

    overlay.update(0, "Ready");

    // Queue for API Batching
    let apiQueue: ContentState[] = [];
    let apiQueueLength = 0;
    let apiQueueTimer: ReturnType<typeof setTimeout> | null = null;

    // Check if model is Gemini Flash (Dynamic Batching)
    const isGeminiFlash = model.toLowerCase().includes('gemini') && model.toLowerCase().includes('flash');

    const MIN_CHUNK_LENGTH = 500;
    const MAX_CHUNK_LENGTH = isGeminiFlash ? 4000 : (currentMode === 'efficiency' ? 4000 : 2500);
    const MAX_CHUNK_ITEMS = currentMode === 'efficiency' ? 100 : 50;

    // Concurrency Semaphores
    const CONCURRENCY_LIMIT = isGeminiFlash ? 5 : 3;
    let activeRequests = 0;
    const pendingBatches: ContentState[][] = [];

    const updateProgress = () => {
        const percent = Math.floor((finishedChars / totalChars) * 100);
        chrome.runtime.sendMessage({ action: 'progress', percent });
        // overlay.update(percent, shouldStop ? "Stopped" : "Translating..."); 
        // We only show "Translating..." if actually pending requests?
        // For lazy, we can just show "Active" or the percent.
        if (!shouldStop) {
            overlay.update(percent);
        }
    };

    const attemptProcessing = () => {
        if (shouldStop) return;
        if (activeRequests >= CONCURRENCY_LIMIT || pendingBatches.length === 0) return;

        while (activeRequests < CONCURRENCY_LIMIT && pendingBatches.length > 0) {
            const batch = pendingBatches.shift();
            if (batch) {
                activeRequests++;
                // Fire and forget, but track completion
                processBatch(batch).finally(() => {
                    activeRequests--;
                    attemptProcessing();
                });
            }
        }
    };

    const flushQueue = async () => {
        // NOTE: async signature kept for compatibility, but we just push to pendingBatches
        if (apiQueue.length === 0) return;

        const batch = [...apiQueue];
        apiQueue = [];
        apiQueueLength = 0;
        if (apiQueueTimer) clearTimeout(apiQueueTimer);
        apiQueueTimer = null;

        pendingBatches.push(batch);
        attemptProcessing();
    };

    const scheduleFlush = () => {
        if (apiQueueTimer) return;
        apiQueueTimer = setTimeout(() => {
            flushQueue();
        }, 300); // 300ms debounce
    };

    const setVisualErrorState = (content: string, isPermanent: boolean) => {
        const targets = blocksByContent.get(content);
        if (targets) {
            targets.forEach(block => {
                block.element.style.transition = 'outline 0.3s';
                block.element.style.outline = isPermanent ? '2px dashed #ff0000' : '2px dashed #ffa500';
            });
        }
    };

    // CSS injection removed as per user request to avoid global stylesheet conflicts

    const clearVisualErrorState = (content: string) => {
        const targets = blocksByContent.get(content);
        if (targets) {
            targets.forEach(block => {
                block.element.style.outline = 'none';
            });
        }
    };

    const context = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    };

    const processBatch = async (batch: ContentState[]) => {
        if (shouldStop) return;

        try {
            // Prepare content for API
            const contentsToSend = batch.map(item => {
                if (currentMode === 'efficiency') {
                    const { minified, map } = minifyHTML(item.originalContent);
                    item.minifiedContent = minified;
                    item.minificationMap = map;
                    return minified;
                }
                return item.originalContent;
            });

            console.log(`Sending lazy batch of ${batch.length} items`);

            const response = await sendTranslationRequest({
                action: 'translate_api',
                apiKey,
                model,
                text: contentsToSend,
                context
            });

            if (response.success && Array.isArray(response.data)) {
                const translations = response.data;
                batch.forEach((item, idx) => {
                    let translated = translations[idx];
                    if (translated) {
                        // Success - Clear error state
                        clearVisualErrorState(item.originalContent);

                        if (item.minificationMap) {
                            translated = restoreHTML(translated, item.minificationMap);
                        }

                        applyTranslation(item.originalContent, translated);
                        setCachedTranslation(item.originalContent, "Japanese", translated);
                    }
                    item.status = 'done';
                    // Update progress
                    const multiplier = blocksByContent.get(item.originalContent)?.length || 1;
                    finishedChars += (item.rawLength * multiplier);
                });
            } else {
                console.error("Translation failed", response.error);

                // Retry Logic
                batch.forEach(item => {
                    item.retryCount++;
                    if (item.retryCount <= 3) {
                        // Retry: Mark as Queued, Apply Warning Style
                        item.status = 'queued';
                        setVisualErrorState(item.originalContent, false); // Orange
                        apiQueue.push(item);
                        apiQueueLength += (currentMode === 'efficiency' ? item.rawLength * 0.7 : item.rawLength);
                    } else {
                        // Fail: Mark as Done (with error), Apply Error Style
                        item.status = 'done'; // Stop processing
                        setVisualErrorState(item.originalContent, true); // Red
                        // We count it as "finished" regarding progress bar to avoid infinite hanging?
                        // Or maybe not? Let's leave it out of finishedChars so progress stalls?
                        // User requested explicit error state.
                    }
                });

                // If we pushed back to queue, schedule flush
                if (apiQueue.length > 0) {
                    scheduleFlush();
                }
            }

            updateProgress();

        } catch (e) {
            console.error("Batch error", e);
            // Similar retry logic for exception
            batch.forEach(item => {
                item.retryCount++;
                if (item.retryCount <= 3) {
                    item.status = 'queued';
                    setVisualErrorState(item.originalContent, false);
                    apiQueue.push(item);
                    apiQueueLength += item.rawLength;
                } else {
                    item.status = 'done';
                    setVisualErrorState(item.originalContent, true);
                }
            });
            if (apiQueue.length > 0) scheduleFlush();
            updateProgress();
        }
    };

    const applyTranslation = (content: string, translated: string) => {
        const targets = blocksByContent.get(content);
        if (targets) {
            targets.forEach(block => {
                block.element.classList.remove('tx-retranslating'); // Clear re-translation state
                replaceBlockHTML(block, translated);
                block.translatedHTML = translated;
            });
        }
    };

    const checkCacheAndQueue = async (state: ContentState) => {
        if (shouldStop) return;

        const cached = await getCachedTranslation(state.originalContent, "Japanese");
        if (cached) {
            applyTranslation(state.originalContent, cached);
            state.status = 'done';
            const multiplier = blocksByContent.get(state.originalContent)?.length || 1;
            finishedChars += (state.rawLength * multiplier);
            updateProgress();
        } else {
            // Queue it
            state.status = 'queued';
            apiQueue.push(state);
            apiQueueLength += (currentMode === 'efficiency' ? state.rawLength * 0.7 : state.rawLength); // approximate

            if (apiQueueLength > MAX_CHUNK_LENGTH || apiQueue.length >= MAX_CHUNK_ITEMS) {
                flushQueue();
            } else {
                scheduleFlush();
            }
        }
    };

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        if (shouldStop) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target as HTMLElement;
                // Find which content this element belongs to
                // We don't have a direct Element -> ContentState map efficiently unless we attach data to element.
                // Or we can assume 'blocksByContent' helps, but looking up key by value is slow.
                // optimization: Attach key to element dataset or similar?
                // Currently 'originalBlocks' has { element, originalHTML }.
                // But looking up in originalBlocks is O(N).

                // Better: Map<HTMLElement, ContentState>
                // We'll build this in the setup phase.
                const state = elementStateMap.get(element);
                if (state && state.status === 'fresh') {
                    state.status = 'checking';
                    checkCacheAndQueue(state);
                    observer.unobserve(element); // We only trigger once per element!
                }
            }
        });
    }, {
        rootMargin: '200px' // Preload
    });

    const elementStateMap = new Map<HTMLElement, ContentState>();

    // Start Observing
    for (const [content, blocks] of blocksByContent.entries()) {
        const state = contentStates.get(content)!;

        // If we already have memory translation (from a previous partial run?), use it
        // Actually performTranslation resets if 'isTranslated' wasn't true... 
        // But if we toggle off/on... 'isTranslated' logic in 'onMessage' calls restoreOriginal.
        // So we start from fresh DOM mostly.

        blocks.forEach(block => {
            // Check if block already has translation (memory cache from toggle?)
            if (block.translatedHTML) {
                // It's already done
                replaceBlockHTML(block, block.translatedHTML);
                if (state.status !== 'done') {
                    state.status = 'done';
                    finishedChars += state.rawLength * blocks.length;
                }
                // No need to observe
            } else {
                elementStateMap.set(block.element, state);
                observer.observe(block.element);
            }
        });
    }

    // Initial check for 'done' states in case of toggle re-run
    updateProgress();
}
