'use client';

import { Heart, Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';

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

      <h1 className="text-3xl font-bold tracking-tight">
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
                    : 'fill-gray-200 text-gray-200 dark:fill-gray-600'
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground ml-2 text-sm">
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
          <span className="text-muted-foreground text-sm">Sold by:</span>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={product.shop.logo?.url}
                alt={product.shop.name}
              />
              <AvatarFallback>{getInitials(product.shop.name)}</AvatarFallback>
            </Avatar>

            <span className="text-sm font-medium">{product.shop.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
