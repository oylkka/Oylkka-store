import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';
    const product = await db.product.findUnique({
      where: { slug },

      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            ownerId: true,
            logo: {
              select: {
                url: true,
              },
            },
            bannerImage: {
              select: {
                url: true,
              },
            },
            isVerified: true,
          },
        },
        variants: true,
      },
    });
    return NextResponse.json({ product }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
