import { AlertCircle, Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { ProductFormValues } from './product-form-type';

export default function VariantGenerateAlert() {
  const { watch } = useFormContext<ProductFormValues>();
  const attributes = watch('attributes') || {};
  const productSku = watch('sku') || '';

  const hasAttributes = Object.keys(attributes).length > 0;
  const hasValidSku = productSku.trim() !== '';

  if (!hasAttributes && !hasValidSku) {
    return (
      <Alert className="mb-4 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">
          No Product Variants Yet
        </AlertTitle>
        <AlertDescription className="text-amber-600">
          Define product attributes and a unique SKU in the form above to
          generate product variants.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasAttributes) {
    return (
      <Alert className="mb-4 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">
          No Product Attributes
        </AlertTitle>
        <AlertDescription className="text-amber-600">
          Define product attributes in the form above to generate product
          variants.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasValidSku) {
    return (
      <Alert className="mb-4 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">No Product SKU</AlertTitle>
        <AlertDescription className="text-amber-600">
          A product SKU is required before generating variants. Please define a
          unique SKU for this product.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 bg-primary/5">
      <Info className="h-4 w-4" />
      <AlertTitle>Product Variants</AlertTitle>
      <AlertDescription>
        Click &#34;Generate Variants&#34; to automatically create all possible
        product variants based on your attributes.
        {Object.keys(attributes).length > 0 && (
          <span className="mt-1 block font-semibold">
            Number of possible variants:{' '}
            {Object.values(attributes).reduce(
              (acc, values) =>
                acc * (Array.isArray(values) ? values.length : 1),
              1
            )}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
