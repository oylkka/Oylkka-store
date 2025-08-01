import { db } from '@/lib/db';
import type { CartItem, PaymentData } from '@/lib/types';

export async function validateCartData(cart: CartItem[]) {
  try {
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      return { valid: false, error: 'Cart is empty' };
    }

    // Extract product and variant IDs from cart
    const productIds = new Set<string>();
    const variantIds = new Set<string>();

    // Separate product IDs and variant IDs
    cart.forEach((item) => {
      if (item.variantId) {
        variantIds.add(item.variantId);
      } else {
        productIds.add(item.productId);
      }
    });

    // Fetch base products
    const baseProducts = await db.product.findMany({
      where: {
        id: {
          in: Array.from(productIds),
        },
      },
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        stock: true,
      },
    });

    // Fetch product variants
    const productVariants =
      variantIds.size > 0
        ? await db.productVariant.findMany({
            where: {
              id: {
                in: Array.from(variantIds),
              },
            },
            include: {
              product: {
                select: {
                  productName: true,
                },
              },
            },
          })
        : [];

    // Create maps for easy lookup
    const baseProductMap = new Map(
      baseProducts.map((product) => [product.id, product]),
    );

    const variantMap = new Map(
      productVariants.map((variant) => [variant.id, variant]),
    );

    // Validate each cart item
    for (const item of cart) {
      if (item.variantId) {
        // This is a variant product
        const variant = variantMap.get(item.variantId);

        if (!variant) {
          return {
            valid: false,
            error: `Product variant ${item.variantId} not found`,
          };
        }

        // Check variant price
        if (item.price !== variant.price) {
          return {
            valid: false,
            error: `Price mismatch for variant ${item.variantId}`,
          };
        }

        // Check variant discount price if applicable
        if (
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            variant.discountPrice === null) ||
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            item.discountPrice !== variant.discountPrice)
        ) {
          return {
            valid: false,
            error: `Discount price mismatch for variant ${item.variantId}`,
          };
        }

        // Check variant stock availability
        if (variant.stock < item.quantity) {
          return {
            valid: false,
            error: `Insufficient stock for variant ${item.name || variant.product.productName}`,
          };
        }

        // For variants, the name might be combined (product name + variant name)
        // We're more lenient with name validation for variants as formatting may vary
      } else {
        // This is a base product
        const product = baseProductMap.get(item.productId);

        if (!product) {
          return {
            valid: false,
            error: `Product ${item.productId} not found`,
          };
        }

        // Check product name
        if (item.name !== product.productName) {
          return {
            valid: false,
            error: `Product name mismatch for ${item.productId}`,
          };
        }

        // Check product price
        if (item.price !== product.price) {
          return {
            valid: false,
            error: `Price mismatch for ${item.productId}`,
          };
        }

        // Check product discount price if applicable
        if (
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            product.discountPrice === null) ||
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            item.discountPrice !== product.discountPrice)
        ) {
          return {
            valid: false,
            error: `Discount price mismatch for ${item.productId}`,
          };
        }

        // Check product stock availability
        if (product.stock < item.quantity) {
          return {
            valid: false,
            error: `Insufficient stock for ${item.name}`,
          };
        }
      }
    }

    return { valid: true };
    // biome-ignore lint: error
  } catch (error) {
    return { valid: false, error: 'Database error during cart validation' };
  }
}
export function validateTotalCalculation(data: PaymentData) {
  // Calculate subtotal based on cart items
  const calculatedSubtotal = data.cart.reduce((total, item) => {
    const itemPrice =
      item.discountPrice !== null && item.discountPrice !== undefined
        ? item.discountPrice
        : item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Check if calculated subtotal matches the provided subtotal
  if (calculatedSubtotal !== data.pricing.subtotal) {
    return false;
  }

  // Check if total is correct (subtotal + shipping - discount)
  const calculatedTotal =
    calculatedSubtotal +
    data.pricing.shippingCost -
    data.pricing.discount.amount;

  return calculatedTotal === data.pricing.total;
}

export function validateShipping(shipping: PaymentData['shipping']) {
  // Check if shipping method is valid
  const validMethods = ['standard', 'express', 'pickup'];
  if (!validMethods.includes(shipping.method)) {
    return false;
  }

  // Validate free shipping logic
  if (shipping.freeShippingApplied && shipping.cost !== 0) {
    return false;
  }

  // Basic validation of shipping address
  const address = shipping.address;
  if (
    !address.email ||
    !address.name ||
    !address.address ||
    !address.city ||
    !address.district ||
    !address.postalCode ||
    !address.phone
  ) {
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(address.email)) {
    return false;
  }

  // Phone validation (basic)
  if (address.phone.length < 6) {
    return false;
  }

  return true;
}

export function validatePaymentMethod(method: string) {
  const validMethods = ['bkash', 'cod', 'nagad'];
  return validMethods.includes(method.toLowerCase());
}
