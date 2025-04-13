// components/product/BasicInformationCard.tsx
'use client';

import { LayoutGrid } from 'lucide-react';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';
import { productCategories } from '@/constant';

import { ProductFormContext } from './product-form-context';

export function BasicInformationCard() {
  const { control, setValue } = useFormContext();
  const { selectedCategory, setSelectedCategory } =
    useContext(ProductFormContext);

  const subcategories =
    productCategories.find((category) => category.value === selectedCategory)
      ?.subcategories || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <LayoutGrid className="h-5 w-5" />
        <span className="text-lg font-semibold">Basic Information</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormField
          control={control}
          name="productname"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
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
            <FormItem className="lg:col-span-2">
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Category *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedCategory(value);
                  setValue('subcategory', '');
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="subcategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Category *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedCategory}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sub category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subcategory</SelectLabel>
                    {subcategories.map((subcategory) => (
                      <SelectItem
                        key={subcategory.value}
                        value={subcategory.value}
                      >
                        {subcategory.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Tags (max 6)</FormLabel>
              <TagsInput
                value={field.value}
                onValueChange={(newTags) => {
                  // Only update if we're not exceeding the limit
                  if (newTags.length <= 6) {
                    field.onChange(newTags);
                  }
                }}
                placeholder="Enter tags"
              />
              <FormDescription>
                {field.value.length}/6 tags used
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
