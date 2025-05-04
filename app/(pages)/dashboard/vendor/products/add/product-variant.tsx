import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { ProductAttributes } from './product-attribute';
import { ProductFormValues } from './product-form-type';
import VariantGenerateAlert from './variant-generate-alert';
import VariantList from './variant-list';

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

  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    Object.entries(attributes).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        options[key] = value;
      } else if (typeof value === 'string') {
        options[key] = [value];
      }
    });

    return options;
  }, [attributes]);

  const generateAllVariants = () => {
    if (Object.keys(attributeOptions).length === 0) {return;}

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
        if (!existingCombo) {return false;}
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

      append({
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
                    : 'Generate all possible variants'
              }
            >
              Generate Variants
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
