import { Ruler, Tag, Weight } from 'lucide-react';
import type { PublicProduct } from '@/services/product';

type ProductDetailsProps = {
  product: PublicProduct;
};

function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

function isColorAttr(name: string) {
  return name.toLowerCase() === 'color' || name.toLowerCase() === 'colour';
}

/**
 * Whether the Details section has anything worth showing. The route gates the
 * whole section (header + card) on this, so the markup lives next to the rows
 * that decide it. Same signals the block always keyed off — SKU and condition
 * only render once one of these is present, as before.
 */
export function productHasDetails(product: PublicProduct): boolean {
  return [
    product.hasVariants && product.attributeOptions.length > 0,
    !!product.brand,
    product.tags.length > 0,
    !!product.weight,
    hasDimensions(product),
  ].some(Boolean);
}

function hasDimensions(product: PublicProduct): boolean {
  return (
    (product.dimensionLength ?? 0) > 0 &&
    (product.dimensionWidth ?? 0) > 0 &&
    (product.dimensionHeight ?? 0) > 0
  );
}

export function ProductDetails({ product }: ProductDetailsProps) {
  if (!productHasDetails(product)) return null;

  return (
    <div className='space-y-4'>
      {/* Variant attribute options — read-only summary */}
      {product.hasVariants &&
        product.attributeOptions.map((attr) => (
          <div key={attr.id} className='flex items-start gap-3'>
            <span className='text-xs text-muted-foreground font-medium min-w-18 pt-0.5'>
              {attr.name}
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {(attr.attributeValues?.length
                ? attr.attributeValues
                : attr.values.map((v) => ({
                    value: v,
                    slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    imageUrl: null,
                  }))
              ).map((val) => {
                const displayValue = typeof val === 'string' ? val : val.value;
                const imgUrl = typeof val === 'object' ? val.imageUrl : null;
                if (isColorAttr(attr.name) && isHexColor(displayValue)) {
                  return (
                    <span
                      key={
                        typeof val === 'string' ? val : val.slug || val.value
                      }
                      className='inline-flex items-center gap-1.5 text-xs bg-background border border-border rounded-full px-2 py-0.5'
                    >
                      <span
                        className='w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-border bg-cover bg-center'
                        style={
                          imgUrl
                            ? { backgroundImage: `url(${imgUrl})` }
                            : { backgroundColor: displayValue }
                        }
                      />
                      {displayValue}
                    </span>
                  );
                }
                return (
                  <span
                    key={typeof val === 'string' ? val : val.slug || val.value}
                    className='inline-flex items-center text-xs bg-background border border-border rounded-full px-2.5 py-0.5'
                  >
                    {displayValue}
                  </span>
                );
              })}
            </div>
          </div>
        ))}

      {/* Tags — key attributes for non-variant products */}
      {product.tags.length > 0 && (
        <div className='flex items-start gap-3'>
          <Tag className='w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0' />
          <div className='flex flex-wrap gap-1.5'>
            {product.tags.map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center text-xs bg-background text-foreground border border-border rounded-full px-2.5 py-0.5 capitalize'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      {product.brand && <AttrRow label='Brand' value={product.brand} />}

      {/* SKU */}
      <AttrRow label='SKU' value={product.sku} />

      {/* Condition — only shown when not the default "NEW" */}
      {product.condition !== 'NEW' && (
        <AttrRow
          label='Condition'
          value={product.condition.replace(/_/g, ' ')}
        />
      )}

      {/* Weight */}
      {product.weight && (
        <div className='flex items-center gap-3'>
          <Weight className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
          <span className='text-xs text-muted-foreground min-w-18'>Weight</span>
          <span className='text-xs font-medium text-foreground'>
            {product.weight} {product.weightUnit}
          </span>
        </div>
      )}

      {/* Dimensions */}
      {hasDimensions(product) && (
        <div className='flex items-center gap-3'>
          <Ruler className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
          <span className='text-xs text-muted-foreground min-w-18'>
            Dimensions
          </span>
          <span className='text-xs font-medium text-foreground'>
            {product.dimensionLength} × {product.dimensionWidth} ×{' '}
            {product.dimensionHeight} {product.dimensionUnit}
          </span>
        </div>
      )}
    </div>
  );
}

function AttrRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center gap-3'>
      <span className='text-xs text-muted-foreground font-medium min-w-18'>
        {label}
      </span>
      <span className='text-xs font-medium text-foreground'>{value}</span>
    </div>
  );
}
