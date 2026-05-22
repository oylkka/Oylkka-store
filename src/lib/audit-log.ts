import { prisma } from '@/lib/db';

type AuditAction =
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'ORDER_FULFILLED'
  | 'SHOP_APPROVED'
  | 'SHOP_REJECTED'
  | 'SHOP_SUSPENDED'
  | 'PRODUCT_REMOVED'
  | 'USER_BANNED'
  | 'USER_ROLE_CHANGED'
  | 'PAYOUT_PROCESSED'
  | 'COUPON_CREATED'
  | 'COUPON_MODIFIED'
  | 'BANNER_CREATED'
  | 'BANNER_MODIFIED'
  | 'BANNER_REMOVED'
  | 'REVIEW_MODERATED';

export async function createAuditLog({
  actorId,
  actorRole,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  actorId: string;
  actorRole: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId,
      actorRole,
      action,
      entity,
      entityId,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      ipAddress: ipAddress ?? undefined,
    },
  });
}
