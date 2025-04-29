'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { OnboardingFormValues } from '@/schemas';

export default function ShopPreview() {
  const { control } = useFormContext<OnboardingFormValues>();

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

  return (
    <div className="sticky top-4 space-y-4">
      <div className="rounded-md bg-gray-50 p-3 text-sm">
        <h3 className="font-medium">Shop Preview</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          This is how your shop will appear to customers
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-blue-300/30 via-blue-300/20 to-blue-300/10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-100/20 font-medium text-blue-500 shadow-sm">
              {shopName ? shopName.substring(0, 2).toUpperCase() : 'SP'}
            </div>
          </div>
        </div>

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-xs font-medium">0</span>
              <span className="text-[10px] text-gray-500">Products</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 h-4 w-4 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-xs font-medium">5.0</span>
              <span className="text-[10px] text-gray-500">Rating</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-xs font-medium">0</span>
              <span className="text-[10px] text-gray-500">Followers</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t p-3">
          <button className="mr-1 flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Contact
          </button>
          <button className="ml-1 flex w-full items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Visit Shop
          </button>
        </div>
      </div>

      <div className="text-muted-foreground rounded-md border border-dashed bg-gray-50 p-3 text-xs">
        <h4 className="font-medium text-gray-700">Quick Tips:</h4>
        <ul className="mt-2 space-y-1">
          <li>• Add a clear shop name that&#39;s easy to remember</li>
          <li>• Write a concise, compelling description</li>
          <li>• Upload a professional logo and banner</li>
          <li>• Include accurate contact information</li>
          <li>• Select the most relevant category</li>
        </ul>
      </div>
    </div>
  );
}
