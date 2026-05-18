import { Ruler, Tag, Truck, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicProduct } from '@/services/product';

type ProductDescriptionProps = {
  product: PublicProduct;
};

export function ProductDescription({ product }: ProductDescriptionProps) {
  const hasDimensions =
    product.dimensionLength &&
    product.dimensionWidth &&
    product.dimensionHeight;
  const hasWeight = product.weight;

  return (
    <div className='space-y-8'>
      <div>
        <div className='flex items-center gap-3 mb-4'>
          <div className='h-px w-8 bg-primary' />
          <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
            Description
          </span>
        </div>
        <p className='text-sm leading-relaxed text-muted-foreground whitespace-pre-line'>
          {product.description}
        </p>
      </div>

      <div>
        <div className='flex items-center gap-3 mb-4'>
          <div className='h-px w-8 bg-primary' />
          <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
            Specifications
          </span>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {hasWeight && (
            <SpecRow
              icon={Weight}
              label='Weight'
              value={`${product.weight} ${product.weightUnit}`}
            />
          )}
          {hasDimensions && (
            <SpecRow
              icon={Ruler}
              label='Dimensions'
              value={`${product.dimensionLength} × ${product.dimensionWidth} × ${product.dimensionHeight} ${product.dimensionUnit}`}
            />
          )}
          <SpecRow
            icon={Truck}
            label='Shipping'
            value={product.freeShipping ? 'Free Shipping' : 'Standard'}
            highlight={product.freeShipping}
          />
          {product.tags.length > 0 && (
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5'>
                <Tag className='w-3.5 h-3.5 text-muted-foreground' />
              </div>
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground mb-1'>Tags</p>
                <div className='flex flex-wrap gap-1.5'>
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className='text-[10px] font-semibold tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5'>
        <Icon className='w-3.5 h-3.5 text-muted-foreground' />
      </div>
      <div className='min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p
          className={cn(
            'text-sm font-medium truncate',
            highlight && 'text-primary',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
