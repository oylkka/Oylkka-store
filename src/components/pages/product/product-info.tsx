import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import type { PublicProduct } from '@/services/product';
import { RatingDisplay } from './rating-display';
import { ShareProduct } from './share-product';
import { StockStatus } from './stock-status';

type ProductInfoProps = {
  product: PublicProduct;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const avgRating =
    product._count.reviews > 0
      ? Object.entries(product.ratingBreakdown).reduce(
          (sum, [star, count]) => sum + Number(star) * count,
          0,
        ) / product._count.reviews
      : 0;

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline'>{product.brand || 'Not specified'}</Badge>
          {product.shop?.id && (
            <Badge
              variant='secondary'
              className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            >
              Verified Seller
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <ShareProduct slug={product.slug} />
        </div>
      </div>

      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight leading-tight'>
          {product.productName}
          <span className='text-primary'>.</span>
        </h1>
      </div>

      <div className='flex items-center gap-3 flex-wrap'>
        <RatingDisplay rating={avgRating} size='md' />
        <span className='text-sm text-muted-foreground'>
          {avgRating > 0
            ? `${avgRating.toFixed(1)} (${product._count.reviews.toLocaleString()} reviews)`
            : 'No reviews yet'}
        </span>
      </div>

      <div className='flex items-baseline gap-3'>
        <span className='text-2xl font-bold tabular-nums'>
          ৳{(product.discountPrice ?? product.price).toLocaleString()}
        </span>
        {product.discountPrice && (
          <span className='text-lg text-muted-foreground line-through tabular-nums'>
            ৳{product.price.toLocaleString()}
          </span>
        )}
        {product.discountPercent && (
          <span className='text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md'>
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <StockStatus stock={product.stock} lowStockThreshold={5} />

      <div className='grid grid-cols-2 gap-3'>
        <InfoRow label='SKU' value={product.sku} />
        {product.brand && <InfoRow label='Brand' value={product.brand} />}
        <InfoRow
          label='Condition'
          value={product.condition.replace(/_/g, ' ')}
        />
        {product.freeShipping && <InfoRow label='Shipping' value='Free' />}
      </div>

      {product.conditionDescription && (
        <p className='text-sm text-muted-foreground leading-relaxed border-t border-border pt-4'>
          {product.conditionDescription}
        </p>
      )}

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start gap-3'>
      <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          {label.charAt(0)}
        </span>
      </div>
      <div className='min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-sm font-medium truncate'>{value}</p>
      </div>
    </div>
  );
}
