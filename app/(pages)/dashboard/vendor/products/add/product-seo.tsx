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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ProductFormValues } from './product-form-type';

export default function ProductSeo() {
  const { control } = useFormContext<ProductFormValues>();
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Optimize your product for search engines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="Meta title for SEO" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    id="metaDescription"
                    placeholder="Meta description for SEO"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
