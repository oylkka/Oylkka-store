'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { ProductAttributes } from './product-attribute';
import type { ProductFormValues } from './product-form-type';
import VariantGenerateAlert from './variant-generate-alert';
import VariantList from './variant-list';

type AttributeHierarchy = {
  primary: string | null;
  secondary: string[];
};

export default function ProductVariant() {
  const { control, watch } = useFormContext<ProductFormValues>();

  const {
    fields: variants,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  const attributes = useWatch({ name: 'attributes' });
  const productSku = watch('sku') || '';
  const productPrice = watch('price') || 0;

  const [attributeHierarchy, setAttributeHierarchy] =
    useState<AttributeHierarchy>({
      primary: null,
      secondary: [],
    });

  useEffect(() => {
    const handleHierarchyChange = (event: CustomEvent<AttributeHierarchy>) => {
      setAttributeHierarchy(event.detail);
    };

    window.addEventListener(
      'attributeHierarchyChange',
      handleHierarchyChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'attributeHierarchyChange',
        handleHierarchyChange as EventListener
      );
    };
  }, []);

  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    // Check if attributes exists and is an object before using Object.entries
    if (attributes && typeof attributes === 'object') {
      Object.entries(attributes).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          options[key] = value;
        } else if (typeof value === 'string') {
          options[key] = [value];
        }
      });
    }

    return options;
  }, [attributes]);

  const generateAllVariants = () => {
    if (Object.keys(attributeOptions).length === 0) {
      return;
    }

    // If we have a primary attribute, use hierarchical generation
    if (
      attributeHierarchy.primary &&
      attributeOptions[attributeHierarchy.primary]
    ) {
      generateHierarchicalVariants();
    } else {
      // Fall back to the original method if no hierarchy is defined
      generateFlatVariants();
    }
  };

  const generateHierarchicalVariants = () => {
    const { primary, secondary } = attributeHierarchy;

    if (!primary || !attributeOptions[primary]) {
      return;
    }

    const primaryValues = attributeOptions[primary];
    const existingSkus = new Set(variants.map((v) => v.sku));

    // For each primary value, create a variant with secondary attributes
    primaryValues.forEach((primaryValue) => {
      // Create combinations of secondary attributes
      if (secondary.length > 0) {
        const secondaryOptions: Record<string, string[]> = {};
        secondary.forEach((secAttr) => {
          if (attributeOptions[secAttr]) {
            secondaryOptions[secAttr] = attributeOptions[secAttr];
          }
        });

        const secondaryCombinations =
          generateCombinationsForAttributes(secondaryOptions);

        // Create a variant for each secondary combination
        secondaryCombinations.forEach((secondaryCombo) => {
          const allAttributes = {
            [primary]: primaryValue,
            ...secondaryCombo,
          };

          const attributeCodes = Object.entries(allAttributes)
            .map(([key, value]) =>
              `${key.substring(0, 2)}${value.substring(0, 2)}`.toUpperCase()
            )
            .join('-');

          const baseSku = productSku
            ? `${productSku}-${attributeCodes}`
            : attributeCodes;

          const finalSku = existingSkus.has(baseSku)
            ? `${baseSku}-${Date.now()}`
            : baseSku;

          // Check if this combination already exists
          const exists = variants.some((v) => {
            if (!v.attributes) {
              return false;
            }
            return Object.entries(allAttributes).every(
              ([key, value]) => v.attributes[key] === value
            );
          });

          if (!exists) {
            // Generate a unique ID for the variant
            const variantId = `variant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            append({
              id: variantId, // Add a unique ID for each variant
              name: `${primary.charAt(0).toUpperCase() + primary.slice(1)}: ${primaryValue}`,
              sku: finalSku,
              price: productPrice,
              discountPrice: 0,
              stock: 10,
              attributes: allAttributes,
              image: null,
            });
          }
        });
      } else {
        // If no secondary attributes, just create a variant for the primary
        const allAttributes = {
          [primary]: primaryValue,
        };

        const attributeCodes =
          `${primary.substring(0, 2)}${primaryValue.substring(0, 2)}`.toUpperCase();

        const baseSku = productSku
          ? `${productSku}-${attributeCodes}`
          : attributeCodes;

        const finalSku = existingSkus.has(baseSku)
          ? `${baseSku}-${Date.now()}`
          : baseSku;

        // Check if this combination already exists
        const exists = variants.some((v) => {
          if (!v.attributes) {
            return false;
          }
          return v.attributes[primary] === primaryValue;
        });

        if (!exists) {
          // Generate a unique ID for the variant
          const variantId = `variant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          append({
            id: variantId, // Add a unique ID for each variant
            name: `${primary.charAt(0).toUpperCase() + primary.slice(1)}: ${primaryValue}`,
            sku: finalSku,
            price: productPrice,
            discountPrice: 0,
            stock: 10,
            attributes: allAttributes,
            image: null,
          });
        }
      }
    });
  };

  // Helper function to generate combinations for secondary attributes
  const generateCombinationsForAttributes = (
    attributeOptions: Record<string, string[]>
  ): Record<string, string>[] => {
    const keys = Object.keys(attributeOptions);
    const result: Record<string, string>[] = [];

    const generateHelper = (
      keys: string[],
      currentIndex: number,
      currentCombination: Record<string, string>
    ) => {
      if (currentIndex === keys.length) {
        result.push({ ...currentCombination });
        return;
      }

      const currentKey = keys[currentIndex];
      const values = attributeOptions[currentKey];

      for (const value of values) {
        currentCombination[currentKey] = value;
        generateHelper(keys, currentIndex + 1, currentCombination);
      }
    };

    generateHelper(keys, 0, {});
    return result;
  };

  const generateFlatVariants = () => {
    const generateCombinations = (
      keys: string[],
      currentIndex: number,
      currentCombination: Record<string, string>,
      result: Record<string, string>[]
    ) => {
      if (currentIndex === keys.length) {
        result.push({ ...currentCombination });
        return;
      }

      const currentKey = keys[currentIndex];
      const values = attributeOptions[currentKey];

      for (const value of values) {
        currentCombination[currentKey] = value;
        generateCombinations(
          keys,
          currentIndex + 1,
          currentCombination,
          result
        );
      }
    };

    const attrKeys = Object.keys(attributeOptions);
    const combinations: Record<string, string>[] = [];
    generateCombinations(attrKeys, 0, {}, combinations);

    const existingCombos = variants.map((v) => v.attributes);
    const existingSkus = new Set(variants.map((v) => v.sku));

    const newCombinations = combinations.filter((combo) => {
      return !existingCombos.some((existingCombo) => {
        if (!existingCombo) {
          return false;
        }
        return Object.keys(combo).every(
          (key) => existingCombo[key] === combo[key]
        );
      });
    });

    for (const [index, combo] of newCombinations.entries()) {
      const attrValues = Object.values(combo).join(' / ');

      const attributeCodes = Object.entries(combo)
        .map(([key, value]) =>
          `${key.substring(0, 2)}${value.substring(0, 2)}`.toUpperCase()
        )
        .join('-');

      // Generate SKU with index offset to ensure uniqueness
      const baseSku = productSku
        ? `${productSku}-${attributeCodes}-${index + variants.length}`
        : `${attributeCodes}-${index + variants.length}`;

      const finalSku = existingSkus.has(baseSku)
        ? `${baseSku}-${Date.now()}`
        : baseSku;

      // Generate a unique ID for the variant
      const variantId = `variant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      append({
        id: variantId, // Add a unique ID for each variant
        name: attrValues, // Default name based on attributes, but can be modified by user later
        sku: finalSku,
        price: productPrice,
        discountPrice: 0,
        stock: 10,
        attributes: combo,
        image: null,
      });
    }
  };

  const hasAttributes = Object.keys(attributeOptions).length > 0;
  const hasProductSku = productSku.trim() !== '';
  const canGenerateVariants = hasAttributes && hasProductSku;

  // Also update attributeHierarchy when attributes change
  useEffect(() => {
    if (
      attributeHierarchy.primary &&
      !attributeOptions[attributeHierarchy.primary]
    ) {
      // If the primary attribute was deleted, reset the hierarchy
      setAttributeHierarchy({
        primary: null,
        secondary: attributeHierarchy.secondary.filter(
          (attr) => attributeOptions[attr]
        ),
      });
    }

    // Filter out any secondary attributes that no longer exist
    if (attributeHierarchy.secondary.length > 0) {
      const validSecondary = attributeHierarchy.secondary.filter(
        (attr) => attributeOptions[attr]
      );

      if (validSecondary.length !== attributeHierarchy.secondary.length) {
        setAttributeHierarchy({
          ...attributeHierarchy,
          secondary: validSecondary,
        });
      }
    }
  }, [attributeOptions, attributeHierarchy]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <ProductAttributes />
      </CardHeader>
      <CardContent>
        <VariantGenerateAlert />

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Product Variants</h3>
          <div>
            <Button
              type="button"
              onClick={generateAllVariants}
              disabled={!canGenerateVariants}
              title={
                !hasProductSku
                  ? 'Product SKU must be defined first'
                  : !hasAttributes
                    ? 'Product attributes must be defined first'
                    : attributeHierarchy.primary
                      ? `Generate variants using ${attributeHierarchy.primary} as primary attribute`
                      : 'Generate all possible variants'
              }
            >
              {attributeHierarchy.primary
                ? `Generate Variants by ${attributeHierarchy.primary}`
                : 'Generate All Variants'}
            </Button>
          </div>
        </div>

        <VariantList
          variants={variants}
          onUpdate={update}
          onRemove={remove}
          hasAttributes={hasAttributes}
        />
      </CardContent>
    </Card>
  );
}
