'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  sku: string;
  category: string;
  subcategory: string;
  hasVariants: boolean;
  imageUrl: string;
}

interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const fetchProducts = async (): Promise<ProductListResponse> => {
  const { data } = await axios.get('/api/products/product-list');
  return data;
};

export default function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {return <div className="text-red-500">Error loading products</div>;}

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data?.products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.productName}
            width={400}
            height={300}
            className="h-48 w-full object-cover"
          />
          <CardContent className="p-4">
            <div className="mb-1 text-lg font-semibold">
              {product.productName}
            </div>
            <div className="text-muted-foreground mb-2 text-sm">
              {product.description}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">
                ${product.discountPrice}
              </span>
              {product.discountPrice < product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price}
                </span>
              )}
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              Stock: {product.stock}
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.subcategory}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
