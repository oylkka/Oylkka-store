import { useFormContext } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
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
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const status = watch('status');
  const featured = watch('featured');

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
          <Field data-invalid={!!errors.status}>
            <FieldLabel>Product Status</FieldLabel>
            <Select
              onValueChange={(val) =>
                setValue('status', val as ProductFormValues['status'])
              }
              value={status}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DRAFT'>Draft</SelectItem>
                <SelectItem value='PUBLISHED'>Published</SelectItem>
                <SelectItem value='ARCHIVED'>Archived</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <FieldError>{errors.status.message}</FieldError>}
          </Field>

          <Field>
            <div className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FieldLabel className='text-base'>Featured Product</FieldLabel>
                <FieldDescription>
                  Display this product on the featured section
                </FieldDescription>
              </div>
              <Switch
                checked={featured}
                onCheckedChange={(val) => setValue('featured', val)}
              />
            </div>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
