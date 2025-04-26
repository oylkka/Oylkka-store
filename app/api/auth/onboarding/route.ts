import { db } from '@/lib/db';

import { UploadImage } from '@/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    if (!data.id) {
      return NextResponse.json({ message: 'Missing user ID' }, { status: 400 });
    }

    // Set avatar properly
    const avatar = formData.get('avatar');
    if (avatar && (avatar as File).size > 0) {
      data.avatar = avatar;
    } else {
      data.avatar = undefined;
    }

    const formValues = data;

    // Upload image if present
    let uploadedAvatar = null;
    if (formValues.avatar) {
      uploadedAvatar = await UploadImage(formValues.avatar, 'users/avatar');
    }

    // Update user in DB
    const updatedUser = await db.user.update({
      where: { id: formValues.id },
      data: {
        name: formValues.name,
        username: formValues.username,
        email: formValues.email,
        phone: formValues.phone || null,
        role: formValues.role,
        image: uploadedAvatar?.secure_url ?? undefined,
        imageId: uploadedAvatar?.public_id ?? undefined,
      },
    });

    return NextResponse.json(
      { message: 'User onboarded', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
