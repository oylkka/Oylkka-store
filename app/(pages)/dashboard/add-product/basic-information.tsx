// components/product/BasicInformationCard.tsx
'use client';

import { LayoutGrid } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ProductFormValues } from './product-form-type';

export function BasicInformationCard() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <LayoutGrid className="h-5 w-5" />
        <span className="text-lg font-semibold">Basic Information</span>
      </CardHeader>
      <CardContent className="grid gap-6">
        <FormField
          control={control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product in detail"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
