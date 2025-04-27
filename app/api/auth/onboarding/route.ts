import { NextRequest, NextResponse } from "next/server";

import { DeleteImage, UploadImage } from "@/features/cloudinary"; // Assuming these handle Cloudinary uploads and deletes
import { db } from "@/lib/db"; // Assuming Prisma is set up to interact with the DB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Prepare a data object to store the form data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Validate that required fields are present
    if (!data.id || !data.shopName || !data.shopSlug) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Set avatar if provided
    const avatar = formData.get("avatar");
    if (avatar && avatar instanceof File) {
      data.avatar = avatar;
    }

    // Handle other shop-related fields
    const shopLogo = formData.get("shopLogo");
    const shopBanner = formData.get("shopBanner");

    // Get user to check for existing image to delete (if any)
    const existingUser = await db.user.findUnique({
      where: { id: data.id },
      select: { imageId: true },
    });

    let uploadedAvatar = null;
    let uploadedShopLogo = null;
    let uploadedShopBanner = null;

    // Upload avatar image if present
    if (data.avatar instanceof File) {
      uploadedAvatar = await UploadImage(data.avatar, "users/avatar");
      if (existingUser?.imageId) {
        await DeleteImage(existingUser.imageId);
      }
    }

    // Upload shop logo if present
    if (shopLogo && shopLogo instanceof File) {
      uploadedShopLogo = await UploadImage(shopLogo, "shops/logo");
    }

    // Upload shop banner if present
    if (shopBanner && shopBanner instanceof File) {
      uploadedShopBanner = await UploadImage(shopBanner, "shops/banner");
    }

    // Prepare form values to update the user and shop data
    const updatedUserData = {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone || null,
      role: data.role || "CUSTOMER",
      hasOnboarded: true,
      image: uploadedAvatar?.secure_url ?? undefined,
      imageId: uploadedAvatar?.public_id ?? undefined,
    };

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: updatedUserData,
    });

    // Update the shop information if it exists
    const updatedShopData = {
      name: data.shopName,
      slug: data.shopSlug,
      description: data.shopDescription,
      logo: uploadedShopLogo
        ? {
            url: uploadedShopLogo.secure_url,
            publicId: uploadedShopLogo.public_id,
          }
        : undefined,
      bannerImage: uploadedShopBanner
        ? {
            url: uploadedShopBanner.secure_url,
            publicId: uploadedShopBanner.public_id,
          }
        : undefined,
      shopEmail: data.shopEmail,
      shopPhone: data.shopPhone,
      address: data.shopAddress,
      socialLinks: {
        facebook: data["socialLinks[facebook]"],
        twitter: data["socialLinks[twitter]"],
        intagram: data["socialLinks[intagram]"],
        linkedin: data["socialLinks[linkedin]"],
        website: data["socialLinks[website]"],
      },
    };

    // If shop does not exist, create it
    const existingShop = await db.shop.findUnique({
      where: { ownerId: data.id },
    });

    let shop;
    if (existingShop) {
      shop = await db.shop.update({
        where: { ownerId: data.id },
        data: updatedShopData,
      });
    } else {
      shop = await db.shop.create({
        data: {
          ownerId: data.id,
          ...updatedShopData,
        },
      });
    }

    // Return a success response
    return NextResponse.json(
      {
        message: "User onboarded successfully",
        user: updatedUser,
        shop,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 },
    );
  }
}
