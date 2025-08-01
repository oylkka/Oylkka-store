'use client';

import colorNamer from 'color-namer';
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
      handleHierarchyChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        'attributeHierarchyChange',
        handleHierarchyChange as EventListener,
      );
    };
  }, []);

  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    // Add a check to make sure attributes is defined before calling Object.entries
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

  // Enhanced function to get a readable name for a color hex value
  const getReadableColorName = (colorValue: string): string => {
    // Check if it's a hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      // Get color names from color-namer
      const names = colorNamer(colorValue);

      // Try to get the most accurate and readable color name
      // Start with the most recognized naming systems

      // First priority: Use 'basic' names as they're most common
      if (names.basic && names.basic.length > 0) {
        return capitalizeColorName(names.basic[0].name);
      }

      // Second priority: Use 'ntc' (Name That Color) which has good names
      if (names.ntc && names.ntc.length > 0) {
        return capitalizeColorName(names.ntc[0].name);
      }

      // Third priority: Try roygbiv which focuses on standard color names
      if (names.roygbiv && names.roygbiv.length > 0) {
        return capitalizeColorName(names.roygbiv[0].name);
      }

      // Fourth priority: Use pantone for more technical color names
      if (names.pantone && names.pantone.length > 0) {
        return capitalizeColorName(names.pantone[0].name);
      }
    }

    // Return the original value if it's not a hex color or if there was an error
    return colorValue;
  };

  // Function to properly capitalize color names
  const capitalizeColorName = (name: string): string => {
    // Handle multi-word color names
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format attribute name for display
  const formatAttributeName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Improved function to create a readable variant name
  const createVariantName = (
    attributes: Record<string, string>,
    primary: string | null,
  ): string => {
    if (!attributes) {
      return 'Variant';
    }

    // If we have a primary attribute, use it as the main identifier
    if (primary && attributes[primary]) {
      const primaryValue = attributes[primary];
      const formattedName = formatAttributeName(primary);

      // If the primary attribute is color and the value is a hex code, use a readable name
      if (primary.toLowerCase() === 'color') {
        const colorName = getReadableColorName(primaryValue);
        return `${formattedName}: ${colorName}`;
      }

      return `${formattedName}: ${primaryValue}`;
    }

    // With no primary attribute, build a more readable combined name
    const attributePairs = Object.entries(attributes).map(([key, value]) => {
      const formattedKey = formatAttributeName(key);

      // Special handling for color attributes
      if (key.toLowerCase() === 'color') {
        return `${formattedKey}: ${getReadableColorName(value)}`;
      }

      return `${formattedKey}: ${value}`;
    });

    // Join with commas for better readability
    return attributePairs.join(', ');
  };

  // Helper function to create a short code for SKU generation
  const createAttributeCode = (
    attributeName: string,
    attributeValue: string,
  ): string => {
    // For color attributes, use the first 2 chars of the readable name for the code
    if (
      attributeName.toLowerCase() === 'color' &&
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(attributeValue)
    ) {
      const colorName = getReadableColorName(attributeValue);
      // Take first two letters of each word for multi-word color names
      const code = colorName
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();

      // Ensure we have at least 2 characters
      return code.length >= 2 ? code : code.padEnd(2, 'X');
    }

    // For non-color attributes, use first 2 chars of attribute name + value
    return `${attributeName.substring(0, 2)}${attributeValue.substring(0, 2)}`.toUpperCase();
  };

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
            .map(([key, value]) => createAttributeCode(key, value))
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
              ([key, value]) => v.attributes[key] === value,
            );
          });

          if (!exists) {
            // Generate a unique ID for the variant
            const variantId = `variant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Create a readable variant name
            const variantName = createVariantName(allAttributes, primary);

            append({
              id: variantId,
              name: variantName,
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

        const attributeCodes = createAttributeCode(primary, primaryValue);

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

          // Create a readable variant name
          const variantName = createVariantName(allAttributes, primary);

          append({
            id: variantId,
            name: variantName,
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
    attributeOptions: Record<string, string[]>,
  ): Record<string, string>[] => {
    const keys = Object.keys(attributeOptions);
    const result: Record<string, string>[] = [];

    const generateHelper = (
      keys: string[],
      currentIndex: number,
      currentCombination: Record<string, string>,
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
      result: Record<string, string>[],
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
          result,
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
          (key) => existingCombo[key] === combo[key],
        );
      });
    });

    for (const [index, combo] of newCombinations.entries()) {
      // Create a readable variant name
      const variantName = createVariantName(combo, null);

      const attributeCodes = Object.entries(combo)
        .map(([key, value]) => createAttributeCode(key, value))
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
        id: variantId,
        name: variantName,
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

  return (
    <Card className='mb-6'>
      <CardHeader>
        <ProductAttributes />
      </CardHeader>
      <CardContent>
        <VariantGenerateAlert />

        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Product Variants</h3>
          <div>
            <Button
              type='button'
              onClick={generateAllVariants}
              disabled={!canGenerateVariants}
              title={
                !hasProductSku
                  ? 'Product SKU must be defined first'
                  : !hasAttributes
                    ? 'Product attributes must be defined first'
                    : attributeHierarchy.primary
                      ? `Generate variants using ${formatAttributeName(attributeHierarchy.primary)} as primary attribute`
                      : 'Generate all possible variants'
              }
            >
              {attributeHierarchy.primary
                ? `Generate Variants by ${formatAttributeName(attributeHierarchy.primary)}`
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
