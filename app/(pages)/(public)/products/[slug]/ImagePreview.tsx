'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onRemove,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);

    return () => URL.revokeObjectURL(newImageUrl);
  }, [file]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className='group relative h-20 w-20 overflow-hidden rounded-lg border'>
      <Image
        fill
        src={imageUrl || '/placeholder.svg'}
        alt='Review upload preview'
        className='object-cover'
      />
      <button
        type='button'
        onClick={onRemove}
        className='absolute top-1 right-1 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100'
        aria-label='Remove image'
      >
        <X className='h-3 w-3' />
      </button>
    </div>
  );
};
