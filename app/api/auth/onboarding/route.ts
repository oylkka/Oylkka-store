import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';

import { UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface FormFields {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string | File;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';

  shopName?: string;
  shopSlug?: string;
  shopLogo?: File;
  shopBanner?: File;
  shopDescription?: string;
  shopEmail?: string;
  shopPhone?: string;
  shopCategory?: string;
  shopAddress?: string;
  socialLinks?: SocialLinks;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const data: FormFields = {
      id: formData.get('id') as string,
      username: formData.get('username') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string | undefined,
      avatar: formData.get('avatar') as string | File,
      role: formData.get('role') as 'CUSTOMER' | 'VENDOR' | 'ADMIN',

      shopName: formData.get('shopName') as string | undefined,
      shopSlug: formData.get('shopSlug') as string | undefined,
      shopLogo: formData.get('shopLogo') as File | undefined,
      shopBanner: formData.get('shopBanner') as File | undefined,
      shopDescription: formData.get('shopDescription') as string | undefined,
      shopEmail: formData.get('shopEmail') as string | undefined,
      shopPhone: formData.get('shopPhone') as string | undefined,
      shopCategory: formData.get('shopCategory') as string | undefined,
      shopAddress: formData.get('shopAddress') as string | undefined,
      socialLinks: {
        facebook: formData.get('socialLinks[facebook]') as string | undefined,
        instagram: formData.get('socialLinks[instagram]') as string | undefined,
        twitter: formData.get('socialLinks[twitter]') as string | undefined,
        linkedin: formData.get('socialLinks[linkedin]') as string | undefined,
        website: formData.get('socialLinks[website]') as string | undefined,
      },
    };

    // Basic validation
    const requiredFields: (keyof FormFields)[] = [
      'id',
      'username',
      'name',
      'email',
      'role',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    if (data.role === 'VENDOR') {
      if (!data.shopName || !data.shopSlug) {
        return NextResponse.json(
          { message: 'Vendor must provide both shopName and shopSlug' },
          { status: 400 },
        );
      }
    }

    const user = await db.user.findUnique({
      where: { id: data.id },
    });

    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }

    // =================
    // Start Uploading
    // =================
    let avatarUploadResult = null;
    let shopLogoUploadResult = null;
    let shopBannerUploadResult = null;

    // Upload avatar if it's a File
    if (data.avatar instanceof File) {
      avatarUploadResult = await UploadImage(data.avatar, 'avatars');
    }

    // Upload shop logo if it's a File
    if (data.role === 'VENDOR' && data.shopLogo instanceof File) {
      shopLogoUploadResult = await UploadImage(data.shopLogo, 'shop-logos');
    }

    // Upload shop banner if it's a File
    if (data.role === 'VENDOR' && data.shopBanner instanceof File) {
      shopBannerUploadResult = await UploadImage(
        data.shopBanner,
        'shop-banners',
      );
    }

    // =================
    // Update User
    // =================
    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        username: data.username,
        phone: data.phone,
        role: data.role,
        ...(avatarUploadResult && {
          image: avatarUploadResult.secure_url,
          imageId: avatarUploadResult.public_id,
        }),
        hasOnboarded: true,
      },
    });

    // =================
    // Create Shop if Vendor
    // =================
    if (data.role === 'VENDOR') {
      const existingShop = await db.shop.findUnique({
        where: {
          ownerId: data.id,
        },
      });

      if (!existingShop) {
        await db.shop.create({
          data: {
            // biome-ignore lint: error
            name: data.shopName!,
            // biome-ignore lint: error
            slug: data.shopSlug!,
            ownerId: data.id,
            logo: {
              publicId: shopLogoUploadResult?.public_id || '',
              url: shopLogoUploadResult?.secure_url || '',
            },
            bannerImage: {
              publicId: shopBannerUploadResult?.public_id || '',
              url: shopBannerUploadResult?.secure_url || '',
            },
            description: data.shopDescription,
            shopEmail: data.shopEmail,
            shopPhone: data.shopPhone,
            address: data.shopAddress,
            socialLinks: {
              facebook: data.socialLinks?.facebook,
              instagram: data.socialLinks?.instagram,
              twitter: data.socialLinks?.twitter,
              linkedin: data.socialLinks?.linkedin,
              website: data.socialLinks?.website,
            },
          },
        });

        // Notify admin of new vendor
        const admins = await db.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        for (const admin of admins) {
          await db.notification.create({
            data: {
              type: 'INFO',
              title: 'New Vendor',
              recipientId: admin.id,
              message: `A new vendor has registered: ${data.shopName}`,
              actionUrl: `/admin/vendors?shopSlug=${data.shopSlug}`,
            },
          });
          // biome-ignore lint: error
          const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
          const channel = ably.channels.get(`user:${admin.id}`);
          await channel.publish('new-notification', {});
        }
      }
    }

    return NextResponse.json(
      { message: 'Success', data: updatedUser },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
