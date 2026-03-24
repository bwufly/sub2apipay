import crypto from 'crypto';
import { getEnv } from '@/lib/config';
import { generateHash, verifyHash } from './sign';
import type {
  XunhuPayCreateRequest,
  XunhuPayCreateResponse,
  XunhuPayQueryRequest,
  XunhuPayQueryResponse,
  XunhuPayRefundRequest,
  XunhuPayRefundResponse,
} from './types';

export interface CreateXunhuPayPaymentOptions {
  tradeOrderId: string;
  totalFee: string;
  title: string;
  notifyUrl?: string;
  returnUrl?: string;
  callbackUrl?: string;
  attach?: string;
}

export interface QueryXunhuPayOrderOptions {
  tradeOrderId?: string;
  openOrderId?: string;
}

export interface RefundXunhuPayOrderOptions {
  tradeOrderId?: string;
  openOrderId?: string;
  reason?: string;
}

function assertXunhuPayEnv(env: ReturnType<typeof getEnv>) {
  if (!env.XUNHU_PAY_APP_ID || !env.XUNHU_PAY_APP_SECRET || !env.XUNHU_PAY_NOTIFY_URL) {
    throw new Error(
      'XunhuPay environment variables (XUNHU_PAY_APP_ID, XUNHU_PAY_APP_SECRET, XUNHU_PAY_NOTIFY_URL) are required',
    );
  }

  return {
    ...env,
    XUNHU_PAY_APP_ID: env.XUNHU_PAY_APP_ID,
    XUNHU_PAY_APP_SECRET: env.XUNHU_PAY_APP_SECRET,
    XUNHU_PAY_NOTIFY_URL: env.XUNHU_PAY_NOTIFY_URL,
    XUNHU_PAY_API_BASE: env.XUNHU_PAY_API_BASE || 'https://api.xunhupay.com',
  };
}

function logXunhuPayDebug(message: string, payload: Record<string, unknown>) {
  const env = getEnv();
  if (!env.DEBUG_PAYMENT_FLOW) return;
  console.log(`[xunhupay] ${message}`, payload);
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function withSignedHash<T extends object>(params: T, appSecret: string): T & { hash: string } {
  return {
    ...params,
    hash: generateHash(params as Record<string, unknown>, appSecret),
  };
}

function toFormBody(body: object): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  return params;
}

async function postForm<T extends Record<string, unknown>>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    body: toFormBody(body),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(10_000),
  });

  return (await response.json()) as T;
}

function assertSuccess(errcode: number, errmsg: string | undefined, action: string): void {
  if (errcode !== 0) {
    throw new Error(`XunhuPay ${action} failed: ${errmsg || 'unknown error'}`);
  }
}

function verifyFlatResponseHash(response: Record<string, unknown>, appSecret: string, action: string): void {
  const hash = typeof response.hash === 'string' ? response.hash : '';
  if (!hash) {
    throw new Error(`XunhuPay ${action} failed: missing response hash`);
  }
  if (!verifyHash(response, appSecret, hash)) {
    throw new Error(`XunhuPay ${action} failed: invalid response hash`);
  }
}

export async function createPayment(opts: CreateXunhuPayPaymentOptions): Promise<XunhuPayCreateResponse> {
  const env = assertXunhuPayEnv(getEnv());
  const payload = withSignedHash<XunhuPayCreateRequest>(
    {
      version: '1.1',
      appid: env.XUNHU_PAY_APP_ID,
      trade_order_id: opts.tradeOrderId,
      total_fee: opts.totalFee,
      title: opts.title,
      time: String(Math.floor(Date.now() / 1000)),
      notify_url: opts.notifyUrl || env.XUNHU_PAY_NOTIFY_URL,
      return_url: opts.returnUrl || env.XUNHU_PAY_RETURN_URL,
      callback_url: opts.callbackUrl || opts.returnUrl || env.XUNHU_PAY_RETURN_URL,
      plugins: 'sub2apipay',
      attach: opts.attach,
      nonce_str: generateNonce(),
      hash: '',
    },
    env.XUNHU_PAY_APP_SECRET,
  );

  const response = await postForm<XunhuPayCreateResponse>(`${env.XUNHU_PAY_API_BASE}/payment/do.html`, payload);
  logXunhuPayDebug('create payment response', {
    tradeOrderId: opts.tradeOrderId,
    errcode: response.errcode,
    errmsg: response.errmsg,
    url: response.url,
    url_qrcode: response.url_qrcode,
  });
  verifyFlatResponseHash(response, env.XUNHU_PAY_APP_SECRET, 'create payment');
  assertSuccess(response.errcode, response.errmsg, 'create payment');
  return response;
}

export async function queryOrder(opts: QueryXunhuPayOrderOptions): Promise<XunhuPayQueryResponse> {
  const env = assertXunhuPayEnv(getEnv());
  if (!opts.tradeOrderId && !opts.openOrderId) {
    throw new Error('XunhuPay query order requires tradeOrderId or openOrderId');
  }

  const payload = withSignedHash<XunhuPayQueryRequest>(
    {
      appid: env.XUNHU_PAY_APP_ID,
      out_trade_order: opts.tradeOrderId,
      open_order_id: opts.openOrderId,
      time: String(Math.floor(Date.now() / 1000)),
      nonce_str: generateNonce(),
      hash: '',
    },
    env.XUNHU_PAY_APP_SECRET,
  );

  const response = await postForm<XunhuPayQueryResponse>(`${env.XUNHU_PAY_API_BASE}/payment/query.html`, payload);
  assertSuccess(response.errcode, response.errmsg, 'query order');
  return response;
}

export async function refund(opts: RefundXunhuPayOrderOptions): Promise<XunhuPayRefundResponse> {
  const env = assertXunhuPayEnv(getEnv());
  if (!opts.tradeOrderId && !opts.openOrderId) {
    throw new Error('XunhuPay refund requires tradeOrderId or openOrderId');
  }

  const payload = withSignedHash<XunhuPayRefundRequest>(
    {
      appid: env.XUNHU_PAY_APP_ID,
      trade_order_id: opts.tradeOrderId,
      open_order_id: opts.openOrderId,
      reason: opts.reason,
      time: String(Math.floor(Date.now() / 1000)),
      nonce_str: generateNonce(),
      hash: '',
    },
    env.XUNHU_PAY_APP_SECRET,
  );

  const response = await postForm<XunhuPayRefundResponse>(`${env.XUNHU_PAY_API_BASE}/payment/refund.html`, payload);
  verifyFlatResponseHash(response, env.XUNHU_PAY_APP_SECRET, 'refund');
  assertSuccess(response.errcode, response.errmsg, 'refund');
  return response;
}
