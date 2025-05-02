'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { ProductFormValues } from './product-form-type';

export default function PriceAndInventory() {
  const { control, setValue } = useFormContext<ProductFormValues>();

  // Watch price and discountPrice fields to calculate discount percentage
  const price = useWatch({ control, name: 'price' });
  const discountPrice = useWatch({ control, name: 'discountPrice' });

  // Calculate discount percentage when price or discountPrice changes
  useEffect(() => {
    if (
      price &&
      discountPrice &&
      price > 0 &&
      discountPrice > 0 &&
      discountPrice < price
    ) {
      const discountPercent = Math.round(
        ((price - discountPrice) / price) * 100
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span>Price *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Product Price"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Discount price"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseFloat(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="discountPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    readOnly
                    {...field}
                    value={field.value !== undefined ? field.value : '0'}
                    className="cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span>Stock</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Stock quantity"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lowStockAlert"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span>Low Stock Alert</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Alert threshold"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
