'use client';
import { Check, ChevronsUpDown, Plus, Trash2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { ProductFormValues } from './product-form-type';

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

export function VariantAttributesCard() {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {}
  );
  const [openCombobox, setOpenCombobox] = useState<Record<string, boolean>>({});
  const [attributeTypes, setAttributeTypes] = useState<string[]>([]);

  const rawAttributes = watch('attributes');

  const attributesRecord = useMemo(
    () => rawAttributes ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawAttributes)]
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
      { shouldValidate: true }
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
      { shouldValidate: true }
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
      { shouldValidate: true }
    );

    // Reset input
    setNewValues((prev) => ({ ...prev, [attrType]: '' }));
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
      { shouldValidate: true }
    );
  };

  const getColorName = (hex: string) => {
    const found = Object.entries(COLOR_NAME_TO_HEX).find(
      ([, h]) => h.toLowerCase() === hex.toLowerCase()
    );
    return found ? found[0] : null;
  };

  const renderAttributeInput = (attrType: string) => {
    if (attrType.toLowerCase() === 'color') {
      return (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex w-32 items-center gap-2"
                  >
                    <div
                      className="h-4 w-4 rounded-sm ring-1 ring-gray-200 ring-inset"
                      style={{
                        backgroundColor: selectedColors[attrType] || '#000000',
                      }}
                    />
                    <span>Pick Color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                  <HexColorPicker
                    color={selectedColors[attrType] || '#000000'}
                    onChange={(color) =>
                      setSelectedColors((prev) => ({
                        ...prev,
                        [attrType]: color,
                      }))
                    }
                  />
                  <div className="mt-4 grid grid-cols-8 gap-1.5">
                    {COMMON_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          'flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-all',
                          'hover:ring-primary ring-1 ring-gray-200 ring-inset hover:ring-2'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setSelectedColors((prev) => ({
                            ...prev,
                            [attrType]: color,
                          }))
                        }
                      >
                        {selectedColors[attrType] === color && (
                          <Check
                            className={cn('h-4 w-4 stroke-2', {
                              'text-black':
                                color === '#FFFFFF' || color === '#FFFF00',
                              'text-white':
                                color !== '#FFFFFF' && color !== '#FFFF00',
                            })}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Input
                      type="text"
                      value={selectedColors[attrType] || ''}
                      onChange={(e) =>
                        setSelectedColors((prev) => ({
                          ...prev,
                          [attrType]: e.target.value,
                        }))
                      }
                      className="h-9"
                      placeholder="#000000"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        addAttributeValue(attrType, selectedColors[attrType])
                      }
                    >
                      Add
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover
                open={openCombobox[attrType]}
                onOpenChange={(open) =>
                  setOpenCombobox((prev) => ({ ...prev, [attrType]: open }))
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox[attrType]}
                    className="w-[200px] justify-between"
                  >
                    {selectedColors[attrType]
                      ? `Preset: ${
                          getColorName(selectedColors[attrType]) ||
                          'Custom Color'
                        }`
                      : 'Select preset color...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search color..." />
                    <CommandEmpty>No color found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {Object.entries(COLOR_NAME_TO_HEX).map(([name, hex]) => (
                        <CommandItem
                          key={name}
                          value={name}
                          onSelect={() => {
                            setSelectedColors((prev) => ({
                              ...prev,
                              [attrType]: hex,
                            }));
                            addAttributeValue(attrType, hex);
                            setOpenCombobox((prev) => ({
                              ...prev,
                              [attrType]: false,
                            }));
                          }}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="h-4 w-4 rounded-sm"
                            style={{ backgroundColor: hex }}
                          />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      );
    }

    if (['size', 'material', 'style'].includes(attrType.toLowerCase())) {
      const presets =
        ATTRIBUTE_PRESETS[
          attrType.toLowerCase() as keyof typeof ATTRIBUTE_PRESETS
        ] || [];

      return (
        <div className="mt-4 space-y-4">
          {presets.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-sm"
                    onClick={() => addAttributeValue(attrType, preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <Separator />
            </>
          )}
          <div className="flex gap-2">
            <Input
              placeholder={`Add new ${attrType.toLowerCase()}`}
              className="w-full"
              value={newValues[attrType] || ''}
              onChange={(e) =>
                setNewValues((prev) => ({
                  ...prev,
                  [attrType]: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAttributeValue(attrType);
                }
              }}
            />
            <Button type="button" onClick={() => addAttributeValue(attrType)}>
              Add
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Add new value"
          className="w-full"
          value={newValues[attrType] || ''}
          onChange={(e) =>
            setNewValues((prev) => ({ ...prev, [attrType]: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAttributeValue(attrType);
            }
          }}
        />
        <Button type="button" onClick={() => addAttributeValue(attrType)}>
          Add
        </Button>
      </div>
    );
  };

  const renderAttributeValue = (
    attrType: string,
    value: string,
    index: number
  ) => {
    if (attrType.toLowerCase() === 'color' && /^#[0-9A-F]{6}$/i.test(value)) {
      const colorName = getColorName(value);
      return (
        <div
          key={index}
          className={cn(
            'bg-card flex items-center gap-2 rounded-lg border px-3 py-1.5',
            'hover:bg-accent transition-colors'
          )}
        >
          <div
            className="h-4 w-4 rounded-sm ring-1 ring-gray-200 ring-inset"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-medium">
            {colorName ? `${colorName} (${value})` : value}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-1 h-6 w-6 p-0 opacity-50 hover:opacity-100"
            onClick={() => removeAttributeValue(attrType, index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    return (
      <div
        key={index}
        className={cn(
          'bg-card flex items-center gap-2 rounded-lg border px-3 py-1.5',
          'hover:bg-accent transition-colors'
        )}
      >
        <span className="text-sm font-medium">{value}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={() => removeAttributeValue(attrType, index)}
        >
          <X className="h-3 w-3" />
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

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl font-semibold">
          Product Variants
        </CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Attribute
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search attribute type..." />
              <CommandEmpty>No attribute type found.</CommandEmpty>
              <CommandGroup>
                {ATTRIBUTE_TYPES.filter(
                  (type) => !attributeTypes.includes(type.value)
                ).map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => addAttribute(type.value)}
                  >
                    {type.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="space-y-6">
        {attributeTypes.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50/50 p-8 text-center">
            <div className="text-muted-foreground max-w-[300px]">
              <p className="mb-2 text-sm font-medium">No attributes added</p>
              <p className="text-xs">
                Add product attributes like Color, Size, or Material to create
                variants. Click &#34;Add Attribute&#34; to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {attributeTypes.map((attrType) => (
              <div
                key={attrType}
                className="rounded-lg border bg-gray-50/50 p-5 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium">
                      Attribute Type
                    </FormLabel>
                    <div className="border-input bg-background flex h-10 w-full items-center rounded-md border px-3 py-2">
                      <span>
                        {ATTRIBUTE_TYPES.find((t) => t.value === attrType)
                          ?.label || attrType}
                      </span>
                    </div>
                  </FormItem>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-6 opacity-50 hover:opacity-100"
                    onClick={() => removeAttribute(attrType)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6">
                  <FormLabel className="text-sm font-medium">Values</FormLabel>
                  {attributesRecord[attrType]?.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(attributesRecord[attrType] as string[]).map(
                        (val: string, idx: number) =>
                          renderAttributeValue(attrType, val, idx)
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-2 text-sm">
                      No values added yet
                    </p>
                  )}
                  {renderAttributeInput(attrType)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
