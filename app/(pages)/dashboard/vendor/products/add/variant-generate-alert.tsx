'use client';

import { AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import type { ProductFormValues } from './product-form-type';

// Add the AttributeHierarchy type
type AttributeHierarchy = {
  primary: string | null;
  secondary: string[];
};

export default function VariantGenerateAlert() {
  const { watch } = useFormContext<ProductFormValues>();
  const attributes = watch('attributes') || {};
  const productSku = watch('sku') || '';
  const [attributeHierarchy, setAttributeHierarchy] =
    useState<AttributeHierarchy>({
      primary: null,
      secondary: [],
    });

  // Listen for hierarchy changes
  useEffect(() => {
    const handleHierarchyChange = (event: CustomEvent<AttributeHierarchy>) => {
      setAttributeHierarchy(event.detail);
    };

    window.addEventListener(
      'attributeHierarchyChange',
      handleHierarchyChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        'attributeHierarchyChange',
        handleHierarchyChange as EventListener,
      );
    };
  }, []);

  const hasAttributes = Object.keys(attributes).length > 0;
  const hasValidSku = productSku.trim() !== '';

  if (!hasAttributes && !hasValidSku) {
    return (
      <Alert className='mb-4 bg-amber-50'>
        <AlertCircle className='h-4 w-4 text-amber-600' />
        <AlertTitle className='text-amber-700'>
          No Product Variants Yet
        </AlertTitle>
        <AlertDescription className='text-amber-600'>
          Define product attributes and a unique SKU in the form above to
          generate product variants.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasAttributes) {
    return (
      <Alert className='mb-4 bg-amber-50'>
        <AlertCircle className='h-4 w-4 text-amber-600' />
        <AlertTitle className='text-amber-700'>
          No Product Attributes
        </AlertTitle>
        <AlertDescription className='text-amber-600'>
          Define product attributes in the form above to generate product
          variants.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasValidSku) {
    return (
      <Alert className='mb-4 bg-amber-50'>
        <AlertCircle className='h-4 w-4 text-amber-600' />
        <AlertTitle className='text-amber-700'>No Product SKU</AlertTitle>
        <AlertDescription className='text-amber-600'>
          A product SKU is required before generating variants. Please define a
          unique SKU for this product.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate potential variant count based on hierarchy
  const calculateVariantCount = () => {
    if (attributeHierarchy.primary && attributes[attributeHierarchy.primary]) {
      const primaryCount = Array.isArray(attributes[attributeHierarchy.primary])
        ? attributes[attributeHierarchy.primary].length
        : 1;

      if (attributeHierarchy.secondary.length > 0) {
        const secondaryCount = attributeHierarchy.secondary.reduce(
          (acc, attr) => {
            if (!attributes[attr]) {
              return acc;
            }
            return (
              acc *
              (Array.isArray(attributes[attr]) ? attributes[attr].length : 1)
            );
          },
          1,
        );

        return primaryCount * secondaryCount;
      }

      return primaryCount;
    }

    // Default calculation for all combinations
    return Object.values(attributes).reduce(
      (acc, values) => acc * (Array.isArray(values) ? values.length : 1),
      1,
    );
  };

  return (
    <Alert className='bg-primary/5 mb-4'>
      <Info className='h-4 w-4' />
      <AlertTitle>Product Variants</AlertTitle>
      <AlertDescription>
        {attributeHierarchy.primary ? (
          <>
            Click &#34;Generate Variants&#34; to create variants grouped by
            {attributeHierarchy.primary}.
            {attributeHierarchy.secondary.length > 0 && (
              <span>
                Each {attributeHierarchy.primary} will have variations of{' '}
                {attributeHierarchy.secondary.join(', ')}.
              </span>
            )}
          </>
        ) : (
          <>
            Click &#34;Generate Variants&#34; to automatically create all
            possible product variants based on your attributes.
          </>
        )}
        {Object.keys(attributes).length > 0 && (
          <span className='mt-1 block font-semibold'>
            Number of possible variants: {calculateVariantCount()}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
