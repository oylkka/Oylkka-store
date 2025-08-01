import { useFormContext } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import type { ProductFormValues } from './product-form-type';

export default function ProductStatus() {
  const { control } = useFormContext<ProductFormValues>();
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Product Status</CardTitle>
        <CardDescription>
          Set your product status and visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <FormField
            control={control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel> Product Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='PUBLISHED'>Published</SelectItem>
                    <SelectItem value='ARCHIVED'>Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='featured'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Featured Product</FormLabel>
                  <FormDescription>
                    Display this product on the featured section
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
