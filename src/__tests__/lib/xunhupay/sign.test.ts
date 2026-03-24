import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { generateHash, verifyHash } from '@/lib/xunhupay/sign';

describe('XunhuPay sign', () => {
  const appSecret = 'test-app-secret';
  const params: Record<string, string> = {
    appid: 'app-123',
    trade_order_id: 'order-001',
    total_fee: '10.00',
    title: 'Test Product',
    time: '1711111111',
    notify_url: 'https://pay.example.com/api/xunhupay/notify',
    nonce_str: 'abcdef123456',
  };

  it('generates deterministic md5 hash', () => {
    const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    const query = sorted.map(([key, value]) => `${key}=${value}`).join('&');
    const expected = crypto
      .createHash('md5')
      .update(query + appSecret)
      .digest('hex');

    expect(generateHash(params, appSecret)).toBe(expected);
  });

  it('ignores hash field and empty values', () => {
    const base = generateHash(params, appSecret);
    expect(
      generateHash(
        {
          ...params,
          hash: 'old-hash',
          empty: '',
        },
        appSecret,
      ),
    ).toBe(base);
  });

  it('verifies valid hash and rejects invalid hash', () => {
    const hash = generateHash(params, appSecret);
    expect(verifyHash(params, appSecret, hash)).toBe(true);
    expect(verifyHash(params, appSecret, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
  });
});
