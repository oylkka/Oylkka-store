import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json('Success', { status: 200 });
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
