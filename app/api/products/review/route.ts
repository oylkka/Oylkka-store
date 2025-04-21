import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // const formData = await req.formData();
    // console.log(formData);
    return new NextResponse('OK', { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
