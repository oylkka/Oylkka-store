'use client';

import { StoreIcon } from 'lucide-react';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ShopInfoSectionProps {
  form: UseFormReturn<any>;
}

export default function ShopInfoSection({ form }: ShopInfoSectionProps) {
  // Generate slug from shop name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }, []);

  // Shop form fields configuration
  const shopFields = [
    {
      name: 'shopCategory',
      placeholder: 'Electronics, Fashion, Home Goods...',
      label: 'Category',
      className: 'md:col-span-2',
    },
    {
      name: 'shopEmail',
      placeholder: 'shop@example.com',
      label: 'Shop Email',
    },
    {
      name: 'shopPhone',
      placeholder: '+1 (555) 123-4567',
      label: 'Shop Phone',
    },
  ];

  return (
    <Card className="animate-in slide-in-from-bottom-3 transition-all duration-500 hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-2">
        <div>
          <CardTitle className="group flex items-center gap-2 text-2xl">
            <StoreIcon className="text-primary h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            Shop Information
          </CardTitle>
          <CardDescription>Tell customers about your shop</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="shopName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Amazing Electronics"
                    {...field}
                    className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      form.setValue('shopSlug', generateSlug(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shopSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop URL*</FormLabel>
                <FormControl>
                  <div className="bg-background focus-within:ring-ring flex items-center rounded-md border px-3 focus-within:ring-1">
                    <span className="text-muted-foreground text-sm">
                      yourdomain.com/shop/
                    </span>
                    <Input
                      {...field}
                      className="border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {shopFields.map(({ name, placeholder, label, className }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as any}
              render={({ field }) => (
                <FormItem className={className}>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={placeholder}
                      {...field}
                      className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="shopDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers what makes your shop special..."
                  {...field}
                  className="focus:ring-primary/20 min-h-28 resize-y transition-all duration-200 focus:ring-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shopAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Full shop address including city, state/province, and zip/postal code"
                  {...field}
                  className="focus:ring-primary/20 min-h-24 resize-y transition-all duration-200 focus:ring-2"
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
