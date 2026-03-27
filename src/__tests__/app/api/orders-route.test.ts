import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCreateOrder = vi.fn();
const mockGetCurrentUserByToken = vi.fn();
const mockGetEnabledPaymentTypes = vi.fn();

vi.mock('@/lib/order/service', () => ({
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
}));

vi.mock('@/lib/sub2api/client', () => ({
  getCurrentUserByToken: (...args: unknown[]) => mockGetCurrentUserByToken(...args),
}));

vi.mock('@/lib/payment/resolve-enabled-types', () => ({
  getEnabledPaymentTypes: (...args: unknown[]) => mockGetEnabledPaymentTypes(...args),
}));

vi.mock('@/lib/config', () => ({
  getEnv: () => ({
    MIN_RECHARGE_AMOUNT: 1,
    MAX_RECHARGE_AMOUNT: 1000,
  }),
}));

import { POST } from '@/app/api/orders/route';

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('https://pay.example.com/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserByToken.mockResolvedValue({ id: 1 });
    mockGetEnabledPaymentTypes.mockResolvedValue(['alipay', 'wxpay']);
    mockCreateOrder.mockResolvedValue({
      orderId: 'order-balance-001',
      amount: 5,
      payAmount: 5,
      feeRate: 0,
      status: 'COMPLETED',
      paymentType: 'balance',
      userName: 'test',
      userBalance: 10,
      expiresAt: new Date('2026-03-27T00:00:00.000Z'),
      statusAccessToken: 'token-1',
    });
  });

  it('allows balance payment for subscription orders even when not in enabled payment types', async () => {
    const response = await POST(
      createRequest({
        token: 'test-token',
        amount: 999,
        payment_type: 'balance',
        order_type: 'subscription',
        plan_id: 'plan-1',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.paymentType).toBe('balance');
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        paymentType: 'balance',
        orderType: 'subscription',
        planId: 'plan-1',
      }),
    );
  });

  it('rejects balance payment for non-subscription orders', async () => {
    const response = await POST(
      createRequest({
        token: 'test-token',
        amount: 20,
        payment_type: 'balance',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('不支持的支付方式');
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});
