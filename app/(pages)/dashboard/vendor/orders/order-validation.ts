interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Final state
  CANCELLED: [], // Final state
};

const PAYMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'FAILED'],
  PAID: ['REFUNDED'],
  FAILED: ['PAID'], // Allow retry
  REFUNDED: [], // Final state
};

export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): ValidationResult {
  if (currentStatus === newStatus) {
    return { isValid: true };
  }

  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      message: `Cannot change status from ${currentStatus} to ${newStatus}`,
    };
  }

  return { isValid: true };
}

export function validatePaymentStatusTransition(
  currentStatus: string,
  newStatus: string
): ValidationResult {
  if (currentStatus === newStatus) {
    return { isValid: true };
  }

  const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      message: `Cannot change payment status from ${currentStatus} to ${newStatus}`,
    };
  }

  return { isValid: true };
}
