'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

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
    if (!autoplay || data.length === 0) {return;}

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
    }, 8000);

    return () => clearInterval(interval);
  }, [autoplay, data.length]);

  const resetAutoplayWithDelay = () => {
    setAutoplay(false);
    if (autoplayTimeoutRef.current) {clearTimeout(autoplayTimeoutRef.current);}
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
    if (touchStart === null || touchEnd === null) {return;}
    const distance = touchStart - touchEnd;
    if (distance > 50) {nextSlide();}
    if (distance < -50) {prevSlide();}
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isPending || isError || data.length === 0) {return null;}

  return (
    <section
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[40vh] w-full md:h-[70vh] lg:h-[91vh]">
        {data.map((slide: HeroBanner, index: number) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-1000',
              index === currentSlide
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            )}
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.image.url}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/30 dark:bg-gradient-to-r dark:from-black/70 dark:via-black/40 dark:to-black/20" />
            </div>

            <div className="relative z-10 flex h-full items-center">
              <div
                className={cn(
                  'container mx-auto flex px-2 md:px-0',
                  slide.alignment === 'left'
                    ? 'justify-start'
                    : slide.alignment === 'center'
                      ? 'justify-center'
                      : 'justify-end'
                )}
              >
                <div className="max-w-md space-y-2 md:max-w-lg md:space-y-4 lg:max-w-xl">
                  {slide.bannerTag && (
                    <Badge
                      className="md:mb-2 md:rounded-md md:px-3 md:py-1 md:text-sm md:font-medium"
                      variant="secondary"
                    >
                      {slide.bannerTag}
                    </Badge>
                  )}
                  <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="text-lg font-medium text-white md:text-2xl">
                    {slide.subTitle}
                  </p>
                  <p className="text-sm text-white/90 md:text-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {slide.primaryActionText && slide.primaryActionLink && (
                      <Button asChild>
                        <Link href={slide.primaryActionLink}>
                          {slide.primaryActionText}
                        </Link>
                      </Button>
                    )}
                    {slide.secondaryActionText && slide.secondaryActionLink && (
                      <Button asChild variant="outline">
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

        <div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2">
          {data.map((index: number) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'bg-white/50 hover:bg-white/80'
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
