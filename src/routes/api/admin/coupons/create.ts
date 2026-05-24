import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit-log';

export const Route = createFileRoute('/api/admin/coupons/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (
            !session?.user ||
            (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
          ) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body = await request.json();
          const {
            code,
            description,
            type,
            value,
            minOrderAmount,
            maxDiscount,
            minQuantity,
            freeShipping,
            shippingDiscount,
            bogoBuyQty,
            bogoFreeQty,
            scope,
            scopeId,
            maxUses,
            maxUsesPerUser,
            maxClaimCount,
            firstOrderOnly,
            repeatPurchaseOnly,
            requiredPaymentMethod,
            platformRestriction,
            autoApply,
            startsAt,
            expiresAt,
            isActive,
            tiers,
          } = body;

          if (!code || !type || value === undefined || !scope) {
            return Response.json(
              { error: 'Missing required fields: code, type, value, scope' },
              { status: 400 },
            );
          }

          const existing = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
          });
          if (existing) {
            return Response.json(
              { error: 'A coupon with this code already exists' },
              { status: 409 },
            );
          }

          const coupon = await prisma.coupon.create({
            data: {
              code: code.toUpperCase(),
              description,
              type,
              value,
              minOrderAmount: minOrderAmount || null,
              maxDiscount: maxDiscount || null,
              minQuantity: minQuantity || null,
              freeShipping: freeShipping || false,
              shippingDiscount: shippingDiscount || null,
              bogoBuyQty: bogoBuyQty || null,
              bogoFreeQty: bogoFreeQty || null,
              scope,
              scopeId: scopeId || null,
              maxUses: maxUses || 0,
              maxUsesPerUser: maxUsesPerUser || 0,
              maxClaimCount: maxClaimCount || 0,
              firstOrderOnly: firstOrderOnly || false,
              repeatPurchaseOnly: repeatPurchaseOnly || false,
              requiredPaymentMethod: requiredPaymentMethod || null,
              platformRestriction: platformRestriction || 'ALL',
              autoApply: autoApply || false,
              startsAt: startsAt ? new Date(startsAt) : null,
              expiresAt: expiresAt ? new Date(expiresAt) : null,
              isActive: isActive !== undefined ? isActive : true,
              ...(tiers?.length
                ? {
                    tiers: {
                      create: tiers.map(
                        (t: {
                          minQuantity: number;
                          value: number;
                          type?: string;
                        }) => ({
                          minQuantity: t.minQuantity,
                          value: t.value,
                          type: t.type || null,
                        }),
                      ),
                    },
                  }
                : {}),
            },
            include: { _count: { select: { usages: true } } },
          });

          await createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role,
            action: 'COUPON_CREATED',
            entity: 'Coupon',
            entityId: coupon.id,
            details: { code: coupon.code, type, value, scope },
            ipAddress: headers.get('x-forwarded-for') || undefined,
          });

          return Response.json({ coupon }, { status: 201 });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },
    },
  },
});
