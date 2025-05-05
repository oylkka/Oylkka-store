'use client';

import { Building, MapPin, ShoppingBag, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { OnboardingFormValues } from '@/schemas';

export default function ShopPreview() {
  const { control } = useFormContext<OnboardingFormValues>();

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  // Watch form fields for preview updates
  const shopName = useWatch({
    control: control,
    name: 'shopName',
  });
  const shopAddress = useWatch({
    control: control,
    name: 'shopAddress',
  });
  const shopDescription = useWatch({
    control: control,
    name: 'shopDescription',
  });
  const shopCategory = useWatch({
    control: control,
    name: 'shopCategory',
  });
  const shopLogo = useWatch({
    control: control,
    name: 'shopLogo',
  });
  const shopBanner = useWatch({
    control: control,
    name: 'shopBanner',
  });

  // Get category label from value
  const getCategoryLabel = (value: string) => {
    const categories = {
      electronics: 'Electronics & Tech',
      fashion: 'Fashion & Apparel',
      home: 'Home & Garden',
      beauty: 'Beauty & Personal Care',
      health: 'Health & Wellness',
      toys: 'Toys & Games',
      food: 'Food & Groceries',
      art: 'Art & Collectibles',
      jewelry: 'Jewelry & Accessories',
      sports: 'Sports & Outdoors',
      other: 'Other',
    };
    return categories[value as keyof typeof categories] || value;
  };

  useEffect(() => {
    // Create object URLs only when the File objects change
    if (shopLogo instanceof File) {
      const url = URL.createObjectURL(shopLogo);
      setLogoPreviewUrl(url);
    } else {
      setLogoPreviewUrl(null);
    }

    if (shopBanner instanceof File) {
      const url = URL.createObjectURL(shopBanner);
      setBannerPreviewUrl(url);
    } else {
      setBannerPreviewUrl(null);
    }

    // Cleanup function
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (bannerPreviewUrl) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopLogo, shopBanner]);

  return (
    <div className="sticky top-4 space-y-4">
      <div className="rounded-md bg-gray-50 p-3 text-sm">
        <h3 className="font-medium">Live Preview</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          See how your shop will appear to customers
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        {/* Banner */}
        <div
          className="relative h-32 bg-gradient-to-r from-blue-300/30 via-blue-300/20 to-blue-300/10"
          style={
            bannerPreviewUrl
              ? {
                  backgroundImage: `url(${bannerPreviewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          {/* Logo overlay */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            {logoPreviewUrl ? (
              <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreviewUrl || '/placeholder.svg'}
                  alt="Shop logo"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-100/20 font-medium text-blue-500 shadow-sm">
                {shopName ? shopName.substring(0, 2).toUpperCase() : 'SP'}
              </div>
            )}
          </div>
        </div>

        {/* Shop Info */}
        <div className="flex flex-col items-center px-4 pt-10 text-center">
          <div className="flex items-center gap-1">
            <h3 className="text-xl font-semibold">
              {shopName || 'Your Shop Name'}
            </h3>
            {shopName && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {shopCategory && (
            <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {getCategoryLabel(shopCategory)}
            </span>
          )}

          {shopAddress && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{shopAddress}</span>
            </div>
          )}
        </div>

        <div className="px-4 py-3 text-center">
          <p className="line-clamp-3 text-sm text-gray-500">
            {shopDescription ||
              'Your shop description will appear here. Make it compelling and informative to attract customers.'}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-md border p-2">
              <ShoppingBag className="mb-1 h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium">0</span>
              <span className="text-[10px] text-gray-500">Products</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2">
              <Star className="mb-1 h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">5.0</span>
              <span className="text-[10px] text-gray-500">Rating</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2">
              <Users className="mb-1 h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium">0</span>
              <span className="text-[10px] text-gray-500">Followers</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t p-3">
          <button className="mr-1 flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50">
            Contact
          </button>
          <button className="ml-1 flex w-full items-center justify-center rounded-md bg-blue-500 px-2 py-1.5 text-xs text-white transition-colors hover:bg-blue-600">
            Visit Shop
          </button>
        </div>
      </div>

      <div className="text-muted-foreground rounded-md border border-dashed bg-gray-50 p-3 text-xs">
        <h4 className="font-medium text-gray-700">Quick Tips:</h4>
        <ul className="mt-2 space-y-1">
          <li className="flex items-start gap-1">
            <Building className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>Add a clear shop name that&#39;s easy to remember</span>
          </li>
          <li className="flex items-start gap-1">
            <Star className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>Upload a professional logo and banner</span>
          </li>
          <li className="flex items-start gap-1">
            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>Include accurate contact information</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
