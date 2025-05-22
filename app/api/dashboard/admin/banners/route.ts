import { NextRequest, NextResponse } from 'next/server';

import { UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = value;
      } else if (key === 'startDate' || key === 'endDate') {
        data[key] = value ? new Date(value as string) : null;
      } else {
        data[key] = value;
      }
    }

    // Upload image
    let imageData = null;
    const imageFile = data.image;

    if (imageFile instanceof File && imageFile.size > 0) {
      const result = await UploadImage(imageFile, 'banners');
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: data.title || 'Banner Image',
      };
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image upload failed or missing' },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        title: data.title,
        subTitle: data.subtitle || null,
        description: data.description || null,
        bannerTag: data.bannerTag || null,
        alignment: data.alignment || 'center',
        primaryActionText: data.primaryActionText || null,
        primaryActionLink: data.primaryActionLink || null,
        secondaryActionText: data.secondaryActionText || null,
        secondaryActionLink: data.secondaryActionLink || null,
        bannerPosition: data.bannerPosition || 'home_top',
        startDate: data.startDate,
        endDate: data.endDate,
        image: imageData,
      },
    });

    return NextResponse.json(
      { message: 'Banner created successfully', banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling banner submission:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        image: true,
      },
    });
    return NextResponse.json(banners, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
