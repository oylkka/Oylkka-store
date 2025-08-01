import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json('Not Found', { status: 404 });
    }
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });
    return NextResponse.json(user, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
