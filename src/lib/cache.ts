export async function digestMessage(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function getCachedTranslation(text: string, lang: string): Promise<string | null> {
    const hash = await digestMessage(text + "::" + lang);
    const result = await chrome.storage.local.get(hash);
    return result[hash] || null;
}

export async function setCachedTranslation(text: string, lang: string, translation: string): Promise<void> {
    const hash = await digestMessage(text + "::" + lang);
    await chrome.storage.local.set({ [hash]: translation });
}

export async function removeCachedTranslation(text: string, lang: string): Promise<void> {
    const hash = await digestMessage(text + "::" + lang);
    await chrome.storage.local.remove(hash);
}
