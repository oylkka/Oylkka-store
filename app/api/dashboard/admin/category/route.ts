import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany();
    if (!categories) {
      return NextResponse.json('Not Found', { status: 404 });
    }
    return NextResponse.json(categories, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
