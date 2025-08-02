import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reviews = await db.review.findMany({
      where: {
        product: {
          shop: {
            ownerId: user.id,
          },
        },
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            slug: true,
            productName: true,
            images: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(reviews, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
