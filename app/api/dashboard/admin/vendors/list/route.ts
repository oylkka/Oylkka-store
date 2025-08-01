import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json('Unauthorized', { status: 401 });
  }
  try {
    const vendors = await db.user.findMany({
      where: {
        role: 'VENDOR',
      },
      select: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        image: true,
        isActive: true,
        phoneVerified: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return NextResponse.json(vendors, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
