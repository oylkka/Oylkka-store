import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
// biome-ignore lint: error
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.notification.deleteMany({
      where: {
        recipientId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
