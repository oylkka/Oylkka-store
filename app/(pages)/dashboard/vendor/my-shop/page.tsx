'use client';
import { format } from 'date-fns';
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  Twitter,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendorShop } from '@/services/vendor';

export default function VendorShop() {
  const { isPending, data: shop, isError } = useVendorShop();

  if (isPending) {
    return <ShopSkeleton />;
  }

  if (isError || !shop) {
    return (
      <div className='flex h-96 w-full items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold'>Oops!</h2>
          <p className='text-muted-foreground mt-2'>
            We couldn&apos;t load the shop information.
          </p>
          <Button className='mt-4' variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pb-12'>
      {/* Banner Section */}
      <div className='relative h-64 w-full sm:h-80 md:h-96'>
        <Image
          src={shop.bannerImage.url}
          alt={shop.bannerImage.alt || shop.name}
          fill
          className='object-cover'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
      </div>

      {/* Shop Info Section */}
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative -mt-24 flex flex-col sm:flex-row sm:items-end sm:space-x-5'>
          <div className='relative h-32 w-32 overflow-hidden rounded-xl border-4 sm:h-40 sm:w-40'>
            <Image
              src={shop.logo.url}
              alt={shop.logo.alt || shop.name}
              fill
              className='object-cover'
              priority
            />
          </div>
          <div className='mt-6 sm:mt-0 sm:flex-1'>
            <div className='flex items-center space-x-2'>
              <h1 className='text-primary text-2xl font-bold sm:text-3xl'>
                {shop.name}
              </h1>
              {shop.isVerified && (
                <Badge
                  variant='secondary'
                  className='bg-blue-100 text-blue-800'
                >
                  Verified
                </Badge>
              )}
            </div>
            <div className='text-muted-foreground mt-1 flex items-center text-sm'>
              <MapPin className='mr-1 h-4 w-4' />
              {shop.address}
            </div>
          </div>
          <div className='mt-6 flex flex-col space-y-3 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-3'>
            <Button
              variant='secondary'
              className='flex items-center justify-center'
            >
              <Mail className='mr-2 h-4 w-4' />
              Contact
            </Button>
            <Button
              variant='default'
              className='flex items-center justify-center'
            >
              Follow Shop
            </Button>
          </div>
        </div>

        {/* Shop Stats */}
        <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-12'>
          <Card>
            <CardContent className='flex flex-col items-center p-6'>
              <Star className='h-8 w-8 text-yellow-500' />
              <h3 className='mt-2 text-2xl font-bold'>
                {shop.rating.toFixed(1)}
              </h3>
              <p className='text-sm text-gray-500'>Shop Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex flex-col items-center p-6'>
              {/* biome-ignore lint: error */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-blue-500'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4' />
                <path d='M4 6v12c0 1.1.9 2 2 2h14v-4' />
                <path d='M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z' />
              </svg>
              <h3 className='mt-2 text-2xl font-bold'>{shop.totalSales}</h3>
              <p className='text-sm text-gray-500'>Products Sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex flex-col items-center p-6'>
              {/* biome-ignore lint: error */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-500'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
                <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
              </svg>
              <h3 className='mt-2 text-2xl font-bold'>{shop.views}</h3>
              <p className='text-sm text-gray-500'>Shop Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex flex-col items-center p-6'>
              {/* biome-ignore lint: error */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-purple-500'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M3 6l9 6l9 -6' />
                <path d='M21 6v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-12' />
                <path d='M3 10l9 6l9 -6' />
              </svg>
              <h3 className='mt-2 text-2xl font-bold'>
                {format(new Date(shop.createdAt), 'MMMM d, yyyy')}
              </h3>
              <p className='text-sm text-gray-500'>Member Since</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className='mt-8'>
          <Tabs defaultValue='products' className='w-full'>
            <TabsList className='grid w-full grid-cols-4 md:w-auto'>
              <TabsTrigger value='products'>Products</TabsTrigger>
              <TabsTrigger value='about'>About</TabsTrigger>
              <TabsTrigger value='reviews'>Reviews</TabsTrigger>
              <TabsTrigger value='policies'>Policies</TabsTrigger>
            </TabsList>
            <div className='mt-6'>
              <TabsContent value='products' className='mt-0'>
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                      Browse through all the products offered by {shop.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                      {/* Product cards would go here */}
                      <ProductSkeleton />
                      <ProductSkeleton />
                      <ProductSkeleton />
                      <ProductSkeleton />
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-center'>
                    <Button variant='outline'>Load More</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value='about' className='mt-0'>
                <Card>
                  <CardHeader>
                    <CardTitle>About {shop.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-lg font-medium'>
                          Shop Description
                        </h3>
                        <p className='mt-2 text-gray-600'>{shop.description}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className='text-lg font-medium'>
                          Contact Information
                        </h3>
                        <ul className='mt-4 space-y-3'>
                          <li className='flex items-center'>
                            <Mail className='mr-3 h-5 w-5 text-gray-500' />
                            <span>{shop.shopEmail}</span>
                          </li>
                          <li className='flex items-center'>
                            <Phone className='mr-3 h-5 w-5 text-gray-500' />
                            <span>{shop.shopPhone}</span>
                          </li>
                          <li className='flex items-center'>
                            <MapPin className='mr-3 h-5 w-5 text-gray-500' />
                            <span>{shop.address}</span>
                          </li>
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h3 className='text-lg font-medium'>Social Media</h3>
                        <div className='mt-4 flex space-x-3'>
                          {shop.socialLinks.website && (
                            <Link
                              href={shop.socialLinks.website}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-10 w-10 rounded-full'
                              >
                                <Globe className='h-5 w-5' />
                              </Button>
                            </Link>
                          )}
                          {shop.socialLinks.facebook && (
                            <Link
                              href={shop.socialLinks.facebook}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-10 w-10 rounded-full'
                              >
                                <Facebook className='h-5 w-5' />
                              </Button>
                            </Link>
                          )}
                          {shop.socialLinks.instagram && (
                            <Link
                              href={shop.socialLinks.instagram}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-10 w-10 rounded-full'
                              >
                                <Instagram className='h-5 w-5' />
                              </Button>
                            </Link>
                          )}
                          {shop.socialLinks.twitter && (
                            <Link
                              href={shop.socialLinks.twitter}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-10 w-10 rounded-full'
                              >
                                <Twitter className='h-5 w-5' />
                              </Button>
                            </Link>
                          )}
                          {shop.socialLinks.linkedin && (
                            <Link
                              href={shop.socialLinks.linkedin}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-10 w-10 rounded-full'
                              >
                                <Linkedin className='h-5 w-5' />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='reviews' className='mt-0'>
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      See what customers are saying about {shop.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col items-center justify-center py-12'>
                      <div className='text-center'>
                        <div className='flex justify-center'>
                          <Star className='h-12 w-12 text-yellow-500' />
                        </div>
                        <h3 className='mt-2 text-2xl font-bold'>
                          {shop.rating.toFixed(1)}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Based on customer reviews
                        </p>
                        <Button variant='outline' className='mt-4'>
                          Write a Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='policies' className='mt-0'>
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Policies</CardTitle>
                    <CardDescription>
                      Learn about {shop.name}&#39;s shipping, returns, and other
                      policies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-lg font-medium'>Shipping Policy</h3>
                        <p className='mt-2 text-gray-600'>
                          Information about shipping policies will be displayed
                          here.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className='text-lg font-medium'>Return Policy</h3>
                        <p className='mt-2 text-gray-600'>
                          Information about return policies will be displayed
                          here.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className='text-lg font-medium'>Privacy Policy</h3>
                        <p className='mt-2 text-gray-600'>
                          Information about privacy policies will be displayed
                          here.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Skeleton components for loading state
function ShopSkeleton() {
  return (
    <div className='min-h-screen pb-12'>
      <div className='relative h-64 w-full sm:h-80 md:h-96' />

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative -mt-24 flex flex-col sm:flex-row sm:items-end sm:space-x-5'>
          <Skeleton className='h-32 w-32 rounded-xl border-4 sm:h-40 sm:w-40' />
          <div className='mt-6 sm:mt-0 sm:flex-1'>
            <Skeleton className='h-10 w-48' />
            <Skeleton className='mt-2 h-4 w-32' />
          </div>
          <div className='mt-6 flex flex-col space-y-3 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-3'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-32' />
          </div>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-12'>
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint: error
            <Skeleton key={i} className='h-32 rounded-lg' />
          ))}
        </div>

        <div className='mt-8'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='mt-6 h-96 w-full rounded-lg' />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className='overflow-hidden rounded-lg border shadow'>
      <Skeleton className='h-48 w-full' />
      <div className='p-4'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='mt-2 h-4 w-1/2' />
        <Skeleton className='mt-4 h-6 w-1/3' />
      </div>
    </div>
  );
}
