import { Prisma, ProductCondition, ProductVariant } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { UploadImage } from '@/service/upload-image';

// Define types for variant options
interface VariantOption {
  id: string;
  name: string;
  values: string[];
}

// Define type for variant attributes
interface VariantAttributes {
  [key: string]: string | number | boolean;
}

/**
 * Generate all possible combinations of variant options
 */
function generateVariantCombinations(
  options: VariantOption[]
): VariantAttributes[] {
  if (!options.length) {
    return [];
  }

  function generateCombinations(
    optionIndex: number,
    currentCombination: VariantAttributes = {}
  ): VariantAttributes[] {
    if (optionIndex >= options.length) {
      return [currentCombination];
    }

    const currentOption = options[optionIndex];
    const { name, values } = currentOption;
    const combinations: VariantAttributes[] = [];

    for (const value of values) {
      const newCombination = {
        ...currentCombination,
        [name]: value,
      };

      const nextCombinations = generateCombinations(
        optionIndex + 1,
        newCombination
      );
      combinations.push(...nextCombinations);
    }

    return combinations;
  }

  return generateCombinations(0);
}

/**
 * Generate SKU for a variant based on parent SKU and attributes
 */
function generateVariantSku(
  baseSku: string,
  attributes: VariantAttributes
): string {
  const attributeCodes = Object.entries(attributes).map(([value]) => {
    if (typeof value === 'string') {
      if (value.startsWith('#')) {
        // For colors, use the hex code without #
        return value.substring(1, 4);
      }
      // For other string values, take first 2 chars
      return value.substring(0, 2).toUpperCase();
    }
    return String(value).substring(0, 2);
  });

  return `${baseSku}-${attributeCodes.join('-')}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Check for authentication
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();

    // Extract and validate basic product data
    const productName = formData.get('productname') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const sku = formData.get('sku') as string;
    const barcode = (formData.get('barcode') as string) || null;

    // Extract and validate pricing data
    const price = parseFloat(formData.get('price') as string);
    const discountPrice = formData.get('discountPrice')
      ? parseFloat(formData.get('discountPrice') as string)
      : null;
    const discountPercent = formData.get('discountPercent')
      ? parseFloat(formData.get('discountPercent') as string)
      : null;

    // Extract and validate inventory data
    const stock = parseInt(formData.get('stock') as string);
    const lowStockAlert = parseInt(formData.get('lowStockAlert') as string);

    // Extract and validate condition data
    const condition = (
      formData.get('condition') as string
    ).toUpperCase() as ProductCondition;
    const conditionDescription =
      (formData.get('conditionDescription') as string) || null;

    // Extract and validate shipping data
    const shippingClass = (formData.get('shippingClass') as string) || null;
    const freeShipping = formData.get('freeShipping') === 'true';

    // Extract and validate dimensions and weight
    const weight = formData.get('weight')
      ? parseFloat(formData.get('weight') as string)
      : null;
    const weightUnit = (formData.get('weightUnit') as string) || 'kg';
    const dimensionUnit = (formData.get('dimensionUnit') as string) || 'cm';

    // Build dimensions object if dimensions are provided
    let dimensions = null;
    const length = formData.get('length')
      ? parseFloat(formData.get('length') as string)
      : null;
    const width = formData.get('width')
      ? parseFloat(formData.get('width') as string)
      : null;
    const height = formData.get('height')
      ? parseFloat(formData.get('height') as string)
      : null;

    if (length && width && height) {
      dimensions = {
        length,
        width,
        height,
        unit: dimensionUnit,
      };
    }

    // Extract and validate SEO data
    const metaTitle = (formData.get('metaTitle') as string) || null;
    const metaDescription = (formData.get('metaDescription') as string) || null;

    // Handle image upload
    const coverImage = formData.get('coverImage') as File;
    let imageUrl = null;
    let imagePublicId = null;

    if (coverImage) {
      const uploadResult = await UploadImage(coverImage, 'products');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    // Handle variants
    const variantOptionsString = formData.get('variantOptions') as string;
    // Parse the variant options and explicitly convert to Prisma.JsonValue
    const variantOptions = variantOptionsString
      ? JSON.parse(variantOptionsString)
      : [];

    const hasVariants = variantOptions && variantOptions.length > 0;

    // Create product attributes as a plain JavaScript object that's compatible with Prisma.JsonValue
    const productAttributes: Prisma.JsonValue = {
      options: hasVariants ? variantOptions : [],
      imageUrl: imageUrl,
      imagePublicId: imagePublicId,
    };

    // Create product in database with image information
    const product = await db.product.create({
      data: {
        productName,
        description,
        category,
        subcategory,
        tags,
        sku,
        barcode,
        price,
        discountPrice,
        discountPercent,
        stock,
        lowStockAlert,
        condition,
        conditionDescription,
        weight,
        weightUnit,
        dimensions,
        shippingClass,
        freeShipping,
        metaTitle,
        metaDescription,
        hasVariants,
        // Use the Prisma.JsonValue-compatible object
        attributes: productAttributes,
        isPublished: true,
        createdBy: session.user.id,
      },
    });

    // Create variants if needed
    let variants: ProductVariant[] = [];
    if (hasVariants) {
      // Generate all possible combinations
      const combinations = generateVariantCombinations(variantOptions);

      // Distribute stock among variants
      const defaultVariantStock = Math.max(
        1,
        Math.floor(stock / combinations.length)
      );

      // Create variants
      variants = await Promise.all(
        combinations.map(async (attributes) => {
          const variantSku = generateVariantSku(sku, attributes);

          // Create variant attributes as a Prisma.JsonValue
          const variantAttributes: Prisma.JsonValue = {
            ...attributes,
            parentImageUrl: imageUrl,
            parentImagePublicId: imagePublicId,
          };

          return await db.productVariant.create({
            data: {
              productId: product.id,
              sku: variantSku,
              attributes: variantAttributes,
              price, // Use parent product price as default
              stock: defaultVariantStock,
              barcode: null,
            },
          });
        })
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product,
        variants: hasVariants ? variants : [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await db.product.findFirst();
    return new NextResponse(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new NextResponse('Failed to fetch products', { status: 500 });
  }
}
