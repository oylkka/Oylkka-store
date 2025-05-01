'use client';
import { Check, LayoutGrid, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import slugify from 'slugify'; // Import the slugify package

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
import { Textarea } from '@/components/ui/textarea';

import { ProductFormValues } from './product-form-type';

export function BasicInformationCard() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    isUnique: boolean | null;
    suggestions: string[];
  }>({ isUnique: null, suggestions: [] });

  // For debouncing slug check
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Watch product name to auto-generate slug
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
    if (!slugToCheck) {
      return;
    }

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
      // Use the slugify package with options
      const newSlug = slugify(productName, {
        lower: true, // Convert to lowercase
        strict: true, // Strip special characters
        trim: true, // Trim leading/trailing spaces
      });

      setValue('slug', newSlug, { shouldValidate: true });

      // Reset slug status and prepare to check
      setSlugStatus({ isUnique: null, suggestions: [] });

      // Automatically check the new slug with debouncing
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }

      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlug(newSlug);
      }, 500); // Wait 500ms after typing stops before checking
    }
  }, [productName, setValue]);

  // Check slug uniqueness when manually edited
  useEffect(() => {
    if (slug && !isCheckingSlug) {
      // Don't check if we're already checking or if the slug is empty
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }

      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlug(slug);
      }, 500); // Wait 500ms after typing stops before checking
    }
  }, [slug, isCheckingSlug]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, []);

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
        <div className="grid grid-cols-2 gap-4">
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
                  <FormDescription className="text-red-500">
                    This slug is already taken. Try one of these:
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
                  </FormDescription>
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
