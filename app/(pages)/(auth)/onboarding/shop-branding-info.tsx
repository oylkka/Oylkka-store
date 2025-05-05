'use client';

import { Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { OnboardingFormValues } from '@/schemas';

export default function ShopBrandingSection() {
  const { setValue, watch } = useFormContext<OnboardingFormValues>();
  const fileInputRefs = useRef({
    logo: null as HTMLInputElement | null,
    banner: null as HTMLInputElement | null,
  });

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
    // Only create new object URLs when the File objects change
    if (shopLogo instanceof File) {
      // Clean up previous URL before creating a new one
      if (logoPreviewUrl && logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      const url = URL.createObjectURL(shopLogo);
      setLogoPreviewUrl(url);
    }

    if (shopBanner instanceof File) {
      // Clean up previous URL before creating a new one
      if (bannerPreviewUrl && bannerPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
      const url = URL.createObjectURL(shopBanner);
      setBannerPreviewUrl(url);
    }

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (logoPreviewUrl && logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (bannerPreviewUrl && bannerPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopLogo, shopBanner]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (file) {
      setLogoUploading(true);

      // Validate file
      const maxSize = 500 * 1024; // 500KB
      if (file.size > maxSize) {
        toast.error('Logo image should not exceed 500KB');
        setLogoUploading(false);
        return;
      }

      setValue('shopLogo', file, { shouldDirty: true });
      setTimeout(() => setLogoUploading(false), 500);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (file) {
      setBannerUploading(true);

      // Validate file
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast.error('Banner image should not exceed 1MB');
        setBannerUploading(false);
        return;
      }

      setValue('shopBanner', file, { shouldDirty: true });
      setTimeout(() => setBannerUploading(false), 500);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('shopLogo', undefined, { shouldDirty: true });
    setLogoPreviewUrl(null);
    if (fileInputRefs.current.logo) {
      fileInputRefs.current.logo.value = '';
    }
  };

  const removeBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('shopBanner', undefined, { shouldDirty: true });
    setBannerPreviewUrl(null);
    if (fileInputRefs.current.banner) {
      fileInputRefs.current.banner.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-2 text-base font-semibold">Shop Logo</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Upload a logo to represent your brand
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {logoPreviewUrl ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreviewUrl || '/placeholder.svg'}
                  alt="Logo preview"
                  className="h-full w-full object-contain p-2"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeLogo}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:bg-gray-100">
                <input
                  ref={(el) => {
                    fileInputRefs.current.logo = el;
                  }}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleLogoChange}
                  disabled={logoUploading}
                  onClick={(e) => e.stopPropagation()}
                />
                {logoUploading ? (
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <>
                    <Upload className="text-muted-foreground mb-2 h-10 w-10" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Upload Logo
                    </span>
                    <span className="text-muted-foreground mt-1 text-xs">
                      Click or drag & drop
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Recommended size: 250x250 pixels (square)
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <h4 className="mb-2 text-sm font-medium">Logo Guidelines:</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• PNG or JPG format (transparent background preferred)</li>
              <li>• Maximum file size: 500KB</li>
              <li>• Should be clearly visible at small sizes</li>
              <li>• Keep it simple and recognizable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Banner Upload Section */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-2 text-base font-semibold">Shop Banner</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Add a banner image to showcase your shop
        </p>

        <div className="space-y-4">
          {bannerPreviewUrl ? (
            <div className="relative overflow-hidden rounded-md border border-gray-300">
              <div
                className="relative"
                style={{ paddingTop: '31.25%' /* 16:5 aspect ratio */ }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerPreviewUrl || '/placeholder.svg'}
                  alt="Banner preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeBanner}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="hover:border-primary relative overflow-hidden rounded-md border border-gray-300 transition-all hover:shadow-sm">
              <div
                className="relative"
                style={{ paddingTop: '31.25%' /* 16:5 aspect ratio */ }}
              >
                <input
                  ref={(el) => {
                    fileInputRefs.current.banner = el;
                  }}
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  onChange={handleBannerChange}
                  disabled={bannerUploading}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gray-50 text-center">
                  {bannerUploading ? (
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                  ) : (
                    <>
                      <Upload className="text-muted-foreground mb-2 h-10 w-10" />
                      <span className="text-muted-foreground text-sm font-medium">
                        Upload Banner
                      </span>
                      <span className="text-muted-foreground mt-1 text-xs">
                        Recommended size: 1600x500 pixels
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium">Banner Tips:</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• High-quality image that represents your brand</li>
              <li>• Include key products or services</li>
              <li>• Ensure text is readable if included in the image</li>
              <li>• Maximum file size: 1MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
