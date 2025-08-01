'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DatetimePicker } from '@/components/ui/datetime-picker';
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
import { Textarea } from '@/components/ui/textarea';
import { EditBannerFormSchema, type EditBannerFormType } from '@/schemas';
import { prepareFormData, useSingleBanner, useUpdateBanner } from '@/services';

function EditBanner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('bannerId');
  const { isPending, data, isError } = useSingleBanner({ id: id || '' });
  const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();

  // State for image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(false);
  const [keepExistingImage, setKeepExistingImage] = useState<boolean>(true);

  // Initialize form
  const form = useForm<EditBannerFormType>({
    resolver: zodResolver(EditBannerFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      bannerTag: '',
      primaryActionText: '',
      primaryActionLink: '',
      secondaryActionText: '',
      secondaryActionLink: '',
      alignment: 'left',
      bannerPosition: 'home_top',
      startDate: undefined,
      endDate: undefined,
      image: undefined,
      hasExistingImage: false,
      keepExistingImage: true,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (data && !isPending) {
      const bannerData = data;

      // Reset the form with new values
      form.reset({
        title: bannerData.title || '',
        subtitle: bannerData.subTitle || '',
        description: bannerData.description || '',
        bannerTag: bannerData.bannerTag || '',
        primaryActionText: bannerData.primaryActionText || '',
        primaryActionLink: bannerData.primaryActionLink || '',
        secondaryActionText: bannerData.secondaryActionText || '',
        secondaryActionLink: bannerData.secondaryActionLink || '',
        alignment: bannerData.alignment || 'left',
        bannerPosition: bannerData.bannerPosition || 'home_top',
        startDate: bannerData.startDate
          ? new Date(bannerData.startDate)
          : undefined,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : undefined,
        image: undefined,
        hasExistingImage: !!bannerData.image?.url,
        keepExistingImage: true,
      });

      // Set image preview if there's an existing image
      if (bannerData.image?.url) {
        setImagePreview(bannerData.image.url);
        setHasExistingImage(true);
        setKeepExistingImage(true);
      }
    }
  }, [data, isPending, form]);

  // Form submission handler
  const onSubmit = async (values: EditBannerFormType) => {
    if (!id) {
      toast.error('Banner ID is required');
      return;
    }

    try {
      // Prepare form data for submission
      const formData = prepareFormData(values, id);

      // Submit the form using the mutation
      updateBanner({ id, data: formData });
      // biome-ignore lint: error
    } catch (error) {
      toast.error('An error occurred while updating the banner');
    }
  };

  // Handle file input change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    // biome-ignore lint: error
    onChange: (...event: any[]) => void,
  ) => {
    const files = e.target.files;

    if (files?.length) {
      // Clean up previous preview if it was a blob URL
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      // Create and set the new preview
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);
      setKeepExistingImage(false);

      // Update form values
      form.setValue('keepExistingImage', false);
      onChange(files);
    } else {
      // If no file is selected, update accordingly
      onChange(undefined);
    }
  };

  // Reset to original data
  const resetForm = () => {
    if (data) {
      const bannerData = data;

      // Reset the form with original values
      form.reset({
        title: bannerData.title || '',
        subtitle: bannerData.subTitle || '',
        description: bannerData.description || '',
        bannerTag: bannerData.bannerTag || '',
        primaryActionText: bannerData.primaryActionText || '',
        primaryActionLink: bannerData.primaryActionLink || '',
        secondaryActionText: bannerData.secondaryActionText || '',
        secondaryActionLink: bannerData.secondaryActionLink || '',
        alignment: bannerData.alignment || 'left',
        bannerPosition: bannerData.bannerPosition || 'home_top',
        startDate: bannerData.startDate
          ? new Date(bannerData.startDate)
          : undefined,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : undefined,
        image: undefined,
        hasExistingImage: !!bannerData.image?.url,
        keepExistingImage: true,
      });

      // Reset image preview and states
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(bannerData.image?.url || null);
      setHasExistingImage(!!bannerData.image?.url);
      setKeepExistingImage(true);

      // Clear file input
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      toast.info('Form has been reset to original values');
    }
  };

  // Loading state
  if (isPending) {
    return (
      <Card className='mx-auto max-w-4xl pt-0'>
        <CardHeader className='bg-muted rounded-t-lg'>
          <CardTitle className='text-center text-3xl font-bold'>
            Edit Banner
          </CardTitle>
          <CardDescription className='text-center text-base'>
            Loading banner data...
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2' />
            <p className='text-muted-foreground'>
              Loading banner information...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <Card className='mx-auto max-w-4xl pt-0'>
        <CardHeader className='bg-muted rounded-t-lg'>
          <CardTitle className='text-center text-3xl font-bold'>
            Edit Banner
          </CardTitle>
          <CardDescription className='text-center text-base'>
            Error loading banner data
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <p className='text-destructive mb-4'>
              {!id ? 'No banner ID provided' : 'Failed to load banner data'}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto max-w-4xl pt-0'>
      <CardHeader className='bg-muted rounded-t-lg'>
        <CardTitle className='text-center text-3xl font-bold'>
          Edit Banner
        </CardTitle>
        <CardDescription className='text-center text-base'>
          Update your banner with the form below
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0 pt-6 pb-8'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8 px-6 md:px-8'
          >
            <div className='grid gap-8 md:grid-cols-2'>
              {/* CONTENT SECTION */}
              <div className='space-y-6'>
                <h3 className='border-border border-b pb-2 text-lg font-medium'>
                  Banner Content
                </h3>

                {/* TITLE */}
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter banner title' {...field} />
                      </FormControl>
                      <FormDescription>
                        The main heading of your banner
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SUBTITLE */}
                <FormField
                  control={form.control}
                  name='subtitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Add a subtitle (optional)'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Secondary text that appears below the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DESCRIPTION */}
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your banner content'
                          className='min-h-24 resize-y'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional details to display on your banner
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TAG */}
                <FormField
                  control={form.control}
                  name='bannerTag'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Tag</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='E.g. New, Featured, Limited Time'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A highlighted tag to draw attention
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='space-y-6'>
                {/* DISPLAY SETTINGS SECTION */}
                <h3 className='border-border border-b pb-2 text-lg font-medium'>
                  Display Settings
                </h3>

                {/* ALIGNMENT */}
                <FormField
                  control={form.control}
                  name='alignment'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Alignment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Choose alignment' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='left'>Left</SelectItem>
                          <SelectItem value='center'>Center</SelectItem>
                          <SelectItem value='right'>Right</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How text and elements align within the banner
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* BANNER POSITION */}
                <FormField
                  control={form.control}
                  name='bannerPosition'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select position' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='home_top'>
                            Home Page (Top)
                          </SelectItem>
                          <SelectItem value='home_bottom'>
                            Home Page (Bottom)
                          </SelectItem>
                          <SelectItem value='sidebar'>Sidebar</SelectItem>
                          <SelectItem value='footer'>Footer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Where the banner will appear on your site
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SCHEDULING */}
                <div className='space-y-4'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Banner Schedule
                  </h4>

                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Start Date & Time (Optional)</FormLabel>
                        <div className='flex w-full items-center gap-2'>
                          <FormControl className='flex-1'>
                            {field.value ? (
                              <DatetimePicker
                                value={field.value}
                                onChange={field.onChange}
                                format={[
                                  ['days', 'months', 'years'],
                                  ['hours', 'minutes', 'am/pm'],
                                ]}
                              />
                            ) : (
                              <Button
                                type='button'
                                variant='outline'
                                onClick={() => field.onChange(new Date())}
                                className='text-muted-foreground w-full justify-start text-left font-normal'
                              >
                                Click to set start date
                              </Button>
                            )}
                          </FormControl>
                          {field.value && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => field.onChange(undefined)}
                              className='h-8 w-8'
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          When the banner will start displaying (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>End Date & Time (Optional)</FormLabel>
                        <div className='flex w-full items-center gap-2'>
                          <FormControl className='flex-1'>
                            {field.value ? (
                              <DatetimePicker
                                value={field.value}
                                onChange={field.onChange}
                                format={[
                                  ['days', 'months', 'years'],
                                  ['hours', 'minutes', 'am/pm'],
                                ]}
                              />
                            ) : (
                              <Button
                                type='button'
                                variant='outline'
                                onClick={() => field.onChange(new Date())}
                                className='text-muted-foreground w-full justify-start text-left font-normal'
                              >
                                Click to set end date
                              </Button>
                            )}
                          </FormControl>
                          {field.value && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => field.onChange(undefined)}
                              className='h-8 w-8'
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          When the banner will stop displaying (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* BUTTONS SECTION */}
            <div className='space-y-6 pt-4'>
              <h3 className='border-border border-b pb-2 text-lg font-medium'>
                Call to Action
              </h3>

              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-6'>
                  {/* PRIMARY ACTION TEXT */}
                  <FormField
                    control={form.control}
                    name='primaryActionText'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Button Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='E.g. Learn More, Shop Now'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Text for your main call-to-action button
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PRIMARY LINK */}
                  <FormField
                    control={form.control}
                    name='primaryActionLink'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Button Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://example.com/page'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Where users will go when clicking the primary button
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-6'>
                  {/* SECONDARY TEXT */}
                  <FormField
                    control={form.control}
                    name='secondaryActionText'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='E.g. Contact Us, View Details'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Text for an additional action button
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SECONDARY LINK */}
                  <FormField
                    control={form.control}
                    name='secondaryActionLink'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://example.com/contact'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Required if secondary button text is provided
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className='space-y-6 pt-4'>
              <h3 className='border-border border-b pb-2 text-lg font-medium'>
                Banner Image
              </h3>

              <FormField
                control={form.control}
                name='image'
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                          <Input
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            className='cursor-pointer'
                            onChange={(e) => handleFileChange(e, onChange)}
                            {...fieldProps}
                          />
                          <FormDescription>
                            Upload a new JPEG, PNG, or WebP image to replace the
                            current banner image (optional)
                          </FormDescription>

                          {/* Show current image status and controls */}
                          {hasExistingImage && (
                            <div className='space-y-2'>
                              <div className='bg-muted/50 flex items-center justify-between rounded-md p-3'>
                                <span className='text-sm'>
                                  {keepExistingImage
                                    ? '✅ Using existing image'
                                    : '❌ Existing image will be replaced'}
                                </span>
                                <div className='flex gap-2'>
                                  {!keepExistingImage && (
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='sm'
                                      onClick={() => {
                                        // Reset to existing image
                                        const bannerData = data;
                                        if (imagePreview?.startsWith('blob:')) {
                                          URL.revokeObjectURL(imagePreview);
                                        }
                                        setImagePreview(
                                          bannerData?.image?.url || null,
                                        );
                                        setKeepExistingImage(true);
                                        form.setValue(
                                          'keepExistingImage',
                                          true,
                                        );
                                        form.setValue('image', undefined);

                                        // Clear file input
                                        const fileInput =
                                          document.querySelector(
                                            'input[type="file"]',
                                          ) as HTMLInputElement;
                                        if (fileInput) {
                                          fileInput.value = '';
                                        }
                                      }}
                                    >
                                      Keep Existing
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className='bg-muted/30 border-input flex aspect-video items-center justify-center rounded-md border'>
                          {imagePreview ? (
                            // biome-ignore lint: error
                            <img
                              src={imagePreview}
                              alt='Banner preview'
                              className='max-h-48 max-w-full rounded object-contain'
                            />
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              {hasExistingImage
                                ? 'Current image preview will appear here'
                                : 'No image selected'}
                            </p>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col gap-4 pt-6 sm:flex-row'>
              <Button
                type='button'
                variant='outline'
                className='sm:flex-1'
                onClick={resetForm}
                disabled={isUpdating}
              >
                Reset Changes
              </Button>
              <Button type='submit' className='sm:flex-1' disabled={isUpdating}>
                {isUpdating ? (
                  <span className='flex items-center gap-2'>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Updating...
                  </span>
                ) : (
                  'Update Banner'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function EditBannerPage() {
  return (
    <Suspense fallback=<div>Loading...</div>>
      <EditBanner />
    </Suspense>
  );
}
