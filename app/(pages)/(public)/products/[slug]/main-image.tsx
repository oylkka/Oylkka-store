import { Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProductImage {
  url: string;
  publicId: string;
}
export const ImageGallery: React.FC<{
  images: ProductImage[];
  productName: string;
  discountPercent: number;
}> = ({ images, productName, discountPercent }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [magnify, setMagnify] = useState(false);
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) {
      return;
    }

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMagnifyPosition({ x, y });
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogHeader>
          <DialogTitle className="hidden" />
        </DialogHeader>
        <div
          ref={imageContainerRef}
          className="relative h-[500px] w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-50"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setMagnify(true)}
          onMouseLeave={() => setMagnify(false)}
        >
          <Image
            src={images[selectedImage]?.url || '/api/placeholder/600/600'}
            alt={productName}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {magnify && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${images[selectedImage]?.url})`,
                backgroundPosition: `${magnifyPosition.x}% ${magnifyPosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
                opacity: 1,
                zIndex: 10,
              }}
            />
          )}

          {discountPercent > 0 && (
            <Badge className="absolute top-4 left-4 z-20 bg-red-500 hover:bg-red-600">
              -{discountPercent}%
            </Badge>
          )}

          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 bottom-4 z-20 bg-white/70 hover:bg-white"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent>
          <div className="h-full w-full">
            <Image
              src={images[selectedImage]?.url || '/api/placeholder/800/800'}
              alt={productName}
              className="object-contain"
              width={2000}
              height={2000}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.publicId} className="basis-1/5">
              <div
                className={cn(
                  'relative h-24 cursor-pointer rounded-md border-2 transition-all',
                  selectedImage === index
                    ? 'border-primary ring-primary/20 ring-2'
                    : 'border-transparent'
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.url}
                  alt={`${productName} - view ${index + 1}`}
                  className="rounded-md object-cover"
                  fill
                  sizes="100px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};
