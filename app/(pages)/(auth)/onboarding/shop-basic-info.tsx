'use client';

import { Building, Link, MapPin, Tag } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingFormValues } from '@/schemas';

import { SlugUniquenessChecker } from './check-slug-uniqueness';

// Slugify function to convert text to URL-friendly format
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters except hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

// Shop categories
const SHOP_CATEGORIES = [
  { value: 'electronics', label: 'Electronics & Tech' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'food', label: 'Food & Groceries' },
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'other', label: 'Other' },
];

export default function ShopBasicInfo() {
  const { control, watch, setValue } = useFormContext<OnboardingFormValues>();

  // Watch for shop name changes to auto-generate slug
  const shopName = watch('shopName');

  // Auto-generate slug when shop name changes - simplified and optimized
  useEffect(() => {
    if (shopName) {
      // Only update if there's a shop name
      const newSlug = slugify(shopName);

      // Use a timeout to avoid blocking the UI
      setTimeout(() => {
        setValue('shopSlug', newSlug);
      }, 0);
    }
  }, [shopName, setValue]);

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Building className="text-muted-foreground h-4 w-4" />
                Shop Name *
              </FormLabel>
              <FormControl>
                <Input placeholder="Your Shop Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shopSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Link className="text-muted-foreground h-4 w-4" />
                Shop Slug *
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="your-shop-slug"
                    {...field}
                    onChange={(e) => {
                      // Just set the value directly - slugify is already applied
                      field.onChange(slugify(e.target.value));
                    }}
                  />
                </FormControl>
                <SlugUniquenessChecker />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="shopCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Tag className="text-muted-foreground h-4 w-4" />
                Shop Category *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your shop category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SHOP_CATEGORIES.map((category) => (
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
          name="shopAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="text-muted-foreground h-4 w-4" />
                Shop Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Market St, San Francisco, CA"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="shopDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shop Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell customers about your shop, products, and what makes your business unique..."
                className="min-h-[120px] resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
