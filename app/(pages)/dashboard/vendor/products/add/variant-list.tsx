'use client';

import colorNamer from 'color-namer';
import { ImagePlus, TrashIcon, X } from 'lucide-react';
import { useMemo } from 'react';

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
  // biome-ignore lint: error
  variants: any[];
  // biome-ignore lint: error
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
    index: number,
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
  // biome-ignore lint: error
  const updateVariantField = (index: number, field: string, value: any) => {
    onUpdate(index, {
      ...variants[index],
      [field]: value,
    });
  };

  // Enhanced function to get a readable name for a color hex value
  const getReadableColorName = (colorValue: string): string => {
    // Check if it's a hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      try {
        // Get color names from color-namer
        const names = colorNamer(colorValue);

        // Try to get the most accurate and readable color name
        // Start with the most recognized naming systems

        // First priority: Use 'basic' names as they're most common
        if (names.basic && names.basic.length > 0) {
          return capitalizeColorName(names.basic[0].name);
        }

        // Second priority: Use 'ntc' (Name That Color) which has good names
        if (names.ntc && names.ntc.length > 0) {
          return capitalizeColorName(names.ntc[0].name);
        }

        // Third priority: Try roygbiv which focuses on standard color names
        if (names.roygbiv && names.roygbiv.length > 0) {
          return capitalizeColorName(names.roygbiv[0].name);
        }

        // Fourth priority: Use pantone for more technical color names
        if (names.pantone && names.pantone.length > 0) {
          return capitalizeColorName(names.pantone[0].name);
        }
      } catch (error) {
        // biome-ignore lint: error
        console.error('Error getting color name:', error);
      }
    }

    // Return the original value if it's not a hex color or if there was an error
    return colorValue;
  };

  // Function to properly capitalize color names
  const capitalizeColorName = (name: string): string => {
    // Handle multi-word color names
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format attribute name for display
  const formatAttributeName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Function to format attribute value for display
  const formatAttributeValue = (key: string, value: string): string => {
    // If this is a color attribute and has a hex value, get a readable name
    if (
      key.toLowerCase() === 'color' &&
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
    ) {
      return getReadableColorName(value);
    }
    return value;
  };

  const groupVariantsByPrimaryAttribute = () => {
    if (variants.length === 0) {
      return {};
    }

    // Try to determine the primary attribute by looking at the first variant
    const firstVariant = variants[0];
    if (
      !firstVariant.attributes ||
      Object.keys(firstVariant.attributes).length === 0
    ) {
      return { ungrouped: variants };
    }

    // Find the attribute that appears most consistently across variants
    const attributeCounts: Record<string, number> = {};
    variants.forEach((variant) => {
      if (!variant.attributes) {
        return;
      }

      Object.keys(variant.attributes).forEach((attr) => {
        attributeCounts[attr] = (attributeCounts[attr] || 0) + 1;
      });
    });

    // Find the attribute with the highest count
    const primaryAttribute = Object.entries(attributeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([attr]) => attr)[0];

    if (!primaryAttribute) {
      return { ungrouped: variants };
    }

    // Group variants by the primary attribute value
    const grouped: Record<string, typeof variants> = {};

    variants.forEach((variant) => {
      if (!variant.attributes || !variant.attributes[primaryAttribute]) {
        grouped.ungrouped = grouped.ungrouped || [];
        grouped.ungrouped.push(variant);
        return;
      }

      const value = variant.attributes[primaryAttribute];

      // If this is a color attribute with hex value, use the readable name as the group key
      const groupKey =
        primaryAttribute.toLowerCase() === 'color' &&
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
          ? getReadableColorName(value)
          : value;

      grouped[groupKey] = grouped[groupKey] || [];
      grouped[groupKey].push(variant);
    });

    return { primaryAttribute, groups: grouped };
  };

  // Use the grouping function with useMemo
  // biome-ignore lint: error
  const groupingResult = useMemo(
    () => groupVariantsByPrimaryAttribute(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variants],
  );

  // Extract the primary attribute and groups from the result
  const { primaryAttribute, groups: groupedVariants } = groupingResult as {
    primaryAttribute?: string;
    groups: Record<string, typeof variants>;
  };

  if (variants.length === 0) {
    return (
      <div className='rounded-md border border-dashed py-8 text-center'>
        <p className='text-gray-500'>No variants added yet.</p>
        {hasAttributes ? (
          <p className='mt-2 text-sm text-gray-400'>
            Make sure you&#39;ve defined a product SKU, then click &#34;Generate
            Variants&#34; to create product variants.
          </p>
        ) : (
          <p className='mt-2 text-sm text-gray-400'>
            Define product attributes and SKU first to generate variants.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className='mt-4 space-y-6'>
      <Separator className='my-4' />

      {primaryAttribute && (
        <div className='mb-4'>
          <p className='text-muted-foreground text-sm'>
            Variants grouped by {formatAttributeName(primaryAttribute)}
          </p>
        </div>
      )}

      {Object.entries(groupedVariants).map(([group, groupVariants]) => (
        <div key={group} className='space-y-4'>
          {group !== 'ungrouped' && (
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>
                {/* If this is a color group, show a color preview swatch */}
                {primaryAttribute &&
                  primaryAttribute.toLowerCase() === 'color' &&
                  groupVariants.length > 0 &&
                  groupVariants[0].attributes &&
                  groupVariants[0].attributes[primaryAttribute] &&
                  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                    groupVariants[0].attributes[primaryAttribute],
                  ) && (
                    <span
                      className='mr-2 inline-block h-4 w-4 rounded-full border'
                      style={{
                        backgroundColor:
                          groupVariants[0].attributes[primaryAttribute],
                      }}
                    />
                  )}
                {group}
              </h3>
              <Badge variant='outline' className='text-xs'>
                {groupVariants.length} variant
                {groupVariants.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          <div className='space-y-4'>
            {groupVariants.map((variant) => {
              // Calculate the actual index in the full variants array
              const index = variants.findIndex((v) => v.id === variant.id);
              if (index === -1) {
                return null;
              }

              return (
                <div key={variant.id} className='rounded-md border p-4'>
                  <div className='mb-4 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>{variant.name}</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-red-500 hover:bg-red-50 hover:text-red-700'
                            onClick={() => onRemove(index)}
                          >
                            <TrashIcon className='mr-1 h-4 w-4' /> Remove
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this variant</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className='mb-4 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div>
                      <span className='text-muted-foreground text-sm'>
                        SKU:
                      </span>
                      <Input value={variant.sku} className='mt-1' disabled />
                    </div>
                    <div>
                      <span className='text-muted-foreground text-sm'>
                        Price:
                      </span>
                      <Input
                        type='number'
                        value={variant.price || ''}
                        onChange={(e) =>
                          updateVariantField(
                            index,
                            'price',
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>Discount:</span>
                      <Input
                        type='number'
                        value={variant.discountPrice || ''}
                        onChange={(e) =>
                          updateVariantField(
                            index,
                            'discountPrice',
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>Stock:</span>
                      <Input
                        type='number'
                        value={variant.stock || ''}
                        onChange={(e) =>
                          updateVariantField(
                            index,
                            'stock',
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  {variant.attributes &&
                    Object.keys(variant.attributes).length > 0 && (
                      <div className='mb-4'>
                        <span className='text-muted-foreground mb-2 block text-sm'>
                          Attributes:
                        </span>
                        <div className='flex flex-wrap gap-2'>
                          {Object.entries(variant.attributes).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant='secondary'
                                className='items-center'
                              >
                                {/* For color attributes, add a color swatch */}
                                {key.toLowerCase() === 'color' &&
                                  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                                    value as string,
                                  ) && (
                                    <span
                                      className='mr-1 inline-block h-3 w-3 rounded-full'
                                      style={{
                                        backgroundColor: value as string,
                                      }}
                                    />
                                  )}
                                {formatAttributeName(key)}:{' '}
                                {formatAttributeValue(key, value as string)}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  <div>
                    <span className='text-muted-foreground mb-2 block text-sm'>
                      Image:
                    </span>
                    <div className='flex items-center gap-4'>
                      {variant.image ? (
                        <div className='group relative'>
                          {/* biome-ignore lint: error */}
                          <img
                            src={
                              typeof variant.image === 'string'
                                ? variant.image
                                : URL.createObjectURL(variant.image)
                            }
                            alt={`Variant ${variant.name}`}
                            className='h-16 w-16 rounded-md object-cover'
                          />
                          <button
                            type='button'
                            className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
                            onClick={() => removeVariantImage(index)}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ) : (
                        <div className='text-sm text-gray-500'>No image</div>
                      )}
                      <div>
                        <input
                          type='file'
                          id={`variant-${index}-image`}
                          name={`variantImage_${variant.id || index}`}
                          className='hidden'
                          accept='image/*'
                          onChange={(e) => handleVariantImageUpload(e, index)}
                        />
                        <label
                          htmlFor={`variant-${index}-image`}
                          className='flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300'
                        >
                          <ImagePlus className='h-6 w-6 text-gray-400' />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
