'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import image1 from '@/assets/hero-slider-1.jpg';
import image2 from '@/assets/hero-slider-2.jpg';
import image3 from '@/assets/hero-slider-3.jpg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: StaticImageData;
  primaryCta: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
  badge?: string;
  theme: 'light' | 'dark';
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides: Slide[] = [
    {
      id: 1,
      title: 'Summer Collection',
      subtitle: '2024',
      description:
        'Discover the latest trends for the season with up to 30% off on selected items.',
      image: image1,
      primaryCta: {
        text: 'Shop Now',
        link: '/collections/summer',
      },
      secondaryCta: {
        text: 'Learn More',
        link: '/about-collection',
      },
      badge: 'New Arrivals',
      theme: 'light',
    },
    {
      id: 2,
      title: 'Premium Accessories',
      subtitle: 'Exclusive Collection',
      description:
        'Elevate your style with our handcrafted accessories made from premium materials.',
      image: image2,
      primaryCta: {
        text: 'Explore',
        link: '/collections/accessories',
      },
      theme: 'dark',
    },
    {
      id: 3,
      title: 'Limited Edition',
      subtitle: 'Designer Collaboration',
      description:
        'Our exclusive designer collaboration is now available. Limited quantities only.',
      image: image3,
      primaryCta: {
        text: 'Shop Collection',
        link: '/collections/limited-edition',
      },
      secondaryCta: {
        text: 'View Lookbook',
        link: '/lookbook',
      },
      badge: 'Limited Stock',
      theme: 'light',
    },
  ];

  // Handle autoplay
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoplay, slides.length]);

  const resetAutoplayWithDelay = () => {
    setAutoplay(false);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = setTimeout(() => {
      setAutoplay(true);
    }, 8000); // resume after 5s
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    resetAutoplayWithDelay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
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
    if (!touchStart || !touchEnd) {
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

  return (
    <section
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[60vh] min-h-[500px] w-full md:h-[70vh] lg:h-[91vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-1000',
              index === currentSlide
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            )}
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              <div
                className={cn(
                  'absolute inset-0',
                  slide.theme === 'light'
                    ? 'bg-black/30'
                    : 'bg-gradient-to-r from-black/70 via-black/50 to-black/30'
                )}
              />
            </div>

            <div className="relative z-10 flex h-full items-center">
              <div
                className={cn(
                  'container mx-auto flex',
                  index === 2 ? 'justify-end' : 'justify-start'
                )}
              >
                <div className="max-w-md space-y-4 md:max-w-lg lg:max-w-xl">
                  {slide.badge && (
                    <Badge
                      className="mb-2 rounded-md px-3 py-1 text-sm font-medium"
                      variant={
                        slide.theme === 'light' ? 'secondary' : 'default'
                      }
                    >
                      {slide.badge}
                    </Badge>
                  )}
                  <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="text-xl font-medium text-white md:text-2xl">
                    {slide.subtitle}
                  </p>
                  <p className="text-base text-white/90 md:text-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild size="lg" className="rounded-md">
                      <Link href={slide.primaryCta.link}>
                        {slide.primaryCta.text}
                      </Link>
                    </Button>
                    {slide.secondaryCta && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-md bg-white/10 backdrop-blur"
                      >
                        <Link href={slide.secondaryCta.link}>
                          {slide.secondaryCta.text}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
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

      <div className="container mx-auto py-8  md:py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {[
            {
              name: 'Women',
              image: '/placeholder.svg?height=400&width=300',
              link: '/category/women',
            },
            {
              name: 'Men',
              image: '/placeholder.svg?height=400&width=300',
              link: '/category/men',
            },
            {
              name: 'Accessories',
              image: '/placeholder.svg?height=400&width=300',
              link: '/category/accessories',
            },
            {
              name: 'Footwear',
              image: '/placeholder.svg?height=400&width=300',
              link: '/category/footwear',
            },
          ].map((category, index) => (
            <Link
              key={index}
              href={category.link}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-semibold text-white md:text-xl">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
