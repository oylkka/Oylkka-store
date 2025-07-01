import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json('Not Found', { status: 404 });
    }
    const address = await db.savedAddress.findUnique({
      where: {
        id: id,
      },
    });
    return NextResponse.json(address, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      district,
      postalCode,
      isDefault,
    } = body;

    // Check if address exists and belongs to the user
    const existingAddress = await db.savedAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If new address isDefault, unset previous default
    if (isDefault) {
      await db.savedAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update the address
    const updated = await db.savedAddress.update({
      where: { id },
      data: {
        isDefault,
        address: {
          name,
          email,
          phone,
          address,
          city,
          district,
          postalCode,
          isDefault, // optional, could be redundant
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[ADDRESS_PUT]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
