import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    const id = session.user.id;
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });
    return NextResponse.json(user, {
      status: 200,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
