'use client';

import {
  ChevronRight,
  Clock,
  Heart,
  Home,
  Minus,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product, ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSingleProduct } from '@/services';
import { getColorName } from '@/utils/color-utils';

import { ColorSwatch } from './color-swatch';
import LoadingSkeleton from './LoadingSkeleton';
import { ImageGallery } from './main-image';
import { RatingDisplay } from './rating-display';
import RelatedProducts from './related-product';
import Share from './share-product';
import { StockStatus } from './stock-status';

function ProductPage({ slug }: { slug: string }) {
  const { isPending, data, isError } = useSingleProduct({ slug });
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Map colors to images for better UX
  const [colorToImageMap, setColorToImageMap] = useState<
    Record<string, number>
  >({});

  const product = data?.product as Product | undefined;

  // Extract unique colors and sizes from variants
  useEffect(() => {
    if (product?.variants) {
      // Extract unique colors and sizes
      const colors = [
        ...new Set(product.variants.map((v) => v.attributes.color)),
      ].filter(Boolean) as string[];
      const sizes = [
        ...new Set(product.variants.map((v) => v.attributes.size)),
      ].filter(Boolean) as string[];

      setAvailableColors(colors);
      setAvailableSizes(sizes);

      // Set default selections if available
      if (colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }

      if (sizes.length > 0 && !selectedSize) {
        setSelectedSize(sizes[0]);
      }

      // Create a mapping of colors to images
      // Since variants don't have images, we'll map colors to product images
      if (product.images.length >= colors.length) {
        const mapping: Record<string, number> = {};
        colors.forEach((color, index) => {
          // Map each color to a different image if possible
          const imageIndex = index % product.images.length;
          mapping[color] = imageIndex;
        });
        setColorToImageMap(mapping);
      }
    }
  }, [product, selectedColor, selectedSize]);

  // Update available sizes based on selected color
  useEffect(() => {
    if (product?.variants && selectedColor) {
      const sizesForColor = product.variants
        .filter((v) => v.attributes.color === selectedColor && v.stock > 0)
        .map((v) => v.attributes.size)
        .filter(Boolean) as string[];

      setAvailableSizes([...new Set(sizesForColor)]);

      // If current selected size is not available for this color, select the first available
      if (sizesForColor.length > 0 && !sizesForColor.includes(selectedSize)) {
        setSelectedSize(sizesForColor[0]);
      }

      // Update the active image based on the selected color
      if (colorToImageMap[selectedColor] !== undefined) {
        setActiveImageIndex(colorToImageMap[selectedColor]);
      }
    }
  }, [product, selectedColor, selectedSize, colorToImageMap]);

  // Find the selected variant based on color and size
  useEffect(() => {
    if (product?.variants && selectedColor && selectedSize) {
      const variant = product.variants.find(
        (v) =>
          v.attributes.color === selectedColor &&
          v.attributes.size === selectedSize
      );

      setSelectedVariant(variant || null);

      // Reset quantity if it exceeds the variant stock
      if (variant && quantity > variant.stock) {
        setQuantity(variant.stock > 0 ? 1 : 0);
      }
    }
  }, [product, selectedColor, selectedSize, quantity]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    // Update the image when color is selected
    if (colorToImageMap[color] !== undefined) {
      setActiveImageIndex(colorToImageMap[color]);
    }
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

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    toast.success(
      inWishlist ? 'Removed from your wishlist' : 'Added to your wishlist'
    );
  };

  const handleAddToCart = () => {
    if (product && product?.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select all options before adding to cart');
      return;
    }

    if (selectedVariant && selectedVariant.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    // Add to cart logic would go here
    toast.success(`Added ${quantity} ${product?.productName} to your cart`);
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };

  if (isPending) {
    return <LoadingSkeleton />;
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

  // Calculate average rating and review counts
  const avgRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;

  // Calculate current price based on variant or product
  const currentPrice = selectedVariant?.price || product.price;
  const currentDiscountPrice =
    selectedVariant?.discountPrice || product.discountPrice;
  const currentDiscountPercent =
    selectedVariant?.discountPercent || product.discountPercent;
  const currentStock = selectedVariant?.stock || product.stock;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
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
              <BreadcrumbPage>{product.slug}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images Section */}
          <ImageGallery
            images={product.images}
            productName={product.productName}
            discountPercent={currentDiscountPercent}
            activeIndex={activeImageIndex}
            onImageChange={handleImageChange}
          />

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{product.brand}</Badge>
                  {product.shop.isVerified && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800"
                    >
                      Verified Seller
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Share slug={slug} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWishlist}
                    className={inWishlist ? 'text-red-500' : ''}
                    aria-label={
                      inWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                    }
                  >
                    <Heart
                      className={cn('h-5 w-5', inWishlist && 'fill-red-500')}
                    />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.productName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <RatingDisplay
                    rating={avgRating}
                    showValue={true}
                    reviewCount={reviewCount}
                  />
                </div>

                <Badge variant="secondary" className="ml-2">
                  {product.condition}
                </Badge>

                <StockStatus stock={currentStock} lowStockThreshold={10} />
              </div>

              {/* Shop info */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-500">Sold by:</span>
                <div className="flex items-center gap-2">
                  <Image
                    width={100}
                    height={100}
                    src={
                      product.shop.logo.url ||
                      '/placeholder.svg?height=20&width=20'
                    }
                    alt={product.shop.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">
                    {product.shop.name}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price section */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {currentDiscountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      ৳{currentDiscountPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ৳{currentPrice.toFixed(2)}
                    </span>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      Save {currentDiscountPercent}%
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ৳{currentPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Price includes taxes & duties for US
              </p>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="leading-relaxed text-gray-700">
                {product.description.split('\r\n\r\n')[0]}
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-2 text-sm font-medium">
                      Color:{' '}
                      <span className="font-semibold">
                        {getColorName(selectedColor)}
                      </span>
                    </Label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {availableColors.map((color) => {
                      // Check if this color has variants with stock
                      const hasStock = product.variants.some(
                        (v) => v.attributes.color === color && v.stock > 0
                      );

                      return (
                        <ColorSwatch
                          key={color}
                          color={color}
                          isSelected={selectedColor === color}
                          onClick={() => handleColorSelect(color)}
                          label={getColorName(color)}
                          disabled={!hasStock}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-2 text-sm font-medium">
                      Size:{' '}
                      <span className="font-semibold">{selectedSize}</span>
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="h-auto p-0 text-xs">
                          Size Guide
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Size Guide</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-4 gap-4 py-4">
                          <div className="font-medium">Size</div>
                          <div className="font-medium">Chest (in)</div>
                          <div className="font-medium">Length (in)</div>
                          <div className="font-medium">Sleeve (in)</div>

                          <div>S</div>
                          <div>36-38</div>
                          <div>27-28</div>
                          <div>24-25</div>

                          <div>M</div>
                          <div>38-40</div>
                          <div>28-29</div>
                          <div>25-26</div>

                          <div>L</div>
                          <div>40-42</div>
                          <div>29-30</div>
                          <div>26-27</div>

                          <div>XL</div>
                          <div>42-44</div>
                          <div>30-31</div>
                          <div>27-28</div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <RadioGroup
                    className="mt-2 flex flex-wrap gap-3"
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                  >
                    {availableSizes.map((size) => {
                      // Find if this size is available for the selected color
                      const isAvailable = product.variants.some(
                        (v) =>
                          v.attributes.size === size &&
                          v.attributes.color === selectedColor &&
                          v.stock > 0
                      );

                      return (
                        <div key={size} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={size}
                            id={`size-${size}`}
                            className="peer hidden"
                            disabled={!isAvailable}
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className={cn(
                              'relative flex h-10 w-14 cursor-pointer items-center justify-center rounded-md border bg-white text-center transition-colors',
                              selectedSize === size
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200',
                              !isAvailable && 'cursor-not-allowed opacity-50'
                            )}
                          >
                            {size}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Quantity
                </Label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >= (selectedVariant?.stock || product.stock)
                    }
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  className="flex-1 cursor-pointer py-6"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  variant={inWishlist ? 'destructive' : 'outline'}
                  size="lg"
                  className="py-6"
                  onClick={toggleWishlist}
                >
                  <Heart
                    className={cn('h-5 w-5', inWishlist && 'fill-current')}
                  />
                  <span className="sr-only">
                    {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Delivery & Returns Info */}
            <div className="rounded-xl border bg-gray-50/50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-xs text-gray-500">
                      {product.freeShipping
                        ? 'Free standard shipping on all orders'
                        : 'Free shipping on orders over $50'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-xs text-gray-500">
                      {product.estimatedDelivery || '3-5 business days'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-xs text-gray-500">
                      30-day easy returns if you change your mind
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Warranty</p>
                    <p className="text-xs text-gray-500">
                      {product.warrantyInfo || '1 year manufacturer warranty'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SKU and Additional Info */}
            <div className="flex flex-wrap justify-between text-sm text-gray-500">
              <span>SKU: {selectedVariant?.sku || product.sku}</span>
              <span>Tags: {product.tags.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="rounded-b-lg border p-6">
              <div className="prose max-w-none">
                <h3>Product Description</h3>
                {product.description
                  .split('\r\n\r\n')
                  .map((paragraph, index) => (
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
            <TabsContent
              value="specifications"
              className="rounded-b-lg border p-6"
            >
              <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-8">
                <div>
                  <h3 className="text-lg font-medium">
                    Technical Specifications
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Brand</span>
                      <span>{product.brand}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Model</span>
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Material</span>
                      <span>Cotton Blend</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Weight</span>
                      <span>0.75 kg</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="font-medium">Warranty</span>
                      <span>{product.warrantyInfo || '1 year'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Package Includes</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    <li>1 x {product.productName}</li>
                    <li>1 x Care Instructions</li>
                    <li>1 x Warranty Card</li>
                  </ul>

                  <h3 className="mt-6 text-lg font-medium">
                    Available Variants
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Variant
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {product.variants.map((variant) => (
                          <tr
                            key={variant.id}
                            className={cn(
                              selectedVariant?.id === variant.id &&
                                'bg-primary/5'
                            )}
                          >
                            <td className="px-3 py-2 text-sm whitespace-nowrap">
                              {variant.name}
                            </td>
                            <td className="px-3 py-2 text-sm whitespace-nowrap">
                              ৳{variant.discountPrice || variant.price}
                            </td>
                            <td className="px-3 py-2 text-sm whitespace-nowrap">
                              {variant.stock > 0
                                ? variant.stock
                                : 'Out of stock'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="rounded-b-lg border p-6">
              <div className="py-8 text-center">
                <h3 className="mb-2 text-xl font-bold">Customer Reviews</h3>
                <p className="text-gray-500">
                  No reviews yet. Be the first to review this product!
                </p>
                <Button className="mt-4">Write a Review</Button>
              </div>
            </TabsContent>
            <TabsContent value="faq" className="rounded-b-lg border p-6">
              <h3 className="mb-4 text-xl font-bold">
                Frequently Asked Questions
              </h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How long is the warranty period?
                  </AccordionTrigger>
                  <AccordionContent>
                    This product comes with a {product.warrantyInfo || '1 year'}{' '}
                    manufacturer warranty that covers defects in materials and
                    workmanship. Please retain your receipt as proof of
                    purchase.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How do I choose the right size?
                  </AccordionTrigger>
                  <AccordionContent>
                    Please refer to our size guide for detailed measurements.
                    For hoodies, we recommend selecting your normal size for a
                    regular fit, or one size up if you prefer a looser fit.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Can I return this item if I&#39;m not satisfied?
                  </AccordionTrigger>
                  <AccordionContent>
                    We offer a 30-day return policy. If you&#39;re not
                    completely satisfied with your purchase, you can return it
                    in its original packaging for a full refund or exchange.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    How do I care for this product?
                  </AccordionTrigger>
                  <AccordionContent>
                    For best results, machine wash cold with similar colors,
                    tumble dry low, and remove promptly. Do not bleach or iron
                    the printed design if applicable. This will help maintain
                    the color and shape of your product.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    Are the colors exactly as shown in the photos?
                  </AccordionTrigger>
                  <AccordionContent>
                    We strive to display colors as accurately as possible, but
                    please note that colors may appear slightly different
                    depending on your screen settings. The teal color is a deep
                    blue-green, the yellow is bright, and the pink has a soft,
                    pastel tone.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 rounded-lg bg-gray-50 p-6">
                <h4 className="text-lg font-medium">Still have questions?</h4>
                <p className="mt-2 text-gray-600">
                  Our customer support team is ready to help you with any
                  questions you might have about this product.
                </p>
                <div className="mt-4 flex gap-4">
                  <Button variant="outline">Contact Support</Button>
                  <Button variant="ghost">View Support Center</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <RelatedProducts slug={slug} />
      </div>
    </>
  );
}

export default function SingleProduct({ slug }: { slug: string }) {
  return (
    <>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductPage slug={slug} />
      </Suspense>
    </>
  );
}
