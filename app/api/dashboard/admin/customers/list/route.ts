import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    const user = await db.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        username: true,
        phone: true,
        image: true,
        isActive: true,
        phoneVerified: true,
        emailVerified: true,
      },
    });
    if (!user) {
      return NextResponse.json('Not Found', { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
