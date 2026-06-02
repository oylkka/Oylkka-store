import type { PublicProduct } from '@/services/product';

type ProductDescriptionProps = {
  product: PublicProduct;
};

export function ProductDescription({ product }: ProductDescriptionProps) {
  return (
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
  );
}
