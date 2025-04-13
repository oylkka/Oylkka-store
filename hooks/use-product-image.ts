// hooks/useProductImages.ts
import { useState } from 'react';

export interface ProductImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

export function useProductImages(maxImages: number = 4) {
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedImage, setDraggedImage] = useState<ProductImage | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Check if adding new files would exceed the limit
    if (productImages.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages: ProductImage[] = [];

    Array.from(files).forEach((file) => {
      // Create a unique ID for each image
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);

      // First image automatically becomes the cover image if no cover exists
      const isCover =
        productImages.length === 0 &&
        newImages.length === 0 &&
        !productImages.some((img) => img.isCover);

      newImages.push({ id, file, preview, isCover });
    });

    setProductImages([...productImages, ...newImages]);
  };

  const removeImage = (id: string) => {
    const imageToRemove = productImages.find((img) => img.id === id);
    const wasImageCover = imageToRemove?.isCover || false;

    const updatedImages = productImages.filter((img) => img.id !== id);

    // If the removed image was the cover image, set the first remaining image as cover
    if (wasImageCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }

    setProductImages(updatedImages);
  };

  const handleDragStart = (image: ProductImage) => {
    setIsDragging(true);
    setDraggedImage(image);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetImage: ProductImage) => {
    if (!draggedImage) {
      return;
    }

    const draggedIndex = productImages.findIndex(
      (img) => img.id === draggedImage.id
    );
    const targetIndex = productImages.findIndex(
      (img) => img.id === targetImage.id
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create a new array with the images reordered
    const newImages = [...productImages];
    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    setProductImages(newImages);
    setIsDragging(false);
    setDraggedImage(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedImage(null);
  };

  const setCoverImage = (id: string) => {
    setProductImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  return {
    productImages,
    isDragging,
    draggedImage,
    handleImageUpload,
    removeImage,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    setCoverImage,
  };
}
