'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, RefreshCw, Save } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import slugify from 'slugify';
import { toast } from 'sonner';
import { z } from 'zod';

import { checkCategorySlugUniqueness, updateCategory } from '@/actions';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAdminProductCategories, useSingleCategory } from '@/services';

import { ImageUpload } from './../add/image-upload';

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
  image: z.any().optional(), // Image is optional for edit (keep existing if not changed)
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

function EditCategoryPage() {
  const searchParams = useSearchParams();

  const Categoryslug = searchParams.get('slug');
  const router = useRouter();

  // Fetch category data
  const {
    data: category,
    isPending: isLoadingCategory,
    isError: categoryError,
  } = useSingleCategory({ slug: Categoryslug || '' });

  // Fetch parent categories
  const {
    isPending: isLoadingParents,
    data: parentCategories,
    isError: parentsError,
  } = useAdminProductCategories();

  const [isCheckingSlug, setIsCheckingSlug] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);
  const [originalSlug, setOriginalSlug] = useState<string>('');

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

  // Set form values when category data is loaded
  useEffect(() => {
    if (category && !isLoadingCategory) {
      form.reset({
        name: category.name,
        slug: category.slug,
        parentId: category.parentId || 'none',
        featured: category.featured,
        description: category.description || '',
        // Don't set image here, we'll handle it separately
      });

      // Set original slug for comparison
      setOriginalSlug(category.slug);

      // Set image preview if available
      if (category.image?.url) {
        setImagePreview(category.image.url);
      }
    }
  }, [category, isLoadingCategory, form]);

  // Format slug to enforce valid slug format
  const formatSlugInput = (value: string): string => {
    return slugify(value, {
      lower: true, // Convert to lowercase
      strict: true, // Strip special characters
      trim: true, // Trim leading/trailing spaces
    });
  };

  //  biome-ignore lint: error
  useEffect(() => {
    if (name && !isSlugManuallyEdited) {
      const generatedSlug = formatSlugInput(name);
      if (generatedSlug !== slug) {
        form.setValue('slug', generatedSlug, { shouldValidate: true });
      }
    }
  }, [name, form, isSlugManuallyEdited, slug]);

  //  biome-ignore lint: error
  useEffect(() => {
    // Only run checks if slug is valid, not empty, and different from original
    if (slug && slug.length >= 2 && slug !== originalSlug) {
      // Clear previous timeout
      if (slugDebounceTimeoutRef.current) {
        clearTimeout(slugDebounceTimeoutRef.current);
      }

      // Set new timeout for debounce
      slugDebounceTimeoutRef.current = setTimeout(() => {
        checkSlugAvailability(slug);
      }, 500); // 500ms debounce
    } else if (slug === originalSlug) {
      // If slug is the same as original, clear any errors
      setSlugError(null);
      setSlugSuggestions([]);
    }

    return () => {
      if (slugDebounceTimeoutRef.current) {
        clearTimeout(slugDebounceTimeoutRef.current);
      }
    };
  }, [slug, originalSlug]);

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
        slugValue,
      )) as SlugCheckResponse;

      if (!result.isUnique) {
        setSlugSuggestions(result.suggestions);
        setSlugError('This slug is already in use.');
      }
    } catch (error) {
      //  biome-ignore lint: error
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

  // Form submission handler
  const onSubmit = async (values: FormValues): Promise<void> => {
    // Prepare form data for server action
    const formData = new FormData();
    formData.append('id', category.id);
    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('parentId', values.parentId);
    formData.append('featured', values.featured ? 'true' : 'false');

    if (values.description) {
      formData.append('description', values.description);
    }

    // Only append image if a new one is selected
    if (values.image && values.image instanceof File) {
      formData.append('image', values.image);
    }

    // Use Sonner's promise toast
    toast.promise(updateCategory(formData), {
      loading: 'Updating category...',
      // biome-ignore lint: error
      success: (result: any) => {
        if (result.success) {
          // Navigate back to categories list
          router.push('/dashboard/admin/category/all');
          return 'Category updated successfully!';
        } else {
          // If there's a uniqueness error, show suggestions
          if (result.uniqueCheck) {
            setSlugSuggestions(result.uniqueCheck.suggestions);
            setSlugError('This slug is already in use.');
          }
          throw new Error(result.message || 'Failed to update category');
        }
      },
      error: (error: unknown) => {
        return error instanceof Error ? error.message : 'Something went wrong';
      },
    });
  };

  // Manual slug check button handler
  const handleManualSlugCheck = (): void => {
    const currentSlug = form.getValues('slug');
    if (currentSlug && currentSlug !== originalSlug) {
      checkSlugAvailability(currentSlug);
    }
  };

  // Loading state
  if (isLoadingCategory) {
    return (
      <div className='container mx-auto max-w-3xl py-10'>
        <Card className='w-full'>
          <CardHeader>
            <Skeleton className='mx-auto h-8 w-3/4' />
            <Skeleton className='mx-auto mt-2 h-4 w-1/2' />
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-6'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-6'>
                <Skeleton className='mx-auto h-40 w-40' />
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-16 w-full' />
              </div>
            </div>
            <Skeleton className='mt-8 h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (categoryError || !category) {
    return (
      <div className='container mx-auto max-w-3xl py-10'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load category. Please try again or contact support.
          </AlertDescription>
        </Alert>
        <Button
          className='mt-4'
          onClick={() => router.push('/admin/categories')}
        >
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-3xl py-10'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-semibold'>
            Edit Category
          </CardTitle>
          <CardDescription className='text-center'>
            Update category information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-6'>
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Category name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Slug */}
                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <div className='flex space-x-2'>
                          <FormControl>
                            <Input
                              placeholder='category-slug'
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
                            type='button'
                            variant='outline'
                            size='icon'
                            disabled={
                              isCheckingSlug ||
                              !field.value ||
                              field.value === originalSlug
                            }
                            onClick={handleManualSlugCheck}
                          >
                            {isCheckingSlug ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <RefreshCw className='h-4 w-4' />
                            )}
                          </Button>
                        </div>

                        {isCheckingSlug && (
                          <div className='text-muted-foreground mt-2 text-xs'>
                            Checking availability...
                          </div>
                        )}

                        {slugError && (
                          <Alert variant='destructive' className='mt-2'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{slugError}</AlertDescription>
                          </Alert>
                        )}

                        {slugSuggestions.length > 0 && (
                          <div className='mt-2'>
                            <p className='text-muted-foreground mb-2 text-sm'>
                              Suggested alternatives:
                            </p>
                            <div className='flex flex-wrap gap-2'>
                              {slugSuggestions.map((suggestion) => (
                                <Badge
                                  key={suggestion}
                                  variant='outline'
                                  className='hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors'
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
                          Used in URLs. Only lowercase letters, numbers, and
                          hyphens allowed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parent Category */}
                  <FormField
                    control={form.control}
                    name='parentId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingParents || parentsError}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select parent category' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Default option for no parent */}
                            <SelectItem value='none'>
                              None (Top-level category)
                            </SelectItem>

                            {/* Loading state */}
                            {isLoadingParents && (
                              <div className='text-muted-foreground p-2 text-sm'>
                                <Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
                                Loading categories...
                              </div>
                            )}

                            {/* Error state */}
                            {parentsError && (
                              <div className='p-2 text-sm text-red-500'>
                                Failed to load categories
                              </div>
                            )}

                            {/* No data state */}
                            {!isLoadingParents &&
                              !parentsError &&
                              (!parentCategories ||
                                parentCategories.length === 0) && (
                                <div className='text-muted-foreground p-2 text-sm'>
                                  No categories found
                                </div>
                              )}

                            {/* Category options - filter out the current category to prevent circular references */}
                            {!isLoadingParents &&
                              !parentsError &&
                              parentCategories &&
                              parentCategories.length > 0 &&
                              parentCategories
                                .filter((cat: Category) => cat.id !== slug) // Prevent self-reference
                                .map((cat: Category) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-6'>
                  {/* Image */}
                  <FormField
                    control={form.control}
                    name='image'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center'>
                          Category Image
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
                          {imagePreview
                            ? 'Current image shown. Upload new to replace.'
                            : 'No current image.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Brief description of the category'
                            className='h-32 resize-none'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Featured */}
                  <FormField
                    control={form.control}
                    name='featured'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                        <div className='space-y-0.5'>
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

              <div className='flex gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/categories')}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='transition-all duration-200 hover:scale-[1.02]'
                  disabled={isCheckingSlug || !!slugError}
                >
                  <Save className='mr-2 h-4 w-4' />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditCategory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditCategoryPage />
    </Suspense>
  );
}
