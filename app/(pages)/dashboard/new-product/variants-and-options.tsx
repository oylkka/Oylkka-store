// components/product/VariantsOptionsCard.tsx
'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

export function VariantsOptionsCard() {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [newOptionValue, setNewOptionValue] = useState('');
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
  const addOptionValue = (optionId: string) => {
    if (!newOptionValue.trim()) {
      return;
    }

    const updatedOptions = variantOptions.map((option) => {
      if (option.id === optionId) {
        return {
          ...option,
          values: [...option.values, newOptionValue.trim()],
        };
      }
      return option;
    });

    setValue('variantOptions', updatedOptions);
    setNewOptionValue('');
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
                  {option.values.map((value, index) => (
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
                  ))}
                </div>

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
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
