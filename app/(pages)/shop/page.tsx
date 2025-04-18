// app/shop/page.tsx
'use client';

import { ChevronDown, Filter, Search, ShoppingCart, Tag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

// Define types based on your API structure
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

interface Product {
  id: string;
  productName: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  stock: number;
  lowStockAlert: number;
  condition:
    | 'NEW'
    | 'USED'
    | 'LIKE_NEW'
    | 'EXCELLENT'
    | 'GOOD'
    | 'FAIR'
    | 'POOR'
    | 'FOR_PARTS';
  conditionDescription?: string;
  weight?: number;
  weightUnit: string;
  freeShipping: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';
  tags: string[];
  dimensions?: ProductDimensions;
  attributes: Record<string, string[]>;
  sku: string;
  images: ProductImage[];
  createdBy: string;
}

// Mock products based on your API structure
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    productName: 'Premium Wireless Headphones',
    description:
      'Immersive sound quality with noise cancellation and 30-hour battery life.',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 249.99,
    discountPrice: 199.99,
    discountPercent: 20,
    stock: 15,
    lowStockAlert: 5,
    condition: 'NEW',
    weightUnit: 'kg',
    weight: 0.3,
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['wireless', 'bluetooth', 'audio', 'headphones'],
    sku: 'HD-PRO-001',
    attributes: {
      Color: ['Black', 'Silver'],
      Connectivity: ['Bluetooth 5.0', '3.5mm jack'],
    },
    images: [
      { url: '/api/placeholder/400/400', publicId: 'prod_1_img1' },
      { url: '/api/placeholder/400/400', publicId: 'prod_1_img2' },
    ],
    createdBy: 'user123',
  },
  {
    id: '2',
    productName: 'Ergonomic Office Chair',
    description:
      'Adjustable lumbar support with premium materials for all-day comfort.',
    category: 'Furniture',
    subcategory: 'Office',
    price: 349.99,
    discountPrice: 279.99,
    discountPercent: 20,
    stock: 8,
    lowStockAlert: 3,
    condition: 'NEW',
    weight: 15,
    weightUnit: 'kg',
    freeShipping: false,
    status: 'PUBLISHED',
    tags: ['office', 'chair', 'ergonomic', 'furniture'],
    dimensions: {
      length: 70,
      width: 65,
      height: 115,
      unit: 'cm',
    },
    sku: 'CH-ERG-002',
    attributes: {
      Color: ['Black', 'Gray'],
      Material: ['Mesh', 'Faux Leather'],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_2_img1' }],
    createdBy: 'user123',
  },
  {
    id: '3',
    productName: 'Smart Fitness Watch',
    description:
      'Track your health metrics and workouts with precision and style.',
    category: 'Electronics',
    subcategory: 'Wearables',
    price: 199.99,
    stock: 22,
    lowStockAlert: 8,
    condition: 'NEW',
    weight: 0.05,
    weightUnit: 'kg',
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['fitness', 'smartwatch', 'health', 'wearable'],
    sku: 'FW-SM-003',
    attributes: {
      Color: ['Black', 'Blue', 'Pink'],
      Features: ['Heart Rate Monitor', 'Sleep Tracking', 'GPS'],
    },
    images: [
      { url: '/api/placeholder/400/400', publicId: 'prod_3_img1' },
      { url: '/api/placeholder/400/400', publicId: 'prod_3_img2' },
    ],
    createdBy: 'user123',
  },
  {
    id: '4',
    productName: 'Organic Cotton Throw Blanket',
    description:
      'Sustainably made, ultra-soft blanket perfect for cozy evenings.',
    category: 'Home Goods',
    subcategory: 'Bedding',
    price: 89.99,
    discountPrice: 69.99,
    discountPercent: 22,
    stock: 14,
    lowStockAlert: 5,
    condition: 'NEW',
    weight: 1.2,
    weightUnit: 'kg',
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['organic', 'cotton', 'blanket', 'sustainable'],
    dimensions: {
      length: 200,
      width: 150,
      height: 1,
      unit: 'cm',
    },
    sku: 'BL-ORG-004',
    attributes: {
      Color: ['Natural', 'Gray', 'Blue'],
      Material: ['100% Organic Cotton'],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_4_img1' }],
    createdBy: 'user123',
  },
  {
    id: '5',
    productName: 'Professional Chef Knife Set',
    description:
      'Premium stainless steel knives for precision cutting and durability.',
    category: 'Kitchen',
    subcategory: 'Cutlery',
    price: 179.99,
    stock: 7,
    lowStockAlert: 3,
    condition: 'NEW',
    weight: 2.5,
    weightUnit: 'kg',
    freeShipping: false,
    status: 'PUBLISHED',
    tags: ['kitchen', 'chef', 'knives', 'cooking'],
    sku: 'KN-SET-005',
    attributes: {
      Material: ['Stainless Steel', 'Wood Handles'],
      Pieces: [
        'Chef Knife',
        'Bread Knife',
        'Paring Knife',
        'Utility Knife',
        'Shears',
      ],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_5_img1' }],
    createdBy: 'user123',
  },
  {
    id: '6',
    productName: 'Minimalist Desk Lamp',
    description: 'Adjustable LED lamp with touch controls and modern design.',
    category: 'Home Goods',
    subcategory: 'Lighting',
    price: 59.99,
    stock: 19,
    lowStockAlert: 5,
    condition: 'NEW',
    weight: 0.8,
    weightUnit: 'kg',
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['lamp', 'desk', 'led', 'minimalist'],
    sku: 'LP-DSK-006',
    attributes: {
      Color: ['White', 'Black', 'Silver'],
      Features: ['Touch Control', '3 Brightness Levels', 'USB Charging Port'],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_6_img1' }],
    createdBy: 'user123',
  },
  {
    id: '7',
    productName: 'Sustainable Water Bottle',
    description:
      'Double-insulated stainless steel bottle that keeps drinks cold for 24 hours.',
    category: 'Kitchen',
    subcategory: 'Drinkware',
    price: 34.99,
    discountPrice: 27.99,
    discountPercent: 20,
    stock: 31,
    lowStockAlert: 10,
    condition: 'NEW',
    weight: 0.35,
    weightUnit: 'kg',
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['water bottle', 'sustainable', 'reusable', 'insulated'],
    sku: 'WB-SST-007',
    attributes: {
      Color: ['Ocean Blue', 'Forest Green', 'Matte Black'],
      Capacity: ['500ml', '750ml'],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_7_img1' }],
    createdBy: 'user123',
  },
  {
    id: '8',
    productName: 'Wireless Charging Pad',
    description:
      'Fast wireless charging for all Qi-enabled devices with sleek design.',
    category: 'Electronics',
    subcategory: 'Accessories',
    price: 45.99,
    stock: 16,
    lowStockAlert: 5,
    condition: 'NEW',
    weight: 0.15,
    weightUnit: 'kg',
    freeShipping: true,
    status: 'PUBLISHED',
    tags: ['wireless', 'charging', 'smartphone', 'accessories'],
    sku: 'CH-WL-008',
    attributes: {
      Color: ['Black', 'White'],
      'Compatible With': ['iPhone', 'Samsung', 'Google Pixel'],
    },
    images: [{ url: '/api/placeholder/400/400', publicId: 'prod_8_img1' }],
    createdBy: 'user123',
  },
];

// Get all unique categories from products
const getCategories = (products: Product[]): string[] => {
  const categories = products.map((product) => product.category);
  return ['All', ...Array.from(new Set(categories))];
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);

  // Simulate API fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/products');
        // const data = await response.json();

        // Using mock data for now
        const data = MOCK_PRODUCTS;

        // Filter out products that aren't published
        const publishedProducts = data.filter((p) => p.status === 'PUBLISHED');

        setProducts(publishedProducts);
        setFilteredProducts(publishedProducts);
        setCategories(getCategories(publishedProducts));

        // Find max price for slider
        const maxPrice = Math.max(...publishedProducts.map((p) => p.price));
        setPriceRange([0, maxPrice]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters when any filter state changes
  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.productName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Price range filter
    result = result.filter((product) => {
      const priceToCheck = product.discountPrice || product.price;
      return priceToCheck >= priceRange[0] && priceToCheck <= priceRange[1];
    });

    // Sort products
    switch (sortBy) {
      case 'priceLow':
        result.sort(
          (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
        break;
      case 'priceHigh':
        result.sort(
          (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
        break;
      case 'newest':
        // In a real app, would sort by createdAt
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'bestselling':
        // Would need sales data in a real app
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        // Default sorting - featured items first (those with discounts)
        result.sort(
          (a, b) => (b.discountPrice ? 1 : 0) - (a.discountPrice ? 1 : 0)
        );
        break;
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, priceRange, sortBy, products]);

  function handleAddToCart() {
    // Implement your cart functionality here
    // console.log('Added to cart:', product);
    // In a real app, you would dispatch to your cart state or context
  }

  // Calculate discount percentage if not provided
  const getDiscountPercentage = (product: Product) => {
    if (product.discountPercent) {
      return Math.round(product.discountPercent);
    }
    if (product.price && product.discountPrice) {
      return Math.round(100 - (product.discountPrice / product.price) * 100);
    }
    return 0;
  };

  // Show stock status
  const renderStockStatus = (product: Product) => {
    if (product.stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.stock <= product.lowStockAlert) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-green-500 text-green-500">
        In Stock
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Shop Our Collection</h1>
        <p className="text-lg text-gray-500">
          Discover quality products for every need
        </p>
      </div>

      {/* Search bar and filter toggle */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 md:w-auto"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <Filter size={16} />
          Filters
          <ChevronDown
            size={16}
            className={`transform transition-transform ${filtersVisible ? 'rotate-180' : ''}`}
          />
        </Button>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="priceLow">Price: Low to High</SelectItem>
            <SelectItem value="priceHigh">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="bestselling">Best Selling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters section */}
      <div
        className={`mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${filtersVisible ? 'block' : 'hidden'}`}
      >
        {/* Category filter */}
        <div>
          <h3 className="mb-3 font-medium">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price range filter */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="mb-3 font-medium">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </h3>
          <Slider
            defaultValue={[0, 500]}
            max={500}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="py-4"
          />
        </div>
      </div>

      {/* Product count */}
      <div className="mb-6">
        <p className="text-gray-500">
          Showing {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          // Skeleton loaders while loading
          Array(8)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-6">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <h3 className="mb-2 text-xl font-medium">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group flex h-full flex-col overflow-hidden"
            >
              <div className="relative">
                <Image
                  src={product.images[0]?.url || '/api/placeholder/400/400'}
                  alt={product.productName}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
                {product.freeShipping && (
                  <Badge className="absolute top-2 left-2 bg-blue-500">
                    Free Shipping
                  </Badge>
                )}
                {product.discountPrice && (
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    -{getDiscountPercentage(product)}%
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.productName}</CardTitle>
                <div className="mt-1 flex flex-wrap gap-1">
                  {renderStockStatus(product)}
                  <Badge variant="secondary">{product.condition}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-2 text-sm text-gray-500">
                  {product.category} {product.subcategory}
                </p>
                <p className="line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>

                {product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-gray-500"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </div>
                    ))}
                    {product.tags.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{product.tags.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-2">
                <div>
                  {product.discountPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">
                        ${product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleAddToCart()}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={16} />
                  {product.stock > 0 ? 'Add' : 'Sold Out'}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
