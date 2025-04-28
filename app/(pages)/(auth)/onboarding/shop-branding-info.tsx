'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { OnboardingFormValues } from '@/schemas';

export default function ShopBrandingSection() {
  const { setValue, watch } = useFormContext<OnboardingFormValues>();

  // Watch for form values instead of using local state
  const shopLogo = watch('shopLogo');
  const shopBanner = watch('shopBanner');

  // Track upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // States for preview URLs
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  // Update preview URLs when form values change
  useEffect(() => {
    // Clean up previous object URLs to prevent memory leaks
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    if (bannerPreviewUrl) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    // Create new object URLs from the File objects
    if (shopLogo instanceof File) {
      const url = URL.createObjectURL(shopLogo);
      setLogoPreviewUrl(url);
    }

    if (shopBanner instanceof File) {
      const url = URL.createObjectURL(shopBanner);
      setBannerPreviewUrl(url);
    }

    // Cleanup function to revoke object URLs when component unmounts or dependencies change
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (bannerPreviewUrl) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
  }, [shopLogo, shopBanner, bannerPreviewUrl, logoPreviewUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUploading(true);

      // Validate file
      const maxSize = 500 * 1024; // 500KB
      if (file.size > maxSize) {
        alert('Logo image should not exceed 500KB');
        setLogoUploading(false);
        return;
      }

      setValue('shopLogo', file);
      setTimeout(() => setLogoUploading(false), 500);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerUploading(true);

      // Validate file
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        alert('Banner image should not exceed 1MB');
        setBannerUploading(false);
        return;
      }

      setValue('shopBanner', file);
      setTimeout(() => setBannerUploading(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed p-6">
        <h3 className="mb-2 text-lg font-semibold">Shop Logo</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Upload a logo to represent your brand
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:bg-gray-100">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleLogoChange}
                disabled={logoUploading}
              />
              {logoPreviewUrl ? (
                <Image
                  height={300}
                  width={300}
                  src={logoPreviewUrl}
                  alt="Logo preview"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  {logoUploading ? (
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-muted-foreground mb-2 h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-muted-foreground text-xs">
                        Click to upload
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Recommended size: 250x250 pixels (square)
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <h4 className="mb-2 text-sm font-medium">Logo Guidelines:</h4>
            <ul className="text-muted-foreground text-xs">
              <li className="mb-1">
                • PNG or JPG format (transparent background preferred)
              </li>
              <li className="mb-1">• Maximum file size: 500KB</li>
              <li className="mb-1">
                • Should be clearly visible at small sizes
              </li>
              <li>• Keep it simple and recognizable</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-6">
        <h3 className="mb-2 text-lg font-semibold">Shop Banner</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Add a banner image to showcase your shop
        </p>

        <div className="space-y-4">
          <div className="hover:border-primary relative overflow-hidden rounded-md border border-gray-300 transition-all hover:shadow-sm">
            <div
              className="relative"
              style={{ paddingTop: '31.25%' /* 16:5 aspect ratio */ }}
            >
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={handleBannerChange}
                disabled={bannerUploading}
              />
              {bannerPreviewUrl ? (
                <Image
                  height={300}
                  width={300}
                  src={bannerPreviewUrl}
                  alt="Banner preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gray-50 text-center">
                  {bannerUploading ? (
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-muted-foreground mb-2 h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-muted-foreground text-sm">
                        Upload a banner image
                      </span>
                      <span className="text-muted-foreground mt-1 text-xs">
                        (Recommended size: 1600x500 pixels)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium">Banner Tips:</h4>
            <ul className="text-muted-foreground text-xs">
              <li className="mb-1">
                • High-quality image that represents your brand
              </li>
              <li className="mb-1">• Include key products or services</li>
              <li className="mb-1">
                • Ensure text is readable if included in the image
              </li>
              <li>• Consistent with your brand colors and style</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
