import { ImagePlus, TrashIcon, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VariantListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (index: number, value: any) => void;
  onRemove: (index: number) => void;
  hasAttributes: boolean;
}

export default function VariantList({
  variants,
  onUpdate,
  onRemove,
  hasAttributes,
}: VariantListProps) {
  const handleVariantImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    onUpdate(index, {
      ...variants[index],
      image: file,
    });
  };

  const removeVariantImage = (index: number) => {
    onUpdate(index, {
      ...variants[index],
      image: null,
    });
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateVariantField = (index: number, field: string, value: any) => {
    onUpdate(index, {
      ...variants[index],
      [field]: value,
    });
  };

  if (variants.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-8 text-center">
        <p className="text-gray-500">No variants added yet.</p>
        {hasAttributes ? (
          <p className="mt-2 text-sm text-gray-400">
            Make sure you&#39;ve defined a product SKU, then click &#34;Generate
            Variants&#34; to create product variants.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">
            Define product attributes and SKU first to generate variants.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <Separator className="my-4" />

      {variants.map((variant, index) => (
        <div key={variant.id} className="rounded-md border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">{variant.name}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onRemove(index)}
                  >
                    <TrashIcon className="mr-1 h-4 w-4" /> Remove
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete this variant</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <span className="text-sm text-gray-500">SKU:</span>
              <Input value={variant.sku} className="mt-1" disabled />
            </div>
            <div>
              <span className="text-sm text-gray-500">Price:</span>
              <Input
                type="number"
                value={variant.price || ''}
                onChange={(e) =>
                  updateVariantField(
                    index,
                    'price',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <span className="text-sm text-gray-500">Discount:</span>
              <Input
                type="number"
                value={variant.discountPrice || ''}
                onChange={(e) =>
                  updateVariantField(
                    index,
                    'discountPrice',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <span className="text-sm text-gray-500">Stock:</span>
              <Input
                type="number"
                value={variant.stock || ''}
                onChange={(e) =>
                  updateVariantField(
                    index,
                    'stock',
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
            <div className="mb-4">
              <span className="mb-2 block text-sm text-gray-500">
                Attributes:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(variant.attributes).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key}: {value as string}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="mb-2 block text-sm text-gray-500">Image:</span>
            <div className="flex items-center gap-4">
              {variant.image ? (
                <div className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(variant.image)}
                    alt={`Variant ${variant.name}`}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeVariantImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No image</div>
              )}
              <div>
                <input
                  type="file"
                  id={`variant-${index}-image`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleVariantImageUpload(e, index)}
                />
                <label
                  htmlFor={`variant-${index}-image`}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300"
                >
                  {variant.image ? (
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
