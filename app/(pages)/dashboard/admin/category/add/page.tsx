'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { useAdminProductCategories } from '@/services';

import { ImageUpload } from './image-upload';

// Define types for our form
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
  featured: z.boolean(),
  description: z.string().max(200).optional(),
  image: z.any().refine((val) => !!val, {
    message: 'Image is required',
  }),
});

// Type for form values
type FormValues = z.infer<typeof FormSchema>;

// Type for category data
interface Category {
  id: string;
  name: string;
}

// Type for slug check response
interface SlugCheckResponse {
  isUnique: boolean;
  suggestions: string[];
}

export default function AddCategory(): JSX.Element {
  const { isPending, data, isError, refetch } = useAdminProductCategories();
  const [isCheckingSlug, setIsCheckingSlug] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);

  // Ref for slug check debounce
  const slugDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageUploadRef = useRef<{ resetUpload: () => void } | null>(null);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      slug: '',
      parentId: 'none',
      featured: false,
      description: '',
      image: undefined,
    },
    mode: 'onChange', // Enable validation on change
  });

  // Watch form values using useWatch
  const name = useWatch({ control: form.control, name: 'name' });
  const slug = useWatch({ control: form.control, name: 'slug' });

  // Format slug to enforce valid slug format
  const formatSlugInput = (value: string): string => {
    return slugify(value, {
      lower: true, // Convert to lowercase
      strict: true, // Strip special characters
      trim: true, // Trim leading/trailing spaces
    });
  };

  // Auto-generate slug from name when name changes
  useEffect(() => {
    if (name && !isSlugManuallyEdited) {
      const generatedSlug = formatSlugInput(name);
      if (generatedSlug !== slug) {
        form.setValue('slug', generatedSlug, { shouldValidate: true });
      }
    }
  }, [name, form, isSlugManuallyEdited, slug]);

  // Check slug when it changes (with debounce)
  useEffect(() => {
    // Only run checks if slug is valid and not empty
    if (slug && slug.length >= 2) {
      // Clear previous timeout
      if (slugDebounceTimeoutRef.current) {
        clearTimeout(slugDebounceTimeoutRef.current);
      }

      // Set new timeout for debounce
      slugDebounceTimeoutRef.current = setTimeout(() => {
        checkSlugAvailability(slug);
      }, 500); // 500ms debounce
    }

    return () => {
      if (slugDebounceTimeoutRef.current) {
        clearTimeout(slugDebounceTimeoutRef.current);
      }
    };
  }, [slug]);

  // Check slug availability
  const checkSlugAvailability = async (slugValue: string): Promise<void> => {
    if (!slugValue || slugValue.length < 2) {
      return;
    }

    try {
      setIsCheckingSlug(true);
      setSlugError(null);
      setSlugSuggestions([]);

      const result = (await checkCategorySlugUniqueness(
        slugValue
      )) as SlugCheckResponse;

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
  const applySlugSuggestion = (suggestion: string): void => {
    form.setValue('slug', suggestion, { shouldValidate: true });
    setSlugSuggestions([]);
    setSlugError(null);
  };

  // Handle slug field change - mark as manually edited
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    const formattedValue = formatSlugInput(value);

    setIsSlugManuallyEdited(true);
    form.setValue('slug', formattedValue, { shouldValidate: true });
  };

  // Reset the form completely, including the image
  const resetForm = (): void => {
    form.reset({
      name: '',
      slug: '',
      parentId: 'none',
      featured: false,
      description: '',
      image: undefined,
    });
    setSlugSuggestions([]);
    setSlugError(null);
    setIsSlugManuallyEdited(false);

    // Reset the image upload component
    if (imageUploadRef.current) {
      imageUploadRef.current.resetUpload();
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues): Promise<void> => {
    // Prepare form data for server action
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('parentId', values.parentId);
    formData.append('featured', values.featured ? 'true' : 'false');

    if (values.description) {
      formData.append('description', values.description);
    }

    if (values.image) {
      formData.append('image', values.image);
    }

    // Use Sonner's promise toast
    toast.promise(createCategory(formData), {
      loading: 'Creating category...',

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: (result: any) => {
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
      error: (error: unknown) => {
        console.error('Error creating category:', error);
        return error instanceof Error ? error.message : 'Something went wrong';
      },
    });
  };

  // Manual slug check button handler
  const handleManualSlugCheck = (): void => {
    const currentSlug = form.getValues('slug');
    if (currentSlug) {
      checkSlugAvailability(currentSlug);
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
                                field.value && !slugError
                                  ? 'border-green-600'
                                  : slugError
                                    ? 'border-red-500'
                                    : ''
                              }
                              onChange={(e) => {
                                handleSlugChange(e);
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pastedText =
                                  e.clipboardData.getData('text');
                                const formattedValue =
                                  formatSlugInput(pastedText);
                                form.setValue('slug', formattedValue, {
                                  shouldValidate: true,
                                });
                                setIsSlugManuallyEdited(true);
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
                              (!data || data.length === 0) && (
                                <div className="text-muted-foreground p-2 text-sm">
                                  No categories found
                                </div>
                              )}

                            {/* Category options */}
                            {!isPending &&
                              !isError &&
                              data &&
                              data.length > 0 &&
                              data.map((category: Category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
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
                        <FormLabel className="flex items-center">
                          Category Image
                          <span className="ml-1 text-red-500">*</span>
                        </FormLabel>
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
                          Required. Recommended: 512×512px square image (max
                          500KB)
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
