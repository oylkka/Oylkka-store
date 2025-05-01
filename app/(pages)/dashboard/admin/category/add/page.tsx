'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import { toast } from 'sonner';
import { z } from 'zod';

import { checkCategorySlugUniqueness, createCategory } from '@/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useProductCategories } from '@/services';

import { ImageUpload } from './image-upload';

export const categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Books' },
  { id: '4', name: 'Home & Kitchen' },
  { id: '5', name: 'Beauty & Personal Care' },
  { id: '6', name: 'Sports & Outdoors' },
];

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        'Slug can only contain lowercase letters, numbers, and hyphens. No spaces or special characters allowed.',
    }),
  parentId: z.string(),
  featured: z.boolean().default(false).optional(),
  description: z.string().optional(),
  image: z.any().optional(),
  order: z.number().default(0).optional(),
});

export default function AddCategory() {
  const { isPending, data, isError, refetch } = useProductCategories();
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugDebounceTimeout, setSlugDebounceTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const imageUploadRef = useRef<{ resetUpload: () => void } | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      slug: '',
      parentId: 'none',
      featured: false,
      description: '',
      image: undefined,
      order: 0,
    },
  });

  // Watch the name field to auto-generate slug
  const watchName = form.watch('name');
  const watchSlug = form.watch('slug');

  // Generate slug from name
  useEffect(() => {
    if (watchName) {
      const slug = slugify(watchName, {
        lower: true,
        strict: true,
        trim: true,
      });
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [watchName, form]);

  // Format slug input to enforce valid slug format
  const formatSlugInput = (value: string) => {
    return slugify(value, {
      lower: true, // Convert to lowercase
      strict: true, // Strip special characters
      trim: true, // Trim leading/trailing spaces
    });
  };

  // Check slug uniqueness with debounce
  useEffect(() => {
    if (watchSlug && watchSlug.length >= 2) {
      // Clear previous timeout
      if (slugDebounceTimeout) {
        clearTimeout(slugDebounceTimeout);
      }

      // Set new timeout for debounce
      const timeout = setTimeout(async () => {
        await checkSlugAvailability(watchSlug);
      }, 500); // 500ms debounce

      setSlugDebounceTimeout(timeout);
    }

    return () => {
      if (slugDebounceTimeout) {
        clearTimeout(slugDebounceTimeout);
      }
    };
  }, [watchSlug, slugDebounceTimeout]);

  // Function to check slug availability
  const checkSlugAvailability = async (slug: string) => {
    try {
      setIsCheckingSlug(true);
      setSlugError(null);
      setSlugSuggestions([]);

      const result = await checkCategorySlugUniqueness(slug);

      if (!result.isUnique) {
        setSlugSuggestions(result.suggestions);
        setSlugError('This slug is already in use.');
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Apply slug suggestion
  const applySlugSuggestion = (suggestion: string) => {
    form.setValue('slug', suggestion, { shouldValidate: true });
    setSlugSuggestions([]);
    setSlugError(null);
  };

  // Reset the form completely, including the image
  const resetForm = () => {
    form.reset({
      name: '',
      slug: '',
      parentId: 'none',
      featured: false,
      description: '',
      image: undefined,
      order: 0,
    });
    setSlugSuggestions([]);
    setSlugError(null);

    // Reset the image upload component
    if (imageUploadRef.current) {
      imageUploadRef.current.resetUpload();
    }
  };

  // Form submission handler
  async function onSubmit(values: z.infer<typeof FormSchema>) {
    // Prepare form data for server action
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('parentId', values.parentId);
    formData.append('featured', values.featured ? 'true' : 'false');

    if (values.description) {
      formData.append('description', values.description);
    }

    if (values.order !== undefined) {
      formData.append('order', values.order.toString());
    }

    if (values.image) {
      formData.append('image', values.image);
    }

    // Use Sonner's promise toast
    toast.promise(createCategory(formData), {
      loading: 'Creating category...',
      success: (result) => {
        if (result.success) {
          // Reset the form including the image
          resetForm();
          refetch();
          return 'Category created successfully!';
        } else {
          // If there's a uniqueness error, show suggestions
          if (result.uniqueCheck) {
            setSlugSuggestions(result.uniqueCheck.suggestions);
            setSlugError('This slug is already in use.');
          }
          throw new Error(result.message || 'Failed to create category');
        }
      },
      error: (error) => {
        console.error('Error creating category:', error);
        return error instanceof Error ? error.message : 'Something went wrong';
      },
    });
  }

  // Manual slug check button handler
  const handleManualSlugCheck = async () => {
    const slug = form.getValues('slug');
    if (slug) {
      await checkSlugAvailability(slug);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Add New Category
          </CardTitle>
          <CardDescription className="text-center">
            Create a new product category or subcategory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="category-slug"
                              {...field}
                              className={
                                !slugError
                                  ? 'border-green-600'
                                  : 'border-red-500'
                              }
                              onChange={(e) => {
                                // Auto-format the slug as the user types
                                const formattedValue = formatSlugInput(
                                  e.target.value
                                );
                                field.onChange(formattedValue);
                              }}
                              onPaste={(e) => {
                                // Format pasted content
                                e.preventDefault();
                                const pastedText =
                                  e.clipboardData.getData('text');
                                const formattedValue =
                                  formatSlugInput(pastedText);
                                field.onChange(formattedValue);
                              }}
                              onBlur={(e) => {
                                // Ensure slug is formatted on blur
                                const formattedValue = formatSlugInput(
                                  e.target.value
                                );
                                field.onChange(formattedValue);
                                field.onBlur();
                              }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isCheckingSlug || !field.value}
                            onClick={handleManualSlugCheck}
                          >
                            {isCheckingSlug ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {isCheckingSlug && (
                          <div className="text-muted-foreground mt-2 text-xs">
                            Checking availability...
                          </div>
                        )}

                        {slugError && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{slugError}</AlertDescription>
                          </Alert>
                        )}

                        {slugSuggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-muted-foreground mb-2 text-sm">
                              Suggested alternatives:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {slugSuggestions.map((suggestion) => (
                                <Badge
                                  key={suggestion}
                                  variant="outline"
                                  className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                                  onClick={() =>
                                    applySlugSuggestion(suggestion)
                                  }
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <FormDescription>
                          Auto-generated from name. Used in URLs. Only lowercase
                          letters, numbers, and hyphens allowed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order */}
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers display first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parent Category */}
                  {/* Parent Category */}
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue="none"
                          disabled={isPending || isError}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Default option for no parent */}
                            <SelectItem value="none">
                              None (Top-level category)
                            </SelectItem>

                            {/* Loading state */}
                            {isPending && (
                              <div className="text-muted-foreground p-2 text-sm">
                                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                Loading categories...
                              </div>
                            )}

                            {/* Error state */}
                            {isError && (
                              <div className="p-2 text-sm text-red-500">
                                Failed to load categories
                              </div>
                            )}

                            {/* No data state */}
                            {!isPending &&
                              !isError &&
                              data?.json?.length === 0 && (
                                <div className="text-muted-foreground p-2 text-sm">
                                  No categories found
                                </div>
                              )}

                            {/* Category options */}
                            {!isPending &&
                              !isError &&
                              data?.length > 0 &&
                              data.map(
                                (category: { id: string; name: string }) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                )
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  {/* Image */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            previewUrl={imagePreview}
                            onPreviewChange={setImagePreview}
                            ref={imageUploadRef}
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended: 512×512px square image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the category"
                            className="h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Featured */}
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Category</FormLabel>
                          <FormDescription>
                            Display prominently on the website
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isCheckingSlug || !!slugError}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
