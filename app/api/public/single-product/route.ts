import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
            id: true,
          },
        },
        reviews: true,
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
