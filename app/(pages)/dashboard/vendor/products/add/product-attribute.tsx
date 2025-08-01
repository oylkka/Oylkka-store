'use client';
import { Plus, Trash2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { ProductFormValues } from './product-form-type';

type AttributeHierarchy = {
  primary: string | null;
  secondary: string[];
};

const ATTRIBUTE_TYPES = [
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Size' },
  { value: 'material', label: 'Material' },
  { value: 'style', label: 'Style' },
  { value: 'custom', label: 'Custom' },
];

const ATTRIBUTE_PRESETS = {
  size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  material: [
    'Cotton',
    'Polyester',
    'Leather',
    'Denim',
    'Wool',
    'Silk',
    'Linen',
  ],
  style: ['Casual', 'Formal', 'Sport', 'Vintage', 'Modern', 'Classic'],
};

const COLOR_NAME_TO_HEX = {
  Black: '#000000',
  White: '#FFFFFF',
  Red: '#FF0000',
  Blue: '#0000FF',
  Green: '#008000',
  Yellow: '#FFFF00',
  Purple: '#800080',
  Orange: '#FFA500',
  Gray: '#808080',
  Pink: '#FFC0CB',
  Brown: '#A52A2A',
  Navy: '#000080',
  Teal: '#008080',
  Maroon: '#800000',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Beige: '#F5F5DC',
};

const COMMON_COLORS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#0000FF',
  '#008000',
  '#FFA500',
  '#800080',
  '#FFFF00',
];

export function ProductAttributes() {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {},
  );
  const [attributeTypes, setAttributeTypes] = useState<string[]>([]);
  const [attributeHierarchy, setAttributeHierarchy] =
    useState<AttributeHierarchy>({
      primary: null,
      secondary: [],
    });

  const rawAttributes = watch('attributes');
  // biome-ignore lint: error
  const attributesRecord = useMemo(
    () => rawAttributes ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawAttributes)],
  );

  const addAttribute = (type: string) => {
    if (attributeTypes.includes(type)) {
      return; // Prevent duplicate attribute types
    }

    // Add new attribute type to our tracking state
    setAttributeTypes((prev) => [...prev, type]);

    // Update the form with the new empty attribute array
    setValue(
      'attributes',
      {
        ...attributesRecord,
        [type]: [],
      },
      { shouldValidate: true },
    );
  };

  const removeAttribute = (type: string) => {
    // Remove from our tracking state
    setAttributeTypes((prev) => prev.filter((t) => t !== type));

    // Remove from form values
    const newAttributes = { ...attributesRecord };
    delete newAttributes[type];

    setValue(
      'attributes',
      Object.keys(newAttributes).length > 0 ? newAttributes : undefined,
      { shouldValidate: true },
    );

    // Clean up related state
    setNewValues((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });

    setSelectedColors((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
  };

  const addAttributeValue = (attrType: string, value?: string) => {
    const newValue = (value || newValues[attrType] || '').trim();
    if (!newValue) {
      return;
    }

    let finalValue = newValue;

    // Handle color values
    if (attrType.toLowerCase() === 'color') {
      finalValue =
        COLOR_NAME_TO_HEX[newValue as keyof typeof COLOR_NAME_TO_HEX] ||
        (newValue.startsWith('#') ? newValue : `#${newValue}`);
    }

    // Get current values for this attribute type
    const currentValues = attributesRecord[attrType] || [];

    // Don't add duplicates
    if (Array.isArray(currentValues) && currentValues.includes(finalValue)) {
      return;
    }

    // Update the form
    setValue(
      'attributes',
      {
        ...attributesRecord,
        [attrType]: [
          ...(Array.isArray(currentValues) ? currentValues : []),
          finalValue,
        ],
      },
      { shouldValidate: true },
    );

    // Reset input
    setNewValues((prev) => ({ ...prev, [attrType]: '' }));
  };

  const addMultipleAttributeValues = (attrType: string, values: string[]) => {
    // Get current values for this attribute type
    const currentValues = attributesRecord[attrType] || [];

    // Filter out duplicates
    const newValues = values.filter((value) => !currentValues.includes(value));

    if (newValues.length === 0) {
      return;
    }

    // Update the form
    setValue(
      'attributes',
      {
        ...attributesRecord,
        [attrType]: [
          ...(Array.isArray(currentValues) ? currentValues : []),
          ...newValues,
        ],
      },
      { shouldValidate: true },
    );
  };

  const removeAttributeValue = (attrType: string, index: number) => {
    const currentValues = attributesRecord[attrType] || [];
    if (!Array.isArray(currentValues)) {
      return;
    }

    const newValues = [...currentValues];
    newValues.splice(index, 1);

    setValue(
      'attributes',
      {
        ...attributesRecord,
        [attrType]: newValues.length > 0 ? newValues : [],
      },
      { shouldValidate: true },
    );
  };

  const getColorName = (hex: string) => {
    const found = Object.entries(COLOR_NAME_TO_HEX).find(
      ([, h]) => h.toLowerCase() === hex.toLowerCase(),
    );
    return found ? found[0] : null;
  };

  const setPrimaryAttribute = (attrType: string) => {
    if (attributeHierarchy.primary === attrType) {
      // Toggle off if already selected
      setAttributeHierarchy({
        ...attributeHierarchy,
        primary: null,
      });
    } else {
      // Set as primary and ensure it's not in secondary
      setAttributeHierarchy({
        primary: attrType,
        secondary: attributeHierarchy.secondary.filter(
          (attr) => attr !== attrType,
        ),
      });
    }
  };

  const setSecondaryAttribute = (attrType: string) => {
    if (attributeHierarchy.secondary.includes(attrType)) {
      // Toggle off if already selected
      setAttributeHierarchy({
        ...attributeHierarchy,
        secondary: attributeHierarchy.secondary.filter(
          (attr) => attr !== attrType,
        ),
      });
    } else if (attributeHierarchy.primary !== attrType) {
      // Add to secondary if not the primary
      setAttributeHierarchy({
        ...attributeHierarchy,
        secondary: [...attributeHierarchy.secondary, attrType],
      });
    }
  };

  const renderAttributeValue = (
    attrType: string,
    value: string,
    index: number,
  ) => {
    if (attrType.toLowerCase() === 'color' && /^#[0-9A-F]{6}$/i.test(value)) {
      const colorName = getColorName(value);
      return (
        <div
          key={index}
          className={cn(
            'bg-card flex items-center gap-2 rounded-lg border px-3 py-1.5',
            'hover:bg-accent transition-colors',
          )}
        >
          <div
            className='h-4 w-4 rounded-sm ring-1 ring-gray-200 ring-inset'
            style={{ backgroundColor: value }}
          />
          <span className='text-sm font-medium'>
            {colorName ? `${colorName} (${value})` : value}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='ml-1 h-6 w-6 p-0 opacity-50 hover:opacity-100'
            onClick={() => removeAttributeValue(attrType, index)}
          >
            <X className='h-3 w-3' />
          </Button>
        </div>
      );
    }
    return (
      <div
        key={index}
        className={cn(
          'bg-card flex items-center gap-2 rounded-lg border px-3 py-1.5',
          'hover:bg-accent transition-colors',
        )}
      >
        <span className='text-sm font-medium'>{value}</span>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='ml-1 h-6 w-6 p-0 opacity-50 hover:opacity-100'
          onClick={() => removeAttributeValue(attrType, index)}
        >
          <X className='h-3 w-3' />
        </Button>
      </div>
    );
  };

  const renderQuickAddButtons = (attrType: string) => {
    const type = attrType.toLowerCase();

    if (type === 'color') {
      return (
        <div className='mt-2 mb-3'>
          <p className='text-muted-foreground mb-2 text-xs'>
            Quick add common colors:
          </p>
          <div className='flex flex-wrap gap-2'>
            {COMMON_COLORS.map((color, idx) => {
              const colorName = getColorName(color);
              const buttonLabel = colorName || color;

              return (
                <Button
                  // biome-ignore lint: error
                  key={idx}
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8 rounded-md px-2'
                  onClick={() => addAttributeValue(type, color)}
                >
                  <div
                    className='mr-1.5 h-4 w-4 rounded-sm ring-1 ring-gray-200 ring-inset'
                    style={{ backgroundColor: color }}
                  />
                  <span className='text-xs'>{buttonLabel}</span>
                </Button>
              );
            })}
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8 px-2'
              onClick={() => {
                const colorValues = Object.values(COLOR_NAME_TO_HEX);
                addMultipleAttributeValues(type, colorValues);
              }}
            >
              <span className='text-xs'>Add All Colors</span>
            </Button>
          </div>
        </div>
      );
    }

    if (ATTRIBUTE_PRESETS[type as keyof typeof ATTRIBUTE_PRESETS]) {
      const presets = ATTRIBUTE_PRESETS[type as keyof typeof ATTRIBUTE_PRESETS];

      return (
        <div className='mt-2 mb-3'>
          <p className='text-muted-foreground mb-2 text-xs'>
            Quick add {type} presets:
          </p>
          <div className='flex flex-wrap gap-2'>
            {presets.map((value, idx) => (
              <Button
                // biome-ignore lint: error
                key={idx}
                type='button'
                size='sm'
                variant='outline'
                className='h-8 px-2'
                onClick={() => addAttributeValue(type, value)}
              >
                <span className='text-xs'>{value}</span>
              </Button>
            ))}
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8 px-2'
              onClick={() => addMultipleAttributeValues(type, presets)}
            >
              <span className='text-xs'>
                Add All{' '}
                {ATTRIBUTE_TYPES.find((t) => t.value === type)?.label || type}
              </span>
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderAttributeInput = (attrType: string) => {
    const isColor = attrType.toLowerCase() === 'color';

    return (
      <div className='mt-4 flex items-center gap-2'>
        <Input
          type='text'
          placeholder={`Add ${attrType} value`}
          value={newValues[attrType] || ''}
          onChange={(e) =>
            setNewValues((prev) => ({ ...prev, [attrType]: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addAttributeValue(attrType);
            }
          }}
        />
        {isColor ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type='button' variant='outline' size='sm'>
                Pick Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-56 p-0' align='end'>
              <HexColorPicker
                color={selectedColors[attrType] || '#000'}
                onChange={(color) => {
                  setSelectedColors((prev) => ({ ...prev, [attrType]: color }));
                  setNewValues((prev) => ({ ...prev, [attrType]: color }));
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
        <Button type='button' onClick={() => addAttributeValue(attrType)}>
          Add
        </Button>
      </div>
    );
  };

  // Initialize attributeTypes from existing attributes
  React.useEffect(() => {
    if (
      Object.keys(attributesRecord).length > 0 &&
      attributeTypes.length === 0
    ) {
      setAttributeTypes(Object.keys(attributesRecord));
    }
  }, [attributesRecord, attributeTypes.length]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use a custom event to communicate with the parent component
      const event = new CustomEvent('attributeHierarchyChange', {
        detail: attributeHierarchy,
      });
      window.dispatchEvent(event);
    }
  }, [attributeHierarchy]);

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <CardTitle>Product Attributes</CardTitle>
          <CardDescription>
            Add attributes of your product (color, size, etc.)
          </CardDescription>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button type='button' variant='outline' className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Attribute
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-56 p-0' align='end'>
              <Command>
                <CommandInput placeholder='Search attribute type...' />
                <CommandList>
                  <CommandEmpty>No attribute type found.</CommandEmpty>
                  <CommandGroup>
                    {ATTRIBUTE_TYPES.filter(
                      (type) => !attributeTypes.includes(type.value),
                    ).map((type) => (
                      <CommandItem
                        key={type.value}
                        onSelect={() => addAttribute(type.value)}
                      >
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className='space-y-6'>
        <div className='space-y-4'>
          {attributeTypes.map((attrType) => (
            <div
              key={attrType}
              className='rounded-lg border p-5 transition-all hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-4'>
                <FormItem className='flex-1'>
                  <FormLabel className='text-sm font-medium'>
                    Attribute Type
                  </FormLabel>
                  <div className='border-input bg-background flex h-10 w-full items-center rounded-md border px-3 py-2'>
                    <span>
                      {ATTRIBUTE_TYPES.find((t) => t.value === attrType)
                        ?.label || attrType}
                    </span>
                  </div>
                </FormItem>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='mt-6 opacity-50 hover:opacity-100'
                  onClick={() => removeAttribute(attrType)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              <div className='mt-2 flex items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant={
                    attributeHierarchy.primary === attrType
                      ? 'default'
                      : 'outline'
                  }
                  className='h-7 px-2'
                  onClick={() => setPrimaryAttribute(attrType)}
                >
                  Primary
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant={
                    attributeHierarchy.secondary.includes(attrType)
                      ? 'default'
                      : 'outline'
                  }
                  className='h-7 px-2'
                  onClick={() => setSecondaryAttribute(attrType)}
                  disabled={attributeHierarchy.primary === attrType}
                >
                  Secondary
                </Button>
                <span className='text-muted-foreground text-xs'>
                  {attributeHierarchy.primary === attrType
                    ? 'Main attribute for variant grouping'
                    : attributeHierarchy.secondary.includes(attrType)
                      ? 'Sub-attribute within primary groups'
                      : ''}
                </span>
              </div>

              <div className='mt-6'>
                <FormLabel className='text-sm font-medium'>Values</FormLabel>
                {attributesRecord[attrType]?.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {(attributesRecord[attrType] as string[]).map(
                      (val: string, idx: number) =>
                        renderAttributeValue(attrType, val, idx),
                    )}
                  </div>
                ) : (
                  <p className='text-muted-foreground mt-2 text-sm'>
                    No values added yet
                  </p>
                )}
                {renderQuickAddButtons(attrType)}
                {renderAttributeInput(attrType)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
