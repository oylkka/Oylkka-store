import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
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

    // ✅ Unset previous default address if needed
    if (isDefault) {
      await db.savedAddress.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // ✅ Create new saved address
    const newAddress = await db.savedAddress.create({
      data: {
        userId,
        isDefault,
        address: {
          name,
          email,
          phone,
          address,
          city,
          district,
          postalCode,
          isDefault,
        },
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db.savedAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    console.error('[ADDRESS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId') || '';

    // Find the address to delete
    const address = await db.savedAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the address
    await db.savedAddress.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another one default (most recent)
    if (address.isDefault) {
      // Find another address for the user, ordered by createdAt descending
      const anotherAddress = await db.savedAddress.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (anotherAddress) {
        await db.savedAddress.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json(
      { message: 'Address deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDRESS_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
