import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'VENDOR') {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    const response = await db.shop.findUnique({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!response) {
      return NextResponse.json('Not Found', { status: 404 });
    }
    return NextResponse.json(response, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
