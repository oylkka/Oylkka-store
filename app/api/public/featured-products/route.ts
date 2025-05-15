import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        featured: true,
      },
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        slug: true,
        stock: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        freeShipping: true,
        discountPercent: true,
        updatedAt: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!products) {
      return new Response('Not Found', { status: 404 });
    }
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
