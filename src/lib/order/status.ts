import { ORDER_STATUS, REFUND_STATUSES } from '@/lib/constants';

export type RechargeStatus = 'not_paid' | 'paid_pending' | 'recharging' | 'success' | 'failed' | 'closed';

export interface OrderStatusLike {
  status: string;
  paidAt?: Date | string | null;
  completedAt?: Date | string | null;
  orderType?: string | null;
}

export interface DerivedOrderState {
  paymentSuccess: boolean;
  rechargeSuccess: boolean;
  rechargeStatus: RechargeStatus;
}

export interface PublicOrderStatusSnapshot extends DerivedOrderState {
  id: string;
  status: string;
  expiresAt: Date | string;
  orderType?: string | null;
  failedReason?: string | null;
}

export interface OrderDisplayState {
  label: string;
  color: string;
  icon: string;
  message: string;
}

function isSubscriptionOrder(order: { orderType?: string | null }): boolean {
  return order.orderType === 'subscription';
}

const CLOSED_STATUSES = new Set<string>([
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REFUNDING,
  ORDER_STATUS.REFUNDED,
  ORDER_STATUS.REFUND_FAILED,
]);

function hasDate(value: Date | string | null | undefined): boolean {
  return Boolean(value);
}

export function isRefundStatus(status: string): boolean {
  return REFUND_STATUSES.has(status);
}

export function isRechargeRetryable(order: OrderStatusLike): boolean {
  return hasDate(order.paidAt) && order.status === ORDER_STATUS.FAILED && !isRefundStatus(order.status);
}

export function deriveOrderState(order: OrderStatusLike): DerivedOrderState {
  const paymentSuccess = hasDate(order.paidAt);
  const rechargeSuccess = hasDate(order.completedAt) || order.status === ORDER_STATUS.COMPLETED;

  if (rechargeSuccess) {
    return { paymentSuccess, rechargeSuccess: true, rechargeStatus: 'success' };
  }

  if (order.status === ORDER_STATUS.RECHARGING) {
    return { paymentSuccess, rechargeSuccess: false, rechargeStatus: 'recharging' };
  }

  if (order.status === ORDER_STATUS.FAILED) {
    return { paymentSuccess, rechargeSuccess: false, rechargeStatus: 'failed' };
  }

  if (CLOSED_STATUSES.has(order.status)) {
    return { paymentSuccess, rechargeSuccess: false, rechargeStatus: 'closed' };
  }

  if (paymentSuccess) {
    return { paymentSuccess, rechargeSuccess: false, rechargeStatus: 'paid_pending' };
  }

  return { paymentSuccess: false, rechargeSuccess: false, rechargeStatus: 'not_paid' };
}

export function getOrderDisplayState(
  order: Pick<PublicOrderStatusSnapshot, 'status' | 'paymentSuccess' | 'rechargeSuccess' | 'rechargeStatus' | 'orderType'>,
  locale: 'zh' | 'en' = 'zh',
  isDark = false,
): OrderDisplayState {
  const subscriptionOrder = isSubscriptionOrder(order);
  const successColor = isDark ? 'text-green-400' : 'text-green-600';
  const processingColor = isDark ? 'text-blue-400' : 'text-blue-600';
  const successAfterPayColor = isDark ? 'text-amber-400' : 'text-amber-600';
  const pendingColor = isDark ? 'text-yellow-400' : 'text-yellow-600';
  const neutralColor = isDark ? 'text-slate-400' : 'text-gray-500';
  const errorColor = isDark ? 'text-red-400' : 'text-red-600';

  if (order.rechargeSuccess || order.rechargeStatus === 'success') {
    if (subscriptionOrder) {
      return locale === 'en'
        ? {
            label: 'Subscription Successful',
            color: successColor,
            icon: '✓',
            message: 'Your subscription has been activated successfully.',
          }
        : {
            label: '订阅成功',
            color: successColor,
            icon: '✓',
            message: '订阅已开通成功，感谢您的购买！',
          };
    }

    return locale === 'en'
      ? {
          label: 'Recharge Successful',
          color: successColor,
          icon: '✓',
          message: 'Your balance has been credited successfully.',
        }
      : {
          label: '充值成功',
          color: successColor,
          icon: '✓',
          message: '余额已成功到账！',
        };
  }

  if (order.paymentSuccess) {
    if (order.rechargeStatus === 'paid_pending' || order.rechargeStatus === 'recharging') {
      if (subscriptionOrder) {
        return locale === 'en'
          ? {
              label: 'Subscription Processing',
              color: processingColor,
              icon: '⟳',
              message: 'Payment succeeded, and your subscription is being activated.',
            }
          : {
              label: '订阅开通中',
              color: processingColor,
              icon: '⟳',
              message: '支付成功，正在开通订阅，请稍候...',
            };
      }

      return locale === 'en'
        ? {
            label: 'Top-up Processing',
            color: processingColor,
            icon: '⟳',
            message: 'Payment succeeded, and the balance top-up is being processed.',
          }
        : {
            label: '充值处理中',
            color: processingColor,
            icon: '⟳',
            message: '支付成功，余额正在充值中...',
          };
    }

    if (order.rechargeStatus === 'failed') {
      if (subscriptionOrder) {
        return locale === 'en'
          ? {
              label: 'Payment Successful',
              color: successAfterPayColor,
              icon: '!',
              message:
                'Payment succeeded, but the subscription activation has not completed yet. The system may retry automatically. Please check again later or contact the administrator if it remains unresolved.',
            }
          : {
              label: '支付成功',
              color: successAfterPayColor,
              icon: '!',
              message: '支付已完成，但订阅开通暂未完成。系统可能会自动重试，请稍后查看订单结果或联系管理员。',
            };
      }

      return locale === 'en'
        ? {
            label: 'Payment Successful',
            color: successAfterPayColor,
            icon: '!',
            message:
              'Payment succeeded, but the balance top-up has not completed yet. The system may retry automatically. Please check again later or contact the administrator if it remains unresolved.',
          }
        : {
            label: '支付成功',
            color: successAfterPayColor,
            icon: '!',
            message: '支付成功，但余额充值暂未完成。系统可能会自动重试，请稍后查看订单结果或联系管理员。',
          };
    }
  }

  if (order.status === ORDER_STATUS.FAILED) {
    return locale === 'en'
      ? {
          label: 'Payment Failed',
          color: errorColor,
          icon: '✗',
          message:
            'Payment was not completed. Please try again. If funds were deducted but the order did not take effect, contact the administrator.',
        }
      : {
          label: '支付失败',
          color: errorColor,
          icon: '✗',
          message: '支付未完成，请重新发起支付；如已扣款未生效，请联系管理员处理。',
        };
  }

  if (order.status === ORDER_STATUS.PENDING) {
    return locale === 'en'
      ? {
          label: 'Awaiting Payment',
          color: pendingColor,
          icon: '⏳',
          message: 'The order has not been paid yet.',
        }
      : {
          label: '等待支付',
          color: pendingColor,
          icon: '⏳',
          message: '订单尚未完成支付。',
        };
  }

  if (order.status === ORDER_STATUS.EXPIRED) {
    return locale === 'en'
      ? {
          label: 'Order Expired',
          color: neutralColor,
          icon: '⏰',
          message: 'This order has expired. Please create a new order.',
        }
      : {
          label: '订单超时',
          color: neutralColor,
          icon: '⏰',
          message: '订单已超时，请重新创建订单。',
        };
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    return locale === 'en'
      ? {
          label: 'Cancelled',
          color: neutralColor,
          icon: '✗',
          message: 'The order has been cancelled.',
        }
      : {
          label: '已取消',
          color: neutralColor,
          icon: '✗',
          message: '订单已取消。',
        };
  }

  return locale === 'en'
    ? {
        label: 'Payment Error',
        color: errorColor,
        icon: '✗',
        message: 'Payment status is abnormal. Please contact the administrator.',
      }
    : {
        label: '支付异常',
        color: errorColor,
        icon: '✗',
        message: '支付状态异常，请联系管理员处理。',
      };
}
