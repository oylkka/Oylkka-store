'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';

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
import { BannerFormSchema } from '@/schemas';
import { useBannerMutation } from '@/services';

export default function BannerCreationForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof BannerFormSchema>>({
    resolver: zodResolver(BannerFormSchema),
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
    },
  });

  const { mutateAsync: createBanner, isPending: loading } = useBannerMutation();
  const onSubmit = async (values: z.infer<typeof BannerFormSchema>) => {
    await createBanner(values);

    // Reset form on success
    form.reset();
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  return (
    <Card className='mx-auto max-w-4xl pt-0'>
      <CardHeader className='bg-muted rounded-t-lg'>
        <CardTitle className='text-center text-3xl font-bold'>
          Create Banner
        </CardTitle>
        <CardDescription className='text-center text-base'>
          Design a custom banner for your website with the form below
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
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                                  ['months', 'days', 'years'],
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
                                  ['months', 'days', 'years'],
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
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            className='cursor-pointer'
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files?.length) {
                                // Pass the entire FileList to the form state
                                onChange(files);
                                // Clean up previous preview and set new preview
                                if (imagePreview) {
                                  URL.revokeObjectURL(imagePreview);
                                }
                                setImagePreview(URL.createObjectURL(files[0]));
                              } else {
                                // Clear form state and preview if no file is selected
                                onChange(null);
                                if (imagePreview) {
                                  URL.revokeObjectURL(imagePreview);
                                  setImagePreview(null);
                                }
                              }
                            }}
                            {...fieldProps} // Spread other props, excluding value
                          />
                          {value && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                onChange(null);
                                if (imagePreview) {
                                  URL.revokeObjectURL(imagePreview);
                                  setImagePreview(null);
                                }
                              }}
                              className='h-8 w-8'
                            >
                              ✕
                            </Button>
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
                              Image preview will appear here
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
                onClick={() => {
                  form.reset();
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                  }
                }}
              >
                Reset Form
              </Button>
              <Button type='submit' disabled={loading} className='sm:flex-1'>
                Create Banner
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
