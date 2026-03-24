import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({
  getEnv: () => ({
    XUNHU_PAY_APP_ID: 'app-123',
    XUNHU_PAY_APP_SECRET: 'secret-xyz',
    XUNHU_PAY_NOTIFY_URL: 'https://pay.example.com/api/xunhupay/notify',
    XUNHU_PAY_RETURN_URL: 'https://pay.example.com/pay/result',
  }),
}));

const mockCreatePayment = vi.fn();
const mockQueryOrder = vi.fn();
const mockRefund = vi.fn();

vi.mock('@/lib/xunhupay/client', () => ({
  createPayment: (...args: unknown[]) => mockCreatePayment(...args),
  queryOrder: (...args: unknown[]) => mockQueryOrder(...args),
  refund: (...args: unknown[]) => mockRefund(...args),
}));

const mockVerifyHash = vi.fn();

vi.mock('@/lib/xunhupay/sign', () => ({
  verifyHash: (...args: unknown[]) => mockVerifyHash(...args),
}));

import { XunhuPayProvider } from '@/lib/xunhupay/provider';
import type { CreatePaymentRequest, RefundRequest } from '@/lib/payment/types';

describe('XunhuPayProvider', () => {
  let provider: XunhuPayProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new XunhuPayProvider();
  });

  it('exposes expected metadata', () => {
    expect(provider.name).toBe('xunhupay');
    expect(provider.providerKey).toBe('xunhupay');
    expect(provider.supportedTypes).toEqual(['xunhupay']);
    expect(provider.defaultLimits).toEqual({
      xunhupay: { singleMax: 1000, dailyMax: 10000 },
    });
  });

  it('maps create payment response to payUrl and qrCodeImg', async () => {
    mockCreatePayment.mockResolvedValue({
      errcode: 0,
      url: 'https://cashier.xunhupay.com/pay/order-001',
      url_qrcode: 'https://cashier.xunhupay.com/qrcode/order-001.png',
    });

    const request: CreatePaymentRequest = {
      orderId: 'order-001',
      amount: 88.5,
      paymentType: 'xunhupay',
      subject: 'Sub2API 充值',
      returnUrl: 'https://pay.example.com/pay/result?order_id=order-001',
    };

    const result = await provider.createPayment(request);

    expect(mockCreatePayment).toHaveBeenCalledWith({
      tradeOrderId: 'order-001',
      totalFee: '88.50',
      title: 'Sub2API 充值',
      notifyUrl: undefined,
      returnUrl: 'https://pay.example.com/pay/result?order_id=order-001',
      callbackUrl: 'https://pay.example.com/pay/result?order_id=order-001',
      attach: 'xunhupay',
    });
    expect(result).toEqual({
      tradeNo: 'order-001',
      payUrl: 'https://cashier.xunhupay.com/pay/order-001',
      qrCodeImg: 'https://cashier.xunhupay.com/qrcode/order-001.png',
    });
  });

  it('maps query status OD to paid', async () => {
    mockQueryOrder.mockResolvedValue({
      errcode: 0,
      data: {
        status: 'OD',
        open_order_id: 'xh-open-001',
        trade_order_id: 'order-001',
        total_fee: '66.00',
      },
    });

    const result = await provider.queryOrder('order-001');
    expect(result).toEqual({
      tradeNo: 'xh-open-001',
      status: 'paid',
      amount: 66,
    });
  });

  it('falls back to openOrderId query when merchant-order query throws', async () => {
    mockQueryOrder
      .mockRejectedValueOnce(new Error('XunhuPay query order failed: invalid identifier'))
      .mockResolvedValueOnce({
        errcode: 0,
        data: {
          status: 'WP',
          open_order_id: 'xh-open-002',
          total_fee: '10.00',
        },
      });

    const result = await provider.queryOrder('xh-open-002');

    expect(mockQueryOrder).toHaveBeenNthCalledWith(1, { tradeOrderId: 'xh-open-002' });
    expect(mockQueryOrder).toHaveBeenNthCalledWith(2, { openOrderId: 'xh-open-002' });
    expect(result.status).toBe('pending');
  });

  it('verifies payment notification and maps OD to success', async () => {
    mockVerifyHash.mockReturnValue(true);

    const body = new URLSearchParams({
      appid: 'app-123',
      trade_order_id: 'order-002',
      open_order_id: 'xh-open-002',
      total_fee: '18.80',
      status: 'OD',
      hash: 'valid-hash',
    }).toString();

    const result = await provider.verifyNotification(body, {});

    expect(result).toEqual({
      tradeNo: 'xh-open-002',
      orderId: 'order-002',
      amount: 18.8,
      status: 'success',
      rawData: {
        appid: 'app-123',
        trade_order_id: 'order-002',
        open_order_id: 'xh-open-002',
        total_fee: '18.80',
        status: 'OD',
        hash: 'valid-hash',
      },
    });
  });

  it('rejects notification with invalid hash', async () => {
    mockVerifyHash.mockReturnValue(false);

    const body = new URLSearchParams({
      appid: 'app-123',
      trade_order_id: 'order-003',
      total_fee: '18.80',
      status: 'OD',
      hash: 'bad-hash',
    }).toString();

    await expect(provider.verifyNotification(body, {})).rejects.toThrow(
      'XunhuPay notification signature verification failed',
    );
  });

  it('uses open_order_id when refunding a paid order', async () => {
    mockRefund.mockResolvedValue({
      errcode: 0,
      out_refund_no: 'refund-001',
      refund_status: 'CD',
    });

    const request: RefundRequest = {
      tradeNo: 'xh-open-003',
      orderId: 'order-003',
      amount: 9.99,
      reason: 'test refund',
    };

    const result = await provider.refund(request);

    expect(mockRefund).toHaveBeenCalledWith({
      tradeOrderId: undefined,
      openOrderId: 'xh-open-003',
      reason: 'test refund',
    });
    expect(result).toEqual({ refundId: 'refund-001', status: 'success' });
  });
});
