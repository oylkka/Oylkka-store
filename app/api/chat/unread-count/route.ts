import { NextResponse } from 'next/server';
import { getUnreadMessageCount } from '@/actions/chat';

export async function GET() {
  try {
    const unreadCount = await getUnreadMessageCount();
    return NextResponse.json({ unreadCount });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch unread message count' },
      { status: 500 },
    );
  }
}
