'use client';

import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHeroBanner } from '@/services/public/hero-banner';

type HeroBanner = {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  image: { url: string };
  bannerTag?: string;
  primaryActionText?: string;
  primaryActionLink?: string;
  secondaryActionText?: string;
  secondaryActionLink?: string;
  alignment?: 'left' | 'center' | 'right';
};

export default function HeroSection() {
  const { isPending, data = [], isError } = useHeroBanner();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autoplay effect
  useEffect(() => {
    if (!autoplay || data.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
    }, 8000);

    return () => clearInterval(interval);
  }, [autoplay, data.length]);

  const resetAutoplayWithDelay = () => {
    setAutoplay(false);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = setTimeout(() => setAutoplay(true), 8000); // 8s
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
    resetAutoplayWithDelay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? data.length - 1 : prev - 1));
    resetAutoplayWithDelay();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    resetAutoplayWithDelay();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      nextSlide();
    }
    if (distance < -50) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isPending) {
    return <HeroSkeleton />;
  }
  if (isError) {
    return <HeroError />;
  }
  if (data.length === 0) {
    return null;
  }

  return (
    <section
      className='relative w-full overflow-hidden'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='relative h-[40vh] w-full md:h-[70vh] lg:h-[91vh]'>
        {data.map((slide: HeroBanner, index: number) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-1000',
              index === currentSlide
                ? 'opacity-100'
                : 'pointer-events-none opacity-0',
            )}
          >
            <div className='absolute inset-0 overflow-hidden'>
              <Image
                src={slide.image.url || '/placeholder.svg'}
                alt={slide.title}
                fill
                priority={index === 0}
                className='object-cover object-center'
              />
              <div
                className={cn(
                  'absolute inset-0 bg-black/40', // Base overlay for better contrast
                  slide.alignment === 'left'
                    ? 'bg-gradient-to-r from-black/80 via-black/50 to-black/20'
                    : slide.alignment === 'center'
                      ? 'bg-gradient-to-r from-black/60 via-black/20 to-black/60'
                      : 'bg-gradient-to-l from-black/80 via-black/50 to-black/20',
                )}
                aria-hidden='true' // Accessibility: Hide decorative overlay
              />
            </div>

            <div className='relative z-10 flex h-full items-center'>
              <div
                className={cn(
                  'container mx-auto flex px-2 md:px-0',
                  slide.alignment === 'left'
                    ? 'justify-start'
                    : slide.alignment === 'center'
                      ? 'justify-center text-center'
                      : 'justify-end',
                )}
              >
                <div className='max-w-md space-y-2 md:max-w-lg md:space-y-4 lg:max-w-xl'>
                  {slide.bannerTag && (
                    <Badge
                      className='bg-white/90 text-black md:mb-2 md:rounded-md md:px-3 md:py-1 md:text-sm md:font-medium'
                      variant='secondary'
                    >
                      {slide.bannerTag}
                    </Badge>
                  )}
                  <h2 className='font-heading text-xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl'>
                    {slide.title}
                  </h2>
                  <p className='text-lg font-medium text-white md:text-2xl'>
                    {slide.subTitle}
                  </p>
                  <p className='text-sm text-white/90 md:text-lg'>
                    {slide.description}
                  </p>
                  <div
                    className={cn(
                      'flex flex-wrap gap-3 pt-2',
                      slide.alignment === 'center' && 'justify-center',
                    )}
                  >
                    {slide.primaryActionText && slide.primaryActionLink && (
                      <Button asChild>
                        <Link href={slide.primaryActionLink}>
                          {slide.primaryActionText}
                        </Link>
                      </Button>
                    )}
                    {slide.secondaryActionText && slide.secondaryActionLink && (
                      <Button
                        asChild
                        variant='outline'
                        className='border-white/20 bg-white/10 text-white hover:bg-white/20'
                      >
                        <Link href={slide.secondaryActionLink}>
                          {slide.secondaryActionText}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className='absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2'>
          {data.map((_: HeroBanner, index: number) => (
            <button
              type='button'
              // biome-ignore lint: error
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'bg-white/50 hover:bg-white/80',
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className='relative h-[40vh] w-full md:h-[70vh] lg:h-[91vh]'>
      <div className='bg-muted absolute inset-0 animate-pulse' />
      <div className='relative z-10 flex h-full items-center'>
        <div className='container mx-auto px-2 md:px-0'>
          <div className='max-w-md space-y-2 md:max-w-lg md:space-y-4 lg:max-w-xl'>
            <div className='bg-muted-foreground/20 h-6 w-24 rounded' />
            <div className='bg-muted-foreground/30 h-10 w-3/4 rounded' />
            <div className='bg-muted-foreground/30 h-8 w-2/3 rounded' />
            <div className='space-y-2'>
              <div className='bg-muted-foreground/20 h-4 w-full rounded' />
              <div className='bg-muted-foreground/20 h-4 w-5/6 rounded' />
              <div className='bg-muted-foreground/20 h-4 w-4/6 rounded' />
            </div>
            <div className='flex gap-3 pt-2'>
              <div className='bg-muted-foreground/30 h-10 w-32 rounded' />
              <div className='bg-muted-foreground/20 h-10 w-32 rounded' />
            </div>
          </div>
        </div>
      </div>
      <div className='absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2'>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className='bg-muted-foreground/30 h-2 w-2 rounded-full'
          />
        ))}
      </div>
    </div>
  );
}

function HeroError() {
  return (
    <div className='w-full p-6'>
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Failed to load</AlertTitle>
        <AlertDescription>
          We couldn’t load the hero banner. Please try again later.
        </AlertDescription>
      </Alert>
    </div>
  );
}
