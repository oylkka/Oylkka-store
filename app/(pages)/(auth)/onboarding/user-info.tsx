'use client';

import { AlertCircle, Camera, Check, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { JSX, useCallback, useEffect, useState, useTransition } from 'react';
import { Control, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { checkUsername } from '@/actions';
import { Button } from '@/components/ui/button';
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
import { OnboardingFormValues } from '@/schemas';

interface AvatarUploadProps {
  avatarSrc: string | null;
  setAvatarSrc: (src: string | null) => void;
  name: string | undefined;
  setValue: (name: 'avatar', value: File) => void;
}

function AvatarUpload({
  avatarSrc,
  setAvatarSrc,
  name,
  setValue,
}: AvatarUploadProps): JSX.Element {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      // File validation
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size should not exceed 500 KB');
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, GIF and WebP images are supported');
        return;
      }

      setValue('avatar', file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarSrc(previewUrl);
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-10 flex justify-center">
      <div className="group relative">
        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-4xl text-slate-400 shadow-md transition-all duration-300 group-hover:scale-105">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt="Profile"
              height={400}
              width={400}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="uppercase">{name?.substring(0, 2) || 'U'}</span>
          )}
        </div>

        <label
          htmlFor="avatar-upload"
          className="bg-primary hover:bg-primary/90 absolute right-10 bottom-10 cursor-pointer rounded-full p-3 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-70"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        <div className="mt-2 text-center text-xs text-slate-500">
          <p>Max 500KB (JPEG, PNG, GIF, WebP)</p>
        </div>
      </div>
    </div>
  );
}

interface UsernameFieldProps {
  control: Control<OnboardingFormValues>;
  username: string | undefined;
  isUsernameValid: boolean;
  isPending: boolean;
  usernameSuggestions: string[];
  usernameErrorMessage: string | null;
  setValue: (name: 'username', value: string) => void;
  onCheckUsername: (username: string) => Promise<void>;
}

function UsernameField({
  control,
  username,
  isUsernameValid,
  isPending,
  usernameSuggestions,
  usernameErrorMessage,
  setValue,
  onCheckUsername,
}: UsernameFieldProps): JSX.Element {
  return (
    <FormField
      control={control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Username <span className="text-red-500">*</span>
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                placeholder="Choose a unique username"
                {...field}
                className={
                  username && !isPending
                    ? isUsernameValid
                      ? 'border-green-500 pr-10 focus-visible:ring-green-300'
                      : usernameErrorMessage
                        ? 'border-red-300 pr-10 focus-visible:ring-red-200'
                        : ''
                    : ''
                }
                onBlur={(e) => {
                  field.onBlur();
                  if (e.target.value) {
                    onCheckUsername(e.target.value);
                  }
                }}
              />
            </FormControl>
            {username && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : isUsernameValid ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : usernameErrorMessage ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>

          {/* Custom error message from server action */}
          {usernameErrorMessage && !isPending && (
            <p className="mt-1 text-sm font-medium text-red-500">
              {usernameErrorMessage}
            </p>
          )}

          {/* Username suggestions */}
          {usernameSuggestions.length > 0 && (
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Try one of these instead:
              </p>
              <div className="flex flex-wrap gap-2">
                {usernameSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setValue('username', suggestion);
                      // Verify the suggestion is available
                      onCheckUsername(suggestion);
                    }}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}

export default function UserInfo(): JSX.Element {
  const { control, setValue, watch, setError, clearErrors } =
    useFormContext<OnboardingFormValues>();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const { data: session } = useSession();

  // React Server Action transition
  const [isPending, startTransition] = useTransition();

  const name = watch('name');
  const username = watch('username');
  const [debouncedUsername] = useDebounce(username, 500);

  const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<
    string | null
  >(null);

  // Function to check username using server action - wrapped in useCallback
  const handleCheckUsername = useCallback(
    async (usernameToCheck: string): Promise<void> => {
      if (!usernameToCheck || usernameToCheck.length < 3) {
        setIsUsernameValid(false);
        setUsernameSuggestions([]);
        setUsernameErrorMessage(
          usernameToCheck ? 'Username must be at least 3 characters' : null
        );
        if (usernameToCheck) {
          setError('username', {
            type: 'manual',
            message: 'Username must be at least 3 characters',
          });
        }
        return;
      }

      startTransition(async () => {
        try {
          const result = await checkUsername(usernameToCheck);

          if (result.available) {
            clearErrors('username');
            setIsUsernameValid(true);
            setUsernameSuggestions([]);
            setUsernameErrorMessage(null);
          } else {
            if (result.message) {
              setError('username', {
                type: 'manual',
                message: result.message,
              });
              setIsUsernameValid(false);
              setUsernameErrorMessage(result.message);

              if (result.suggestions) {
                setUsernameSuggestions(result.suggestions);
              }
            }

            if (result.error) {
              if (result.error === 'Unauthorized') {
                toast.error('Session expired. Please refresh the page.');
              } else {
                toast.error(result.error);
              }
              setIsUsernameValid(false);
              setUsernameSuggestions([]);
              setUsernameErrorMessage(result.error);
            }
          }
        } catch (error) {
          console.error('Error checking username:', error);
          setIsUsernameValid(false);
          setUsernameErrorMessage('Failed to check username availability');
          toast.error('Something went wrong. Please try again.');
        }
      });
    },
    [clearErrors, setError, startTransition]
  );

  // Auto-generate username when full name changes
  useEffect(() => {
    if (name && !username) {
      const initialUsername = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);
      setValue('username', initialUsername);
    }
  }, [name, username, setValue]);

  // Check username availability with debounce
  useEffect(() => {
    if (debouncedUsername) {
      handleCheckUsername(debouncedUsername);
    }
  }, [debouncedUsername, handleCheckUsername]);

  // Load avatar from session
  useEffect(() => {
    if (session?.user?.image) {
      setAvatarSrc(session.user.image);
    }
  }, [session]);

  return (
    <Card className="mx-auto max-w-3xl pt-0 shadow-md">
      <CardHeader className="border-b pt-5">
        <CardTitle className="text-primary flex items-center gap-2">
          <User className="h-5 w-5" />
          User Information
        </CardTitle>
        <CardDescription>
          Complete your profile details to get started with your account
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Avatar upload section */}
        <AvatarUpload
          avatarSrc={avatarSrc}
          setAvatarSrc={setAvatarSrc}
          name={name}
          setValue={setValue}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name field */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username field component */}
          <UsernameField
            control={control}
            username={username}
            isUsernameValid={isUsernameValid}
            isPending={isPending}
            usernameSuggestions={usernameSuggestions}
            usernameErrorMessage={usernameErrorMessage}
            setValue={setValue}
            onCheckUsername={handleCheckUsername}
          />

          {/* Email field */}
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone field */}
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+8801XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role selection */}
          <FormField
            control={control}
            name="role"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-1">
                <FormLabel>
                  Account Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This determines what features you can access.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
