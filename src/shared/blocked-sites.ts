const BLOCKED_SITES_KEY = 'blocked-sites:v1';

export async function getBlockedSites(): Promise<string[]> {
  const result = await chrome.storage.local.get(BLOCKED_SITES_KEY);
  return (result[BLOCKED_SITES_KEY] as string[]) ?? [];
}

export async function addBlockedSite(hostname: string): Promise<void> {
  const sites = await getBlockedSites();
  if (!sites.includes(hostname)) {
    sites.push(hostname);
    await chrome.storage.local.set({ [BLOCKED_SITES_KEY]: sites });
  }
}

export async function removeBlockedSite(hostname: string): Promise<void> {
  const sites = await getBlockedSites();
  const filtered = sites.filter((s) => s !== hostname);
  await chrome.storage.local.set({ [BLOCKED_SITES_KEY]: filtered });
}

export async function isBlockedSite(hostname: string): Promise<boolean> {
  const sites = await getBlockedSites();
  return sites.includes(hostname);
}
