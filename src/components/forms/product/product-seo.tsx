import { useFormContext } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { ProductFormValues } from './product-form-type';

export default function ProductSeo() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Optimize your product for search engines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Field data-invalid={!!errors.metaTitle}>
            <FieldLabel htmlFor='metaTitle'>Meta Title</FieldLabel>
            <Input
              id='metaTitle'
              placeholder='Meta title for SEO'
              {...register('metaTitle')}
            />
            {errors.metaTitle && (
              <FieldError>{errors.metaTitle.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.metaDescription}>
            <FieldLabel htmlFor='metaDescription'>Meta Description</FieldLabel>
            <Textarea
              id='metaDescription'
              placeholder='Meta description for SEO'
              rows={3}
              {...register('metaDescription')}
            />
            {errors.metaDescription && (
              <FieldError>{errors.metaDescription.message}</FieldError>
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
