import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCreateGlobalAttributeMutation } from '@/services/admin-global-attributes';

export const Route = createFileRoute(
  '/dashboard/admin/global-attributes/create',
)({
  component: RouteComponent,
});

type ValueEntry = {
  value: string;
  slug: string;
  hex: string;
};

function RouteComponent() {
  const navigate = useNavigate();
  const { mutate: createAttribute, isPending } =
    useCreateGlobalAttributeMutation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [values, setValues] = useState<ValueEntry[]>([
    { value: '', slug: '', hex: '' },
  ]);

  const autoSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === autoSlug(name)) {
      setSlug(autoSlug(val));
    }
  };

  const updateValue = (index: number, field: keyof ValueEntry, val: string) => {
    const next = [...values];
    next[index] = {
      ...next[index],
      [field]: val,
      ...(field === 'value' && !next[index].slug
        ? { slug: autoSlug(val) }
        : {}),
    };
    setValues(next);
  };

  const addValue = () =>
    setValues([...values, { value: '', slug: '', hex: '' }]);

  const removeValue = (index: number) => {
    if (values.length <= 1) return;
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const validValues = values.filter(
      (v) =>
        (v.value.trim() && v.slug.trim()) ||
        (v.hex.trim() && v.hex.startsWith('#')),
    );
    createAttribute(
      {
        name: name.trim(),
        slug: slug.trim(),
        displayOrder,
        values: validValues.map((v) => ({
          value: v.value.trim(),
          slug: v.slug.trim(),
          hex: v.hex.trim() || undefined,
        })),
      },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/admin/global-attributes' });
        },
      },
    );
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Create Global Attribute
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Define a new attribute in the shared catalog (e.g. "Color", "Size")
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Attribute Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                placeholder='e.g. Color'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug</Label>
              <Input
                id='slug'
                placeholder='e.g. color'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className='font-mono text-sm'
                required
              />
              <p className='text-xs text-muted-foreground'>
                Used in filter URLs like /products?globalAttr.color=red
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='displayOrder'>Display Order</Label>
              <Input
                id='displayOrder'
                type='number'
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className='w-24'
              />
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-base'>Values</CardTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addValue}
            >
              <Plus className='w-3.5 h-3.5' />
              Add Value
            </Button>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-[1fr_1fr_48px_36px] gap-2 items-start'>
              <div className='text-xs text-muted-foreground font-medium'>
                Value
              </div>
              <div className='text-xs text-muted-foreground font-medium'>
                Slug
              </div>
              <div className='text-xs text-muted-foreground font-medium text-center'>
                Color
              </div>
              <div />
            </div>
            {values.map((v, i) => (
              <div
                key={String(i)}
                className='grid grid-cols-[1fr_1fr_48px_36px] gap-2 items-start'
              >
                <Input
                  placeholder='e.g. Red'
                  value={v.value}
                  onChange={(e) => updateValue(i, 'value', e.target.value)}
                />
                <Input
                  placeholder='e.g. red'
                  value={v.slug}
                  onChange={(e) => updateValue(i, 'slug', e.target.value)}
                  className='font-mono text-sm'
                />
                <div className='relative'>
                  <Input
                    type='color'
                    value={v.hex || '#000000'}
                    onChange={(e) => updateValue(i, 'hex', e.target.value)}
                    className='w-12 h-10 p-1 cursor-pointer'
                    title='Pick a color'
                  />
                  {v.hex?.startsWith('#') && (
                    <Eye
                      className={cn(
                        'absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5',
                        v.hex === '#000000'
                          ? 'text-muted-foreground'
                          : 'text-white mix-blend-difference',
                      )}
                    />
                  )}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='w-9 h-10 hover:text-destructive'
                  onClick={() => removeValue(i)}
                  disabled={values.length <= 1}
                >
                  <Trash2 className='w-3.5 h-3.5' />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Attribute'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              navigate({ to: '/dashboard/admin/global-attributes' })
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
