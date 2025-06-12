'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateOrderStatus } from '@/services';

import { validateStatusTransition } from './order-validation';

interface OrderStatusManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  onUpdate: () => void;
}

export function OrderStatusManager({
  order,
  onUpdate,
}: OrderStatusManagerProps) {
  const [tempOrderStatus, setTempOrderStatus] = useState(order.status);
  const [tempPaymentStatus, setTempPaymentStatus] = useState(
    order.paymentStatus
  );

  const updateOrderMutation = useUpdateOrderStatus();

  // Check if there are pending changes
  const hasPendingChanges =
    tempOrderStatus !== order.status ||
    tempPaymentStatus !== order.paymentStatus;

  // Handle bulk status update with security checks
  const handleStatusUpdate = async () => {
    if (!hasPendingChanges) {
      return;
    }

    // Validate status transitions
    const orderStatusValid = validateStatusTransition(
      order.status,
      tempOrderStatus
    );
    const paymentStatusValid = validateStatusTransition(
      order.paymentStatus,
      tempPaymentStatus
    );

    if (!orderStatusValid.isValid) {
      toast('Invalid Status Transition');
      return;
    }

    if (!paymentStatusValid.isValid) {
      toast('Invalid Payment Status Transition');
      return;
    }

    const updateData = {
      orderId: order.id,
      vendorId: order.vendorId, // Make sure this exists on your order object
      ...(tempOrderStatus !== order.status && {
        orderStatus: tempOrderStatus,
      }),
      ...(tempPaymentStatus !== order.paymentStatus && {
        paymentStatus: tempPaymentStatus,
      }),
    };

    updateOrderMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Order status updated successfully');
        onUpdate(); // Refresh the orders list
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        console.error('Failed to update order status:', error);

        // Handle specific error cases
        if (error.status === 403) {
          toast.error('Access Denied');
        } else if (error.status === 429) {
          toast.error('Rate Limit Exceeded');
        } else {
          toast.error('Update Failed');
        }

        // Reset to original values on error
        setTempOrderStatus(order.status);
        setTempPaymentStatus(order.paymentStatus);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Order Status Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Order Status</h4>
        <Select
          value={tempOrderStatus}
          onValueChange={setTempOrderStatus}
          disabled={updateOrderMutation.isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Status Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Payment Status</h4>
        <Select
          value={tempPaymentStatus}
          onValueChange={setTempPaymentStatus}
          disabled={updateOrderMutation.isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Update Button */}
      {hasPendingChanges && (
        <div className="pt-2">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleStatusUpdate}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      )}
    </div>
  );
}
