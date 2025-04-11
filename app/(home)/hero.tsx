'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import image1 from '@/assets/hero-slider-1.jpg';
import image2 from '@/assets/hero-slider-2.jpg';
import image3 from '@/assets/hero-slider-3.jpg';
import img2 from '@/assets/hero2-image1.webp';
import img1 from '@/assets/hero2-image2.webp';
import img3 from '@/assets/hero2-image3.jpg';
import img4 from '@/assets/hero2-image4.jpg';
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
      <div className="relative h-[40vh] w-full md:h-[70vh] lg:h-[91vh]">
        {slides.map((slide, index) => (
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
                  'container mx-auto flex px-2 md:px-0',
                  index === 2 ? 'justify-end text-end' : 'justify-start'
                )}
              >
                <div className="max-w-md space-y-2 md:max-w-lg md:space-y-4 lg:max-w-xl">
                  {slide.badge && (
                    <Badge
                      className="md:mb-2 md:rounded-md md:px-3 md:py-1 md:text-sm md:font-medium"
                      variant={
                        slide.theme === 'light' ? 'secondary' : 'default'
                      }
                    >
                      {slide.badge}
                    </Badge>
                  )}
                  <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-4xl md:text-3xl md:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="text-lg font-medium text-white md:text-2xl">
                    {slide.subtitle}
                  </p>
                  <p className="text-sm text-white/90 md:text-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild>
                      <Link href={slide.primaryCta.link}>
                        {slide.primaryCta.text}
                      </Link>
                    </Button>
                    {slide.secondaryCta && (
                      <Button asChild variant="outline">
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

        <div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2">
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

      <div className="container mx-auto px-2 py-8 md:px-0 md:py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-6">
          {[
            {
              name: 'Women',
              image: img1,
              link: '/category/women',
            },
            {
              name: 'Men',
              image: img2,
              link: '/category/men',
            },
            {
              name: 'Accessories',
              image: img3,
              link: '/category/accessories',
            },
            {
              name: 'Footwear',
              image: img4,
              link: '/category/footwear',
            },
          ].map((category, index) => (
            <Link
              key={index}
              href={category.link}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="bg-muted aspect-[3/4] w-full overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-4">
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
