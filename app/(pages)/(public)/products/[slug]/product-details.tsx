'use client';

import {
  ChevronRight,
  Heart,
  Home,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductImage, ProductVariant } from '@/lib/types';
import { useAddToCart, useSingleProduct } from '@/services';
import { useToggleWishlist } from '@/services/customer/wishlist';
import MessageVendorButton from '@/utils/chat-button';

import LoadingSkeleton from './loading-skeleton';
import ProductGallery from './product-gallery';
import ProductInfo from './product-info';
import RelatedProducts from './related-products';
import ProductReviews from './review';
import { StockStatus } from './stock-status';
import VariantSelector from './variant-selector';

export default function ProductDetails({ slug }: { slug: string }) {
  const { isPending, data, isError } = useSingleProduct({ slug });
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [combinedImages, setCombinedImages] = useState<ProductImage[]>([]);
  const { mutate: addToCart } = useAddToCart();
  const { data: session, status } = useSession();
  const { mutate: toggleWishlist, isPending: isWishlistPending } =
    useToggleWishlist();

  const product = data?.product;
  const router = useRouter();

  // Extract unique colors and sizes from variants
  useEffect(() => {
    if (product?.variants) {
      // Extract unique colors and sizes
      const colors = [
        ...new Set(
          product.variants.map(
            (v: { attributes: { color: string } }) => v.attributes?.color
          )
        ),
      ].filter(Boolean) as string[];
      setAvailableColors(colors);

      if (colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product, selectedColor]);

  // Update available sizes when color changes
  useEffect(() => {
    if (product?.variants && selectedColor) {
      const sizesForColor = product.variants
        .filter(
          (v: { attributes: { color: string }; stock: number }) =>
            v.attributes?.color === selectedColor && v.stock > 0
        )
        .map((v: { attributes: { size: string } }) => v.attributes?.size)
        .filter(Boolean) as string[];

      setAvailableSizes([...new Set(sizesForColor)]);

      // Select first available size if current size is not available
      if (
        sizesForColor.length > 0 &&
        (!selectedSize || !sizesForColor.includes(selectedSize))
      ) {
        setSelectedSize(sizesForColor[0]);
      }
    }
  }, [product, selectedColor, selectedSize]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product?.variants && selectedColor) {
      // Find the variant that matches the selected color and size (if size is selected)
      let variant;

      if (selectedSize) {
        variant = product.variants.find(
          (v: { attributes: { color: string; size: string } }) =>
            v.attributes?.color === selectedColor &&
            v.attributes?.size === selectedSize
        );
      } else {
        // If no size is selected, just match by color
        variant = product.variants.find(
          (v: { attributes: { color: string } }) =>
            v.attributes?.color === selectedColor
        );
      }

      setSelectedVariant(variant || null);

      // Reset quantity if it exceeds stock
      if (variant && quantity > variant.stock) {
        setQuantity(variant.stock > 0 ? 1 : 0);
      }
    }
  }, [product, selectedColor, selectedSize, quantity]);

  // Update the useEffect for extracting images to include all variant images
  useEffect(() => {
    if (product) {
      // Start with product images
      let allImages = [...product.images];

      // Add all variant images to the gallery
      if (product.variants && product.variants.length > 0) {
        // Get all unique variant images
        const variantImages = product.variants
          .filter((v: { image: string }) => v.image) // Only include variants with images
          .map((v: { image: string }) => v.image);

        // Filter out duplicates by publicId
        const uniqueVariantImages = variantImages.filter(
          (
            image: { publicId: string },
            index: number,
            self: { publicId: string }[]
          ) => index === self.findIndex((i) => i?.publicId === image?.publicId)
        );

        // Add all unique variant images to the gallery
        allImages = [...uniqueVariantImages, ...allImages];
      }

      // Remove duplicates by publicId
      const uniqueImages = allImages.filter(
        (image, index, self) =>
          index === self.findIndex((i) => i.publicId === image.publicId)
      );

      setCombinedImages(uniqueImages);

      // If a variant is selected, find its image index and set it as active
      if (selectedVariant && selectedVariant.image) {
        const variantImageIndex = uniqueImages.findIndex(
          (img) => img.publicId === selectedVariant?.image?.publicId
        );

        if (variantImageIndex !== -1) {
          setActiveImageIndex(variantImageIndex);
        }
      }
    }
  }, [product, selectedVariant]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    // Find a variant with this color
    const variantWithColor = product.variants.find(
      (v: { attributes: { color: string }; image: string }) =>
        v.attributes?.color === color && v.image
    );

    // If this variant has an image, find its index in the combined images array
    if (variantWithColor && variantWithColor.image) {
      const variantImageIndex = combinedImages.findIndex(
        (img) => img.publicId === variantWithColor.image.publicId
      );

      if (variantImageIndex !== -1) {
        setActiveImageIndex(variantImageIndex);
      }
    }

    // Reset size when color changes to ensure we get a valid variant
    setSelectedSize('');
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleWishlistToggle = () => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/sign-in');
      return;
    }

    toggleWishlist({ productId: product.id });
  };

  const increaseQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity((prev) => prev + 1);
    } else if (product && !selectedVariant && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Fix the add to cart logic
  const handleAddToCart = () => {
    // Check if product has variants but none is selected
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      // Check if we have colors or sizes that need selection
      if (availableColors.length > 0 || availableSizes.length > 0) {
        toast.error('Please select all options before adding to cart');
        return;
      }
    }

    if (selectedVariant && selectedVariant.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart({
      productId: data.product.id,
      quantity,
      variantId: selectedVariant?.id,
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-lg text-red-500">
          Error loading product. Please try again later.
        </p>
      </div>
    );
  }

  // Calculate current price based on variant or product
  const currentPrice = selectedVariant?.price || product.price;
  const currentDiscountPrice =
    selectedVariant?.discountPrice || product.discountPrice;
  const currentDiscountPercent =
    selectedVariant?.discountPercent || product.discountPercent;
  const currentStock = selectedVariant?.stock || product.stock;

  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center">
              <Home className="mr-1 h-4 w-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{product.productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <ProductGallery
          images={combinedImages.length > 0 ? combinedImages : product.images}
          productName={product.productName}
          discountPercent={currentDiscountPercent}
          activeIndex={activeImageIndex}
          onImageChange={setActiveImageIndex}
        />

        {/* Product Details */}
        <div className="space-y-6">
          <ProductInfo product={product} currentStock={currentStock} />

          <Separator />

          {/* Price section */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {currentDiscountPrice ? (
                <>
                  <span className="text-3xl font-bold">
                    ৳{currentDiscountPrice.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground text-lg line-through">
                    ৳{currentPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-red-500 hover:bg-red-600">
                    Save {currentDiscountPercent}%
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  ৳{currentPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Price includes taxes & duties for US
            </p>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Variant Selection */}
            <VariantSelector
              availableColors={availableColors}
              availableSizes={availableSizes}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={handleColorSelect}
              onSizeSelect={handleSizeSelect}
              product={product}
            />

            {/* Quantity Selection */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Quantity</span>
                <StockStatus stock={currentStock} lowStockThreshold={10} />
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={
                    quantity >= (selectedVariant?.stock || product.stock)
                  }
                  className="h-10 w-10 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 py-6 text-base"
                size="lg"
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <MessageVendorButton
                className="hidden md:flex"
                vendorId={product.shop.ownerId}
                vendorName={product.shop.name}
                productId={product.id}
              />

              <Button
                className="py-6"
                variant={product.isWishlisted ? 'default' : 'outline'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
                disabled={isWishlistPending}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            <MessageVendorButton
              className="md:hidden"
              vendorId={product.shop.ownerId}
              vendorName={product.shop.name}
              productId={product.id}
            />
          </div>

          {/* Shipping & Returns Info */}
          <div className="bg-card mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over 2000 BDT</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">Encrypted transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Worldwide Delivery</p>
                <p className="text-xs text-gray-500">To over 90 countries</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="mb-4 hidden w-full grid-cols-4 md:grid">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsList className="mb-4 max-w-full md:hidden">
            <div className="flex items-center overflow-x-auto">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </div>
          </TabsList>
          <TabsContent value="details">
            <div className="prose max-w-none">
              <h3>Product Description</h3>
              {product.description
                .split('\n\n')
                .map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              <h3>Features</h3>
              <ul>
                <li>Premium quality materials</li>
                <li>Ergonomic design for comfort</li>
                <li>Sustainable manufacturing process</li>
                <li>Versatile functionality</li>
                <li>Modern aesthetic</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-8">
              <div>
                <h3 className="text-lg font-medium">
                  Technical Specifications
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Brand</span>
                    <span>{product.brand || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Model</span>
                    <span>{product.sku}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Material</span>
                    <span>
                      {product.attributes?.material || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Style</span>
                    <span>{product.attributes?.style || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="font-medium">Warranty</span>
                    <span>{product.warrantyInfo || '1 year'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Available Variants</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead>
                      <tr>
                        <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium tracking-wider uppercase">
                          Variant
                        </th>
                        <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium tracking-wider uppercase">
                          Price
                        </th>
                        <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium tracking-wider uppercase">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {product.variants.map((variant: ProductVariant) => (
                        <tr
                          key={variant.id}
                          className={
                            selectedVariant?.id === variant.id
                              ? 'bg-primary/5'
                              : ''
                          }
                        >
                          <td className="px-3 py-2 text-sm whitespace-nowrap">
                            {variant.name}
                          </td>
                          <td className="px-3 py-2 text-sm whitespace-nowrap">
                            ৳{variant.discountPrice || variant.price}
                          </td>
                          <td className="px-3 py-2 text-sm whitespace-nowrap">
                            {variant.stock > 0 ? variant.stock : 'Out of stock'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <ProductReviews productId={product.id} />
          </TabsContent>
          <TabsContent value="shipping">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Shipping Information</h3>
                <p className="text-muted-foreground mt-2">
                  We offer the following shipping options for your convenience:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  <li>
                    Standard Shipping (3-5 business days): Free on orders over
                    ৳120
                  </li>
                  <li>Express Shipping (1-2 business days): ৳240</li>
                  <li>
                    International Shipping (7-14 business days): Rates
                    calculated at checkout
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium">Return Policy</h3>
                <p className="mt-2 text-gray-600">
                  We want you to be completely satisfied with your purchase. If
                  for any reason you&#39;re not happy with your order, you can
                  return it within 30 days of delivery for a full refund or
                  exchange.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  <li>
                    Items must be in original condition with tags attached
                  </li>
                  <li>Return shipping is free for domestic orders</li>
                  <li>
                    Personalized or custom items cannot be returned unless
                    defective
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <RelatedProducts slug={product.slug} />
    </>
  );
}
