import { randomUUID } from 'crypto';

import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    const oauth2Client = new google.auth.OAuth2();
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let userInDb = await db.user.findUnique({ where: { email } });
    if (!userInDb) {
      userInDb = await db.user.create({
        data: {
          email,
          name,
          image: picture,
          // Add any defaults you want here (e.g., role)
        },
      });
    }

    // Ensure Account exists for Google provider
    const existingAccount = await db.account.findFirst({
      where: {
        userId: userInDb.id,
        provider: 'google',
        providerAccountId: googleId,
      },
    });

    if (!existingAccount) {
      await db.account.create({
        data: {
          userId: userInDb.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleId,
          // Optionally store tokens if you have them
        },
      });
    }

    // Create a session record (optional but recommended for consistency)
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry

    await db.session.create({
      data: {
        userId: userInDb.id,
        sessionToken,
        expires: expiresAt,
      },
    });

    // Create JWT for mobile client usage
    const token = jwt.sign(
      {
        userId: userInDb.id,
        email: userInDb.email,
        image: userInDb.image,
        name: userInDb.name,
        role: userInDb.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      { message: 'Success', token, user: userInDb, sessionToken },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
