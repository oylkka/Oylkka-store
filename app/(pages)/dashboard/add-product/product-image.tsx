// components/product/ProductImagesCard.tsx
'use client';

import { ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage } from '@/hooks/use-product-image';

import { ProductFormContext } from './product-form-context';

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB in bytes

export function ProductImagesCard() {
  const { productImages, setProductImages } = useContext(ProductFormContext);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedImage, setDraggedImage] = useState<ProductImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formMethods = useFormContext();
  const formErrors = formMethods.formState.errors;
  const imageError = formErrors.root?.images?.message;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Check if adding new files would exceed the limit
    if (productImages.length + files.length > 4) {
      setErrorMessage('You can only upload up to 4 images');
      return;
    }

    // Check file sizes
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > MAX_IMAGE_SIZE
    );
    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `Some images exceed the maximum size of 500KB: ${oversizedFiles.map((f) => f.name).join(', ')}`
      );
      return;
    }

    setErrorMessage(null);
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

    // Reset the input to allow selecting the same file again
    event.target.value = '';
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        <span className="text-lg font-semibold">Product Images</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="image-upload">Upload Images</Label>
            <FormDescription>
              You can upload up to 4 images (max 500KB each). Drag images to
              reorder or set as cover image.
            </FormDescription>

            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={productImages.length >= 4}
                className="max-w-md"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={productImages.length >= 4}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Browse
              </Button>
            </div>

            {errorMessage && (
              <div className="mt-1 text-sm text-red-500">{errorMessage}</div>
            )}

            {/* Display form validation error */}
            {imageError && (
              <div className="mt-1 text-sm text-red-500">{imageError}</div>
            )}
          </div>

          {/* Image Preview Section */}
          {productImages.length > 0 && (
            <div className="mt-4">
              <Label>Product Images ({productImages.length}/4)</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {productImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative flex flex-col items-center rounded-md border-2 p-2 ${
                      image.isCover ? 'border-blue-500' : 'border-gray-200'
                    } ${
                      isDragging && draggedImage?.id === image.id
                        ? 'opacity-50'
                        : 'opacity-100'
                    } `}
                    draggable
                    onDragStart={() => handleDragStart(image)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(image)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={image.preview}
                        alt="Product preview"
                        className="h-full w-full rounded-md object-cover"
                        width={120}
                        height={120}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 rounded-full"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-1 w-full text-center text-xs text-gray-500">
                      {(image.file.size / 1024).toFixed(1)} KB
                    </div>

                    <Button
                      type="button"
                      variant={image.isCover ? 'default' : 'outline'}
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setCoverImage(image.id)}
                      disabled={image.isCover}
                    >
                      {image.isCover ? 'Cover Image' : 'Set as Cover'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
