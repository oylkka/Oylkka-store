'use client';
import { Check, LayoutGrid, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import slugify from 'slugify';

import { checkSlugUnique } from '@/actions';
import { Button } from '@/components/ui/button';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';
import { useProductCategories } from '@/services';

import { ProductFormValues } from './product-form-type';

export function BasicInformationCard() {
  const {
    isPending,
    data: productCategories,
    isError,
  } = useProductCategories();
  const { control, setValue } = useFormContext<ProductFormValues>();
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    isUnique: boolean | null;
    suggestions: string[];
  }>({ isUnique: null, suggestions: [] });

  // For debouncing slug check
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedSlug = useRef<string>('');

  // Watch product name and slug
  const productName = useWatch({
    control,
    name: 'productName',
  });

  const slug = useWatch({
    control,
    name: 'slug',
  });

  // Function to check slug uniqueness
  const checkSlug = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck === lastCheckedSlug.current) {
      return;
    }

    lastCheckedSlug.current = slugToCheck;
    setIsCheckingSlug(true);

    try {
      const result = await checkSlugUnique(slugToCheck);
      setSlugStatus({
        isUnique: result.isUnique,
        suggestions: result.suggestions || [],
      });
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Auto-generate slug when product name changes
  useEffect(() => {
    if (productName) {
      const newSlug = slugify(productName, {
        lower: true,
        strict: true,
        trim: true,
      });
      setValue('slug', newSlug, { shouldValidate: true });
    }
  }, [productName, setValue]);

  // Handle slug checking with debounce
  useEffect(() => {
    if (!slug || isCheckingSlug) {
      return;
    }

    if (slug === lastCheckedSlug.current) {
      return;
    }

    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
    }

    slugCheckTimeoutRef.current = setTimeout(() => {
      checkSlug(slug);
    }, 500);

    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, [slug, isCheckingSlug]);

  // Apply suggested slug
  const applySuggestion = (suggestion: string) => {
    setValue('slug', suggestion, { shouldValidate: true });
    setSlugStatus({ isUnique: true, suggestions: [] });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <LayoutGrid className="h-5 w-5" />
        <span className="text-lg font-semibold">Basic Information</span>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Slug *</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder="product-slug"
                      {...field}
                      className={
                        slugStatus.isUnique === true
                          ? 'border-green-500 pr-8'
                          : slugStatus.isUnique === false
                            ? 'border-red-500 pr-8'
                            : 'pr-8'
                      }
                    />
                    {isCheckingSlug && (
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!isCheckingSlug && slugStatus.isUnique === true && (
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {!isCheckingSlug && slugStatus.isUnique === false && (
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                </FormControl>
                {!isCheckingSlug && slugStatus.isUnique === false && (
                  <div className="text-sm">
                    <p className="text-red-500">
                      This slug is already taken. Try one of these:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slugStatus.suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product in detail"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                {isPending ? (
                  <Skeleton className="h-8 w-full" />
                ) : isError ? (
                  <div>Error</div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your product category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productCategories.map(
                        (category: { slug: string; name: string }) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input placeholder="Brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter your product tags.</FormLabel>
              <FormControl>
                <TagsInput
                  className="border"
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Enter your tags"
                />
              </FormControl>
              <FormDescription>
                Write your product tag then press enter
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
