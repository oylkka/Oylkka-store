import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
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
        { status: 404 },
      );
    }

    const productId = req.nextUrl.searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId, shopId: shop.id },
      include: {
        variants: true,
        category: {
          select: {
            slug: true,
            id: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or not owned by this shop' },
        { status: 404 },
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
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
        { status: 404 },
      );
    }

    const productId = req.nextUrl.searchParams.get('id');
    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.shopId !== shop.id) {
      return NextResponse.json(
        { message: 'Product not found or not owned by this shop' },
        { status: 404 },
      );
    }

    const formData = await req.formData();

    const getArrayValue = (key: string): string[] => {
      const values = formData.getAll(key);
      return values.map((value) => (typeof value === 'string' ? value : ''));
    };

    const getFileValues = (key: string): File[] => {
      const files = formData.getAll(key);
      return files.filter((file) => file instanceof File) as File[];
    };

    const mappedData: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        mappedData[key] = value;
      } else if (value instanceof File) {
        mappedData[key] = value;
      }
    });

    if (formData.has('productImages')) {
      mappedData.productImages = getFileValues('productImages');
    }

    if (formData.has('tags')) {
      mappedData.tags = getArrayValue('tags');
    }

    if (mappedData.variants) {
      try {
        mappedData.variants = JSON.parse(mappedData.variants as string);
      } catch {
        mappedData.variants = [];
      }
    } else {
      mappedData.variants = [];
    }

    const { UploadImage } = await import('@/features/cloudinary');

    const productImageUploads: { url: string; publicId: string }[] = [];
    if (mappedData.productImages && Array.isArray(mappedData.productImages)) {
      const uploadPromises = (mappedData.productImages as File[]).map(
        async (file: File) => {
          try {
            const result = await UploadImage(file, 'products');
            return {
              url: result.secure_url,
              publicId: result.public_id,
            };
          } catch {
            return null;
          }
        },
      );
      const uploads = await Promise.all(uploadPromises);
      productImageUploads.push(
        ...uploads.filter(
          (img): img is { url: string; publicId: string } => img !== null,
        ),
      );
    }

    const price = parseFloat(mappedData.price as string) || 0;
    const discountPrice = mappedData.discountPrice
      ? parseFloat(mappedData.discountPrice as string)
      : null;
    const discountPercent = mappedData.discountPercent
      ? parseFloat(mappedData.discountPercent as string)
      : null;
    const stock = parseInt(mappedData.stock as string) || 0;
    const weight = mappedData.weight
      ? parseFloat(mappedData.weight as string)
      : null;
    const freeShipping = mappedData.freeShipping === 'true';
    const featured = mappedData.featured === 'true';

    const categoryId = await db.category.findUnique({
      where: { slug: mappedData.category as string },
      select: { id: true },
    });

    if (!categoryId) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      );
    }

    const existingImages = product.images || [];
    const newImages = productImageUploads.map((img) => ({
      url: img.url,
      publicId: img.publicId,
    }));
    const allImages = [...existingImages, ...newImages];

    await db.product.update({
      where: { id: productId },
      data: {
        productName: mappedData.productName as string,
        slug: mappedData.slug as string,
        description: mappedData.description as string,
        categoryId: categoryId.id,
        tags: (mappedData.tags as string[]) || [],
        sku: mappedData.sku as string,
        price,
        discountPrice,
        discountPercent,
        stock,
        brand: (mappedData.brand as string) || null,
        condition: mappedData.condition as
          | 'NEW'
          | 'USED'
          | 'LIKE_NEW'
          | 'GOOD'
          | 'POOR'
          | 'FOR_PARTS',
        conditionDescription: (mappedData.conditionDescription as string) || '',
        freeShipping,
        weight,
        images: allImages,
        metaTitle: (mappedData.metaTitle as string) || null,
        metaDescription: (mappedData.metaDescription as string) || null,
        featured,
      },
    });

    if (mappedData.variants && Array.isArray(mappedData.variants)) {
      await db.productVariant.deleteMany({
        where: { productId },
      });

      const variantsData = (
        mappedData.variants as Record<string, unknown>[]
      ).map((variant) => ({
        name: (variant.name as string) || '',
        sku: (variant.sku as string) || '',
        price: parseFloat(variant.price as string) || price,
        discountPrice: variant.discountPrice
          ? parseFloat(variant.discountPrice as string)
          : null,
        discountPercent: variant.discountPercent
          ? parseFloat(variant.discountPercent as string)
          : null,
        stock: parseInt(variant.stock as string) || 0,
        attributes: (variant.attributes as Record<string, string>) || {},
        productId,
      }));

      if (variantsData.length > 0) {
        await db.productVariant.createMany({
          data: variantsData,
        });
      }
    }

    return NextResponse.json(
      { message: 'Product updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    // biome-ignore lint: error
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
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
        { status: 404 },
      );
    }

    const productId = req.nextUrl.searchParams.get('id');
    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.shopId !== shop.id) {
      return NextResponse.json(
        { message: 'Product not found or not owned by this shop' },
        { status: 404 },
      );
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    // biome-ignore lint: error
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
