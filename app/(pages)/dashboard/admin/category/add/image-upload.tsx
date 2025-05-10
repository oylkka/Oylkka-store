'use client';

import { AlertCircle, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onChange: (file?: File) => void;
  value?: File | null;
  disabled?: boolean;
  previewUrl?: string | null;
  onPreviewChange?: (url: string | null) => void;
  required?: boolean;
}

// 500 KB in bytes
const MAX_FILE_SIZE = 500 * 1024;

export const ImageUpload = forwardRef<
  { resetUpload: () => void },
  ImageUploadProps
>(
  (
    { onChange, disabled, previewUrl, onPreviewChange, required = false },
    ref
  ) => {
    // Use internal preview state if not provided by parent
    const [internalPreview, setInternalPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use the provided preview if available, otherwise use internal state
    const preview = previewUrl !== undefined ? previewUrl : internalPreview;

    // Expose resetUpload method to parent component
    useImperativeHandle(ref, () => ({
      resetUpload: () => {
        onChange(undefined);
        if (onPreviewChange) {
          onPreviewChange(null);
        } else {
          setInternalPreview(null);
        }
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) {
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File size exceeds 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`
        );
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Reset error if exists
      setError(null);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);

      // Update preview based on whether parent is managing it or not
      if (onPreviewChange) {
        onPreviewChange(objectUrl);
      } else {
        // Cleanup old preview URL if internal state is used
        if (internalPreview) {
          URL.revokeObjectURL(internalPreview);
        }
        setInternalPreview(objectUrl);
      }

      // Pass file to parent
      onChange(file);
    };

    const handleRemove = () => {
      // Cleanup preview URL if internal state is used
      if (!onPreviewChange && internalPreview) {
        URL.revokeObjectURL(internalPreview);
      }

      // Update state in parent or internally
      onChange(undefined);
      if (onPreviewChange) {
        onPreviewChange(null);
      } else {
        setInternalPreview(null);
      }
      setError(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          ref={fileInputRef}
          required={required}
        />

        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-md border">
            <Image
              src={preview || '/placeholder.svg'}
              alt="Preview"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              onClick={handleRemove}
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full p-0 opacity-80 transition-opacity hover:opacity-100"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className={`border-muted-foreground/50 bg-muted/50 hover:border-muted-foreground/80 hover:bg-muted flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors ${
              required ? 'ring-red-500 focus-within:ring-2' : ''
            }`}
          >
            <UploadCloud className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              Click to upload an image
              {required && <span className="ml-1 text-red-500">*</span>}
            </p>
            <p className="text-muted-foreground text-xs">Max size: 500 KB</p>
          </label>
        )}
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';
