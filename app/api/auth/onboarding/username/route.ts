import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    // Check if this is the user's current username
    const currentUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        username: true,
      },
    });

    // If the user is trying their current username, it's automatically available
    if (currentUser?.username === username) {
      return NextResponse.json({ available: true });
    }

    // Reserved usernames that can't be used
    const reservedUsernames = [
      'admin',
      'root',
      'system',
      'moderator',
      'support',
      'help',
      'info',
      'contact',
      'about',
      'login',
      'signup',
      'register',
      'account',
      'profile',
      'settings',
      'dashboard',
    ];

    const isReserved = reservedUsernames.includes(username.toLowerCase());

    // Check if username exists in database
    const existingUser = await db.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser || isReserved) {
      // Generate multiple suggestions for better user experience
      const suggestions = [];

      // Add variants with numbers
      for (let i = 0; i < 3; i++) {
        suggestions.push(`${username}${Math.floor(Math.random() * 1000)}`);
      }

      // Add a variant with year
      const currentYear = new Date().getFullYear();
      suggestions.push(`${username}${currentYear}`);

      return NextResponse.json({
        available: false,
        suggestions: suggestions,
        message: isReserved
          ? 'This username is reserved'
          : 'This username is already taken',
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    );
  }
}
