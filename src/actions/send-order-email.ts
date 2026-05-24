import { prisma } from '@/lib/db';
import { orderConfirmationHtml, orderShippedHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            productName: true,
            variantName: true,
            imageUrl: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
      },
    });

    if (!order) return;

    await sendEmail({
      to: order.shippingEmail,
      subject: `Order #${order.orderNumber} Confirmed`,
      meta: {
        description: '',
        link: '',
        callToActionText: '',
      },
      html: orderConfirmationHtml({
        orderNumber: order.orderNumber,
        customerName: order.shippingName,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        currency: order.currency,
        items: order.items.map((item) => ({
          productName: item.productName,
          variantName: item.variantName,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
      }),
    });
  } catch (_error) {
    // Email failures should never break the order flow
  }
}

export async function sendOrderShippedNotification(
  orderId: string,
  itemId: string,
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        shippingName: true,
        shippingEmail: true,
      },
    });

    if (!order) return;

    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      select: {
        productName: true,
        variantName: true,
        imageUrl: true,
        quantity: true,
        trackingNumber: true,
        trackingUrl: true,
      },
    });

    if (!item) return;

    await sendEmail({
      to: order.shippingEmail,
      subject: `Item Shipped — #${order.orderNumber}`,
      meta: {
        description: '',
        link: '',
        callToActionText: '',
      },
      html: orderShippedHtml(
        {
          orderNumber: order.orderNumber,
          customerName: order.shippingName,
        },
        {
          productName: item.productName,
          variantName: item.variantName,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          trackingNumber: item.trackingNumber,
          trackingUrl: item.trackingUrl,
        },
      ),
    });
  } catch (_error) {
    // Email failures should never break the order flow
  }
}
