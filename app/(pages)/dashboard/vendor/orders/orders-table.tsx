'use client';

import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { OrderItemsPopover } from './order-items-popover';
import { OrderStatusManager } from './order-status-manager';

interface OrdersTableProps {
  // biome-ignore lint: error
  orders: any[];
  isPending: boolean;
  sort: string;
  onSort: (column: string) => void;
  onRefetch: () => void;
}

export function OrdersTable({
  orders,
  isPending,
  onSort,
  onRefetch,
}: OrdersTableProps) {
  const router = useRouter();

  // Skeleton rows for loading state
  const renderSkeletonRows = (count = 5) =>
    Array.from({ length: count }).map((_, index) => (
      // biome-ignore lint: error
      <TableRow key={index}>
        <TableCell>
          <Skeleton className='h-4 w-24' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-40' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-32' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-20' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-20' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-24' />
        </TableCell>
        <TableCell className='text-right'>
          <Skeleton className='ml-auto h-4 w-16' />
        </TableCell>
        <TableCell className='text-right'>
          <Skeleton className='ml-auto h-8 w-8' />
        </TableCell>
      </TableRow>
    ));

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[120px]'>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead
              className='cursor-pointer'
              onClick={() => onSort('updatedAt')}
            >
              <div className='flex items-center gap-1'>
                Date
                <ArrowUpDown className='h-3 w-3' />
              </div>
            </TableHead>
            <TableHead
              className='cursor-pointer'
              onClick={() => onSort('status')}
            >
              <div className='flex items-center gap-1'>
                Status
                <ArrowUpDown className='h-3 w-3' />
              </div>
            </TableHead>
            <TableHead
              className='cursor-pointer'
              onClick={() => onSort('paymentStatus')}
            >
              <div className='flex items-center gap-1'>
                Payment
                <ArrowUpDown className='h-3 w-3' />
              </div>
            </TableHead>
            <TableHead>Items</TableHead>
            <TableHead
              className='cursor-pointer text-right'
              onClick={() => onSort('total')}
            >
              <div className='flex items-center justify-end gap-1'>
                Total
                <ArrowUpDown className='h-3 w-3' />
              </div>
            </TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            renderSkeletonRows()
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className='py-10 text-center text-gray-500'
              >
                No orders found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() =>
                  router.push(
                    `/dashboard/vendor/orders/single-order?orderId=${order.orderNumber}`,
                  )
                }
                className='cursor-pointer'
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  router.push(`/dashboard/vendor/orders/${order.orderNumber}`)
                }
              >
                <TableCell className='font-medium'>
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className='font-medium'>{order.user.name}</p>
                    <p className='text-sm text-gray-500'>{order.user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className='text-sm'>
                    {format(new Date(order.updatedAt), 'MMM d, yyyy, hh:mm a')}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'PROCESSING'
                        ? 'outline'
                        : order.status === 'SHIPPED'
                          ? 'success'
                          : order.status === 'DELIVERED'
                            ? 'default'
                            : 'secondary'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.paymentStatus === 'PAID' ? 'default' : 'secondary'
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                  <p className='mt-1 text-xs text-gray-500'>
                    {order.paymentMethod}
                  </p>
                </TableCell>
                <TableCell>
                  <OrderItemsPopover
                    orderNumber={order.orderNumber}
                    items={order.items}
                  />
                </TableCell>
                <TableCell className='text-right'>
                  <span className='font-medium'>
                    {order.currency || 'USD'} {order.total.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        aria-label={`Actions for order ${order.orderNumber}`}
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-56'
                      align='end'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OrderStatusManager order={order} onUpdate={onRefetch} />
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
