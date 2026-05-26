import type { prisma } from '@/lib/db';

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function decrementStock(
  tx: PrismaTx,
  productId: string,
  quantity: number,
  productName: string,
): Promise<void> {
  const { count } = await tx.product.updateMany({
    where: { id: productId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  if (count === 0) {
    throw new Error(`"${productName}" is out of stock`);
  }
}

export async function decrementVariantStock(
  tx: PrismaTx,
  variantId: string,
  quantity: number,
  variantName: string,
): Promise<void> {
  const { count } = await tx.productVariant.updateMany({
    where: { id: variantId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  if (count === 0) {
    throw new Error(`"${variantName}" is out of stock`);
  }
}

export async function incrementStock(
  tx: PrismaTx,
  productId: string,
  quantity: number,
): Promise<void> {
  await tx.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } },
  });
}

export async function incrementVariantStock(
  tx: PrismaTx,
  variantId: string,
  quantity: number,
): Promise<void> {
  await tx.productVariant.update({
    where: { id: variantId },
    data: { stock: { increment: quantity } },
  });
}
