import { getTranslatableBlocks, replaceBlockHTML, BlockNodeData, minifyHTML, restoreHTML } from '../lib/dom-utils';
import { getCachedTranslation, setCachedTranslation, removeCachedTranslation } from '../lib/cache';
import { overlay } from '../lib/overlay';

// Global state
let currentMode: 'quality' | 'efficiency' = 'quality'; // Default
let currentScope: 'page' | 'main' = 'page'; // Default
let originalBlocks: BlockNodeData[] = [];
let isTranslated = false;
let shouldStop = false;

// Pending requests map for async messaging
const pendingRequests = new Map<string, { resolve: (val: any) => void, reject: (err: any) => void }>();

// Helper to identify trivial content
const UI_TERMS = new Set(['read more', 'learn more', 'share', 'login', 'sign up', 'signup', 'menu', 'search', 'follow', 'subscribe', 'comment', 'reply', 'like', 'loading...', 'privacy policy', 'terms of use']);

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
        pendingRequests.set(requestId, { resolve, reject });
        chrome.runtime.sendMessage({ ...payload, requestId }).catch(err => {
            pendingRequests.delete(requestId);
            reject(err);
        });
    });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'translate') {
        // Update settings from request if provided
        if (request.translationScope) currentScope = request.translationScope;

        if (isTranslated) {
            restoreOriginal();
            isTranslated = false;
            overlay.showToggle(false);
            sendResponse({ status: 'original' });
        } else {
            shouldStop = false;
            // Check if we already have data for the current mode
            const hasData = (originalBlocks.length > 0 && originalBlocks.some(n => n.translatedHTML));

            if (hasData) {
                showTranslated();
                isTranslated = true;
                overlay.showToggle(true);
                sendResponse({ status: 'translated' });
            } else {
                // FIRE AND FORGET - Do not await.
                // This prevents the channel from timing out if the popup closes.
                // We assume successful start. Logic handles state.
                performTranslation().then(() => {
                    if (!shouldStop) {
                        isTranslated = true;
                        // overlay.showToggle(true) called inside performTranslation
                    }
                }).catch(console.error);

                sendResponse({ status: 'started' });
            }
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
    } else if (request.action === 'clear_page_cache') {
        let blocksToClear = originalBlocks;
        if (blocksToClear.length === 0) {
            blocksToClear = getTranslatableBlocks(document.body);
        }
        if (blocksToClear.length > 0) await clearPageSpecificCache(blocksToClear);
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

async function performTranslation() {
    overlay.show();
    overlay.update(0, "Starting...");

    overlay.onStop = () => {
        shouldStop = true;
        overlay.setStoppedState();
    };

    overlay.onResume = () => {
        shouldStop = false;
        overlay.setProcessingState();
        performTranslation();
    };

    overlay.onToggle = () => {
        if (isTranslated) {
            restoreOriginal();
            isTranslated = false;
            overlay.showToggle(false);
        } else {
            showTranslated();
            isTranslated = true;
            overlay.showToggle(true);
        }
    };

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
    if (originalBlocks.length === 0) {
        let root = document.body;
        if (currentScope === 'main') {
            // Try to find main content area
            const main = document.querySelector('main') || document.querySelector('article') || document.querySelector('[role="main"]');
            if (main) root = main as HTMLElement;
        }
        originalBlocks = getTranslatableBlocks(root);
    }

    // Deduplication Map: Original Content -> Array of Blocks
    const uniqueBlockMap = new Map<string, BlockNodeData[]>();

    // Unique items to translate: { key, contentToTranslate, map }
    // key is the originalContent (used to lookup blocks)
    // contentToTranslate is possibly minified
    interface UniqueItem {
        key: string; // The original HTML content, used as a key for deduplication and caching
        content: string; // The content to send for translation (might be minified)
        map: Record<string, string> | null; // Minification map if applicable
        rawLength: number; // Original length for progress calculation
    }
    const uniqueItems: UniqueItem[] = [];

    let processedChars = 0;

    const totalChars = originalBlocks.reduce((sum, n: BlockNodeData) => {
        const text = n.originalHTML;
        return text.trim().length > 0 ? sum + text.length : sum;
    }, 0);

    // Identify what needs translation
    for (const block of originalBlocks) {
        const content = block.originalHTML;

        if (content.trim().length === 0) continue;

        const memoryTranslated = block.translatedHTML;

        // Skip trivial content to save cost and speed
        if (isTrivialContent(content)) {
            processedChars += content.length;
            continue;
        }

        if (memoryTranslated) {
            replaceBlockHTML(block, memoryTranslated);
            processedChars += content.length;
            continue;
        }

        const cached = await getCachedTranslation(content, "Japanese");
        if (cached) {
            replaceBlockHTML(block, cached);
            block.translatedHTML = cached;
            processedChars += content.length;
        } else {
            // Check if we already have this content queued for translation
            if (!uniqueBlockMap.has(content)) {
                uniqueBlockMap.set(content, []);

                // Prepare the unique item for translation
                if (currentMode === 'efficiency') {
                    const { minified, map } = minifyHTML(content);
                    uniqueItems.push({
                        key: content,
                        content: minified,
                        map: map,
                        rawLength: content.length
                    });
                } else {
                    uniqueItems.push({
                        key: content,
                        content: content,
                        map: null,
                        rawLength: content.length
                    });
                }
            }
            // Always add the current block to the map, even if content was already queued
            uniqueBlockMap.get(content)!.push(block);
        }
    }

    // Report initial progress
    if (totalChars > 0) {
        const percent = Math.floor((processedChars / totalChars) * 100);
        chrome.runtime.sendMessage({ action: 'progress', percent });
        overlay.update(percent, "Translating...");
    }

    if (uniqueItems.length === 0) {
        chrome.runtime.sendMessage({ action: 'progress', percent: 100 });
        overlay.update(100, "Done");
        overlay.complete();
        overlay.showToggle(true);
        return;
    }

    // Batching with Unique Items
    const chunks: UniqueItem[][] = [];
    let currentChunk: UniqueItem[] = [];
    let currentChunkLength = 0;

    const MIN_CHUNK_LENGTH = 500;
    // Increased Chunk Size for Quality Mode (from 1500 to 2500) to reduce requests
    const MAX_CHUNK_LENGTH = currentMode === 'efficiency' ? 4000 : 2500;
    const MAX_CHUNK_ITEMS = currentMode === 'efficiency' ? 100 : 50;

    for (const item of uniqueItems) {
        const len = item.content.length;

        let shouldFlush = false;
        if (currentChunkLength + len > MAX_CHUNK_LENGTH) shouldFlush = true;
        else if (currentChunk.length >= MAX_CHUNK_ITEMS) shouldFlush = true;
        else if (currentChunkLength > MIN_CHUNK_LENGTH) shouldFlush = true;

        if (currentChunk.length > 0 && shouldFlush) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkLength = 0;
        }

        currentChunk.push(item);
        currentChunkLength += len;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    // Context
    const context = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    };

    const CONCURRENCY_LIMIT = 3;

    const processChunk = async (chunk: UniqueItem[]) => {
        if (shouldStop) return;

        try {
            console.log(`Sending batch of ${chunk.length} unique items (${currentMode})`);
            const contentsToSend = chunk.map(i => i.content);

            // Use new robust messaging helper
            const response = await sendTranslationRequest({
                action: 'translate_api',
                apiKey,
                model,
                text: contentsToSend,
                context
            });

            if (response.success && Array.isArray(response.data)) {
                const translations = response.data;
                chunk.forEach((item, idx) => {
                    let translated = translations[idx];

                    if (translated) {
                        // Restore HTML if it was minified
                        if (item.map) {
                            translated = restoreHTML(translated, item.map);
                        }

                        // Apply to ALL duplicate blocks
                        const targetBlocks = uniqueBlockMap.get(item.key);
                        if (targetBlocks) {
                            targetBlocks.forEach(block => {
                                replaceBlockHTML(block, translated);
                                block.translatedHTML = translated;
                            });
                        }

                        // Cache the fully restored HTML against the original HTML
                        setCachedTranslation(item.key, "Japanese", translated);
                    }
                });
            } else {
                console.error("Translation failed", response.error);
            }
        } catch (e) {
            console.error("Chunk processing error:", e);
        }

        // Update progress based on total original chars represented by this chunk
        chunk.forEach(item => {
            // We processed 'one instance', but we must account for all duplicates in progress
            const targetBlocks = uniqueBlockMap.get(item.key);
            if (targetBlocks) {
                processedChars += (item.rawLength * targetBlocks.length);
            }
        });

        const percent = Math.min(100, Math.floor((processedChars / totalChars) * 100));
        chrome.runtime.sendMessage({ action: 'progress', percent });
        overlay.update(percent);
    };

    for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
        if (shouldStop) break;
        const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map(c => processChunk(c)));
    }

    if (shouldStop) {
        const finalPercent = totalChars > 0 ? Math.floor((processedChars / totalChars) * 100) : 0;
        overlay.update(finalPercent, `Stopped (${finalPercent}%)`);
        overlay.setStoppedState();
        overlay.showToggle(true);
        return;
    }

    chrome.runtime.sendMessage({ action: 'progress', percent: 100 });
    overlay.update(100, "Done");
    overlay.complete();
    overlay.showToggle(true);
}
