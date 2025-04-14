'use client';

import { Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ProductFormValues } from './product-form-type';

// Type for variant options
type VariantOption = {
  id: string;
  name: string;
  values: string[];
};

// Common variant preset values (non-color options)
const VARIANT_PRESETS = {
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

// Color name to hex mapping
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

// Common brand colors for quick selection
const COMMON_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#0000FF', // Blue
  '#008000', // Green
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFFF00', // Yellow
  '#808080', // Gray
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
];

export function VariantsOptionsCard() {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [newOptionValue, setNewOptionValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const variantOptions = watch('variantOptions') || [];

  // Add a new variant option type (like Size, Color)
  const addVariantOption = () => {
    const newOption: VariantOption = {
      id: Date.now().toString(),
      name: '',
      values: [],
    };

    setValue('variantOptions', [...variantOptions, newOption]);
  };

  // Remove a variant option
  const removeVariantOption = (id: string) => {
    setValue(
      'variantOptions',
      variantOptions.filter((option) => option.id !== id)
    );
  };

  // Add a new value to a variant option
  const addOptionValue = (optionId: string, value = newOptionValue.trim()) => {
    if (!value) {
      return;
    }

    const updatedOptions = variantOptions.map((option) => {
      if (option.id === optionId) {
        // Handle color values differently
        if (option.name === 'color') {
          // Convert color name to hex if it exists in our mapping
          const hexValue =
            COLOR_NAME_TO_HEX[value as keyof typeof COLOR_NAME_TO_HEX] || value;
          const formattedHex = hexValue.startsWith('#')
            ? hexValue
            : `#${hexValue}`;

          // Don't add duplicates
          if (option.values.includes(formattedHex)) {
            return option;
          }

          return {
            ...option,
            values: [...option.values, formattedHex],
          };
        } else {
          // For non-color values, handle normally
          if (option.values.includes(value)) {
            return option;
          }
          return {
            ...option,
            values: [...option.values, value],
          };
        }
      }
      return option;
    });

    setValue('variantOptions', updatedOptions);
    setNewOptionValue('');
  };

  // Add a color variant
  const addColorValue = (optionId: string, colorHex: string) => {
    // Ensure color hex is properly formatted
    const formattedColor = colorHex.startsWith('#') ? colorHex : `#${colorHex}`;
    addOptionValue(optionId, formattedColor);
  };

  // Add a preset color value (converts color name to hex)
  const addPresetColorValue = (optionId: string, colorName: string) => {
    const hexValue =
      COLOR_NAME_TO_HEX[colorName as keyof typeof COLOR_NAME_TO_HEX] ||
      '#000000';
    addColorValue(optionId, hexValue);
  };

  // Add a preset value for non-color options
  const addPresetValue = (optionId: string, presetValue: string) => {
    addOptionValue(optionId, presetValue);
  };

  // Remove a value from a variant option
  const removeOptionValue = (optionId: string, valueIndex: number) => {
    const updatedOptions = variantOptions.map((option) => {
      if (option.id === optionId) {
        const updatedValues = [...option.values];
        updatedValues.splice(valueIndex, 1);
        return {
          ...option,
          values: updatedValues,
        };
      }
      return option;
    });

    setValue('variantOptions', updatedOptions);
  };

  // Update variant option name
  const updateOptionName = (optionId: string, name: string) => {
    const updatedOptions = variantOptions.map((option) => {
      if (option.id === optionId) {
        return { ...option, name };
      }
      return option;
    });

    setValue('variantOptions', updatedOptions);
  };

  // Check if a color is hex format
  const isColorHex = (value: string) => {
    return /^#[0-9A-F]{6}$/i.test(value);
  };

  // Find color name by hex value (for display purposes)
  const getColorNameByHex = (hexValue: string) => {
    const entries = Object.entries(COLOR_NAME_TO_HEX);
    for (const [name, hex] of entries) {
      if (hex.toLowerCase() === hexValue.toLowerCase()) {
        return name;
      }
    }
    return null;
  };

  // Render the appropriate input for different variant types
  const renderVariantInput = (option: VariantOption) => {
    switch (option.name) {
      case 'color':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex w-24 items-center gap-2 self-start"
                  >
                    <div
                      className="h-4 w-4 rounded-sm"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span>Pick</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="mb-2">
                    <HexColorPicker
                      color={selectedColor}
                      onChange={setSelectedColor}
                    />
                  </div>
                  <div className="mb-3 grid grid-cols-6 gap-1">
                    {COMMON_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-gray-200"
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      >
                        {selectedColor === color && (
                          <Check
                            className={`h-4 w-4 stroke-2 ${
                              color === '#FFFFFF' || color === '#FFFF00'
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="mr-2 h-8"
                      placeholder="#000000"
                    />
                    <Button
                      type="button"
                      onClick={() => addColorValue(option.id, selectedColor)}
                      size="sm"
                      className="h-8"
                    >
                      Add
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {Object.keys(COLOR_NAME_TO_HEX)
                    .slice(0, 8)
                    .map((colorName) => (
                      <Button
                        key={colorName}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          addPresetColorValue(option.id, colorName)
                        }
                      >
                        {colorName}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'size':
      case 'material':
      case 'style':
        return (
          <div className="mt-2 space-y-2">
            {VARIANT_PRESETS[option.name as keyof typeof VARIANT_PRESETS] && (
              <div className="mb-2 flex flex-wrap gap-1">
                {VARIANT_PRESETS[
                  option.name as keyof typeof VARIANT_PRESETS
                ].map((presetValue) => (
                  <Button
                    key={presetValue}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addPresetValue(option.id, presetValue)}
                  >
                    {presetValue}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex">
              <Input
                placeholder={`Add new ${option.name}`}
                className="mr-2"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOptionValue(option.id);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addOptionValue(option.id)}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-2 flex">
            <Input
              placeholder="Add new value"
              className="mr-2"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOptionValue(option.id);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addOptionValue(option.id)}
              size="sm"
            >
              Add
            </Button>
          </div>
        );
    }
  };

  // Render variant value badge with appropriate style
  const renderVariantValue = (
    option: VariantOption,
    value: string,
    index: number
  ) => {
    if (option.name === 'color' && isColorHex(value)) {
      // Show color name if available, otherwise show hex value
      const colorName = getColorNameByHex(value);
      return (
        <div
          key={index}
          className="bg-muted flex items-center rounded-md border px-2 py-1"
        >
          <div
            className="mr-2 h-4 w-4 rounded-sm"
            style={{ backgroundColor: value }}
          />
          <span className="mr-1">
            {colorName ? `${colorName} (${value})` : value}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeOptionValue(option.id, index)}
            className="h-5 w-5 p-0"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="bg-muted flex items-center rounded-md border px-2 py-1"
      >
        <span className="mr-1">{value}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeOptionValue(option.id, index)}
          className="h-5 w-5 p-0"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Variants & Options</CardTitle>
        <Button
          type="button"
          variant="outline"
          onClick={addVariantOption}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {variantOptions.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center">
            No variant options added. Add options like Size, Color, Material,
            etc.
          </div>
        ) : (
          variantOptions.map((option) => (
            <div key={option.id} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <FormItem className="mr-2 flex-1">
                  <FormLabel>Option Name</FormLabel>
                  <Select
                    value={option.name}
                    onValueChange={(value) =>
                      updateOptionName(option.id, value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="style">Style</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariantOption(option.id)}
                  className="mt-8 h-9"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-2">
                <FormLabel>Option Values</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value, index) =>
                    renderVariantValue(option, value, index)
                  )}
                </div>

                {renderVariantInput(option)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
