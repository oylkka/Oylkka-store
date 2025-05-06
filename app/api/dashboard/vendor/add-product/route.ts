import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

interface Variant {
  id?: string;
  name?: string;
  sku?: string;
  price?: string;
  discountPrice?: string;
  discountPercent?: string;
  stock?: string;
  attributes?: Record<string, string>;
}
function getArrayValue(formData: FormData, key: string): string[] {
  const values = formData.getAll(key);
  return values.map((value) => (typeof value === 'string' ? value : ''));
}

function getFileValues(formData: FormData, key: string): File[] {
  const files = formData.getAll(key);
  return files.filter((file) => file instanceof File) as File[];
}

function mapFormData(formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedData: Record<string, any> = {};

  // Handle all base key-value pairs
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      mappedData[key] = value;
    } else if (value instanceof File) {
      mappedData[key] = value;
    }
  });

  // Explicitly parse known arrays and files
  if (formData.has('productImages')) {
    mappedData.productImages = getFileValues(formData, 'productImages');
  }

  if (formData.has('tags')) {
    mappedData.tags = getArrayValue(formData, 'tags');
  }

  // ✅ Correctly handle parsing `variants`
  if (mappedData.variants) {
    try {
      mappedData.variants = JSON.parse(mappedData.variants);
    } catch (error) {
      console.error('❌ Failed to parse variants:', error);
      mappedData.variants = [];
    }
  } else {
    mappedData.variants = [];
  }

  // Handle variant images (if any)
  mappedData.variantImages = {};
  formData.forEach((value, key) => {
    if (key.startsWith('variantImage_') && value instanceof File) {
      const variantId = key.replace('variantImage_', '');
      mappedData.variantImages[variantId] = value;
    }
  });

  return mappedData;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const shop = await db.shop.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json(
        { message: 'Create a shop first' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const mappedData = mapFormData(formData);

    // Upload product images
    const productImageUploads = await Promise.all(
      (mappedData.productImages || []).map(async (file: File) => {
        try {
          const result = await UploadImage(file, 'products');
          return {
            url: result.secure_url,
            publicId: result.public_id,
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return null;
        }
      })
    );
    const productImages = productImageUploads.filter(Boolean);

    // Upload variant images only if the variant has an image
    const variantImageUploads: Record<
      string,
      { url: string; publicId: string }
    > = {};
    for (const [variantId, file] of Object.entries(mappedData.variantImages)) {
      if (file instanceof File) {
        try {
          const result = await UploadImage(file as File, 'product-variants');
          variantImageUploads[variantId] = {
            url: result.secure_url,
            publicId: result.public_id,
          };
        } catch (error) {
          console.error(
            `❌ Variant image upload failed for ${variantId}:`,
            error
          );
        }
      }
    }

    // Parse product data
    const price = parseFloat(mappedData.price) || 0;
    const discountPrice = mappedData.discountPrice
      ? parseFloat(mappedData.discountPrice)
      : null;
    const discountPercent = mappedData.discountPercent
      ? parseFloat(mappedData.discountPercent)
      : null;
    const stock = parseInt(mappedData.stock) || 0;
    const weight = mappedData.weight ? parseFloat(mappedData.weight) : null;
    const freeShipping = mappedData.freeShipping === 'true';
    const featured = mappedData.featured === 'true';

    // Map variant data
    const variantsData = (mappedData.variants || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (variant: any, index: number) => {
        const variantId = variant.id || `auto-${index}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantData: any = {
          name: variant.name || '',
          sku: variant.sku || '',
          price: parseFloat(variant.price) || price,
          discountPrice: variant.discountPrice
            ? parseFloat(variant.discountPrice)
            : null,
          discountPercent: variant.discountPercent
            ? parseFloat(variant.discountPercent)
            : null,
          stock: parseInt(variant.stock) || 0,
          attributes: variant.attributes || {},
        };

        // Only add the image if the variant has one
        if (variantImageUploads[variantId]) {
          variantData.image = variantImageUploads[variantId];
        }

        return variantData;
      }
    );

    const categoryId = await db.category.findUnique({
      where: { slug: mappedData.category },
      select: { id: true },
    });

    if (!categoryId) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        productName: mappedData.productName,
        slug: mappedData.slug,
        description: mappedData.description,
        categoryId: categoryId.id,
        tags: mappedData.tags || [],
        sku: mappedData.sku,
        price,
        discountPrice,
        discountPercent,
        stock,
        brand: mappedData.brand || null,
        condition: mappedData.condition,
        conditionDescription: mappedData.conditionDescription || '',
        shopId: shop.id,
        featured,
        freeShipping,
        weight,
        images: productImages,
        createdBy: session.user.id,
      },
    });

    // Create variants
    if (variantsData.length > 0) {
      await db.productVariant.createMany({
        data: variantsData.map((variant: Variant) => ({
          ...variant,
          productId: product.id,
        })),
      });
    }

    return NextResponse.json(
      { message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Product creation error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
