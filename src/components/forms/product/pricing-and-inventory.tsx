import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { ProductFormValues } from './product-form-type';

export default function PricingAndInventory() {
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const price = useWatch({ control, name: 'price' });
  const discountPrice = useWatch({ control, name: 'discountPrice' });

  useEffect(() => {
    if (price && discountPrice && discountPrice > 0 && discountPrice < price) {
      const discountPercent = Math.round(
        ((price - discountPrice) / price) * 100,
      );
      setValue('discountPercent', discountPercent);
    } else {
      setValue('discountPercent', 0);
    }
  }, [price, discountPrice, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price &amp; Stock</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor='price'>Price *</FieldLabel>
            <Input
              id='price'
              type='number'
              placeholder='Product Price'
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <FieldError>{errors.price.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.discountPrice}>
            <FieldLabel htmlFor='discountPrice'>Discount Price</FieldLabel>
            <Input
              id='discountPrice'
              type='number'
              placeholder='Discount price'
              {...register('discountPrice')}
            />
            {errors.discountPrice && (
              <FieldError>{errors.discountPrice.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='discountPercent'>Discount %</FieldLabel>
            <Input
              id='discountPercent'
              type='number'
              readOnly
              className='cursor-not-allowed'
              {...register('discountPercent', { valueAsNumber: true })}
            />
          </Field>

          <Field data-invalid={!!errors.stock}>
            <FieldLabel htmlFor='stock'>Stock</FieldLabel>
            <Input
              id='stock'
              type='number'
              placeholder='Stock quantity'
              {...register('stock', { valueAsNumber: true })}
            />
            {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.lowStockAlert}>
            <FieldLabel htmlFor='lowStockAlert'>Low Stock Alert</FieldLabel>
            <Input
              id='lowStockAlert'
              type='number'
              placeholder='Alert threshold'
              {...register('lowStockAlert', { valueAsNumber: true })}
            />
            {errors.lowStockAlert && (
              <FieldError>{errors.lowStockAlert.message}</FieldError>
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
