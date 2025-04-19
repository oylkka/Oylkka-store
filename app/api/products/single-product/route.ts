import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { UploadImage } from '@/service/upload-image';

// Schema for product validation
const productSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  price: z.number().positive('Price must be positive'),
  discountPrice: z
    .number()
    .positive('Discount price must be positive')
    .optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockAlert: z.number().int().min(1).default(5),
  condition: z.enum([
    'NEW',
    'USED',
    'LIKE_NEW',
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR',
    'FOR_PARTS',
  ]),
  conditionDescription: z.string().optional(),
  weight: z.number().positive().optional(),
  weightUnit: z.string().default('kg'),
  freeShipping: z.boolean().default(false),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK'])
    .default('DRAFT'),
  tags: z.array(z.string()).default([]),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.string(),
    })
    .optional(),
  attributes: z.record(z.array(z.string())).optional(),
  sku: z.string().min(1, 'SKU is required'),
  brand: z
    .string()
    .max(40, { message: 'Brand must be at most 40 characters' })
    .default('No Brand'),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await req.formData();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData: Record<string, any> = {};
    const imageFiles: File[] = [];

    // Process form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'productImages[]' || key === 'productImages') {
        if (value instanceof File) {
          imageFiles.push(value);
        }
      } else {
        try {
          productData[key] =
            value instanceof File ? value : JSON.parse(value as string);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          productData[key] = value;
        }
      }
    }

    // Validate product data
    const validatedData = productSchema.safeParse(productData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Ensure SKU is unique
    const existingSku = await db.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: { sku: ['SKU already exists'] },
        },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const imageUploads = [];
    for (const imageFile of imageFiles) {
      try {
        const uploadResult = await UploadImage(imageFile, 'products');
        imageUploads.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue with other images if one fails
      }
    }

    // Create product in database with the simpler Image type
    const product = await db.product.create({
      data: {
        productName: productData.productName,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory,
        price: parseFloat(productData.price),
        discountPrice: productData.discountPrice
          ? parseFloat(productData.discountPrice)
          : undefined,
        discountPercent: productData.discountPercent
          ? parseFloat(productData.discountPercent)
          : undefined,
        stock: parseInt(productData.stock),
        lowStockAlert: parseInt(productData.lowStockAlert) || 5,
        condition: productData.condition,
        conditionDescription: productData.conditionDescription,
        weight: productData.weight ? parseFloat(productData.weight) : undefined,
        weightUnit: productData.weightUnit || 'kg',
        brand: productData.brand || 'No Brand',
        freeShipping: Boolean(productData.freeShipping),
        status: productData.status || 'DRAFT',
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        sku: productData.sku,
        dimensions: productData.dimensions
          ? {
              length: parseFloat(productData.dimensions.length),
              width: parseFloat(productData.dimensions.width),
              height: parseFloat(productData.dimensions.height),
              unit: productData.dimensions.unit,
            }
          : undefined,
        attributes: productData.attributes || {},
        createdBy: userId,
        // Create images with just url and publicId fields
        images: imageUploads.map((img) => ({
          url: img.url,
          publicId: img.publicId,
        })),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: {
          id: product.id,
          productName: product.productName,
          status: product.status,
          sku: product.sku,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || '';
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
            id: true,
          },
        },
        reviews: true,
      },
    });
    return NextResponse.json({ product });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
