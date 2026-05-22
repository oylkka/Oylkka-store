import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const ORDER_STYLES: Record<
  string,
  { variant: BadgeVariant; className?: string; label: string }
> = {
  PENDING: { variant: 'secondary', label: 'Pending' },
  CONFIRMED: { variant: 'default', label: 'Confirmed' },
  PROCESSING: { variant: 'outline', label: 'Processing' },
  SHIPPED: {
    variant: 'default',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    label: 'Shipped',
  },
  DELIVERED: { variant: 'default', label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  REFUNDED: { variant: 'outline', label: 'Refunded' },
  PARTIALLY_REFUNDED: {
    variant: 'outline',
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    label: 'Partially Refunded',
  },
};

const PAYMENT_STYLES: Record<string, { variant: BadgeVariant; label: string }> =
  {
    PAID: { variant: 'default', label: 'Paid' },
    PENDING: { variant: 'secondary', label: 'Unpaid' },
    FAILED: { variant: 'destructive', label: 'Failed' },
    REFUNDED: { variant: 'outline', label: 'Refunded' },
    PARTIALLY_REFUNDED: { variant: 'outline', label: 'Partial Refund' },
  };

const FULFILLMENT_STYLES: Record<
  string,
  { variant: BadgeVariant; className?: string; label: string }
> = {
  PENDING: { variant: 'secondary', label: 'Pending' },
  PROCESSING: { variant: 'outline', label: 'Processing' },
  SHIPPED: {
    variant: 'default',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    label: 'Shipped',
  },
  DELIVERED: { variant: 'default', label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  REFUNDED: { variant: 'outline', label: 'Refunded' },
};

type StatusType = 'order' | 'payment' | 'fulfillment';

export function StatusBadge({
  type,
  value,
}: {
  type: StatusType;
  value: string;
}) {
  const map =
    type === 'order'
      ? ORDER_STYLES
      : type === 'payment'
        ? PAYMENT_STYLES
        : FULFILLMENT_STYLES;
  const style = map[value] || {
    variant: 'outline' as BadgeVariant,
    label: value,
  };

  return (
    <Badge
      variant={style.variant}
      className={`text-[10px] uppercase tracking-wider ${'className' in style ? style.className : ''}`}
    >
      {style.label}
    </Badge>
  );
}
