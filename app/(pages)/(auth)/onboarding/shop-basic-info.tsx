'use client';

import { Building, Link, MapPin, Tag } from 'lucide-react';
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
import { OnboardingFormValues } from '@/schemas';

import { SlugUniquenessChecker } from './check-slug-uniqueness';

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
  const { control } = useFormContext<OnboardingFormValues>();

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
                      // Transform input to valid slug format
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '');
                      field.onChange(value);
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
