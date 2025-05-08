'use client';

import { Heart, Star } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

import ShareProduct from './share-product';
import { StockStatus } from './stock-status';

interface ProductInfoProps {
  product: Product;
  inWishlist: boolean;
  toggleWishlist: () => void;
  currentStock: number;
}

export default function ProductInfo({
  product,
  inWishlist,
  toggleWishlist,
  currentStock,
}: ProductInfoProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{product.brand}</Badge>
          {product.shop?.isVerified && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              Verified Seller
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ShareProduct slug={product.slug} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            className={inWishlist ? 'text-red-500' : ''}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-5 w-5', inWishlist && 'fill-red-500')} />
          </Button>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {product.productName}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-5 w-5',
                  star <= Math.round(product.rating ?? 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {product.rating
              ? `${product.rating.toFixed(1)} (${product.reviewCount || 0} reviews)`
              : 'No ratings yet'}
          </span>
        </div>

        <Badge variant="secondary" className="ml-2">
          {product.condition}
        </Badge>

        <StockStatus stock={currentStock} lowStockThreshold={10} />
      </div>

      {/* Shop info */}
      {product.shop && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Sold by:</span>
          <div className="flex items-center gap-2">
            <Image
              width={20}
              height={20}
              src={
                product.shop.logo?.url || '/placeholder.svg?height=20&width=20'
              }
              alt={product.shop.name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{product.shop.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
