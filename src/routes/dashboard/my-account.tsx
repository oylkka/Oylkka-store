import { createFileRoute } from '@tanstack/react-router';
import { Camera, Loader2, Save, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { updateUser } from '@/lib/auth-client';

export const Route = createFileRoute('/dashboard/my-account')({
  component: MyAccountPage,
});

function MyAccountPage() {
  const { user } = Route.useRouteContext();
  const [name, setName] = useState(user.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateUser({ name: trimmed });
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        return;
      }
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>My Account</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your profile and account settings
        </p>
      </div>

      <Card className='rounded-2xl border-border shadow-none'>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <User className='h-5 w-5' />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center gap-4'>
            <div className='relative group'>
              <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <User className='h-7 w-7 text-muted-foreground' />
                )}
              </div>
              <button
                type='button'
                className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                onClick={() => toast.info('Avatar upload coming soon')}
              >
                <Camera className='h-5 w-5 text-white' />
              </button>
            </div>
            <div>
              <p className='text-sm font-medium'>{user.name}</p>
              <p className='text-xs text-muted-foreground'>{user.email}</p>
            </div>
          </div>

          <Separator />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='name'>Full Name</FieldLabel>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Your full name'
              />
              {!name.trim() && <FieldError>Name is required</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                value={user.email ?? ''}
                disabled
                placeholder='your@email.com'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                Email cannot be changed
              </p>
            </Field>
          </FieldGroup>

          <div className='flex justify-end'>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className='gap-2'
            >
              {isSaving ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-border shadow-none'>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label className='text-xs text-muted-foreground'>User ID</Label>
              <p className='text-sm font-mono'>{user.id}</p>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>Role</Label>
              <p className='text-sm font-medium capitalize'>
                {user.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>
                Email Verified
              </Label>
              <p className='text-sm'>
                {user.emailVerified ? (
                  <span className='text-emerald-600 font-medium'>Yes</span>
                ) : (
                  <span className='text-amber-600 font-medium'>No</span>
                )}
              </p>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>Joined</Label>
              <p className='text-sm'>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
