import crypto from 'crypto';

function normalizeSignValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    return value === '' ? undefined : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

export function generateHash(params: Record<string, unknown>, appSecret: string): string {
  const filtered = Object.entries(params)
    .filter(([key, value]) => key !== 'hash' && normalizeSignValue(value) !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  const query = filtered.map(([key, value]) => `${key}=${normalizeSignValue(value)!}`).join('&');
  return crypto
    .createHash('md5')
    .update(query + appSecret)
    .digest('hex');
}

export function verifyHash(params: Record<string, unknown>, appSecret: string, hash: string): boolean {
  const expected = generateHash(params, appSecret);
  if (expected.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}
