import { NextRequest } from 'next/server';
import { getEnv } from '@/lib/config';
import { handlePaymentNotify } from '@/lib/order/service';
import { paymentRegistry } from '@/lib/payment';
import type { PaymentType } from '@/lib/payment';
import { extractHeaders } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    if (!env.XUNHU_PAY_APP_ID || !env.XUNHU_PAY_APP_SECRET) {
      return new Response('success', { headers: { 'Content-Type': 'text/plain' } });
    }

    const provider = paymentRegistry.getProvider('xunhupay' as PaymentType);
    const rawBody = await request.text();
    const headers = extractHeaders(request);

    const notification = await provider.verifyNotification(rawBody, headers);
    if (!notification) {
      return new Response('success', { headers: { 'Content-Type': 'text/plain' } });
    }

    const success = await handlePaymentNotify(notification, provider.name);
    return new Response(success ? 'success' : 'fail', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('XunhuPay notify error:', error);
    return new Response('fail', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
