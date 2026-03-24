import type {
  PaymentProvider,
  PaymentType,
  CreatePaymentRequest,
  CreatePaymentResponse,
  QueryOrderResponse,
  PaymentNotification,
  RefundRequest,
  RefundResponse,
} from '@/lib/payment/types';
import { getEnv } from '@/lib/config';
import { createPayment, queryOrder, refund } from './client';
import { verifyHash } from './sign';

function parseNotifyBody(rawBody: string | Buffer): Record<string, string> {
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  const searchParams = new URLSearchParams(body);
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

function parseAmount(raw: string | undefined, context: string): number {
  const amount = Number.parseFloat(raw || '');
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`XunhuPay ${context}: invalid amount "${raw}"`);
  }
  return Math.round(amount * 100) / 100;
}

function mapOrderStatus(status: string | undefined): QueryOrderResponse['status'] {
  switch (status) {
    case 'OD':
      return 'paid';
    case 'CD':
      return 'refunded';
    case 'UD':
      return 'failed';
    case 'RD':
    case 'WP':
    default:
      return 'pending';
  }
}

function mapRefundStatus(status: string | undefined): RefundResponse['status'] {
  switch (status) {
    case 'CD':
      return 'success';
    case 'UD':
      return 'failed';
    case 'RD':
    default:
      return 'pending';
  }
}

export class XunhuPayProvider implements PaymentProvider {
  readonly name = 'xunhupay';
  readonly providerKey = 'xunhupay';
  readonly supportedTypes: PaymentType[] = ['xunhupay'];
  readonly defaultLimits = {
    xunhupay: { singleMax: 1000, dailyMax: 10000 },
  };

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const result = await createPayment({
      tradeOrderId: request.orderId,
      totalFee: request.amount.toFixed(2),
      title: request.subject,
      notifyUrl: request.notifyUrl,
      returnUrl: request.returnUrl,
      callbackUrl: request.returnUrl,
      attach: request.paymentType,
    });

    return {
      tradeNo: request.orderId,
      payUrl: result.url,
      qrCode: result.url_qrcode,
    };
  }

  async queryOrder(tradeNo: string): Promise<QueryOrderResponse> {
    let result;
    try {
      result = await queryOrder({ tradeOrderId: tradeNo });
    } catch {
      result = await queryOrder({ openOrderId: tradeNo });
    }

    const data = result.data || {};
    const amount = data.total_fee ? parseAmount(data.total_fee, 'query order') : 0;

    return {
      tradeNo: data.open_order_id || data.trade_order_id || tradeNo,
      status: mapOrderStatus(data.status),
      amount,
    };
  }

  async verifyNotification(rawBody: string | Buffer, _headers: Record<string, string>): Promise<PaymentNotification> {
    const env = getEnv();
    if (!env.XUNHU_PAY_APP_SECRET) throw new Error('XUNHU_PAY_APP_SECRET not configured');

    const params = parseNotifyBody(rawBody);
    const hash = params.hash || '';
    if (!hash || !verifyHash(params, env.XUNHU_PAY_APP_SECRET, hash)) {
      throw new Error('XunhuPay notification signature verification failed');
    }

    if (params.appid && env.XUNHU_PAY_APP_ID && params.appid !== env.XUNHU_PAY_APP_ID) {
      throw new Error('XunhuPay notification appid mismatch');
    }

    const orderId = params.trade_order_id?.trim();
    if (!orderId) {
      throw new Error('XunhuPay notification missing trade_order_id');
    }

    return {
      tradeNo: params.open_order_id || orderId,
      orderId,
      amount: parseAmount(params.total_fee, 'notification'),
      status: params.status === 'OD' ? 'success' : 'failed',
      rawData: params,
    };
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const useOpenOrderId = request.tradeNo && request.tradeNo !== request.orderId;
    const result = await refund({
      tradeOrderId: useOpenOrderId ? undefined : request.orderId,
      openOrderId: useOpenOrderId ? request.tradeNo : undefined,
      reason: request.reason,
    });

    return {
      refundId: result.out_refund_no || `${request.orderId}-refund`,
      status: mapRefundStatus(result.refund_status),
    };
  }

  async cancelPayment(): Promise<void> {
    // XunhuPay 没有公开关闭待支付订单接口，交由本地订单状态兜底。
  }
}
