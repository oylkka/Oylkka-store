'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface OrderItemsPopoverProps {
  orderNumber: string;
  items: Array<{
    id: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
}

export function OrderItemsPopover({
  orderNumber,
  items,
}: OrderItemsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="text-blue-600 hover:text-blue-800"
          onClick={(e) => e.stopPropagation()}
          aria-label={`View items for order ${orderNumber}`}
        >
          {items.length} Item{items.length !== 1 ? 's' : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Order Items ({items.length})</h4>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} (x{item.quantity})
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
