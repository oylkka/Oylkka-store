import { BadgeCheck, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatBDT } from '@/lib/currency';
import { getInitials } from '@/lib/utils';
import type { PublicProduct } from '@/services/product';
import { RatingDisplay } from './rating-display';
import { ShareProduct } from './share-product';
import { StockStatus } from './stock-status';

type ProductInfoProps = {
  product: PublicProduct;
  currentPrice?: number;
  currentOriginalPrice?: number | null;
  currentDiscountPercent?: number | null;
};

export function ProductInfo({
  product,
  currentPrice,
  currentOriginalPrice,
  currentDiscountPercent,
}: ProductInfoProps) {
  const avgRating =
    product._count.reviews > 0
      ? Object.entries(product.ratingBreakdown).reduce(
          (sum, [star, count]) => sum + Number(star) * count,
          0,
        ) / product._count.reviews
      : 0;

  const displayPrice =
    currentPrice ||
    (product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price);
  const displayOriginalPrice =
    currentOriginalPrice !== undefined
      ? currentOriginalPrice
      : product.discountPrice && product.discountPrice > 0
        ? product.price
        : null;
  const displayDiscountPercent =
    currentDiscountPercent !== undefined
      ? currentDiscountPercent
      : product.discountPercent;

  return (
    <div className='space-y-5'>
      {/* ── Badges row ── */}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          {product.brand && (
            <Badge variant='outline' className='text-xs font-medium'>
              {product.brand}
            </Badge>
          )}
          {product.freeShipping && (
            <span className='inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full'>
              <Truck className='w-2.5 h-2.5' />
              Free Shipping
            </span>
          )}
          {product.shop?.status === 'ACTIVE' && (
            <span className='inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full'>
              <BadgeCheck className='w-2.5 h-2.5' />
              Verified
            </span>
          )}
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <ShareProduct slug={product.slug} />
        </div>
      </div>

      {/* ── Product name ── */}
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight leading-tight'>
          {product.productName}
          <span className='text-primary'>.</span>
        </h1>
      </div>

      {/* ── Rating ── */}
      <div className='flex items-center gap-3 flex-wrap'>
        <RatingDisplay rating={avgRating} size='md' />
        <span className='text-sm text-muted-foreground'>
          {avgRating > 0
            ? `${avgRating.toFixed(1)} (${product._count.reviews.toLocaleString()} reviews)`
            : 'No reviews yet'}
        </span>
      </div>

      {/* ── Price ── */}
      <div className='flex items-baseline gap-3'>
        <span className='text-2xl font-bold tabular-nums'>
          ৳{formatBDT(displayPrice)}
        </span>
        {displayOriginalPrice !== null && (
          <span className='text-lg text-muted-foreground line-through tabular-nums'>
            ৳{formatBDT(displayOriginalPrice)}
          </span>
        )}
        {displayDiscountPercent && (
          <span className='text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md'>
            -{displayDiscountPercent}%
          </span>
        )}
      </div>

      {/* ── Stock status ── */}
      <StockStatus stock={product.stock} lowStockThreshold={5} />

      {/* ── Sold by ── */}
      {product.shop && (
        <div className='flex items-center gap-2 border-t border-border pt-4'>
          <span className='text-sm text-muted-foreground'>Sold by:</span>
          <div className='flex items-center gap-2'>
            <Avatar className='w-6 h-6'>
              <AvatarImage
                src={product.shop.logoUrl ?? undefined}
                alt={product.shop.name}
              />
              <AvatarFallback className='text-[10px]'>
                {getInitials(product.shop.name)}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm font-medium'>{product.shop.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
