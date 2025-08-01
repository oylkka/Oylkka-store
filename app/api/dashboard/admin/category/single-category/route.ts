import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Parse the URL to extract the query parameter
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 },
      );
    }

    const category = await db.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(category, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
