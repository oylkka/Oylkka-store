'use client';
import {
  Check,
  Clock,
  Heart,
  Maximize2,
  Minus,
  Package,
  Plus,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSingleProduct } from '@/service';
import RelatedProducts from './related-product';

// Type definitions
interface ProductImage {
  url: string;
  publicId: string;
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

interface ProductReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  helpful: number;
}

interface ProductAttributes {
  color?: string[];
  material?: string[];
  size?: string[];
}

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercent: number;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  stock: number;
  lowStockAlert: number;
  freeShipping: boolean;
  images: ProductImage[];
  tags: string[];
  dimensions?: ProductDimensions;
  attributes?: ProductAttributes;
  reviews?: ProductReview[];
  rating: number;
  reviewCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts?: any[];
  estimatedDelivery?: string;
  warrantyInfo?: string;
}

// Rating Display Component
const RatingDisplay: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, size = 'md' }) => {
  const starSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize[size],
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

// Image Gallery Component
const ImageGallery: React.FC<{
  images: ProductImage[];
  productName: string;
  discountPercent: number;
}> = ({ images, productName, discountPercent }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [magnify, setMagnify] = useState(false);
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) {
      return;
    }

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMagnifyPosition({ x, y });
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogHeader>
          <DialogTitle className="hidden" />
        </DialogHeader>
        <div
          ref={imageContainerRef}
          className="relative h-[500px] w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-50"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setMagnify(true)}
          onMouseLeave={() => setMagnify(false)}
        >
          <Image
            src={images[selectedImage]?.url || '/api/placeholder/600/600'}
            alt={productName}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {magnify && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${images[selectedImage]?.url})`,
                backgroundPosition: `${magnifyPosition.x}% ${magnifyPosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
                opacity: 1,
                zIndex: 10,
              }}
            />
          )}

          {discountPercent > 0 && (
            <Badge className="absolute top-4 left-4 z-20 bg-red-500 hover:bg-red-600">
              -{discountPercent}%
            </Badge>
          )}

          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 bottom-4 z-20 bg-white/70 hover:bg-white"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent>
          <div className="h-full w-full">
            <Image
              src={images[selectedImage]?.url || '/api/placeholder/800/800'}
              alt={productName}
              className="object-contain"
              width={2000}
              height={2000}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.publicId} className="basis-1/5">
              <div
                className={cn(
                  'relative h-24 cursor-pointer rounded-md border-2 transition-all',
                  selectedImage === index
                    ? 'border-primary ring-primary/20 ring-2'
                    : 'border-transparent'
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.url}
                  alt={`${productName} - view ${index + 1}`}
                  className="rounded-md object-cover"
                  fill
                  sizes="100px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

function ProductPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '';
  const { isPending, data, isError } = useSingleProduct({ id: productId });

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const product = data?.product as Product | undefined;

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
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
    toast('Item has been added to your wishlist');
  };

  const addToCart = () => {
    toast('Added to cart');
  };

  const submitReview = () => {
    toast('Review submitted');
    setReviewDialogOpen(false);
    setReviewComment('');
  };

  const shareProduct = () => {
    toast('Share link copied');
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
  const reviewCount = product.reviewCount || product.reviews?.length || 0;

  // Distribution of ratings for visualization
  const ratingDistribution = [
    { stars: 5, count: 65 },
    { stars: 4, count: 25 },
    { stars: 3, count: 7 },
    { stars: 2, count: 2 },
    { stars: 1, count: 1 },
  ];

  // Demo reviews for illustration (in a real app, these would come from the API)
  const mockReviews = product.reviews || [
    {
      id: '1',
      userId: '101',
      rating: 5,
      comment:
        'This product exceeds all my expectations! The quality is exceptional and the design is perfect for my needs. I would highly recommend it to anyone looking for something reliable and stylish.',
      createdAt: new Date(2025, 3, 15).toISOString(),
      user: {
        name: 'Sarah Johnson',
        image: '/api/placeholder/40/40',
      },
      helpful: 12,
    },
    {
      id: '2',
      userId: '102',
      rating: 4,
      comment:
        'Beautiful product, just as pictured. Shipping was fast too! The only reason Im giving 4 stars instead of 5 is because the packaging could be improved.',
      createdAt: new Date(2025, 3, 10).toISOString(),
      user: {
        name: 'Emily Chen',
        image: '/api/placeholder/40/40',
      },
      helpful: 8,
    },
    {
      id: '3',
      userId: '103',
      rating: 5,
      comment:
        'Ive been using this product for two weeks now and Im completely satisfied. The materials are high quality and it looks even better in person than in the photos.',
      createdAt: new Date(2025, 2, 28).toISOString(),
      user: {
        name: 'Michael Patel',
        image: '/api/placeholder/40/40',
      },
      helpful: 15,
    },
  ];

  // Related products
  const relatedProducts = product.relatedProducts || [
    {
      id: 'rel1',
      name: 'Similar Product 1',
      price: 129.99,
      image: '/api/placeholder/200/200',
      rating: 4.7,
    },
    {
      id: 'rel2',
      name: 'Similar Product 2',
      price: 149.99,
      image: '/api/placeholder/200/200',
      rating: 4.5,
    },
    {
      id: 'rel3',
      name: 'Similar Product 3',
      price: 139.99,
      image: '/api/placeholder/200/200',
      rating: 4.8,
    },
    {
      id: 'rel4',
      name: 'Similar Product 4',
      price: 119.99,
      image: '/api/placeholder/200/200',
      rating: 4.6,
    },
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images Section */}
          <ImageGallery
            images={product.images}
            productName={product.productName}
            discountPercent={product.discountPercent}
          />

          {/* Product Details Section */}
          <div className="space-y-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline">No Brand</Badge>

                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={shareProduct}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWishlist}
                    className={inWishlist ? 'text-red-500' : ''}
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

              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center">
                  <RatingDisplay rating={avgRating} />
                  <span className="ml-2 text-sm text-gray-600">
                    {avgRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>

                <Badge variant="secondary" className="ml-2">
                  {product.condition}
                </Badge>
              </div>
            </div>

            {/* Price section */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      Save $
                      {(product.price - (product.discountPrice || 0)).toFixed(
                        2
                      )}
                    </Badge>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Price includes taxes & duties for US
              </p>
            </div>

            <p className="leading-relaxed text-gray-700">
              {product.description}
            </p>

            <div className="space-y-6">
              {/* Color Selection */}
              {product.attributes?.color &&
                product.attributes.color.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="mb-2 text-sm font-medium">Color</Label>
                      <span className="text-sm text-gray-500">
                        {selectedColor || 'Select color'}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-3">
                      {product.attributes.color.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            'relative h-10 w-10 rounded-full border-2 transition-all',
                            selectedColor === color
                              ? 'ring-primary ring-2 ring-offset-2'
                              : 'ring-offset-0'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Color: ${color}`}
                        >
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="h-5 w-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Size Selection */}
              {product.attributes?.size &&
                product.attributes.size.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="mb-2 text-sm font-medium">Size</Label>
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
                            <div className="font-medium">US</div>
                            <div className="font-medium">EU</div>
                            <div className="font-medium">UK</div>

                            {['S', 'M', 'L', 'XL'].map((size) => (
                              <React.Fragment key={size}>
                                <div>{size}</div>
                                <div>US {size}</div>
                                <div>EU {size}</div>
                                <div>UK {size}</div>
                              </React.Fragment>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <RadioGroup
                      className="mt-2 flex flex-wrap gap-3"
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      {product.attributes.size.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={size}
                            id={`size-${size}`}
                            className="peer hidden"
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary flex h-10 w-14 cursor-pointer items-center justify-center rounded-md border bg-white text-center"
                          >
                            {size}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

              {/* Material Selection */}
              {product.attributes?.material &&
                product.attributes.material.length > 0 && (
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Material
                    </Label>
                    <RadioGroup
                      className="mt-2 flex flex-wrap gap-3"
                      value={selectedMaterial}
                      onValueChange={setSelectedMaterial}
                    >
                      {product.attributes.material.map((material) => (
                        <div
                          key={material}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={material}
                            id={`material-${material}`}
                            className="peer hidden"
                          />
                          <Label
                            htmlFor={`material-${material}`}
                            className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary flex h-10 min-w-20 cursor-pointer items-center justify-center rounded-md border bg-white px-3 text-center"
                          >
                            {material}
                          </Label>
                        </div>
                      ))}
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
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-4 text-sm text-gray-500">
                    {product.stock} available
                    {product.stock <= product.lowStockAlert && (
                      <span className="ml-2 text-red-500">(Low stock)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button className="flex-1 py-6" size="lg" onClick={addToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
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
              <span>SKU: {product.sku}</span>
              <span>
                Category: {product.category} / {product.subcategory}
              </span>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="rounded-b-lg border p-6">
              <div className="prose max-w-none">
                <h3>Product Description</h3>
                <p>{product.description}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                  vitae libero ut justo tempus dapibus. Sed at ligula sed nisi
                  facilisis fringilla. Morbi laoreet, nisi quis feugiat
                  faucibus, libero tortor varius massa, at facilisis nibh nisi
                  ut magna.
                </p>
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
                      <span>
                        {product.attributes?.material?.[0] || 'Various'}
                      </span>
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
                    <li>1 x User Manual</li>
                    <li>1 x Warranty Card</li>
                    <li>1 x Certificate of Authenticity</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dimensions" className="rounded-b-lg border p-6">
              {product.dimensions ? (
                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    Product Dimensions
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-center text-sm font-medium text-gray-500">
                          Length
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-2xl font-bold">
                          {product.dimensions.length}{' '}
                          <span className="text-sm font-normal">
                            {product.dimensions.unit}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-center text-sm font-medium text-gray-500">
                          Width
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-2xl font-bold">
                          {product.dimensions.width}{' '}
                          <span className="text-sm font-normal">
                            {product.dimensions.unit}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-center text-sm font-medium text-gray-500">
                          Height
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-2xl font-bold">
                          {product.dimensions.height}{' '}
                          <span className="text-sm font-normal">
                            {product.dimensions.unit}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-medium">
                      Sizing Information
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Please refer to the detailed dimensions above before
                      making your purchase to ensure this product will fit in
                      your intended space.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left font-medium">Size</th>
                            <th className="py-3 text-left font-medium">
                              Dimensions
                            </th>
                            <th className="py-3 text-left font-medium">
                              Weight
                            </th>
                            <th className="py-3 text-left font-medium">
                              Recommended For
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3">Small</td>
                            <td className="py-3">20 × 15 × 10 cm</td>
                            <td className="py-3">0.5 kg</td>
                            <td className="py-3">Compact spaces</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Medium</td>
                            <td className="py-3">30 × 20 × 15 cm</td>
                            <td className="py-3">0.75 kg</td>
                            <td className="py-3">Standard usage</td>
                          </tr>
                          <tr>
                            <td className="py-3">Large</td>
                            <td className="py-3">40 × 25 × 20 cm</td>
                            <td className="py-3">1.2 kg</td>
                            <td className="py-3">Expanded functionality</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    No dimension information available for this product.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="rounded-b-lg border p-6">
              <div className="space-y-8">
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Review Summary */}
                  <div className="w-full md:w-1/3">
                    <div className="rounded-lg bg-gray-50 p-6">
                      <h3 className="mb-4 text-xl font-bold">
                        Customer Reviews
                      </h3>
                      <div className="mb-6 text-center">
                        <div className="text-5xl font-bold">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="mt-2">
                          <RatingDisplay rating={avgRating} size="lg" />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Based on {reviewCount} reviews
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingDistribution.map((item) => (
                          <div
                            key={item.stars}
                            className="flex items-center gap-2"
                          >
                            <div className="w-12 text-sm">
                              {item.stars} stars
                            </div>
                            <Progress
                              value={(item.count / reviewCount) * 100}
                              className="h-2"
                            />
                            <div className="w-10 text-right text-sm text-gray-500">
                              {item.count}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Dialog
                        open={reviewDialogOpen}
                        onOpenChange={setReviewDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="mt-6 w-full">
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                            <DialogDescription>
                              Share your experience with this product
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="rating">Rating</Label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Button
                                    key={rating}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                      'h-10 w-10',
                                      reviewRating >= rating && 'bg-yellow-100'
                                    )}
                                    onClick={() => setReviewRating(rating)}
                                  >
                                    <Star
                                      className={cn(
                                        'h-5 w-5',
                                        reviewRating >= rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      )}
                                    />
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="comment">Your Review</Label>
                              <Textarea
                                id="comment"
                                value={reviewComment}
                                onChange={(e) =>
                                  setReviewComment(e.target.value)
                                }
                                placeholder="Share your thoughts about this product..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setReviewDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="button" onClick={submitReview}>
                              Submit Review
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="w-full md:w-2/3">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-xl font-bold">Recent Reviews</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Most Recent
                        </Button>
                        <Button variant="ghost" size="sm">
                          Highest Rated
                        </Button>
                      </div>
                    </div>

                    {mockReviews.length > 0 ? (
                      <div className="space-y-6">
                        {mockReviews.map((review) => (
                          <Card key={review.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={review.user.image}
                                      alt={review.user.name}
                                    />
                                    <AvatarFallback>
                                      {review.user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {review.user.name}
                                    </p>
                                    <div className="flex items-center">
                                      <RatingDisplay
                                        rating={review.rating}
                                        size="sm"
                                      />
                                      <span className="ml-2 text-xs text-gray-500">
                                        {new Date(
                                          review.createdAt
                                        ).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  Verified Purchase
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <p className="text-gray-700">{review.comment}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500"
                                >
                                  {review.helpful} people found this helpful
                                </Button>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    Helpful
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    Report
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-gray-500">
                          No reviews yet. Be the first to review this product!
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => setReviewDialogOpen(true)}
                        >
                          Write a Review
                        </Button>
                      </div>
                    )}

                    <div className="mt-6 flex justify-center">
                      <Button variant="outline">Load More Reviews</Button>
                    </div>
                  </div>
                </div>
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
                    Is this product suitable for professional use?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, this product is designed for both personal and
                    professional use, with high-quality materials that ensure
                    durability even with frequent usage.
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
                    Do you ship internationally?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, we ship to most countries worldwide. International
                    shipping times vary based on location. Please check the
                    shipping calculator at checkout for delivery estimates and
                    costs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    How do I care for this product?
                  </AccordionTrigger>
                  <AccordionContent>
                    For best results and longevity, we recommend regular
                    cleaning with a soft, dry cloth. Avoid using harsh chemicals
                    or abrasive cleaners as they may damage the finish.
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
        <RelatedProducts id={productId} />
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full rounded-lg" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="mt-2 h-10 w-3/4" />
            <div className="mt-2 flex items-center gap-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-2 h-5 w-16" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="mb-2 h-5 w-16" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-14 rounded-md" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="mb-2 h-5 w-20" />
              <div className="flex items-center">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="mx-4 h-6 w-12" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-14" />
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="mt-16 h-12 w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

export default function SignleProduct() {
  return (
    <>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductPage />
      </Suspense>
    </>
  );
}
