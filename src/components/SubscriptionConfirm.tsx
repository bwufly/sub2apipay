'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Locale } from '@/lib/locale';
import { pickLocaleText } from '@/lib/locale';
import { getPaymentTypeLabel, getPaymentIconSrc } from '@/lib/pay-utils';
import { PAYMENT_TYPE } from '@/lib/constants';
import type { PlanInfo } from '@/components/SubscriptionPlanCard';
import { PlanInfoDisplay } from '@/components/SubscriptionPlanCard';

interface SubscriptionConfirmProps {
  plan: PlanInfo;
  paymentTypes: string[];
  userBalance?: number;
  onBack: () => void;
  onSubmit: (paymentType: string) => void;
  loading: boolean;
  isDark: boolean;
  locale: Locale;
}

export default function SubscriptionConfirm({
  plan,
  paymentTypes,
  userBalance,
  onBack,
  onSubmit,
  loading,
  isDark,
  locale,
}: SubscriptionConfirmProps) {
  const canUseBalance = typeof userBalance === 'number' && userBalance >= plan.price;
  const availablePaymentTypes = canUseBalance ? [PAYMENT_TYPE.BALANCE, ...paymentTypes] : paymentTypes;
  const [selectedPayment, setSelectedPayment] = useState(availablePaymentTypes[0] || '');
  const effectiveSelectedPayment = availablePaymentTypes.includes(selectedPayment)
    ? selectedPayment
    : (availablePaymentTypes[0] ?? '');

  const handleSubmit = () => {
    if (effectiveSelectedPayment && !loading) {
      onSubmit(effectiveSelectedPayment);
    }
  };

  const renderPaymentIcon = (type: string) => {
    if (type === PAYMENT_TYPE.BALANCE) {
      return (
        <span
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600',
          ].join(' ')}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5h9A2.5 2.5 0 0 1 18 7.5v9A2.5 2.5 0 0 1 15.5 19h-9A2.5 2.5 0 0 1 4 16.5v-9Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9h1.25A1.75 1.75 0 0 1 21 10.75v2.5A1.75 1.75 0 0 1 19.25 15H18V9Z" />
            <circle cx="16" cy="12" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        </span>
      );
    }

    const iconSrc = getPaymentIconSrc(type);
    if (!iconSrc) return null;
    return <Image src={iconSrc} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />;
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className={[
          'flex items-center gap-1 text-sm transition-colors',
          isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700',
        ].join(' ')}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {pickLocaleText(locale, '返回套餐页面', 'Back to Plans')}
      </button>

      {/* Title */}
      <h2 className={['text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>
        {pickLocaleText(locale, '确认订单', 'Confirm Order')}
      </h2>

      {/* Plan detail card — reuse shared component */}
      <div
        className={[
          'rounded-2xl border p-5',
          isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white',
        ].join(' ')}
      >
        <PlanInfoDisplay plan={plan} isDark={isDark} locale={locale} />
      </div>

      {/* Payment method selector */}
      <div>
        <label className={['mb-2 block text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-700'].join(' ')}>
          {pickLocaleText(locale, '支付方式', 'Payment Method')}
        </label>
        <div className="space-y-2">
          {availablePaymentTypes.map((type) => {
            const isSelected = effectiveSelectedPayment === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedPayment(type)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  isSelected
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : isDark
                      ? 'border-slate-700 hover:border-slate-600'
                      : 'border-slate-200 hover:border-slate-300',
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/30'
                      : 'bg-emerald-50/50'
                    : isDark
                      ? 'bg-slate-800/60'
                      : 'bg-white',
                ].join(' ')}
              >
                {/* Radio indicator */}
                <span
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    isSelected ? 'border-emerald-500' : isDark ? 'border-slate-600' : 'border-slate-300',
                  ].join(' ')}
                >
                  {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                </span>

                {/* Icon */}
                {renderPaymentIcon(type)}

                {/* Label */}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={['text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-700'].join(' ')}>
                    {getPaymentTypeLabel(type, locale)}
                  </span>
                  {type === PAYMENT_TYPE.BALANCE && userBalance !== undefined && (
                    <span className={['mt-1 text-xs', isDark ? 'text-emerald-300/80' : 'text-emerald-600'].join(' ')}>
                      {pickLocaleText(
                        locale,
                        `当前余额 ¥${userBalance.toFixed(2)}，支付后剩余 ¥${Math.max(userBalance - plan.price, 0).toFixed(2)}`,
                        `Current balance ¥${userBalance.toFixed(2)}, remaining ¥${Math.max(userBalance - plan.price, 0).toFixed(2)}`,
                      )}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {!canUseBalance && userBalance !== undefined && (
          <p className={['mt-2 text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
            {pickLocaleText(
              locale,
              `当前余额 ¥${userBalance.toFixed(2)}，不足以支付该套餐`,
              `Current balance is ¥${userBalance.toFixed(2)}, which is not enough for this plan`,
            )}
          </p>
        )}
      </div>

      {/* Amount to pay */}
      <div
        className={[
          'flex items-center justify-between rounded-xl border px-4 py-3',
          isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50',
        ].join(' ')}
      >
        <span className={['text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
          {pickLocaleText(locale, '应付金额', 'Amount Due')}
        </span>
        <span className="text-xl font-bold text-emerald-500">¥{plan.price}</span>
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={!effectiveSelectedPayment || loading}
        onClick={handleSubmit}
        className={[
          'w-full rounded-xl py-3 text-sm font-bold text-white transition-colors',
          effectiveSelectedPayment && !loading
            ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
            : isDark
              ? 'cursor-not-allowed bg-slate-700 text-slate-400'
              : 'cursor-not-allowed bg-slate-200 text-slate-400',
        ].join(' ')}
      >
        {loading ? pickLocaleText(locale, '处理中...', 'Processing...') : pickLocaleText(locale, '立即购买', 'Buy Now')}
      </button>
    </div>
  );
}
