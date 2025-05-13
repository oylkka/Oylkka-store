'use client';

import namer from 'color-namer';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Product, ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ColorSwatch } from './color-swatch';

interface VariantSelectorProps {
  availableColors: string[];
  availableSizes: string[];
  selectedColor: string;
  selectedSize: string;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  product: Product;
}

// Helper function to get a human-readable color name
const getColorName = (hexColor: string): string => {
  try {
    const result = namer(hexColor);
    // Use the closest name from any palette
    return result.ntc[0].name; // or result.html[0].name, etc.
  } catch {
    return hexColor;
  }
};

export default function VariantSelector({
  availableColors,
  availableSizes,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  product,
}: VariantSelectorProps) {
  // Update the variant selector to handle the single image property
  const handleColorClick = (color: string) => {
    onColorSelect(color);
  };

  return (
    <>
      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <Label className="mb-2 text-sm font-medium">
              Color:{' '}
              <span className="font-semibold">
                {getColorName(selectedColor)}
              </span>
            </Label>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {availableColors.map((color) => {
              // Check if this color has variants with stock
              const hasStock = product.variants.some(
                (v: ProductVariant) =>
                  v.attributes?.color === color && v.stock > 0
              );

              return (
                <div key={color} className="flex flex-col items-center">
                  <ColorSwatch
                    color={color}
                    isSelected={selectedColor === color}
                    onClick={() => handleColorClick(color)}
                    label={getColorName(color)}
                    disabled={!hasStock}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <Label className="mb-2 text-sm font-medium">
              Size: <span className="font-semibold">{selectedSize}</span>
            </Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Size Guide
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Size Guide</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-4 py-4">
                  <div className="font-medium">Size</div>
                  <div className="font-medium">Chest (in)</div>
                  <div className="font-medium">Length (in)</div>
                  <div className="font-medium">Sleeve (in)</div>

                  <div>S</div>
                  <div>36-38</div>
                  <div>27-28</div>
                  <div>24-25</div>

                  <div>M</div>
                  <div>38-40</div>
                  <div>28-29</div>
                  <div>25-26</div>

                  <div>L</div>
                  <div>40-42</div>
                  <div>29-30</div>
                  <div>26-27</div>

                  <div>XL</div>
                  <div>42-44</div>
                  <div>30-31</div>
                  <div>27-28</div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <RadioGroup
            className="mt-2 flex flex-wrap gap-3"
            value={selectedSize}
            onValueChange={onSizeSelect}
          >
            {availableSizes.map((size) => {
              // Find if this size is available for the selected color
              const isAvailable = product.variants.some(
                (v: ProductVariant) =>
                  v.attributes?.size === size &&
                  v.attributes?.color === selectedColor &&
                  v.stock > 0
              );

              return (
                <div key={size} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={size}
                    id={`size-${size}`}
                    className="peer hidden"
                    disabled={!isAvailable}
                  />
                  <Label
                    htmlFor={`size-${size}`}
                    className={cn(
                      'relative flex h-10 w-14 cursor-pointer items-center justify-center rounded-md border text-center transition-colors',
                      selectedSize === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200',
                      !isAvailable && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {size}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}
    </>
  );
}
