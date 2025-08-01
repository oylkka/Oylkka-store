'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Pencil } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { editAddressSchema } from '@/schemas/addressesSchema';
import {
  useSingleAddress,
  useUpdateAddress,
} from '@/services/customer/addresses';

const EditAddressPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('addressesId') || '';

  const form = useForm<z.infer<typeof editAddressSchema>>({
    resolver: zodResolver(editAddressSchema),
    defaultValues: {
      id: '',
      name: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      phone: '',
      email: '',
      isDefault: false,
    },
  });

  const { data, isPending, isError } = useSingleAddress({ id });
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  useEffect(() => {
    if (data) {
      form.reset({
        id: data.id,
        name: data.address.name,
        email: data.address.email,
        phone: data.address.phone,
        address: data.address.address,
        city: data.address.city,
        district: data.address.district,
        postalCode: data.address.postalCode,
        isDefault: data.isDefault,
      });
    }
  }, [data, form]);

  function onSubmit(values: z.infer<typeof editAddressSchema>) {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        updateAddress(
          {
            id: values.id,
            data: values,
          },
          {
            onSuccess: () => {
              resolve();
              router.push('/dashboard/profile/addresses');
            },
            // biome-ignore lint: error
            onError: (err: any) => {
              reject(
                err?.response?.data?.message || 'Failed to update address',
              );
            },
          },
        );
      }),
      {
        loading: 'Updating address...',
        success: 'Address updated successfully!',
        error: (err) => err.toString(),
      },
    );
  }

  if (isPending) {
    return <div className='p-4'>Loading...</div>;
  }
  if (isError) {
    return <div className='p-4 text-red-500'>Failed to fetch address</div>;
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='container mx-auto max-w-2xl px-4'>
        <div className='mb-8'>
          <div className='mb-2 flex items-center gap-2'>
            <MapPin className='text-primary h-6 w-6' />
            <h1 className='text-3xl font-bold'>Edit Address</h1>
          </div>
          <p className='text-muted-foreground'>
            Update your delivery address details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Pencil className='h-5 w-5' />
              Edit Address
            </CardTitle>
            <CardDescription>
              Update the necessary address information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder='John Doe' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder='+88 01234567890' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='john@example.com'
                          type='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='123 Main Street, Apartment 4B'
                          className='min-h-[80px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder='Dhaka' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='district'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder='Dhaka' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder='10001' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isDefault'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Set as default address</FormLabel>
                        <p className='text-muted-foreground text-sm'>
                          Use this address as your default delivery address.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className='flex gap-4 pt-4'>
                  <Button
                    type='submit'
                    className='flex-1'
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Address'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1 bg-transparent'
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function EditAddress() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditAddressPage />
    </Suspense>
  );
}
