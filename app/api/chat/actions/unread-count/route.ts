import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await db.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
        },
        senderId: { not: user.id },
        NOT: {
          readBy: {
            has: user.id,
          },
        },
      },
    });

    return NextResponse.json({ unreadCount });
    // biome-ignore lint: error
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
