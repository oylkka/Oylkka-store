'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building,
  ChevronRight,
  Clock,
  Home,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Star,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { Separator } from '@/components/ui/separator';
import type { Address } from '@/lib/types/address';
import { type AddressFormData, addressSchema } from '@/schemas/checkout-schema';
import { useAddress } from '@/services/customer/addresses';

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  defaultValues?: Partial<AddressFormData>;
  email?: string;
}

interface AddressType {
  id: string;
  address: Address;
  isDefault?: boolean;
}

export function AddressForm({
  onSubmit,
  defaultValues,
  email,
}: AddressFormProps) {
  const { data: addresses = [] } = useAddress();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      email: email ?? '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      phone: '',
      ...defaultValues,
    },
  });

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(
      (addr: AddressType) => addr.id === addressId,
    );

    if (selectedAddress) {
      const a = selectedAddress.address;
      form.reset({
        ...form.getValues(), // retain email if manually entered
        name: a.name || '',
        address: a.address || '',
        city: a.city || '',
        district: a.district || '',
        postalCode: a.postalCode || '',
        phone: a.phone || '',
      });
    }
  };

  const clearAddressSelection = () => {
    setSelectedAddressId('');
    form.reset({
      ...form.getValues(),
      name: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      phone: '',
    });
  };

  const isFormFilled =
    form.watch('name') || form.watch('address') || form.watch('city');

  return (
    <div className='space-y-6'>
      <Card className='border-muted-foreground/25 bg-muted/30 border-2 border-dashed'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MapPin className='text-primary h-5 w-5' />
            Contact & Shipping Information
          </CardTitle>
          <CardDescription className='text-sm'>
            Enter your contact details and shipping address for delivery
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Clock className='text-muted-foreground h-4 w-4' />
                <h3 className='text-sm font-medium'>Quick Select</h3>
              </div>

              <div className='flex items-center gap-2'>
                <Select
                  value={selectedAddressId}
                  onValueChange={handleAddressSelect}
                >
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Choose from your saved addresses' />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address: AddressType) => (
                      <SelectItem
                        value={address.id}
                        key={address.id}
                        className='py-3'
                      >
                        <div className='flex w-full items-center gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {address.address.name}
                              </span>
                              {address.isDefault && (
                                <Badge variant='secondary' className='text-xs'>
                                  <Star className='mr-1 h-3 w-3 fill-current' />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className='text-muted-foreground truncate text-xs'>
                              {address.address.address}, {address.address.city}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAddressId && (
                  <Button
                    variant='outline'
                    size='icon'
                    type='button'
                    onClick={clearAddressSelection}
                    className='shrink-0 bg-transparent'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              <Separator className='my-6' />
            </div>
          )}

          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Contact Information */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <User className='text-muted-foreground h-4 w-4' />
                  <h3 className='text-sm font-medium'>Contact Information</h3>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                            <Input
                              {...field}
                              placeholder='Enter your full name'
                              className='pl-10'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                            <Input
                              {...field}
                              type='email'
                              placeholder='your.email@example.com'
                              className='pl-10'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem className='md:col-span-1'>
                        <FormLabel className='text-sm font-medium'>
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Phone className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                            <Input
                              {...field}
                              placeholder='+88 01234567890'
                              className='pl-10'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Home className='text-muted-foreground h-4 w-4' />
                  <h3 className='text-sm font-medium'>Shipping Address</h3>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Street Address
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Navigation className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                            <Input
                              {...field}
                              placeholder='Enter your full street address'
                              className='pl-10'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium'>
                            City
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Building className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                              <Input
                                {...field}
                                placeholder='Enter city'
                                className='pl-10'
                              />
                            </div>
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
                          <FormLabel className='text-sm font-medium'>
                            District
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Enter district' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='postalCode'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium'>
                            Postal Code
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Enter postal code' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <div className='flex justify-end pt-4'>
                <Button
                  type='submit'
                  size='lg'
                  className='flex items-center gap-2 px-8'
                  disabled={!isFormFilled}
                >
                  Continue to Shipping
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
