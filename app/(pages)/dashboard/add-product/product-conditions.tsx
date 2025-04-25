// components/product/ProductDetailsCard.tsx
'use client';

import {
  CheckCircle,
  ClipboardList,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSkuCheck } from '@/hooks/use-sku-check';
import { SkuService } from '@/services';

import { ProductFormValues } from './product-form-type';

// Product condition options - same as before
const PRODUCT_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'FOR_PARTS', label: 'For Parts or Not Working' },
];

export function ProductDetailsCard() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { isChecking, isAvailable, error, checkSkuAvailability } =
    useSkuCheck();

  // Watch relevant fields
  const productName = useWatch({ control, name: 'productName' });
  const category = useWatch({ control, name: 'category' });
  const subcategory = useWatch({ control, name: 'subcategory' });
  const sku = useWatch({ control, name: 'sku' });

  // Only auto-generate SKU when we have all required information and no SKU exists yet
  useEffect(() => {
    // Only generate SKU if we have all required fields AND there is no existing SKU value
    if (productName && category && subcategory && !sku) {
      const suggestedSku = SkuService.suggestSku(
        category,
        productName,
        subcategory
      );
      setValue('sku', suggestedSku);
      checkSkuAvailability(suggestedSku);
    }
  }, [productName, category, subcategory, sku, setValue, checkSkuAvailability]);

  // Check SKU availability when it changes
  useEffect(() => {
    if (sku && sku.length > 3) {
      checkSkuAvailability(sku);
    }
  }, [sku, checkSkuAvailability]);

  // Generate a new SKU
  const handleGenerateSku = () => {
    if (productName && category && subcategory) {
      const newSku = SkuService.suggestSku(category, productName, subcategory);
      setValue('sku', newSku);
      checkSkuAvailability(newSku);
    }
  };

  // Sanitize SKU on blur
  const handleSkuBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const sanitized = SkuService.sanitizeSku(event.target.value);
    setValue('sku', sanitized);
    if (sanitized) {
      checkSkuAvailability(sanitized);
    }
  };

  // Check if all required fields for SKU generation are available
  const canGenerateSku = Boolean(productName && category && subcategory);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ClipboardList className="h-5 w-5" />
        <span className="text-lg font-semibold">Product Details</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Brand</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Product Brand" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <FormControl>
                    <Input
                      placeholder="SKU-12345"
                      {...field}
                      onBlur={handleSkuBlur}
                    />
                  </FormControl>
                  {sku && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      {isChecking && (
                        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                      )}
                      {!isChecking && isAvailable === true && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!isChecking && isAvailable === false && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateSku}
                        disabled={!canGenerateSku}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate unique SKU</p>
                      {!canGenerateSku && (
                        <p className="text-xs text-amber-500">
                          Requires product name, category and subcategory
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription className="flex items-center gap-1">
                {error ? (
                  <span className="text-sm text-red-500">{error}</span>
                ) : (
                  <>
                    <span>A unique identifier for inventory tracking</span>
                  </>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Condition *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCT_CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conditionDescription"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Condition Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the condition in detail (scratches, wear, etc.)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
