'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BannerType } from '@/lib/types';
import { cn } from '@/lib/utils';

type BannerPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerType | null;
};

export function BannerPreview({ isOpen, onClose, banner }: BannerPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  if (!banner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[40vh] max-w-[90vw] min-w-[90vw] p-0 md:h-[80vh]">
        <DialogHeader className="hidden">
          <DialogTitle>{banner.title}</DialogTitle>
        </DialogHeader>
        <div className="relative h-full w-full overflow-hidden sm:rounded-lg">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>

          {/* Banner content */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="relative h-full w-full">
              <Image
                src={banner.image.url || '/placeholder.svg'}
                alt={banner.image.alt || banner.title}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/30 dark:bg-gradient-to-r dark:from-black/70 dark:via-black/40 dark:to-black/20" />
            </div>
          </div>

          <div className="relative z-10 flex h-full items-center">
            <div
              className={cn(
                'container mx-auto flex px-2 md:px-0',
                banner.alignment === 'left'
                  ? 'justify-start'
                  : banner.alignment === 'center'
                    ? 'justify-center'
                    : 'justify-end'
              )}
            >
              <div className="max-w-md space-y-2 md:max-w-lg md:space-y-4 lg:max-w-xl">
                {banner.bannerTag && (
                  <Badge
                    className="md:mb-2 md:rounded-md md:px-3 md:py-1 md:text-sm md:font-medium"
                    variant="secondary"
                  >
                    {banner.bannerTag}
                  </Badge>
                )}
                <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  {banner.title}
                </h2>
                <p className="text-lg font-medium text-white md:text-2xl">
                  {banner.subTitle}
                </p>
                {banner.description && (
                  <p className="text-sm text-white/90 md:text-lg">
                    {banner.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  {banner.primaryActionText && banner.primaryActionLink && (
                    <Button className="pointer-events-none">
                      {banner.primaryActionText}
                    </Button>
                  )}
                  {banner.secondaryActionText && banner.secondaryActionLink && (
                    <Button variant="outline" className="pointer-events-none">
                      {banner.secondaryActionText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview indicator */}
          <div className="absolute right-0 bottom-4 left-0 flex justify-center">
            <Badge
              variant="outline"
              className="bg-black/50 text-white backdrop-blur-sm"
            >
              Preview Mode
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
