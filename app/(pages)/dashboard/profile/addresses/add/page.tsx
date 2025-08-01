'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { addressSchema } from '@/schemas/addressesSchema';
import { useCreateAddress } from '@/services/customer/addresses';

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddAddressPage() {
  const router = useRouter();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
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

  const { mutate, isPending } = useCreateAddress();

  function onSubmit(data: AddressFormValues) {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        mutate(data, {
          onSuccess: () => {
            resolve(); // resolve the toast
            form.reset();
            router.push('/dashboard/profile/addresses');
          },
          // biome-ignore lint: error
          onError: (error: any) => {
            reject(error?.response?.data?.message || 'Failed to add address.');
          },
        });
      }),
      {
        loading: 'Adding address...',
        success: 'Address added successfully!',
        error: (err) => err.toString(),
      },
    );
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='container mx-auto max-w-2xl px-4'>
        <div className='mb-8'>
          <div className='mb-2 flex items-center gap-2'>
            <MapPin className='text-primary h-6 w-6' />
            <h1 className='text-3xl font-bold'>Add New Address</h1>
          </div>
          <p className='text-muted-foreground'>
            Add a new delivery address to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5' />
              Address Details
            </CardTitle>
            <CardDescription>
              Please fill in all the required information for your new address.
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
                  <Button type='submit' className='flex-1' disabled={isPending}>
                    {isPending ? 'Adding...' : 'Add Address'}
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
}
