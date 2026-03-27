'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/locale';
import { getOrderDisplayState, type PublicOrderStatusSnapshot } from '@/lib/order/status';
import { buildOrderStatusUrl } from '@/lib/order/status-url';

interface OrderStatusProps {
  orderId: string;
  order: PublicOrderStatusSnapshot;
  statusAccessToken?: string;
  onBack: () => void;
  onStateChange?: (order: PublicOrderStatusSnapshot) => void;
  dark?: boolean;
  locale?: Locale;
}

export default function OrderStatus({
  orderId,
  order,
  statusAccessToken,
  onBack,
  onStateChange,
  dark = false,
  locale = 'zh',
}: OrderStatusProps) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  useEffect(() => {
    if (!orderId || !currentOrder.paymentSuccess || currentOrder.rechargeSuccess) {
      return;
    }

    let cancelled = false;

    const refreshOrder = async () => {
      try {
        const response = await fetch(buildOrderStatusUrl(orderId, statusAccessToken));
        if (!response.ok) return;
        const nextOrder = (await response.json()) as PublicOrderStatusSnapshot;
        if (cancelled) return;
        setCurrentOrder(nextOrder);
        onStateChangeRef.current?.(nextOrder);
      } catch {}
    };

    refreshOrder();
    const timer = setInterval(refreshOrder, 3000);
    const timeout = setTimeout(() => clearInterval(timer), 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [orderId, currentOrder.paymentSuccess, currentOrder.rechargeSuccess, statusAccessToken]);

  const config = getOrderDisplayState(currentOrder, locale, dark);
  const doneLabel = locale === 'en' ? 'Done' : '完成';
  const backLabel = locale === 'en' ? 'Back to Recharge' : '返回充值';

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className={`text-6xl ${config.color}`}>{config.icon}</div>
      <h2 className={`text-xl font-bold ${config.color}`}>{config.label}</h2>
      <p className={['text-center', dark ? 'text-slate-400' : 'text-gray-500'].join(' ')}>{config.message}</p>
      <button
        onClick={onBack}
        className={[
          'mt-4 w-full rounded-lg py-3 font-medium text-white',
          dark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700',
        ].join(' ')}
      >
        {currentOrder.rechargeSuccess ? doneLabel : backLabel}
      </button>
    </div>
  );
}
