'use client';

import { CameraIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsernameCheck } from '@/services';
import { UsernameInput } from './username-input';

interface UserInfoSectionProps {
  form: UseFormReturn<any>;
  avatarSrc: string;
  setAvatarSrc: (src: string) => void;
  setAvatarFile: (file: File | null) => void;
}

function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '') // Remove spaces
    .substring(0, 20); // Limit to 20 characters
}

export default function UserInfoSection({
  form,
  avatarSrc,
  setAvatarSrc,
  setAvatarFile,
}: UserInfoSectionProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const {
    username,
    setUsername,
    isAvailable,
    suggestion,
    isLoading: isCheckingUsername,
  } = useUsernameCheck();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (500KB limit)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 500 KB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Processing image...');

    try {
      // Store the file for form submission
      setAvatarFile(file);

      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarSrc(previewUrl);

      // Store the file in the form data
      form.setValue('avatar', file);

      toast.success('Image ready for upload', { id: toastId });
    } catch (error) {
      toast.error('Failed to process image', { id: toastId });
      console.error('Image processing error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize form with session data when available
  useEffect(() => {
    if (session?.user) {
      const name = session.user.name || '';
      form.setValue('name', name);
      form.setValue('email', session.user.email || '');

      if (session.user.image && !avatarSrc) {
        setAvatarSrc(session.user.image);
      }

      // Generate initial username from full name if available
      if (name) {
        const generatedUsername = generateUsername(name);
        form.setValue('username', generatedUsername);
        form.setValue('id', session.user.id);
        setUsername(generatedUsername);
      }
    }
  }, [session, form, avatarSrc, setAvatarSrc, setUsername]);

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-8 flex justify-center">
          <div className="group relative">
            <Avatar className="h-32 w-32 transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={avatarSrc} alt="Profile picture" />
              <AvatarFallback className="text-3xl">
                {form.watch('fullName')?.substring(0, 2).toUpperCase() ||
                  session?.user?.name?.substring(0, 2).toUpperCase() ||
                  'U'}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className={`bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 translate-y-0 transform cursor-pointer rounded-full p-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isUploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
              ) : (
                <CameraIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Upload avatar</span>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                    onChange={(e) => {
                      field.onChange(e);
                      // Generate username when full name changes
                      const generatedUsername = generateUsername(
                        e.target.value
                      );
                      form.setValue('username', generatedUsername);
                      setUsername(generatedUsername);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-0">
                <FormControl>
                  <UsernameInput
                    name="username"
                    label="Username*"
                    placeholder="Choose a unique username"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input
                  placeholder="youremail@example.com"
                  disabled
                  {...field}
                  className="bg-muted/50"
                />
              </FormControl>
              <FormDescription>Email cannot be changed</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 (555) 123-4567"
                  {...field}
                  className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-primary/20 transition-all duration-200 focus:ring-2">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This cannot be changed after submission
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
