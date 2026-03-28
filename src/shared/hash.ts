export async function hashString(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}
