// app/profile/edit/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle,
  Mail,
  Phone,
  Save,
  Upload,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import * as z from 'zod';

import { checkUsername, UsernameCheckResult } from '@/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';
import { useProfile, useUpdateProfile } from '@/services/customar/useProfile';

import { UsernameField } from './username';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Username must not exceed 30 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {
          return true;
        }
        return /^\+?[\d\s\-()]+$/.test(val);
      },
      { message: 'Please enter a valid phone number.' }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProfile() {
  const { isPending, data, isError, error } = useProfile();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query mutation for profile update
  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      // Reset form state

      setHasUnsavedChanges(false);
      setImageFile(null);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
    },
  });

  // Watch form changes to detect unsaved changes
  const watchedValues = form.watch();
  const [debouncedUsername] = useDebounce(watchedValues.username, 500); // Debounce username input

  useEffect(() => {
    if (data) {
      const hasChanges =
        watchedValues.name !== (data.name || '') ||
        watchedValues.username !== (data.username || '') ||
        watchedValues.phone !== (data.phone || '') ||
        imageFile !== null;
      setHasUnsavedChanges(hasChanges);
    }
  }, [watchedValues, data, imageFile]);

  // Update form values when profile data is loaded
  useEffect(() => {
    if (data) {
      const profile = data;
      form.reset({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      setProfileImage(profile.image || null);
      setIsUsernameValid(true); // Assume current username is valid
    }
  }, [data, form]);

  // Handle navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Username check using debounced value
  useEffect(() => {
    const checkUsernameValidity = async () => {
      if (!debouncedUsername || debouncedUsername === data?.username) {
        setIsUsernameValid(true);
        setUsernameErrorMessage(null);
        setUsernameSuggestions([]);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const result: UsernameCheckResult =
          await checkUsername(debouncedUsername);
        setIsUsernameValid(result.available);
        setUsernameErrorMessage(result.message || result.error || null);
        setUsernameSuggestions(result.suggestions || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsUsernameValid(false);
        setUsernameErrorMessage('Failed to check username');
        setUsernameSuggestions([]);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameValidity();
  }, [debouncedUsername, data?.username]);

  const validateImageFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image size must be less than 500KB. Please compress your image or choose a smaller file.';
    }
    return null;
  }, []);

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const error = validateImageFile(file);
      if (error) {
        setImageError(error);
        return;
      }

      setImageError(null);
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [validateImageFile]
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveImage = useCallback(() => {
    setProfileImage(data?.image || null);
    setImageFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [data?.image]);

  async function onSubmit(values: FormValues) {
    if (!isUsernameValid && values.username !== data?.username) {
      form.setError('username', { message: 'Please choose a valid username' });
      return;
    }

    // Use the mutation instead of direct API call
    updateProfileMutation.mutate({
      formData: values,
      imageFile,
    });
  }

  if (isPending) {
    return <EditProfileSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  const profile = data;

  if (!profile) {
    return <ErrorState message="No profile data found" />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Link href="/profile">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information and profile picture
            </p>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload a new profile picture. Supported formats: JPEG, PNG, WebP
            (max 500KB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="ring-muted h-24 w-24 ring-2">
                <AvatarImage
                  src={profileImage || '/placeholder.svg'}
                  alt={profile.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium">Current Photo</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {profile.role}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose New Photo
                </Button>
                {imageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
              {imageFile && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{imageFile.name}</strong> selected. Click &#34;Save
                    Changes&#34; to upload.
                  </AlertDescription>
                </Alert>
              )}
              {!imageFile && (
                <div className="text-muted-foreground text-sm">
                  <p>• Maximum file size: 500KB</p>
                  <p>• Accepted formats: JPEG, PNG, WebP</p>
                  <p>• Recommended: Square images work best</p>
                  <p>• Tip: Use online tools to compress large images</p>
                </div>
              )}
            </div>
          </div>
          {imageError && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{imageError}</AlertDescription>
            </Alert>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleImageChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="transition-colors focus:ring-2 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <UsernameField
                control={form.control}
                username={watchedValues.username}
                isUsernameValid={isUsernameValid}
                isPending={isCheckingUsername}
                usernameSuggestions={usernameSuggestions}
                usernameErrorMessage={usernameErrorMessage}
                setValue={(name: string, value: string) => {
                  if (name === 'username') {
                    form.setValue('username', value);
                  }
                }}
                onCheckUsername={async (username: string) => {
                  if (!username || username === data?.username) {
                    setIsUsernameValid(true);
                    setUsernameErrorMessage(null);
                    setUsernameSuggestions([]);
                    return;
                  }

                  setIsCheckingUsername(true);
                  try {
                    const result: UsernameCheckResult =
                      await checkUsername(username);
                    setIsUsernameValid(result.available);
                    setUsernameErrorMessage(
                      result.message || result.error || null
                    );
                    setUsernameSuggestions(result.suggestions || []);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (error) {
                    setIsUsernameValid(false);
                    setUsernameErrorMessage('Failed to check username');
                    setUsernameSuggestions([]);
                  } finally {
                    setIsCheckingUsername(false);
                  }
                }}
              />

              <Separator />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        disabled
                        {...field}
                        className="bg-muted/50"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Email cannot be changed for security reasons
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number (optional)"
                        {...field}
                        className="transition-colors focus:ring-2 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-2">
                      {profile.phone ? (
                        profile.phoneVerified ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-600" />
                            Your phone is verified
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-yellow-600" />
                            Your phone is not verified
                          </>
                        )
                      ) : (
                        'Optional: Add your phone number for better security'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Show mutation error if any */}
              {updateProfileMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {updateProfileMutation.error?.message ||
                      'Failed to update profile. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-muted-foreground">
                To Reflect changes, you will need to re-login
              </p>
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    updateProfileMutation.isPending ||
                    (!form.formState.isDirty && !imageFile) ||
                    (!isUsernameValid &&
                      watchedValues.username !== data?.username)
                  }
                  className="flex-1 transition-all duration-200"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href="/profile">
                  <Button
                    type="button"
                    variant="outline"
                    className="hover:bg-muted transition-all duration-200"
                    onClick={(e) => {
                      if (hasUnsavedChanges) {
                        if (
                          !confirm(
                            'You have unsaved changes. Are you sure you want to cancel?'
                          )
                        ) {
                          e.preventDefault();
                        }
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>

              {hasUnsavedChanges && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have unsaved changes. Don&#39;t forget to save your
                    updates!
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// EditProfileSkeleton and ErrorState components remain unchanged
function EditProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <div>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({
  message = 'Failed to load profile data',
  error,
}: {
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Error Loading Profile</h2>
            <p className="text-muted-foreground">{message}</p>
            {error && (
              <details className="mt-2 text-left">
                <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                  Show error details
                </summary>
                <pre className="bg-muted mt-2 overflow-auto rounded-md p-2 text-xs">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link href="/profile">
                <Button variant="outline">Go Back to Profile</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
