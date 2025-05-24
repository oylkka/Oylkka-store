import Image from 'next/image';
import type React from 'react';

import type { ProductReviewImage } from '@/lib/types/review';

interface ReviewImagesProps {
  images: ProductReviewImage[];
}

export const ReviewImages: React.FC<ReviewImagesProps> = ({ images }) => {
  if (!images || images.length === 0) {return null;}

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((image, index) => (
        <div
          key={image.publicId || index}
          className="relative h-16 w-16 overflow-hidden rounded-lg border md:h-20 md:w-20"
        >
          <Image
            src={image.url || '/placeholder.svg'}
            alt={image.alt || `Review image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};
