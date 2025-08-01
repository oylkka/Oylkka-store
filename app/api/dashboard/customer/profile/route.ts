import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { DeleteImage, UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    const id = session.user.id;
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });
    return NextResponse.json(user, {
      status: 200,
    });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.formData();

    const name =
      typeof data.get('name') === 'string'
        ? (data.get('name') as string)
        : null;
    const email =
      typeof data.get('email') === 'string'
        ? (data.get('email') as string)
        : null;
    const username =
      typeof data.get('username') === 'string'
        ? (data.get('username') as string)
        : null;
    const phone =
      typeof data.get('phone') === 'string'
        ? (data.get('phone') as string)
        : null;
    const profileImage = data.get('profileImage');

    if (!name || !email || !username) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if username is unique
    const usernameExists = await db.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });

    if (usernameExists) {
      return NextResponse.json(
        { message: 'Username is already taken' },
        { status: 409 },
      );
    }

    let uploadedImage = null;

    if (profileImage && typeof profileImage !== 'string') {
      // If user had previous image, delete it
      if (existingUser.imageId) {
        await DeleteImage(existingUser.imageId);
      }

      uploadedImage = await UploadImage(
        profileImage as File,
        'user-profile-images',
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        username,
        phone,
        ...(uploadedImage && {
          image: uploadedImage.secure_url,
          imageId: uploadedImage.public_id,
        }),
      },
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
